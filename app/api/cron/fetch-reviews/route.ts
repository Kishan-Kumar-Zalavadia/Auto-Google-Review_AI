import { createServiceClient } from "@/lib/supabase";
import { refreshAccessToken } from "@/lib/google-auth";
import { fetchReviews, postReply, starRatingToNumber } from "@/lib/gbp";
import { generateReply } from "@/lib/claude";
import { sendReviewAlert } from "@/lib/email";

// GET handler — called every 30 min by Vercel cron
export async function GET(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const results = { processed: 0, new_reviews: 0, errors: [] as string[] };

  // 1. Get all businesses with GBP connected
  const { data: businesses } = await supabase
    .from("businesses")
    .select("*")
    .not("gbp_location_name", "is", null);

  if (!businesses?.length) {
    return Response.json({ ...results, message: "No businesses connected" });
  }

  for (const business of businesses) {
    try {
      results.processed++;

      // 2. Refresh token if expired or expiring in next 5 minutes
      let accessToken = business.gbp_access_token;
      const expiryDate = new Date(business.gbp_token_expiry || 0);
      if (expiryDate.getTime() - Date.now() < 5 * 60 * 1000) {
        const refreshed = await refreshAccessToken(business.gbp_refresh_token!);
        accessToken = refreshed.access_token;
        await supabase
          .from("businesses")
          .update({
            gbp_access_token: refreshed.access_token,
            gbp_token_expiry: new Date(refreshed.expiry_date).toISOString(),
          })
          .eq("id", business.id);
      }

      // 3. Fetch reviews from Google
      const { reviews } = await fetchReviews(accessToken!, business.gbp_location_name!);
      if (!reviews?.length) continue;

      for (const review of reviews) {
        const reviewId = review.name; // Google's full review name path

        // 4. Skip if already in DB
        const { data: existing } = await supabase
          .from("reviews")
          .select("id")
          .eq("google_review_id", reviewId)
          .single();
        if (existing) continue;

        results.new_reviews++;
        const starRating = starRatingToNumber(review.starRating);
        const comment = review.comment || "";

        // 5. Check for offensive content (basic)
        const offensiveWords = [
          "fuck", "shit", "bastard", "behen", "maderchod", "chutiya", "bhenchod",
        ];
        const isOffensive = offensiveWords.some((w) =>
          comment.toLowerCase().includes(w)
        );

        let aiDraft: string | null = null;
        let status: "pending" | "flagged" | "posted" = "pending";

        if (isOffensive) {
          status = "flagged";
        } else {
          // 6. Generate reply
          aiDraft = await generateReply(
            {
              name: business.name,
              type: business.type,
              city: business.city,
              tone: business.tone,
              specialty: business.specialty,
              contactEmail: business.contact_email || "",
              language: business.reply_language as "english" | "hindi",
            },
            {
              reviewerName: review.reviewer?.displayName || "",
              starRating,
              comment,
            }
          );
          if (!aiDraft) status = "flagged";
        }

        // 7. Auto-post 5-star if enabled
        if (business.auto_post_5star && starRating === 5 && aiDraft) {
          await postReply(accessToken!, reviewId, aiDraft);
          status = "posted";
        }

        // 8. Save to Supabase
        const { data: savedReview } = await supabase
          .from("reviews")
          .insert({
            business_id: business.id,
            google_review_id: reviewId,
            reviewer_name: review.reviewer?.displayName,
            star_rating: starRating,
            comment,
            review_time: review.updateTime,
            status,
            ai_draft: aiDraft,
            posted_at: status === "posted" ? new Date().toISOString() : null,
          })
          .select()
          .single();

        // 9. Send email notification (except for auto-posted and flagged)
        if (status === "pending" && aiDraft && savedReview) {
          await sendReviewAlert({
            to: business.notification_email,
            businessName: business.name,
            reviewerName: review.reviewer?.displayName || "a customer",
            starRating,
            reviewText: comment,
            draftReply: aiDraft,
            reviewId: savedReview.id,
          });
        }
      }
    } catch (err) {
      results.errors.push(`Business ${business.id}: ${err}`);
    }
  }

  return Response.json(results);
}

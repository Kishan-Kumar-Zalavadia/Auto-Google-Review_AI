import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { postReply } from "@/lib/gbp";
import { refreshAccessToken } from "@/lib/google-auth";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/approve-success?error=missing_token", request.url));
  }

  let reviewId: string;
  try {
    reviewId = Buffer.from(token, "base64").toString("utf8");
  } catch {
    return NextResponse.redirect(new URL("/approve-success?error=invalid_token", request.url));
  }

  const supabase = createServiceClient();

  const { data: review } = await supabase
    .from("reviews")
    .select("*, businesses(id, gbp_access_token, gbp_refresh_token, gbp_token_expiry, gbp_location_name)")
    .eq("id", reviewId)
    .single();

  if (!review) {
    return NextResponse.redirect(new URL("/approve-success?error=not_found", request.url));
  }

  if (review.status === "posted") {
    return NextResponse.redirect(new URL("/approve-success?already=true", request.url));
  }

  if (!review.ai_draft) {
    return NextResponse.redirect(new URL("/approve-success?error=no_draft", request.url));
  }

  const business = review.businesses as {
    id: string;
    gbp_access_token: string | null;
    gbp_refresh_token: string | null;
    gbp_token_expiry: string | null;
    gbp_location_name: string | null;
  };

  // Refresh token if needed
  let accessToken = business.gbp_access_token;
  if (business.gbp_refresh_token) {
    const expiryDate = new Date(business.gbp_token_expiry || 0);
    if (expiryDate.getTime() - Date.now() < 5 * 60 * 1000) {
      try {
        const refreshed = await refreshAccessToken(business.gbp_refresh_token);
        accessToken = refreshed.access_token;
        await supabase
          .from("businesses")
          .update({
            gbp_access_token: refreshed.access_token,
            gbp_token_expiry: new Date(refreshed.expiry_date).toISOString(),
          })
          .eq("id", business.id);
      } catch {
        console.error("Token refresh failed in email approve");
      }
    }
  }

  try {
    if (accessToken && business.gbp_location_name) {
      const reviewName = `${business.gbp_location_name}/reviews/${review.google_review_id}`;
      await postReply(accessToken, reviewName, review.ai_draft);
    }

    await supabase
      .from("reviews")
      .update({
        status: "posted",
        final_reply: review.ai_draft,
        posted_at: new Date().toISOString(),
      })
      .eq("id", reviewId);

    return NextResponse.redirect(new URL("/approve-success", request.url));
  } catch (err) {
    console.error("Email approve failed:", err);
    return NextResponse.redirect(new URL("/approve-success?error=post_failed", request.url));
  }
}

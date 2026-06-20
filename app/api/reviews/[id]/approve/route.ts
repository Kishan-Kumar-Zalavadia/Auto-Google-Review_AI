import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { postReply } from "@/lib/gbp";
import { refreshAccessToken } from "@/lib/google-auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch review + verify ownership
    const { data: review } = await supabase
      .from("reviews")
      .select("*, businesses!inner(id, user_id, gbp_access_token, gbp_refresh_token, gbp_token_expiry, gbp_location_name)")
      .eq("id", id)
      .single();

    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    const business = review.businesses as {
      id: string;
      user_id: string;
      gbp_access_token: string | null;
      gbp_refresh_token: string | null;
      gbp_token_expiry: string | null;
      gbp_location_name: string | null;
    };

    if (business.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check trial
    const { data: userData } = await supabase
      .from("users")
      .select("trial_ends_at, plan")
      .eq("id", user.id)
      .single();

    if (userData?.plan === "trial" && userData.trial_ends_at) {
      if (new Date(userData.trial_ends_at) < new Date()) {
        return NextResponse.json(
          { error: "Trial expired. Please upgrade.", code: "TRIAL_EXPIRED" },
          { status: 403 }
        );
      }
    }

    if (!review.ai_draft) {
      return NextResponse.json({ error: "No draft to post" }, { status: 400 });
    }

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
          console.error("Token refresh failed");
        }
      }
    }

    // Post to Google (skip if not connected)
    if (accessToken && business.gbp_location_name) {
      try {
        const reviewName = `${business.gbp_location_name}/reviews/${review.google_review_id}`;
        await postReply(accessToken, reviewName, review.ai_draft);
      } catch (err) {
        console.error("GBP postReply failed:", err);
        return NextResponse.json(
          { error: "Failed to post to Google. Check your GBP connection." },
          { status: 502 }
        );
      }
    }

    await supabase
      .from("reviews")
      .update({
        status: "posted",
        final_reply: review.ai_draft,
        posted_at: new Date().toISOString(),
      })
      .eq("id", id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("approve route error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { postReply } from "@/lib/gbp";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: review, error } = await supabase
    .from("reviews")
    .select("*, businesses(*)")
    .eq("id", id)
    .single();

  if (error || !review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  if (!review.ai_draft) {
    return NextResponse.json({ error: "No draft to post" }, { status: 400 });
  }

  const business = review.businesses;

  try {
    if (business?.gbp_access_token && business?.gbp_location_name) {
      const reviewName = `${business.gbp_location_name}/reviews/${review.google_review_id}`;
      await postReply(business.gbp_access_token, reviewName, review.ai_draft);
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
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

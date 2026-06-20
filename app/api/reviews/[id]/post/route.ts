import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { postReply } from "@/lib/gbp";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { replyText } = await req.json();

  if (!replyText?.trim()) {
    return NextResponse.json({ error: "Reply text is required" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  const { data: review, error } = await supabase
    .from("reviews")
    .select("*, businesses(*)")
    .eq("id", id)
    .single();

  if (error || !review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  const business = review.businesses;

  try {
    if (business?.gbp_access_token && business?.gbp_location_name) {
      const reviewName = `${business.gbp_location_name}/reviews/${review.google_review_id}`;
      await postReply(business.gbp_access_token, reviewName, replyText);
    }

    await supabase
      .from("reviews")
      .update({
        status: "posted",
        final_reply: replyText,
        posted_at: new Date().toISOString(),
      })
      .eq("id", id);

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

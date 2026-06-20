import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { generateReply } from "@/lib/claude";

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

  const business = review.businesses;

  const newDraft = await generateReply(
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
      reviewerName: review.reviewer_name || "",
      starRating: review.star_rating,
      comment: review.comment,
    }
  );

  if (!newDraft) {
    return NextResponse.json({ error: "Could not generate reply" }, { status: 400 });
  }

  await supabase.from("reviews").update({ ai_draft: newDraft }).eq("id", id);

  return NextResponse.json({ draft: newDraft });
}

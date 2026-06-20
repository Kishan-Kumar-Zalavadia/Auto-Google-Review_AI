import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { generateReply } from "@/lib/claude";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: review } = await supabase
      .from("reviews")
      .select("*, businesses!inner(id, user_id, name, type, city, tone, specialty, contact_email, reply_language)")
      .eq("id", id)
      .single();

    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    const business = review.businesses as {
      id: string;
      user_id: string;
      name: string;
      type: string;
      city: string;
      tone: string;
      specialty: string | null;
      contact_email: string | null;
      reply_language: string;
    };

    if (business.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const newDraft = await generateReply(
      {
        name: business.name,
        type: business.type,
        city: business.city,
        tone: business.tone as "friendly" | "professional" | "casual",
        specialty: business.specialty ?? undefined,
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
      return NextResponse.json(
        { error: "Could not generate reply for this review." },
        { status: 400 }
      );
    }

    await supabase
      .from("reviews")
      .update({ ai_draft: newDraft })
      .eq("id", id);

    return NextResponse.json({ success: true, draft: newDraft });
  } catch (err) {
    console.error("regenerate route error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

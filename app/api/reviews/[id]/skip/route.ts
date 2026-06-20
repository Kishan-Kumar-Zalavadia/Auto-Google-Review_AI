import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify ownership
    const { data: review } = await supabase
      .from("reviews")
      .select("id, businesses!inner(user_id)")
      .eq("id", id)
      .single();

    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    const business = review.businesses as unknown as { user_id: string };
    if (business.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await supabase.from("reviews").update({ status: "skipped" }).eq("id", id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("skip route error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

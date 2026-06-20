import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { auto_post_5star } = await req.json();
    if (typeof auto_post_5star !== "boolean") {
      return NextResponse.json({ error: "auto_post_5star must be boolean" }, { status: 400 });
    }

    const { error } = await supabase
      .from("businesses")
      .update({ auto_post_5star })
      .eq("user_id", user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("settings/automation error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { notification_email } = await req.json();
    if (!notification_email || typeof notification_email !== "string") {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("businesses")
      .update({ notification_email })
      .eq("user_id", user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("settings/notifications error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

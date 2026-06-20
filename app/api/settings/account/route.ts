import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createServiceClient } from "@/lib/supabase";

export async function DELETE() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Delete business (cascades to reviews via FK)
    await supabase.from("businesses").delete().eq("user_id", user.id);

    // Delete auth user via service role
    const adminClient = createServiceClient();
    const { error } = await adminClient.auth.admin.deleteUser(user.id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("settings/account error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

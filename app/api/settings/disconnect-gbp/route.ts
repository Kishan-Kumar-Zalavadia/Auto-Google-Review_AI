import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function PATCH() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { error } = await supabase
      .from("businesses")
      .update({
        gbp_access_token: null,
        gbp_refresh_token: null,
        gbp_location_name: null,
        gbp_account_name: null,
        gbp_token_expiry: null,
      })
      .eq("user_id", user.id);

    if (error) throw error;
    return NextResponse.json({ success: true, redirect: "/onboarding" });
  } catch (err) {
    console.error("settings/disconnect-gbp error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

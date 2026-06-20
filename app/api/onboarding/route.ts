import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, type, city, specialty, contact_email, notification_email, tone, reply_language } = body;

    if (!name?.trim() || !city?.trim() || !notification_email?.trim()) {
      return NextResponse.json({ error: "Name, city and notification email are required." }, { status: 400 });
    }

    // Use service role to bypass RLS — ensures users row exists before business insert
    const admin = createServiceClient();

    // Upsert into our custom users table (Supabase auth user already exists in auth.users)
    const { error: userError } = await admin.from("users").upsert(
      { id: user.id, email: user.email! },
      { onConflict: "id" }
    );
    if (userError) throw userError;

    // Check if business already exists for this user
    const { data: existing } = await admin
      .from("businesses")
      .select("id")
      .eq("user_id", user.id)
      .single();

    let bizError;
    if (existing) {
      // Update existing business
      const { error } = await admin.from("businesses").update({
        name: name.trim(),
        type,
        city: city.trim(),
        specialty: specialty?.trim() || null,
        contact_email: contact_email?.trim() || null,
        notification_email: notification_email.trim(),
        tone,
        reply_language,
      }).eq("user_id", user.id);
      bizError = error;
    } else {
      // Insert new business
      const { error } = await admin.from("businesses").insert({
        user_id: user.id,
        name: name.trim(),
        type,
        city: city.trim(),
        specialty: specialty?.trim() || null,
        contact_email: contact_email?.trim() || null,
        notification_email: notification_email.trim(),
        tone,
        reply_language,
      });
      bizError = error;
    }

    if (bizError) throw bizError;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("onboarding error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

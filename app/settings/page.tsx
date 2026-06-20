import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import SettingsClient from "./SettingsClient";
import type { Business } from "@/lib/types";

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!business) redirect("/onboarding");

  return <SettingsClient business={business as Business} />;
}

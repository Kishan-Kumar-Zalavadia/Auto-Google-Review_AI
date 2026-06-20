import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function TrialBanner() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: userData } = await supabase
    .from("users")
    .select("trial_ends_at, plan")
    .eq("id", user.id)
    .single();

  if (!userData?.trial_ends_at || userData.plan !== "trial") return null;

  const trialEnd = new Date(userData.trial_ends_at);
  const now = new Date();
  const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft > 3) return null;

  if (daysLeft <= 0) {
    return (
      <div className="bg-red-600 text-white px-4 py-3 text-sm text-center font-medium">
        Your trial has ended. Upgrade to continue.{" "}
        <Link href="/billing" className="underline font-bold ml-1">
          Choose a plan →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-800 px-4 py-2.5 text-sm text-center">
      Your free trial ends in <strong>{daysLeft} day{daysLeft !== 1 ? "s" : ""}</strong>.{" "}
      <Link href="/billing" className="underline font-medium">
        Upgrade to keep going →
      </Link>
    </div>
  );
}

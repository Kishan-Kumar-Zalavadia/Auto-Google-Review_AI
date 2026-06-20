import { redirect } from "next/navigation";
import { getAuthUrl } from "@/lib/google-auth";

export async function GET(): Promise<never> {
  const url = getAuthUrl();
  redirect(url);
}

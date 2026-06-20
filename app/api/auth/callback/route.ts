import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import { exchangeCodeForTokens } from "@/lib/google-auth";

const TOKENS_PATH = "/tmp/gbp-tokens.json";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.json(
      { error: `Google OAuth error: ${error}` },
      { status: 400 }
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: "Missing code parameter in callback." },
      { status: 400 }
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    await fs.writeFile(TOKENS_PATH, JSON.stringify(tokens, null, 2), "utf-8");
    return NextResponse.redirect(new URL("/auth-test", request.url));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error during token exchange.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

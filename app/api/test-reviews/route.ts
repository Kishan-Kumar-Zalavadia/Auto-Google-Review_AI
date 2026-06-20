import { NextResponse } from "next/server";
import fs from "fs/promises";

const TOKENS_PATH = "/tmp/gbp-tokens.json";

interface StoredTokens {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}

export async function GET(): Promise<NextResponse> {
  try {
    const raw = await fs.readFile(TOKENS_PATH, "utf-8");
    const tokens: StoredTokens = JSON.parse(raw);

    return NextResponse.json({
      message: "Tokens found",
      access_token_preview: tokens.access_token.slice(0, 20) + "...",
    });
  } catch (err) {
    const isNotFound =
      err instanceof Error && (err as NodeJS.ErrnoException).code === "ENOENT";

    if (isNotFound) {
      return NextResponse.json(
        { error: "Not authenticated. Visit /api/auth/google first." },
        { status: 401 }
      );
    }

    const message = err instanceof Error ? err.message : "Unknown error reading tokens.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

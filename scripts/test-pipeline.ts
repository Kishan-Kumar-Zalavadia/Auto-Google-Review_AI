import fs from "fs/promises";
import dotenv from "dotenv";
import path from "path";

// Load .env.local for ANTHROPIC_API_KEY
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import {
  fetchAccounts,
  fetchLocations,
  fetchReviews,
  starRatingToNumber,
} from "../lib/gbp";
import { generateReply, type Business } from "../lib/claude";

const TOKENS_PATH = "/tmp/gbp-tokens.json";

interface StoredTokens {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}

async function main() {
  // 1. Read tokens
  let tokens: StoredTokens;
  try {
    const raw = await fs.readFile(TOKENS_PATH, "utf-8");
    tokens = JSON.parse(raw);
  } catch {
    console.error("❌ Tokens not found at /tmp/gbp-tokens.json");
    console.error("   Visit http://localhost:3000/api/auth/google to authenticate first.");
    process.exit(1);
  }

  const { access_token } = tokens;

  // 2. Fetch accounts
  console.log("\n── Accounts ──────────────────────────────────");
  const { accounts } = await fetchAccounts(access_token);
  if (!accounts?.length) {
    console.error("❌ No accounts found.");
    process.exit(1);
  }
  accounts.forEach((a) => console.log(`  • ${a.accountName} (${a.name})`));

  // 3. Fetch locations for first account
  console.log("\n── Locations ─────────────────────────────────");
  const { locations } = await fetchLocations(access_token, accounts[0].name);
  if (!locations?.length) {
    console.error("❌ No locations found for account:", accounts[0].name);
    process.exit(1);
  }
  locations.forEach((l) => console.log(`  • ${l.title} (${l.name})`));

  // 4. Fetch reviews for first location
  console.log("\n── Reviews (first 3) ─────────────────────────");
  const { reviews } = await fetchReviews(access_token, locations[0].name);
  if (!reviews?.length) {
    console.log("  (No reviews found for this location)");
    process.exit(0);
  }

  const first3 = reviews.slice(0, 3);
  first3.forEach((r, i) => {
    const preview = r.comment ? r.comment.slice(0, 80) + (r.comment.length > 80 ? "…" : "") : "(no comment)";
    console.log(`  ${i + 1}. ${r.reviewer.displayName} — ${r.starRating} — "${preview}"`);
  });

  // 5. Generate English replies for first 3 reviews
  const testBusiness: Business = {
    name: "Test Restaurant",
    type: "restaurant",
    city: "Bangalore",
    tone: "friendly",
    contactEmail: "test@test.com",
    language: "english",
  };

  console.log("\n── AI Replies (English) ──────────────────────");
  for (const [i, review] of first3.entries()) {
    const starRating = starRatingToNumber(review.starRating);
    const reply = await generateReply(testBusiness, {
      reviewerName: review.reviewer.displayName,
      starRating,
      comment: review.comment,
    });

    console.log(`\n  [Review ${i + 1}] ${review.reviewer.displayName} — ${starRating}★`);
    if (reply === null) {
      console.log("  → SKIPPED (offensive review)");
    } else {
      console.log(`  → ${reply}`);
    }
  }

  // 6. Test Hindi reply with first review
  console.log("\n── AI Reply (Hindi) — Review 1 ───────────────");
  const hindiBusiness: Business = { ...testBusiness, language: "hindi" };
  const firstReview = first3[0];
  const hindiReply = await generateReply(hindiBusiness, {
    reviewerName: firstReview.reviewer.displayName,
    starRating: starRatingToNumber(firstReview.starRating),
    comment: firstReview.comment,
  });

  if (hindiReply === null) {
    console.log("  → SKIPPED (offensive review)");
  } else {
    console.log(`  → ${hindiReply}`);
  }

  console.log("\n✅ Pipeline test complete.\n");
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});

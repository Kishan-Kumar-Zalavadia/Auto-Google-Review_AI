// Before running:
//   1. Go to Supabase → SQL Editor → paste and run supabase/schema.sql
//   2. Go to Supabase → Table Editor → businesses table → insert a test row manually:
//        name: "Spice Garden Restaurant", type: "restaurant", city: "Bangalore",
//        tone: "friendly", reply_language: "english", notification_email: "your@email.com"
//   3. Copy the generated business UUID → paste it as TEST_BUSINESS_ID below

import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { generateReply, type Business } from "../lib/claude";
import { createServiceClient } from "../lib/supabase";

// ── Config ────────────────────────────────────────────────────────────────────

const TEST_BUSINESS_ID = "9c69f05e-d418-4b07-b783-a01c664bfeb6";

// ── Mock reviews ──────────────────────────────────────────────────────────────

const MOCK_REVIEWS = [
  {
    reviewId: "mock-review-001",
    reviewer: { displayName: "Priya Sharma" },
    starRating: "FIVE" as const,
    comment:
      "Absolutely loved the butter chicken here! The ambiance was cozy and the staff was super friendly. Will definitely come back with family.",
    updateTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    reviewId: "mock-review-002",
    reviewer: { displayName: "Rahul Mehta" },
    starRating: "THREE" as const,
    comment:
      "Food was decent but the wait time was too long. Waited almost 40 minutes for our order. The paneer tikka was good though.",
    updateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    reviewId: "mock-review-003",
    reviewer: { displayName: "Anon" },
    starRating: "ONE" as const,
    comment: undefined,
    updateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const STAR_RATING_MAP: Record<string, number> = {
  FIVE: 5,
  FOUR: 4,
  THREE: 3,
  TWO: 2,
  ONE: 1,
};

// ── Test business (for Claude) ────────────────────────────────────────────────

const TEST_BUSINESS: Business = {
  name: "Spice Garden Restaurant",
  type: "restaurant",
  city: "Bangalore",
  tone: "friendly",
  specialty: "North Indian cuisine, especially butter chicken and paneer dishes",
  contactEmail: "manager@spicegarden.in",
  language: "english",
};

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  if (TEST_BUSINESS_ID === "PASTE_BUSINESS_UUID_HERE") {
    console.error("❌ Set TEST_BUSINESS_ID in scripts/test-pipeline.ts before running.");
    process.exit(1);
  }

  const supabase = createServiceClient();

  console.log("\n── Mock Reviews ──────────────────────────────");
  MOCK_REVIEWS.forEach((r, i) => {
    const preview = r.comment
      ? r.comment.slice(0, 80) + (r.comment.length > 80 ? "…" : "")
      : "(no comment)";
    console.log(`  ${i + 1}. ${r.reviewer.displayName} — ${r.starRating} — "${preview}"`);
  });

  console.log("\n── AI Replies + Supabase Upsert ──────────────");

  for (const review of MOCK_REVIEWS) {
    const starRating = STAR_RATING_MAP[review.starRating];

    const reply = await generateReply(TEST_BUSINESS, {
      reviewerName: review.reviewer.displayName,
      starRating,
      comment: review.comment,
    });

    const status = reply === null ? "flagged" : "pending";

    console.log(`\n  [${review.reviewId}] ${review.reviewer.displayName} — ${starRating}★`);
    if (reply === null) {
      console.log("  → SKIPPED (offensive review)");
    } else {
      console.log(`  → ${reply}`);
    }

    const { error } = await supabase.from("reviews").upsert(
      {
        business_id: TEST_BUSINESS_ID,
        google_review_id: review.reviewId,
        reviewer_name: review.reviewer.displayName,
        star_rating: starRating,
        comment: review.comment ?? null,
        review_time: review.updateTime,
        status,
        ai_draft: reply ?? null,
      },
      { onConflict: "google_review_id" }
    );

    if (error) {
      console.error(`  ❌ Supabase error: ${error.message}`);
    } else {
      console.log(`  ✓ Saved to Supabase: ${review.reviewId} — status: ${status}`);
    }
  }

  // Hindi reply test (log only, no extra DB insert)
  console.log("\n── AI Reply (Hindi) — Review 1 ───────────────");
  const hindiReply = await generateReply(
    { ...TEST_BUSINESS, language: "hindi" },
    {
      reviewerName: MOCK_REVIEWS[0].reviewer.displayName,
      starRating: STAR_RATING_MAP[MOCK_REVIEWS[0].starRating],
      comment: MOCK_REVIEWS[0].comment,
    }
  );
  console.log(hindiReply === null ? "  → SKIPPED (offensive review)" : `  → ${hindiReply}`);

  console.log("\n✅ Pipeline test complete.\n");
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});

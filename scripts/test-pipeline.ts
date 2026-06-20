// Before running:
//   1. Go to Supabase → SQL Editor → paste and run supabase/schema.sql
//   2. Go to Supabase → Table Editor → businesses table → insert a test row manually:
//        name: "Spice Garden Restaurant", type: "restaurant", city: "Bangalore",
//        tone: "friendly", reply_language: "english", notification_email: "your@email.com"
//   3. Copy the generated business UUID → paste it as TEST_BUSINESS_ID below
// Run npm run dev in another terminal before running this script

import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { generateReply, type Business } from "../lib/claude";
import { createServiceClient } from "../lib/supabase";
import { sendReviewAlert } from "../lib/email";

// ── Config ────────────────────────────────────────────────────────────────────

const TEST_BUSINESS_ID: string = "51ff9432-f66b-4825-adeb-432d565f19ff";

// ── Mock reviews ──────────────────────────────────────────────────────────────

const MOCK_REVIEWS = [
  {
    reviewId: "mock-review-004",
    reviewer: { displayName: "Sneha Patel" },
    starRating: "FOUR" as const,
    comment:
      "Great food and lovely ambiance! The dal makhani was outstanding. Service was a bit slow during peak hours but overall a wonderful experience.",
    updateTime: new Date().toISOString(),
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

  let firstReviewSupabaseId: string | null = null;
  let firstReviewDraft: string | null = null;
  let isFirst = true;

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

    const { data, error } = await supabase
      .from("reviews")
      .upsert(
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
      )
      .select("id")
      .single();

    if (error) {
      console.error(`  ❌ Supabase error: ${error.message}`);
    } else {
      console.log(`  ✓ Saved to Supabase: ${review.reviewId} — status: ${status}`);
      if (isFirst && data) {
        firstReviewSupabaseId = data.id;
        firstReviewDraft = reply;
      }
    }

    isFirst = false;
  }

  // Send email for first review only
  if (firstReviewSupabaseId && firstReviewDraft && process.env.TEST_EMAIL) {
    const first = MOCK_REVIEWS[0];
    await sendReviewAlert({
      to: process.env.TEST_EMAIL,
      businessName: TEST_BUSINESS.name,
      reviewerName: first.reviewer.displayName,
      starRating: STAR_RATING_MAP[first.starRating],
      reviewText: first.comment || "",
      draftReply: firstReviewDraft,
      reviewId: firstReviewSupabaseId,
    });
    console.log(`\n  ✓ Email sent to ${process.env.TEST_EMAIL}`);
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

  // Test cron endpoint
  await testCronEndpoint();

  console.log("\n✅ Pipeline test complete.\n");
}

async function testCronEndpoint() {
  console.log("\n── Cron Endpoint Test ────────────────────────");
  const url = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/cron/fetch-reviews`;
  try {
    const res = await fetch(url, {
      headers: { "x-cron-secret": process.env.CRON_SECRET || "" },
    });
    const json = await res.json();
    console.log(`  Status: ${res.status}`);
    console.log(`  Response: ${JSON.stringify(json, null, 2)}`);
  } catch (err) {
    console.error(`  ❌ Cron endpoint error: ${err}`);
    console.error(`  Make sure dev server is running: npm run dev`);
  }
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});

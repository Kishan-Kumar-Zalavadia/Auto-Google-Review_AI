import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { postReply } from "@/lib/gbp";

const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`;

function htmlPage(title: string, body: string): NextResponse {
  return new NextResponse(
    `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 480px; margin: 80px auto; padding: 24px; text-align: center; color: #1a1a1a; }
    h1 { font-size: 24px; margin-bottom: 12px; }
    p { color: #555; margin-bottom: 24px; }
    a { color: #2563eb; text-decoration: none; }
  </style>
</head>
<body>${body}</body>
</html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return htmlPage("Invalid link", "<h1>Invalid link</h1><p>The approval link is missing a token.</p>");
  }

  let reviewId: string;
  try {
    reviewId = Buffer.from(token, "base64").toString("utf8");
  } catch {
    return htmlPage("Invalid link", "<h1>Invalid link</h1><p>The approval token could not be decoded.</p>");
  }

  const supabase = createServiceClient();

  // Fetch review
  const { data: review, error: reviewError } = await supabase
    .from("reviews")
    .select("*")
    .eq("id", reviewId)
    .single();

  if (reviewError || !review) {
    return htmlPage(
      "Not found",
      "<h1>Review not found</h1><p>Review not found or already replied to.</p>"
    );
  }

  if (review.status === "posted") {
    return htmlPage(
      "Already posted",
      `<h1>Already posted</h1><p>This reply has already been posted to Google.</p><p><a href="${dashboardUrl}">Go to dashboard</a></p>`
    );
  }

  if (!review.ai_draft) {
    return htmlPage(
      "No draft",
      "<h1>No draft available</h1><p>There is no AI draft to post for this review.</p>"
    );
  }

  // Fetch business for GBP credentials
  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", review.business_id)
    .single();

  if (businessError || !business) {
    return htmlPage(
      "Error",
      "<h1>Business not found</h1><p>Could not find the business associated with this review.</p>"
    );
  }

  if (!business.gbp_access_token || !business.gbp_location_name) {
    return htmlPage(
      "Not connected",
      "<h1>Google not connected</h1><p>This business has not connected a Google Business Profile yet.</p>"
    );
  }

  try {
    // Post reply to Google
    const reviewName = `${business.gbp_location_name}/reviews/${review.google_review_id}`;
    await postReply(business.gbp_access_token, reviewName, review.ai_draft);

    // Update review status in Supabase
    await supabase
      .from("reviews")
      .update({
        status: "posted",
        final_reply: review.ai_draft,
        posted_at: new Date().toISOString(),
      })
      .eq("id", reviewId);

    return htmlPage(
      "✓ Reply posted!",
      `<h1>✓ Reply posted!</h1>
       <p>Your reply has been posted to Google.</p>
       <p><a href="${dashboardUrl}">Go to dashboard</a></p>`
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return htmlPage(
      "Error",
      `<h1>Failed to post reply</h1><p>${message}</p><p><a href="${dashboardUrl}">Go to dashboard</a></p>`
    );
  }
}

import { Resend } from "resend";

type ReviewAlertParams = {
  to: string;
  businessName: string;
  reviewerName: string;
  starRating: number;
  reviewText: string;
  draftReply: string;
  reviewId: string; // Supabase review ID (UUID)
};

export async function sendReviewAlert(params: ReviewAlertParams) {
  const approveToken = Buffer.from(params.reviewId).toString("base64");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const approveUrl = `${baseUrl}/api/approve?token=${approveToken}`;
  const dashboardUrl = `${baseUrl}/dashboard`;

  const stars = "★".repeat(params.starRating) + "☆".repeat(5 - params.starRating);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${stars} New review for ${params.businessName}</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">

  <h2 style="margin: 0 0 4px 0; font-size: 20px;">${stars} New review for ${params.businessName}</h2>
  <p style="margin: 0 0 24px 0; color: #666; font-size: 14px;">From: ${params.reviewerName || "Anonymous"}</p>

  <div style="background: #f5f5f5; border-left: 4px solid #d1d5db; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
    <p style="margin: 0; font-style: italic; color: #444;">"${params.reviewText || "(No written review)"}"</p>
  </div>

  <h3 style="margin: 0 0 8px 0; font-size: 15px; color: #333;">AI draft reply</h3>
  <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
    <p style="margin: 0; color: #1e40af; white-space: pre-wrap;">${params.draftReply}</p>
  </div>

  <a href="${approveUrl}"
     style="display: inline-block; background: #16a34a; color: white; text-decoration: none;
            padding: 14px 28px; border-radius: 6px; font-weight: bold; font-size: 16px; margin-bottom: 12px;">
    ✓ Approve &amp; post reply
  </a>

  <p style="margin: 12px 0 32px 0;">
    <a href="${dashboardUrl}" style="color: #6b7280; font-size: 14px;">Or edit in dashboard →</a>
  </p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin-bottom: 16px;">
  <p style="color: #9ca3af; font-size: 12px; margin: 0;">
    This reply will be posted to your Google Business Profile. If you don't want to post it, just ignore this email.
    &nbsp;·&nbsp;
    <a href="${dashboardUrl}/settings" style="color: #9ca3af;">ReplyAI · Settings</a>
  </p>

</body>
</html>
  `;

  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "ReplyAI <onboarding@resend.dev>",
    to: params.to,
    subject: `${stars} ${params.starRating}★ review from ${params.reviewerName || "a customer"} — tap to approve reply`,
    html,
  });
}

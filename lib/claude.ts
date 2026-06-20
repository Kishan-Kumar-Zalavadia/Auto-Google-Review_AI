import Anthropic from "@anthropic-ai/sdk";

// ── Types ─────────────────────────────────────────────────────────────────────


export type Business = {
  name: string;
  type: string;
  city: string;
  tone: "friendly" | "professional" | "casual";
  specialty?: string;
  contactEmail: string;
  language?: "english" | "hindi";
};

export type Review = {
  reviewerName: string;
  starRating: number;
  comment?: string;
};

// ── generateReply ─────────────────────────────────────────────────────────────

export async function generateReply(
  business: Business,
  review: Review
): Promise<string | null> {
  const toneInstructions: Record<Business["tone"], string> = {
    friendly: "Warm and personal, like talking to a friend.",
    professional: "Professional and polished.",
    casual: "Relaxed and conversational.",
  };

  const systemPrompt = `You are a customer service representative for ${business.name}, a ${business.type} in ${business.city}, India.

Write a reply to a Google review. Tone: ${toneInstructions[business.tone]}.
${business.specialty ? `The business is known for: ${business.specialty}.` : ""}
${business.language === "hindi" ? "Write the reply in Hindi (Devanagari script). Keep it warm and natural." : "Write in English."}

Rules:
- Under 120 words
- Address reviewer by first name if known, otherwise "Hi there"
- 5-star: thank them + mention ONE specific thing they said + invite back
- 4-star: thank + acknowledge positives + gently note any minor issue
- 3-star or below: acknowledge + apologise genuinely + offer to fix + mention ${business.contactEmail}
- NEVER use: "We value your feedback", "We appreciate your review", "We hope to see you again soon"
- If review contains hate speech or extreme profanity: respond with exactly: SKIP_OFFENSIVE_REVIEW
- Output ONLY the reply. No quotes. No labels. No preamble.`;

  const userPrompt = `Reviewer: ${review.reviewerName || "a customer"}
Star rating: ${review.starRating}/5
Review text: "${review.comment || "(No written review — stars only)"}"

Write the reply now:`;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 300,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text.trim() : "";

  if (text === "SKIP_OFFENSIVE_REVIEW") return null;

  return text;
}

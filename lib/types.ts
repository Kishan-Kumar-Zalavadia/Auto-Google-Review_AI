export type Business = {
  id: string;
  user_id: string;
  name: string;
  type: string;
  city: string;
  tone: "friendly" | "professional" | "casual";
  reply_language: "english" | "hindi";
  specialty?: string;
  contact_email?: string;
  notification_email: string;
  auto_post_5star: boolean;
  gbp_account_name?: string;
  gbp_location_name?: string;
  gbp_access_token?: string;
  gbp_refresh_token?: string;
  gbp_token_expiry?: string;
  created_at: string;
};

export type Review = {
  id: string;
  business_id: string;
  google_review_id: string;
  reviewer_name?: string;
  star_rating: number;
  comment?: string;
  review_time?: string;
  status: "pending" | "approved" | "posted" | "skipped" | "flagged";
  ai_draft?: string;
  final_reply?: string;
  posted_at?: string;
  created_at: string;
};

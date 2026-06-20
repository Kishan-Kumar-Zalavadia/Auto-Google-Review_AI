import fs from "fs/promises";
import { refreshAccessToken } from "./google-auth";

const TOKENS_PATH = "/tmp/gbp-tokens.json";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GBPAccount {
  name: string;
  accountName: string;
  type: string;
}

export interface GBPLocation {
  name: string;
  title: string;
  storefrontAddress?: object;
}

export interface GBPReview {
  name: string;
  reviewId: string;
  reviewer: { displayName: string };
  starRating: string;
  comment?: string;
  updateTime: string;
  reviewReply?: { comment: string };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function starRatingToNumber(rating: string): number {
  const map: Record<string, number> = {
    FIVE: 5,
    FOUR: 4,
    THREE: 3,
    TWO: 2,
    ONE: 1,
  };
  return map[rating] ?? 0;
}

async function updateStoredAccessToken(accessToken: string, expiryDate: number): Promise<void> {
  const raw = await fs.readFile(TOKENS_PATH, "utf-8");
  const tokens = JSON.parse(raw);
  tokens.access_token = accessToken;
  tokens.expiry_date = expiryDate;
  await fs.writeFile(TOKENS_PATH, JSON.stringify(tokens, null, 2), "utf-8");
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  accessToken: string
): Promise<Response> {
  const res = await fetch(url, options);

  if (res.status !== 401) return res;

  // Token expired — refresh and retry once
  const raw = await fs.readFile(TOKENS_PATH, "utf-8");
  const { refresh_token } = JSON.parse(raw);

  const refreshed = await refreshAccessToken(refresh_token);
  await updateStoredAccessToken(refreshed.access_token, refreshed.expiry_date);

  const retryOptions: RequestInit = {
    ...options,
    headers: {
      ...(options.headers as Record<string, string>),
      Authorization: `Bearer ${refreshed.access_token}`,
    },
  };

  const retryRes = await fetch(url, retryOptions);

  if (!retryRes.ok) {
    const body = await retryRes.text();
    throw new Error(`GBP API error after token refresh: ${retryRes.status} — ${body}`);
  }

  return retryRes;
}

// ── API Functions ─────────────────────────────────────────────────────────────

export async function fetchAccounts(
  accessToken: string
): Promise<{ accounts: GBPAccount[] }> {
  const url = "https://mybusinessaccountmanagement.googleapis.com/v1/accounts";
  const headers = { Authorization: `Bearer ${accessToken}` };

  const res = await fetchWithRetry(url, { headers }, accessToken);

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`fetchAccounts failed: ${res.status} — ${body}`);
  }

  return res.json();
}

export async function fetchLocations(
  accessToken: string,
  accountName: string
): Promise<{ locations: GBPLocation[] }> {
  const url = `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title,storefrontAddress`;
  const headers = { Authorization: `Bearer ${accessToken}` };

  const res = await fetchWithRetry(url, { headers }, accessToken);

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`fetchLocations failed: ${res.status} — ${body}`);
  }

  return res.json();
}

export async function fetchReviews(
  accessToken: string,
  locationName: string
): Promise<{ reviews: GBPReview[] }> {
  const url = `https://mybusiness.googleapis.com/v4/${locationName}/reviews?orderBy=updateTime+desc&pageSize=50`;
  // Note: reviews API remains on v4 mybusiness.googleapis.com
  const headers = { Authorization: `Bearer ${accessToken}` };

  const res = await fetchWithRetry(url, { headers }, accessToken);

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`fetchReviews failed: ${res.status} — ${body}`);
  }

  return res.json();
}

export async function postReply(
  accessToken: string,
  reviewName: string,
  replyText: string
): Promise<unknown> {
  const url = `https://mybusiness.googleapis.com/v4/${reviewName}/reply`;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
  const body = JSON.stringify({ comment: replyText });

  const res = await fetchWithRetry(url, { method: "PUT", headers, body }, accessToken);

  if (!res.ok) {
    const responseBody = await res.text();
    throw new Error(`postReply failed: ${res.status} — ${responseBody}`);
  }

  return res.json();
}

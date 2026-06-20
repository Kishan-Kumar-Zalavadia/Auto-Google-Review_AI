"use client";

import type { Review } from "@/lib/types";

type Props = {
  review: Review;
  onApprove: (id: string) => void;
  onSkip: (id: string) => void;
  onEdit: (review: Review) => void;
};

export function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;
  return `${Math.floor(months / 12)} year${Math.floor(months / 12) !== 1 ? "s" : ""} ago`;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-sm">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? "text-amber-400" : "text-gray-200"}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function ReviewCard({ review, onApprove, onSkip, onEdit }: Props) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 mb-3 hover:shadow-sm transition-shadow">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <StarRating rating={review.star_rating} />
          <span className="font-semibold text-sm text-gray-900">
            {review.reviewer_name || "Anonymous"}
          </span>
        </div>
        <span className="text-xs text-gray-400 shrink-0">
          {timeAgo(review.created_at)}
        </span>
      </div>

      {/* Review text */}
      <p className="text-sm text-gray-500 italic mb-3 line-clamp-3">
        {review.comment || "(No written review — star rating only)"}
      </p>

      {/* Status-based content */}
      {review.status === "pending" && (
        <>
          {review.ai_draft && (
            <div className="mb-3">
              <p className="text-xs font-medium text-green-600 mb-1">AI draft reply</p>
              <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-sm text-gray-700">
                {review.ai_draft}
              </div>
            </div>
          )}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => onApprove(review.id)}
              className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Approve & post
            </button>
            <button
              onClick={() => onEdit(review)}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Edit draft
            </button>
            <button
              onClick={() => onSkip(review.id)}
              className="px-3 py-1.5 text-gray-400 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Skip
            </button>
          </div>
        </>
      )}

      {review.status === "posted" && (
        <div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full mb-2">
            Posted ✓
          </span>
          {review.final_reply && (
            <p className="text-sm text-gray-500 italic">{review.final_reply}</p>
          )}
        </div>
      )}

      {review.status === "skipped" && (
        <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
          Skipped
        </span>
      )}

      {review.status === "flagged" && (
        <div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-full mb-1">
            Needs review ⚠
          </span>
          <p className="text-xs text-gray-400">
            Contains sensitive content — reply manually in Google Business Profile
          </p>
        </div>
      )}
    </div>
  );
}

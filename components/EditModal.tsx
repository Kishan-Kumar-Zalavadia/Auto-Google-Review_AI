"use client";

import { useState } from "react";
import type { Review } from "@/lib/types";

type Props = {
  review: Review | null;
  onClose: () => void;
  onPost: (reviewId: string, replyText: string) => void;
};

export default function EditModal({ review, onClose, onPost }: Props) {
  const [text, setText] = useState(review?.ai_draft || "");
  const [regenerating, setRegenerating] = useState(false);
  const [posting, setPosting] = useState(false);

  if (!review) return null;

  // Sync text when review changes
  if (text === "" && review.ai_draft) setText(review.ai_draft);

  const charCount = text.length;

  async function handleRegenerate() {
    if (!review) return;
    setRegenerating(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}/regenerate`, { method: "POST" });
      const data = await res.json();
      if (data.draft) setText(data.draft);
    } finally {
      setRegenerating(false);
    }
  }

  async function handlePost() {
    if (!review || !text.trim()) return;
    setPosting(true);
    onPost(review.id, text);
    setPosting(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit reply</h2>

        {/* Review text */}
        {review.comment && (
          <p className="text-sm text-gray-500 italic mb-4 pb-4 border-b border-gray-100">
            &ldquo;{review.comment}&rdquo;
          </p>
        )}

        {/* Textarea */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
        />

        {/* Character count */}
        <p
          className={`text-xs mt-1 mb-4 text-right ${
            charCount > 500
              ? "text-red-500"
              : charCount > 450
              ? "text-amber-500"
              : "text-gray-400"
          }`}
        >
          {charCount} / 500
        </p>

        {/* Actions */}
        <div className="flex gap-2 justify-between">
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            {regenerating ? "Regenerating…" : "↺ Regenerate with AI"}
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePost}
              disabled={posting || !text.trim()}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {posting ? "Posting…" : "Post reply"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

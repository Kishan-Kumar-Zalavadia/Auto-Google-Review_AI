"use client";

import { useState, useCallback } from "react";
import type { Review, Business } from "@/lib/types";
import ReviewCard from "@/components/ReviewCard";
import EditModal from "@/components/EditModal";
import Toast from "@/components/Toast";

type Tab = "pending" | "posted" | "skipped" | "flagged";

type Props = {
  reviews: Review[];
  business: Business;
};

type ToastState = { message: string; type: "success" | "error" } | null;

const EMPTY_STATES: Record<Tab, { heading: string; sub: string }> = {
  pending: {
    heading: "You're all caught up!",
    sub: "No reviews waiting for a reply.",
  },
  posted: {
    heading: "No replies posted yet",
    sub: "Approved replies will appear here.",
  },
  skipped: {
    heading: "Nothing skipped",
    sub: "Reviews you skip will appear here.",
  },
  flagged: {
    heading: "No flagged reviews",
    sub: "Reviews with sensitive content appear here.",
  },
};

export default function DashboardClient({ reviews: initialReviews, business }: Props) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [editReview, setEditReview] = useState<Review | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [checking, setChecking] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
  }, []);

  // Stats
  const now = new Date();
  const thisMonth = reviews.filter((r) => {
    if (r.status !== "posted" || !r.posted_at) return false;
    const d = new Date(r.posted_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.star_rating, 0) / reviews.length).toFixed(1)
      : "—";

  const posted = reviews.filter((r) => r.status === "posted").length;
  const responseRate =
    reviews.length > 0 ? Math.round((posted / reviews.length) * 100) : 0;

  const tabCounts: Record<Tab, number> = {
    pending: reviews.filter((r) => r.status === "pending").length,
    posted: reviews.filter((r) => r.status === "posted").length,
    skipped: reviews.filter((r) => r.status === "skipped").length,
    flagged: reviews.filter((r) => r.status === "flagged").length,
  };

  const filtered = reviews.filter((r) => r.status === activeTab);

  function updateReview(id: string, patch: Partial<Review>) {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function handleApprove(id: string) {
    updateReview(id, {
      status: "posted",
      posted_at: new Date().toISOString(),
      final_reply: reviews.find((r) => r.id === id)?.ai_draft,
    });
    try {
      const res = await fetch(`/api/reviews/${id}/approve`, { method: "POST" });
      const data = await res.json();
      if (data.code === "TRIAL_EXPIRED") {
        updateReview(id, { status: "pending", posted_at: undefined, final_reply: undefined });
        setShowUpgradeModal(true);
        return;
      }
      if (!res.ok) throw new Error("Failed");
      showToast("Reply posted successfully!", "success");
    } catch {
      // Revert
      updateReview(id, { status: "pending", posted_at: undefined, final_reply: undefined });
      showToast("Failed to post reply", "error");
    }
  }

  async function handleSkip(id: string) {
    updateReview(id, { status: "skipped" });
    try {
      const res = await fetch(`/api/reviews/${id}/skip`, { method: "POST" });
      const data = await res.json();
      if (data.code === "TRIAL_EXPIRED") {
        updateReview(id, { status: "pending" });
        setShowUpgradeModal(true);
        return;
      }
      if (!res.ok) throw new Error("Failed");
    } catch {
      updateReview(id, { status: "pending" });
      showToast("Failed to skip review", "error");
    }
  }

  async function handlePost(reviewId: string, replyText: string) {
    updateReview(reviewId, {
      status: "posted",
      final_reply: replyText,
      posted_at: new Date().toISOString(),
    });
    try {
      const res = await fetch(`/api/reviews/${reviewId}/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyText }),
      });
      if (!res.ok) throw new Error("Failed");
      showToast("Reply posted successfully!", "success");
    } catch {
      updateReview(reviewId, { status: "pending", final_reply: undefined, posted_at: undefined });
      showToast("Failed to post reply", "error");
    }
  }

  async function handleCheckReviews() {
    setChecking(true);
    try {
      const res = await fetch("/api/cron/fetch-reviews", {
        headers: { "x-cron-secret": process.env.NEXT_PUBLIC_CRON_SECRET || "" },
      });
      const data = await res.json();
      if (data.new_reviews > 0) {
        showToast(`${data.new_reviews} new review(s) found — refresh to see them`, "success");
      } else {
        showToast("No new reviews found", "success");
      }
    } catch {
      showToast("Failed to check for reviews", "error");
    } finally {
      setChecking(false);
    }
  }

  const tabs: Tab[] = ["pending", "posted", "skipped", "flagged"];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{business.name}</h1>
          <p className="text-sm text-gray-400">{business.city}</p>
        </div>
        <button
          onClick={handleCheckReviews}
          disabled={checking}
          className="px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          {checking ? "Checking…" : "Check for new reviews"}
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Pending", value: tabCounts.pending },
          { label: "Posted this month", value: thisMonth },
          { label: "Avg rating", value: `${avgRating} ★` },
          { label: "Response rate", value: `${responseRate}%` },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-100 rounded-xl p-3 text-center"
          >
            <p className="text-lg font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-100 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors relative ${
              activeTab === tab
                ? "text-gray-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-green-500"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab}
            {tabCounts[tab] > 0 && (
              <span
                className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === tab
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {tabCounts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Review list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-2xl mb-2">
            {activeTab === "pending" ? "🎉" : activeTab === "posted" ? "📭" : activeTab === "flagged" ? "✅" : "⏭"}
          </p>
          <p className="font-semibold text-gray-700">{EMPTY_STATES[activeTab].heading}</p>
          <p className="text-sm text-gray-400 mt-1">{EMPTY_STATES[activeTab].sub}</p>
        </div>
      ) : (
        filtered.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onApprove={handleApprove}
            onSkip={handleSkip}
            onEdit={setEditReview}
          />
        ))
      )}

      {/* Upgrade modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-xl">
            <div className="text-4xl mb-3">⏰</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Trial expired</h2>
            <p className="text-sm text-gray-500 mb-5">
              Your free trial has ended. Upgrade to keep posting replies.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50"
              >
                Not now
              </button>
              <a
                href="/billing"
                className="flex-1 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 text-center"
              >
                Upgrade now
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      <EditModal
        review={editReview}
        onClose={() => setEditReview(null)}
        onPost={handlePost}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}

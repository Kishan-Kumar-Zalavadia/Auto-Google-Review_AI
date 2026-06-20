import Link from "next/link";

type Props = {
  searchParams: Promise<{ error?: string; already?: string }>;
};

export default async function ApproveSuccessPage({ searchParams }: Props) {
  const { error, already } = await searchParams;

  const errorMessages: Record<string, string> = {
    missing_token: "Invalid approval link — the token is missing.",
    invalid_token: "Invalid approval link — could not decode the token.",
    not_found: "This review was not found or has already been handled.",
    no_draft: "There is no AI draft to post for this review.",
    post_failed: "Failed to post the reply to Google. Please try from your dashboard.",
  };

  const isError = !!error;
  const isAlready = !!already;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">
          {isError ? "❌" : isAlready ? "ℹ️" : "✓"}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isError
            ? "Something went wrong"
            : isAlready
            ? "Already posted"
            : "Reply posted to Google!"}
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          {isError
            ? (errorMessages[error!] || "An unexpected error occurred.")
            : isAlready
            ? "This reply has already been posted to Google."
            : "Your reply has been published on your Google Business Profile."}
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}

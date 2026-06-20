import Link from "next/link";

const PLANS = [
  {
    name: "Starter",
    price: "₹499",
    period: "/month",
    locations: "1 location",
    reviews: "Up to 50 reviews/month",
    features: ["AI reply generation", "Email notifications", "1-click approve"],
  },
  {
    name: "Growth",
    price: "₹1,499",
    period: "/month",
    locations: "3 locations",
    reviews: "Up to 200 reviews/month",
    features: ["Everything in Starter", "Hindi replies", "Auto-post 5-star"],
    highlighted: true,
  },
  {
    name: "Pro",
    price: "₹3,499",
    period: "/month",
    locations: "10 locations",
    reviews: "Up to 500 reviews/month",
    features: ["Everything in Growth", "Priority support", "Analytics dashboard"],
  },
  {
    name: "Agency",
    price: "₹12,999",
    period: "/month",
    locations: "Unlimited locations",
    reviews: "Unlimited reviews",
    features: ["Everything in Pro", "White-label options", "Dedicated account manager"],
  },
];

export default function BillingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose your plan</h1>
        <p className="text-gray-500">Start free, upgrade anytime. Cancel anytime.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl p-5 flex flex-col ${
              plan.highlighted
                ? "bg-gray-900 text-white border-2 border-gray-900"
                : "bg-white border border-gray-100"
            }`}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                Most popular
              </span>
            )}

            <h2 className={`text-lg font-bold mb-1 ${plan.highlighted ? "text-white" : "text-gray-900"}`}>
              {plan.name}
            </h2>
            <div className="mb-1">
              <span className={`text-3xl font-bold ${plan.highlighted ? "text-white" : "text-gray-900"}`}>
                {plan.price}
              </span>
              <span className={`text-sm ${plan.highlighted ? "text-gray-400" : "text-gray-400"}`}>
                {plan.period}
              </span>
            </div>
            <p className={`text-xs mb-4 ${plan.highlighted ? "text-gray-400" : "text-gray-400"}`}>
              {plan.locations} · {plan.reviews}
            </p>

            <ul className="flex-1 space-y-2 mb-6">
              {plan.features.map((f) => (
                <li key={f} className={`text-sm flex items-start gap-2 ${plan.highlighted ? "text-gray-300" : "text-gray-600"}`}>
                  <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              disabled
              className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${
                plan.highlighted
                  ? "bg-green-500 text-white opacity-60 cursor-not-allowed"
                  : "border border-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Razorpay integration coming soon
            </button>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-gray-400 mt-8">
        All plans include a 30-day free trial.{" "}
        <Link href="/dashboard" className="text-gray-600 underline">
          Back to dashboard
        </Link>
      </p>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ReplyAI — Auto-reply to Google reviews for Indian businesses",
  description:
    "AI drafts Google review replies for your restaurant, salon, or clinic. Approve in one click. Hindi + English. Starts at ₹499/month.",
  keywords:
    "Google review reply India, auto respond Google reviews, review management India, restaurant review reply",
  openGraph: {
    title: "ReplyAI — Auto-reply to Google reviews",
    description:
      "AI drafts replies. You approve in one click. Hindi + English support. Starts at ₹499/mo.",
    url: "https://replyai.in",
    siteName: "ReplyAI",
    locale: "en_IN",
    type: "website",
  },
};

// ── Landing Navbar ────────────────────────────────────────────────────────────

function LandingNav() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-0.5">
          <span className="text-xl font-bold" style={{ color: "#1D9E75" }}>
            ReplyAI
          </span>
          <span className="text-xl font-bold text-gray-400">.in</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block"
          >
            Log in
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors"
            style={{ backgroundColor: "#1D9E75" }}
          >
            Start free
          </Link>
        </nav>
      </div>
    </header>
  );
}

// ── Mock Review Card ──────────────────────────────────────────────────────────

function MockReviewCard() {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 max-w-sm w-full">
      {/* Review */}
      <div className="mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
            P
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Priya K.</p>
            <p className="text-xs text-amber-400">★★★★★</p>
          </div>
          <span className="ml-auto text-xs text-gray-400">2h ago</span>
        </div>
        <p className="text-sm text-gray-600 italic">
          &ldquo;Best salon in Bangalore honestly. Staff was so friendly and my
          hair looks amazing!&rdquo;
        </p>
      </div>

      {/* AI Draft */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs font-semibold" style={{ color: "#1D9E75" }}>
            ✦ AI draft reply
          </span>
        </div>
        <div
          className="rounded-xl p-3 text-sm text-gray-700"
          style={{ backgroundColor: "#F0FBF7", border: "1px solid #A7F0D8" }}
        >
          Thank you so much, Priya! We&apos;re thrilled you loved your
          experience — our team works hard to make every visit special. Can
          &apos;t wait to see you again! 💚
        </div>
      </div>

      {/* Approve button */}
      <button
        className="w-full py-2.5 text-sm font-semibold text-white rounded-xl transition-colors"
        style={{ backgroundColor: "#1D9E75" }}
      >
        Approve &amp; post →
      </button>
    </div>
  );
}

// ── Pain Cards ────────────────────────────────────────────────────────────────

const PAIN_POINTS = [
  {
    icon: "💬",
    text: "You have 80 Google reviews. You've replied to 3.",
  },
  {
    icon: "⏰",
    text: "Writing one reply takes 10 minutes. You have zero time.",
  },
  {
    icon: "📉",
    text: "Unanswered 1-star reviews are hurting your Google ranking.",
  },
];

// ── How It Works ─────────────────────────────────────────────────────────────

const HOW_STEPS = [
  {
    num: "1",
    icon: "🔌",
    title: "Connect your Google Business",
    desc: "Link your GBP account in one click. Takes 60 seconds.",
  },
  {
    num: "2",
    icon: "🎚️",
    title: "Set your tone",
    desc: "Friendly, professional, or casual. We write in your voice.",
  },
  {
    num: "3",
    icon: "✅",
    title: "Approve drafts in one tap",
    desc: "Get email alerts. Approve or edit before it posts to Google.",
  },
];

// ── Features ──────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: "✅",
    title: "Auto-detect new reviews",
    desc: "We check every 30 minutes. You never miss a review again.",
  },
  {
    icon: "📱",
    title: "Email approval",
    desc: "One tap from your inbox. No app to install.",
  },
  {
    icon: "🇮🇳",
    title: "Hindi + English replies",
    desc: "Write in your customer's language. Seamlessly.",
  },
  {
    icon: "⭐",
    title: "Auto-post 5-star replies",
    desc: "Skip approval for your best reviews. Save even more time.",
  },
  {
    icon: "🔒",
    title: "You stay in control",
    desc: "Edit any draft before it posts. Your words, your brand.",
  },
  {
    icon: "📊",
    title: "Review dashboard",
    desc: "See all reviews in one place. Pending, posted, skipped.",
  },
];

// ── Pricing ───────────────────────────────────────────────────────────────────

const PLANS = [
  {
    name: "Starter",
    price: "₹499",
    period: "/mo",
    desc: "1 location · 30 replies/mo",
    features: ["AI reply generation", "Email approval", "1-click approve", "English replies"],
    cta: "Get started free",
    highlight: false,
  },
  {
    name: "Growth",
    price: "₹1,499",
    period: "/mo",
    desc: "3 locations · unlimited replies",
    features: [
      "Everything in Starter",
      "Hindi + English replies",
      "Auto-post 5-star reviews",
      "Priority support",
    ],
    cta: "Get started free",
    highlight: true,
  },
  {
    name: "Pro",
    price: "₹3,499",
    period: "/mo",
    desc: "10 locations · unlimited replies",
    features: [
      "Everything in Growth",
      "Sentiment dashboard",
      "SMS + email alerts",
      "Dedicated account manager",
    ],
    cta: "Get started free",
    highlight: false,
  },
  {
    name: "Agency",
    price: "₹12,999",
    period: "/mo",
    desc: "Unlimited locations",
    features: [
      "Everything in Pro",
      "White-label options",
      "Client portal",
      "Custom integrations",
    ],
    cta: "Contact us",
    highlight: false,
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      <LandingNav />

      {/* ── HERO ── */}
      <section className="bg-white py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          {/* Left */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border"
              style={{ backgroundColor: "#F0FBF7", borderColor: "#A7F0D8", color: "#1D9E75" }}>
              ✦ Now in beta · First 20 businesses free
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-5">
              Your Google reviews,{" "}
              <span style={{ color: "#1D9E75" }}>replied to.</span>
              {" "}Automatically.
            </h1>

            <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto lg:mx-0">
              AI drafts a reply the moment a new review lands. You approve in
              one click. Never ignore a review again.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
              <Link
                href="/login"
                className="px-6 py-3.5 text-base font-semibold text-white rounded-xl transition-colors text-center"
                style={{ backgroundColor: "#1D9E75" }}
              >
                Start free — no credit card
              </Link>
              <a
                href="#how-it-works"
                className="px-6 py-3.5 text-base font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors text-center"
              >
                See how it works
              </a>
            </div>

            <p className="text-sm text-gray-400">
              ⭐ Trusted by restaurants, salons, and clinics across India
            </p>
          </div>

          {/* Right — Mock UI */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <MockReviewCard />
          </div>
        </div>
      </section>

      {/* ── PAIN ── */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
            Sound familiar?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PAIN_POINTS.map((p) => (
              <div
                key={p.text}
                className="bg-white border border-gray-100 rounded-2xl p-6 text-center"
              >
                <div className="text-4xl mb-3">{p.icon}</div>
                <p className="text-gray-700 font-medium">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Set up in 5 minutes. Never ignore a review again.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
            {HOW_STEPS.map((step, i) => (
              <div key={step.num} className="flex flex-col items-center text-center relative">
                {/* Connector line (desktop only) */}
                {i < HOW_STEPS.length - 1 && (
                  <div className="hidden sm:block absolute top-8 left-[60%] right-[-40%] h-px bg-gray-200 z-0" />
                )}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-4 relative z-10"
                  style={{ backgroundColor: "#F0FBF7", border: "2px solid #A7F0D8" }}
                >
                  {step.icon}
                </div>
                <div
                  className="text-xs font-bold mb-2 px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "#F0FBF7", color: "#1D9E75" }}
                >
                  Step {step.num}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
            Everything you need
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white border border-gray-100 rounded-2xl p-5"
              >
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="py-12 px-4 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { num: "3.5M+", label: "Indian businesses on Google" },
              { num: "200+", label: "Reviews responded to" },
              { num: "< 5 min", label: "Setup time" },
            ].map((s, i) => (
              <div key={s.label} className={`py-4 ${i !== 2 ? "sm:border-r border-gray-100" : ""}`}>
                <p className="text-3xl font-bold text-gray-900 mb-1">{s.num}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Simple pricing. No surprises.
            </h2>
            <p className="text-gray-500">
              Start free for 30 days. No credit card needed.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-5 flex flex-col ${
                  plan.highlight
                    ? "bg-gray-900 text-white"
                    : "bg-white border border-gray-100"
                }`}
                style={plan.highlight ? { border: "2px solid #1D9E75" } : {}}
              >
                {plan.highlight && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold rounded-full text-white"
                    style={{ backgroundColor: "#1D9E75" }}
                  >
                    Most popular
                  </span>
                )}
                <h3 className={`text-lg font-bold mb-1 ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                  {plan.name}
                </h3>
                <div className="mb-1">
                  <span className={`text-3xl font-bold ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                    {plan.price}
                  </span>
                  <span className="text-sm text-gray-400">{plan.period}</span>
                </div>
                <p className={`text-xs mb-4 ${plan.highlight ? "text-gray-400" : "text-gray-400"}`}>
                  {plan.desc}
                </p>
                <ul className="flex-1 space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className={`text-sm flex items-start gap-2 ${plan.highlight ? "text-gray-300" : "text-gray-600"}`}>
                      <span style={{ color: "#1D9E75" }} className="shrink-0 mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-colors block"
                  style={
                    plan.highlight
                      ? { backgroundColor: "#1D9E75", color: "white" }
                      : { border: "1px solid #e5e7eb", color: "#374151" }
                  }
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 px-4 bg-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Stop ignoring your reviews
          </h2>
          <p className="text-gray-500 mb-8">
            Set up in 5 minutes. First 30 days completely free.
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-4 text-lg font-semibold text-white rounded-xl transition-colors"
            style={{ backgroundColor: "#1D9E75" }}
          >
            Get started free
          </Link>
          <p className="text-sm text-gray-400 mt-4">
            No credit card. Cancel anytime. Built for Indian businesses.
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-50 border-t border-gray-100 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-0.5 mb-1">
              <span className="text-lg font-bold" style={{ color: "#1D9E75" }}>ReplyAI</span>
              <span className="text-lg font-bold text-gray-400">.in</span>
            </div>
            <p className="text-xs text-gray-400">Built for Indian businesses</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms of Service</Link>
            <a href="mailto:hello@replyai.in" className="hover:text-gray-600 transition-colors">hello@replyai.in</a>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-6 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">© 2025 ReplyAI. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

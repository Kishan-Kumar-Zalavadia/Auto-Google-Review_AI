"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const BUSINESS_TYPES = [
  "restaurant", "cafe", "salon", "clinic", "hotel", "gym", "retail", "other",
];

const STEPS = ["Business info", "Reply settings", "Connect Google"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Step 1 fields
  const [name, setName] = useState("");
  const [type, setType] = useState("restaurant");
  const [city, setCity] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [notificationEmail, setNotificationEmail] = useState("");

  // Step 2 fields
  const [tone, setTone] = useState<"friendly" | "professional" | "casual">("friendly");
  const [language, setLanguage] = useState<"english" | "hindi">("english");

  const inputClass =
    "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900";

  async function saveBusinessAndContinue() {
    if (!name.trim() || !city.trim() || !notificationEmail.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type,
          city: city.trim(),
          specialty: specialty.trim() || null,
          contact_email: contactEmail.trim() || null,
          notification_email: notificationEmail.trim(),
          tone,
          reply_language: language,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStep(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function saveReplySettings() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/settings/business", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tone, reply_language: language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Set up ReplyAI</h1>
          <p className="text-sm text-gray-400 mt-1">Takes about 2 minutes</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full h-1.5 rounded-full transition-colors ${
                  i <= step ? "bg-gray-900" : "bg-gray-200"
                }`}
              />
              <span className={`text-xs ${i === step ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">

          {/* ── STEP 0: Business info ── */}
          {step === 0 && (
            <>
              <h2 className="text-base font-semibold text-gray-900 mb-5">Tell us about your business</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business name <span className="text-red-400">*</span>
                  </label>
                  <input
                    className={inputClass}
                    placeholder="Spice Garden Restaurant"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business type <span className="text-red-400">*</span>
                  </label>
                  <select className={inputClass} value={type} onChange={e => setType(e.target.value)}>
                    {BUSINESS_TYPES.map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-400">*</span>
                  </label>
                  <input
                    className={inputClass}
                    placeholder="Bangalore"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    What are you known for? <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    className={inputClass}
                    rows={2}
                    placeholder="e.g. North Indian cuisine, especially butter chicken"
                    value={specialty}
                    onChange={e => setSpecialty(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact email for negative replies <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="email"
                    className={inputClass}
                    placeholder="manager@yourbusiness.com"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Send review alerts to <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    className={inputClass}
                    placeholder="you@example.com"
                    value={notificationEmail}
                    onChange={e => setNotificationEmail(e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-1">Approval emails will be sent here</p>
                </div>
              </div>

              {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

              <button
                onClick={saveBusinessAndContinue}
                disabled={saving}
                className="mt-6 w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : "Continue →"}
              </button>
            </>
          )}

          {/* ── STEP 1: Reply settings ── */}
          {step === 1 && (
            <>
              <h2 className="text-base font-semibold text-gray-900 mb-5">How should we reply?</h2>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reply language</label>
                <div className="flex gap-2">
                  {(["english", "hindi"] as const).map(lang => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-xl border transition-colors ${
                        language === lang
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {lang === "english" ? "English" : "हिंदी (Hindi)"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reply tone</label>
                <div className="flex flex-col gap-2">
                  {[
                    { value: "friendly", label: "Friendly & warm", desc: "Personal, like talking to a friend" },
                    { value: "professional", label: "Professional", desc: "Polished and business-like" },
                    { value: "casual", label: "Casual & fun", desc: "Relaxed and conversational" },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setTone(opt.value as typeof tone)}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-colors ${
                        tone === opt.value
                          ? "border-gray-900 bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                        tone === opt.value ? "border-gray-900" : "border-gray-300"
                      }`}>
                        {tone === opt.value && <div className="w-2 h-2 rounded-full bg-gray-900" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{opt.label}</p>
                        <p className="text-xs text-gray-400">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

              <div className="flex gap-2">
                <button
                  onClick={() => setStep(0)}
                  className="px-4 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={saveReplySettings}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Continue →"}
                </button>
              </div>
            </>
          )}

          {/* ── STEP 2: Connect Google ── */}
          {step === 2 && (
            <>
              <h2 className="text-base font-semibold text-gray-900 mb-2">Connect Google Business</h2>
              <p className="text-sm text-gray-500 mb-6">
                We need access to your Google Business Profile to fetch reviews and post replies.
              </p>

              <a
                href="/api/gbp/connect"
                className="w-full flex items-center justify-center gap-3 py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Connect Google Business Profile
              </a>

              <button
                onClick={() => router.push("/dashboard")}
                className="w-full mt-3 py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Skip for now → go to dashboard
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                You can connect later from Settings
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

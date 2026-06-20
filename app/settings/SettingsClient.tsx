"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Business } from "@/lib/types";

type Props = { business: Business };

type ToastState = { message: string; type: "success" | "error" } | null;

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-4">
      <h2 className="text-base font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

const inputClass = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900";

const BUSINESS_TYPES = ["restaurant", "cafe", "salon", "clinic", "hotel", "gym", "retail", "other"];

export default function SettingsClient({ business }: Props) {
  const router = useRouter();

  // Section 1 — Business info
  const [name, setName] = useState(business.name);
  const [type, setType] = useState(business.type);
  const [city, setCity] = useState(business.city);
  const [specialty, setSpecialty] = useState(business.specialty || "");
  const [contactEmail, setContactEmail] = useState(business.contact_email || "");

  // Section 2 — Reply preferences
  const [language, setLanguage] = useState(business.reply_language);
  const [tone, setTone] = useState(business.tone);

  // Section 3 — Notifications
  const [notificationEmail, setNotificationEmail] = useState(business.notification_email);

  // Section 4 — Automation
  const [autoPost, setAutoPost] = useState(business.auto_post_5star);
  const [autoPostSaving, setAutoPostSaving] = useState(false);

  // UI state
  const [toast, setToast] = useState<ToastState>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function patch(endpoint: string, body: Record<string, unknown>) {
    const res = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed");
    return data;
  }

  async function saveBusinessInfo() {
    setSaving("info");
    try {
      await patch("/api/settings/business", { name, type, city, specialty, contact_email: contactEmail });
      showToast("Business info saved", "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to save", "error");
    } finally {
      setSaving(null);
    }
  }

  async function saveReplyPreferences() {
    setSaving("reply");
    try {
      await patch("/api/settings/business", { tone, reply_language: language });
      showToast("Reply preferences saved", "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to save", "error");
    } finally {
      setSaving(null);
    }
  }

  async function saveNotifications() {
    setSaving("notif");
    try {
      await patch("/api/settings/notifications", { notification_email: notificationEmail });
      showToast("Notification email saved", "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to save", "error");
    } finally {
      setSaving(null);
    }
  }

  async function toggleAutoPost(val: boolean) {
    setAutoPost(val);
    setAutoPostSaving(true);
    try {
      await patch("/api/settings/automation", { auto_post_5star: val });
    } catch {
      setAutoPost(!val);
      showToast("Failed to update automation", "error");
    } finally {
      setAutoPostSaving(false);
    }
  }

  async function disconnectGBP() {
    try {
      const res = await fetch("/api/settings/disconnect-gbp", { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("Google disconnected", "success");
      setTimeout(() => router.push("/onboarding"), 1000);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed", "error");
    } finally {
      setShowDisconnectConfirm(false);
    }
  }

  async function deleteAccount() {
    if (deleteConfirm !== "DELETE") return;
    try {
      const res = await fetch("/api/settings/account", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/login");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed", "error");
    }
  }

  const SaveBtn = ({ section, onClick }: { section: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      disabled={saving === section}
      className="mt-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50"
    >
      {saving === section ? "Saving…" : "Save"}
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Settings</h1>

      {/* Section 1 — Business info */}
      <SectionCard title="Business info">
        <Field label="Business name">
          <input className={inputClass} value={name} onChange={e => setName(e.target.value)} />
        </Field>
        <Field label="Business type">
          <select className={inputClass} value={type} onChange={e => setType(e.target.value)}>
            {BUSINESS_TYPES.map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </Field>
        <Field label="City">
          <input className={inputClass} value={city} onChange={e => setCity(e.target.value)} />
        </Field>
        <Field label="What are you known for?" hint="Optional — helps AI write more relevant replies">
          <textarea
            className={inputClass}
            rows={2}
            value={specialty}
            onChange={e => setSpecialty(e.target.value)}
          />
        </Field>
        <Field label="Contact email for negative replies">
          <input type="email" className={inputClass} value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
        </Field>
        <SaveBtn section="info" onClick={saveBusinessInfo} />
      </SectionCard>

      {/* Section 2 — Reply preferences */}
      <SectionCard title="Reply preferences">
        {/* Language toggle */}
        <Field label="Reply language">
          <div className="flex gap-2">
            {(["english", "hindi"] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`flex-1 py-2 text-sm font-medium rounded-xl border transition-colors ${
                  language === lang
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                {lang === "english" ? "English" : "हिंदी (Hindi)"}
              </button>
            ))}
          </div>
        </Field>

        {/* Tone radio cards */}
        <Field label="Reply tone">
          <div className="flex flex-col gap-2">
            {[
              { value: "friendly", label: "Friendly & warm", desc: "Personal, like talking to a friend" },
              { value: "professional", label: "Professional", desc: "Polished and business-like" },
              { value: "casual", label: "Casual & fun", desc: "Relaxed and conversational" },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setTone(opt.value as Business["tone"])}
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
        </Field>
        <SaveBtn section="reply" onClick={saveReplyPreferences} />
      </SectionCard>

      {/* Section 3 — Notifications */}
      <SectionCard title="Notifications">
        <Field label="Send review alerts to" hint="This is where approval emails are sent. Change to any email.">
          <input
            type="email"
            className={inputClass}
            value={notificationEmail}
            onChange={e => setNotificationEmail(e.target.value)}
          />
        </Field>
        <SaveBtn section="notif" onClick={saveNotifications} />
      </SectionCard>

      {/* Section 4 — Automation */}
      <SectionCard title="Automation">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Auto-post 5-star replies</p>
            <p className="text-xs text-gray-400 mt-0.5">Post without approval for 5-star reviews</p>
          </div>
          <button
            onClick={() => toggleAutoPost(!autoPost)}
            disabled={autoPostSaving}
            className={`relative w-11 h-6 rounded-full transition-colors ${autoPost ? "bg-green-500" : "bg-gray-200"}`}
          >
            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoPost ? "translate-x-5" : ""}`} />
          </button>
        </div>
        {autoPost && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-700">
              ⚠ 5-star replies will post automatically without your approval. Make sure your AI prompt sounds right first.
            </p>
          </div>
        )}
      </SectionCard>

      {/* Section 5 — Google connection */}
      <SectionCard title="Google Business Profile">
        {business.gbp_location_name ? (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <p className="text-sm font-medium text-gray-900">Connected</p>
            </div>
            <p className="text-xs text-gray-400 mb-4">{business.gbp_location_name}</p>
            {!showDisconnectConfirm ? (
              <button
                onClick={() => setShowDisconnectConfirm(true)}
                className="px-4 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 transition-colors"
              >
                Disconnect Google Business
              </button>
            ) : (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-700 mb-3">Are you sure? This will stop all review monitoring.</p>
                <div className="flex gap-2">
                  <button onClick={disconnectGBP} className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                    Yes, disconnect
                  </button>
                  <button onClick={() => setShowDisconnectConfirm(false)} className="px-3 py-1.5 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-gray-300" />
              <p className="text-sm text-gray-500">Not connected</p>
            </div>
            <a
              href="/onboarding"
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors inline-block"
            >
              Connect Google Business
            </a>
          </div>
        )}
      </SectionCard>

      {/* Section 6 — Danger zone */}
      <div className="border border-red-200 rounded-2xl p-6 mb-4">
        <h2 className="text-base font-semibold text-red-600 mb-4">Danger zone</h2>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 transition-colors"
          >
            Delete account
          </button>
        ) : (
          <div>
            <p className="text-sm text-gray-700 mb-3">
              This will permanently delete your account and all reviews. Type <strong>DELETE</strong> to confirm.
            </p>
            <input
              type="text"
              className={`${inputClass} mb-3`}
              placeholder="Type DELETE"
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={deleteAccount}
                disabled={deleteConfirm !== "DELETE"}
                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-40"
              >
                Delete my account
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirm(""); }}
                className="px-3 py-1.5 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
          toast.type === "success" ? "bg-green-600" : "bg-red-500"
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

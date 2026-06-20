"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const HIDE_NAV_ON = ["/login", "/onboarding"];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const hideNav = HIDE_NAV_ON.some((p) => pathname.startsWith(p));
  if (hideNav || !user) return null;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors ${
        pathname.startsWith(href)
          ? "text-gray-900"
          : "text-gray-500 hover:text-gray-900"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="font-bold text-gray-900 text-lg">
          ReplyAI
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6">
          {navLink("/dashboard", "Reviews")}
          {navLink("/settings", "Settings")}
        </nav>

        {/* Desktop right */}
        <div className="hidden sm:flex items-center gap-4">
          <span className="text-xs text-gray-400 truncate max-w-[180px]">
            {user.email}
          </span>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Log out
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2 text-gray-500"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-4">
          <Link href="/dashboard" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
            Reviews
          </Link>
          <Link href="/settings" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
            Settings
          </Link>
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 mb-3 truncate">{user.email}</p>
            <button onClick={handleSignOut} className="text-sm text-red-500 font-medium">
              Log out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

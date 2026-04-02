// src/app/admin/login/page.tsx
// Maa Flavours — Admin Login Page
// Route: /admin/login
// Design: Dark premium card on deep brown background
// Auth: email + bcrypt password → JWT cookie (mf-admin-token)
// On success: redirect to /admin/dashboard

"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// ─── Brand colours (mirrored from tailwind.config.ts) ────────────────────────
// Admin panel uses a dark theme while keeping brand gold accents

export default function AdminLoginPage() {
  const router = useRouter();

  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [showPass,  setShowPass]  = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Login failed. Please check your credentials.");
        return;
      }

      // Cookie set by API — redirect to dashboard
      router.push("/admin/dashboard");
      router.refresh();

    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #1a0f05 0%, #2d1a0a 40%, #1a0f05 100%)" }}
    >
      {/* ── Subtle grain texture overlay ── */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Login Card ── */}
      <div className="relative w-full max-w-md">

        {/* Gold top border accent */}
        <div
          className="h-1 w-full rounded-t-2xl"
          style={{ background: "linear-gradient(90deg, transparent, #C8960C, #E8B84B, #C8960C, transparent)" }}
        />

        <div
          className="rounded-b-2xl px-8 py-10 shadow-2xl"
          style={{ background: "rgba(26, 15, 5, 0.95)", border: "1px solid rgba(200, 150, 12, 0.15)", borderTop: "none" }}
        >
          {/* ── Brand logo / wordmark ── */}
          <div className="text-center mb-8">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <Image
                src="/maa-flavours-logo.png"
                alt="Maa Flavours"
                fill
                className="object-contain"
                sizes="80px"
                priority
              />
            </div>

            <h1
              className="text-2xl font-bold tracking-wide mb-1"
              style={{ fontFamily: "'Playfair Display', serif", color: "#E8B84B" }}
            >
              Maa Flavours
            </h1>
            <p className="text-sm" style={{ color: "rgba(200, 150, 12, 0.6)" }}>
              Admin Portal
            </p>

            {/* Ornamental divider */}
            <div className="flex items-center gap-3 mt-4">
              <div className="flex-1 h-px" style={{ background: "rgba(200, 150, 12, 0.2)" }} />
              <span style={{ color: "rgba(200, 150, 12, 0.4)", fontSize: "10px", letterSpacing: "0.15em" }}>
                ✦ SECURE LOGIN ✦
              </span>
              <div className="flex-1 h-px" style={{ background: "rgba(200, 150, 12, 0.2)" }} />
            </div>
          </div>

          {/* ── Login Form ── */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-medium mb-2 tracking-widest uppercase"
                style={{ color: "rgba(200, 150, 12, 0.7)", fontFamily: "'DM Sans', sans-serif" }}
              >
                Email Address
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                placeholder="admin@maaflavours.com"
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                style={{
                  background:   "rgba(255,255,255,0.05)",
                  border:       error ? "1px solid #C0272D" : "1px solid rgba(200,150,12,0.25)",
                  color:        "#FAFAF5",
                  fontFamily:   "'DM Sans', sans-serif",
                }}
                onFocus={e => {
                  e.target.style.border = "1px solid rgba(200,150,12,0.6)";
                  e.target.style.background = "rgba(255,255,255,0.08)";
                }}
                onBlur={e => {
                  e.target.style.border = error ? "1px solid #C0272D" : "1px solid rgba(200,150,12,0.25)";
                  e.target.style.background = "rgba(255,255,255,0.05)";
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-medium mb-2 tracking-widest uppercase"
                style={{ color: "rgba(200, 150, 12, 0.7)", fontFamily: "'DM Sans', sans-serif" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 pr-12 rounded-lg text-sm outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border:     error ? "1px solid #C0272D" : "1px solid rgba(200,150,12,0.25)",
                    color:      "#FAFAF5",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  onFocus={e => {
                    e.target.style.border = "1px solid rgba(200,150,12,0.6)";
                    e.target.style.background = "rgba(255,255,255,0.08)";
                  }}
                  onBlur={e => {
                    e.target.style.border = error ? "1px solid #C0272D" : "1px solid rgba(200,150,12,0.25)";
                    e.target.style.background = "rgba(255,255,255,0.05)";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-opacity hover:opacity-100 opacity-50"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#C8960C" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#C8960C" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm"
                style={{ background: "rgba(192, 39, 45, 0.15)", border: "1px solid rgba(192, 39, 45, 0.3)", color: "#ff6b6b" }}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 relative overflow-hidden"
              style={{
                background:   loading ? "rgba(200, 150, 12, 0.5)" : "linear-gradient(135deg, #C8960C, #E8B84B, #C8960C)",
                backgroundSize: "200% 100%",
                color:        "#1a0f05",
                fontFamily:   "'DM Sans', sans-serif",
                letterSpacing: "0.08em",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in…
                </span>
              ) : "Sign In to Admin"}
            </button>
          </form>

          {/* Footer note */}
          <p
            className="text-center text-xs mt-6"
            style={{ color: "rgba(200, 150, 12, 0.3)", fontFamily: "'DM Sans', sans-serif" }}
          >
            Secured admin access for Maa Flavours team only.<br/>
            Not your portal?{" "}
            <a href="/" style={{ color: "rgba(200, 150, 12, 0.5)" }} className="hover:underline">
              Return to store →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

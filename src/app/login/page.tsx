"use client";
// src/app/login/page.tsx
// Maa Flavours — Standalone Login Page at /login
// Used when user navigates directly to /login (not via modal)
// Same 4-step OTP flow but in a full-page layout with brand elements
// Redirects to ?redirect= param or /account after login

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  ShieldCheck, ArrowRight, CheckCircle2,
  User, Mail, Star, Package,
} from "lucide-react";
import OtpBoxes from "@/components/auth/OtpBoxes";
import ResendTimer from "@/components/auth/ResendTimer";
import toast from "react-hot-toast";

// ─── Helpers ─────────────────────────────────────────────────────────────
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  return local.slice(0, 2) + "***@" + domain;
}

// ─── Testimonial strip ───────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: "Lakshmi D.", city: "Hyderabad", text: "Best gongura I've tasted since my grandmother's. Ships so fast!" },
  { name: "Ravi K.", city: "Chennai", text: "Drumstick pickle is outstanding. Exactly the Andhra taste I missed." },
  { name: "Ananya M.", city: "Bangalore", text: "No preservatives and still so fresh. Ordering every month now!" },
];

type LoginStep = "email" | "otp" | "profile" | "success";

// ─── Inner content (needs useSearchParams — wrapped in Suspense) ─────────
function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";

  const [step, setStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otp, setOtp] = useState(Array(8).fill(""));
  const [otpError, setOtpError] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [profileError, setProfileError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendKey, setResendKey] = useState(0);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const emailRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // Auto-focus email on mount
  useEffect(() => { setTimeout(() => emailRef.current?.focus(), 200); }, []);

  // Rotate testimonials
  useEffect(() => {
    const t = setInterval(() => {
      setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  // ─── Step 1: Send OTP ────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!isValidEmail(email)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    setEmailError("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setEmailError(data.error || "Failed to send OTP.");
        return;
      }
      setMaskedEmail(data.maskedEmail || maskEmail(email.trim()));
      setStep("otp");
    } catch {
      setEmailError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Verify OTP ──────────────────────────────────────────────
  const handleVerifyOtp = useCallback(async (code?: string) => {
    const otpCode = code ?? otp.join("");
    if (otpCode.length < 8) { setOtpError("Enter all 8 digits of your OTP."); return; }
    setLoading(true);
    setOtpError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otpCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setOtpError(data.error || "Incorrect OTP.");
        setOtp(Array(8).fill(""));
        return;
      }
      if (data.isNewUser) {
        setStep("profile");
        setTimeout(() => nameRef.current?.focus(), 100);
      } else {
        setStep("success");
        window.dispatchEvent(new CustomEvent("mf:auth:login", {
          detail: { name: data.user?.name, email: email.trim(), isNewUser: false }
        }));
        setTimeout(() => router.push(redirectTo), 1800);
      }
    } catch {
      setOtpError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [email, otp, redirectTo, router]);

  // ─── Resend ──────────────────────────────────────────────────────────
  const handleResend = async () => {
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    const data = await res.json();
    if (data.success) {
      setOtp(Array(6).fill("")); setOtpError("");
      setResendKey((k) => k + 1);
      toast.success("OTP sent again!");
    } else {
      toast.error(data.error || "Could not resend OTP.");
    }
  };

  // ─── Step 3: Save profile ────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!name.trim() || name.trim().length < 2) {
      setProfileError("Please enter your full name."); return;
    }
    const mobileDigits = mobile.replace(/\D/g, "");
    if (mobileDigits && !/^[6-9]\d{9}$/.test(mobileDigits)) {
      setProfileError("Enter a valid 10-digit Indian mobile number."); return;
    }
    setLoading(true); setProfileError("");
    try {
      const mobileFormatted = mobileDigits ? `+91${mobileDigits}` : undefined;
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim(), mobile: mobileFormatted }),
      });
      const data = await res.json();
      if (!data.success) { setProfileError(data.error || "Could not save profile."); return; }
      setStep("success");
      window.dispatchEvent(new CustomEvent("mf:auth:login", {
        detail: { name: name.trim(), email: email.trim(), isNewUser: true }
      }));
      setTimeout(() => router.push(redirectTo), 1800);
    } catch {
      setProfileError("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const t = TESTIMONIALS[testimonialIdx];

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row"
      style={{ background: "var(--color-warm-white)" }}
    >
      {/* ── Left brand panel (desktop only) ────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #4A2C0A 0%, #6B3E12 40%, #8B4C14 100%)",
        }}
      >
        {/* Texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
            backgroundSize: "12px 12px",
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/">
            <p className="font-dancing text-4xl" style={{ color: "var(--color-gold-light)" }}>
              Maa Flavours
            </p>
            <p className="font-cormorant italic text-lg mt-1" style={{ color: "rgba(232,184,75,0.7)" }}>
              Authentic Andhra Taste
            </p>
          </Link>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex flex-col gap-6">
          <div>
            <h2 className="font-playfair font-bold text-4xl leading-tight text-white">
              Taste the love
              <br />
              <span style={{ color: "var(--color-gold-light)" }}>Maa bottled</span>
              <br />
              just for you.
            </h2>
            <p className="font-dm-sans text-base mt-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
              Handcrafted in Ongole with generations of Andhra tradition.
              No preservatives. No shortcuts. Just pure, homemade flavour.
            </p>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "🏺", label: "Homemade" },
              { icon: "🌿", label: "No Preservatives" },
              { icon: "🚚", label: "Pan-India Delivery" },
              { icon: "✅", label: "100% Vegetarian" },
            ].map((b) => (
              <div
                key={b.label}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(232,184,75,0.2)" }}
              >
                <span className="text-xl">{b.icon}</span>
                <span className="font-dm-sans text-sm font-medium text-white">{b.label}</span>
              </div>
            ))}
          </div>

          {/* Rotating testimonial */}
          <div
            className="px-5 py-4 rounded-2xl"
            style={{ background: "rgba(200,150,12,0.15)", border: "1px solid rgba(200,150,12,0.3)" }}
          >
            <div className="flex mb-2">
              {Array(5).fill(0).map((_, i) => (
                <Star key={i} size={14} fill="var(--color-gold-light)" strokeWidth={0} />
              ))}
            </div>
            <p className="font-cormorant italic text-lg text-white leading-snug">
              "{t.text}"
            </p>
            <p className="font-dm-sans text-sm mt-2" style={{ color: "rgba(232,184,75,0.8)" }}>
              — {t.name}, {t.city}
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <div className="ornament-line w-24 mb-3" style={{ background: "rgba(200,150,12,0.4)", height: "1px" }} />
          <p className="font-dm-sans text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            © 2025 Maa Flavours, Ongole, Andhra Pradesh
          </p>
        </div>
      </div>

      {/* ── Right: auth form ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 min-h-screen lg:min-h-0">

        {/* Mobile logo */}
        <div className="lg:hidden text-center mb-8">
          <Link href="/">
            <p className="font-dancing text-3xl" style={{ color: "var(--color-crimson)" }}>Maa Flavours</p>
          </Link>
        </div>

        {/* Card */}
        <div
          className="w-full flex flex-col rounded-3xl overflow-hidden"
          style={{
            maxWidth: 460,
            background: "white",
            border: "1px solid rgba(200,150,12,0.15)",
            boxShadow: "0 8px 40px rgba(74,44,10,0.1)",
          }}
        >
          {/* Gold ornament */}
          <div
            className="h-1 flex-shrink-0"
            style={{
              background:
                "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)",
            }}
          />

          {/* Card header */}
          <div className="px-7 pt-7 pb-4 text-center border-b" style={{ borderColor: "rgba(200,150,12,0.1)" }}>
            <div className="flex justify-center mb-3">
              {step === "success" ? (
                <div
                  className="relative w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(46,125,50,0.1)", border: "3px solid rgba(46,125,50,0.25)" }}
                >
                  <CheckCircle2 size={28} strokeWidth={1.75} style={{ color: "#2E7D32" }} />
                  <div className="absolute inset-0 rounded-full animate-ping"
                    style={{ background: "rgba(46,125,50,0.1)", animationDuration: "1.4s" }} />
                </div>
              ) : step === "otp" ? (
                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(200,150,12,0.1)", border: "2px solid rgba(200,150,12,0.25)" }}>
                  <ShieldCheck size={26} strokeWidth={1.75} style={{ color: "var(--color-gold)" }} />
                </div>
              ) : step === "profile" ? (
                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(192,39,45,0.08)", border: "2px solid rgba(192,39,45,0.18)" }}>
                  <User size={26} strokeWidth={1.75} style={{ color: "var(--color-crimson)" }} />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(192,39,45,0.08)", border: "2px solid rgba(192,39,45,0.18)" }}>
                  <Mail size={24} strokeWidth={1.75} style={{ color: "var(--color-crimson)" }} />
                </div>
              )}
            </div>

            <h1 className="font-playfair font-bold text-xl" style={{ color: "var(--color-brown)" }}>
              {step === "email" && "Sign In"}
              {step === "otp" && "Enter OTP"}
              {step === "profile" && "Complete Your Profile"}
              {step === "success" && "You're in! 🎉"}
            </h1>
            <p className="font-dm-sans text-sm mt-1" style={{ color: "var(--color-grey)" }}>
              {step === "email" && "We'll send an OTP code to your email"}
              {step === "otp" && `OTP sent to ${maskedEmail}`}
              {step === "profile" && "Tell us your name to complete registration"}
              {step === "success" && "Redirecting you now…"}
            </p>

            {/* Step progress bar */}
            <div className="flex gap-1 mt-4 justify-center">
              {(["email", "otp", "profile"] as LoginStep[]).map((s, i) => {
                const idx = ["email", "otp", "profile"].indexOf(step);
                const active = s === step;
                const done = i < idx;
                return (
                  <div key={s} className="h-1 rounded-full transition-all duration-300"
                    style={{
                      width: active ? 28 : 10,
                      background: active ? "var(--color-crimson)" : done ? "var(--color-gold)" : "rgba(200,150,12,0.2)",
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Form body */}
          <div className="px-7 py-6 flex flex-col gap-4">

            {/* ══ STEP 1: Email ══ */}
            {step === "email" && (
              <>
                <div>
                  <label htmlFor="login-email" className="block font-dm-sans text-sm font-semibold mb-1.5"
                    style={{ color: "var(--color-brown)" }}>Email Address</label>
                  <div className="flex rounded-xl overflow-hidden"
                    style={{ border: `2px solid ${emailError ? "var(--color-crimson)" : "rgba(200,150,12,0.25)"}` }}>
                    <div className="flex items-center justify-center w-11"
                      style={{ background: "var(--color-cream)", borderRight: "1.5px solid rgba(200,150,12,0.2)" }}>
                      <Mail size={16} style={{ color: "var(--color-gold)" }} />
                    </div>
                    <input id="login-email" ref={emailRef} type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="flex-1 px-4 py-3.5 font-dm-sans text-base bg-white outline-none"
                      style={{ color: "var(--color-brown)" }}
                    />
                    {isValidEmail(email) && (
                      <div className="flex items-center pr-3">
                        <CheckCircle2 size={18} style={{ color: "#2E7D32" }} />
                      </div>
                    )}
                  </div>
                  {emailError && (
                    <p role="alert" className="font-dm-sans text-xs mt-1.5 flex gap-1.5"
                      style={{ color: "var(--color-crimson)" }}>
                      ⚠️ {emailError}
                    </p>
                  )}
                </div>

                <button onClick={handleSendOtp} disabled={loading}
                  className="btn-primary w-full py-4 text-base gap-3 disabled:opacity-60">
                  {loading
                    ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending…</>
                    : <><Mail size={18} />Send OTP<ArrowRight size={18} /></>
                  }
                </button>

                <p className="font-dm-sans text-xs text-center" style={{ color: "var(--color-grey)" }}>
                  No account? You'll be registered automatically.
                  <br />
                  🔒 We never share your email.
                </p>
              </>
            )}

            {/* ══ STEP 2: OTP ══ */}
            {step === "otp" && (
              <>
                <OtpBoxes value={otp}
                  onChange={(v) => { setOtp(v); setOtpError(""); }}
                  onComplete={handleVerifyOtp}
                  disabled={loading} hasError={!!otpError} autoFocus
                  length={8}
                />
                {otpError && (
                  <p role="alert" className="font-dm-sans text-sm text-center" style={{ color: "var(--color-crimson)" }}>
                    ⚠️ {otpError}
                  </p>
                )}
                <button onClick={() => handleVerifyOtp()} disabled={loading || otp.length < 8 || otp.some((d) => !d)}
                  className="btn-primary w-full py-4 text-base gap-3 disabled:opacity-60">
                  {loading
                    ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verifying…</>
                    : <><ShieldCheck size={18} />Verify &amp; Login</>
                  }
                </button>

                <ResendTimer key={resendKey} onResend={handleResend} />

                <button type="button"
                  onClick={() => { setStep("email"); setOtp(Array(8).fill("")); setOtpError(""); }}
                  className="font-dm-sans text-sm text-center underline hover:no-underline"
                  style={{ color: "var(--color-grey)" }}>
                  ← Change email address
                </button>
              </>
            )}

            {/* ══ STEP 3: Profile ══ */}
            {step === "profile" && (
              <>
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
                  style={{ background: "rgba(46,125,50,0.07)", border: "1px solid rgba(46,125,50,0.2)" }}>
                  <CheckCircle2 size={16} style={{ color: "#2E7D32" }} />
                  <p className="font-dm-sans text-sm" style={{ color: "#2E7D32" }}>
                    Email verified! Setting up your account.
                  </p>
                </div>

                <div>
                  <label htmlFor="reg-name" className="block font-dm-sans text-sm font-semibold mb-1.5"
                    style={{ color: "var(--color-brown)" }}>Full Name *</label>
                  <div className="flex rounded-xl overflow-hidden"
                    style={{ border: `2px solid ${profileError ? "var(--color-crimson)" : "rgba(200,150,12,0.25)"}` }}>
                    <div className="flex items-center justify-center w-11"
                      style={{ background: "var(--color-cream)" }}>
                      <User size={16} style={{ color: "var(--color-gold)" }} />
                    </div>
                    <input id="reg-name" ref={nameRef} type="text"
                      value={name} onChange={(e) => { setName(e.target.value); setProfileError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveProfile()}
                      placeholder="e.g. Priya Reddy"
                      className="flex-1 px-3.5 py-3.5 font-dm-sans text-base bg-white outline-none"
                      style={{ color: "var(--color-brown)" }} autoComplete="name" maxLength={80}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-mobile" className="block font-dm-sans text-sm font-semibold mb-1.5"
                    style={{ color: "var(--color-brown)" }}>
                    Mobile{" "}<span className="font-normal" style={{ color: "var(--color-grey)" }}>(optional)</span>
                  </label>
                  <div className="flex rounded-xl overflow-hidden"
                    style={{ border: "2px solid rgba(200,150,12,0.2)" }}>
                    <div className="flex items-center gap-2 px-3.5 flex-shrink-0"
                      style={{ background: "var(--color-cream)", borderRight: "1.5px solid rgba(200,150,12,0.2)" }}>
                      <span className="text-base leading-none">🇮🇳</span>
                      <span className="font-dm-sans font-bold text-sm" style={{ color: "var(--color-brown)" }}>+91</span>
                    </div>
                    <input id="reg-mobile" type="tel" inputMode="numeric"
                      value={mobile} onChange={(e) => { setMobile(e.target.value.replace(/\D/g, "").slice(0, 10)); setProfileError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveProfile()}
                      placeholder="98765 43210"
                      className="flex-1 px-3.5 py-3.5 font-dm-sans text-base bg-white outline-none"
                      style={{ color: "var(--color-brown)" }} autoComplete="tel-national" maxLength={10}
                    />
                  </div>
                  <p className="font-dm-sans text-xs mt-1" style={{ color: "var(--color-grey)" }}>
                    For delivery updates and exclusive pickle offers
                  </p>
                </div>

                {profileError && (
                  <p role="alert" className="font-dm-sans text-sm" style={{ color: "var(--color-crimson)" }}>
                    ⚠️ {profileError}
                  </p>
                )}

                <button onClick={handleSaveProfile} disabled={loading || !name.trim()}
                  className="btn-primary w-full py-4 text-base gap-2 disabled:opacity-60">
                  {loading
                    ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
                    : "🛒 Start Shopping"
                  }
                </button>
              </>
            )}

            {/* ══ STEP 4: Success ══ */}
            {step === "success" && (
              <div className="flex flex-col items-center gap-4 py-3 text-center">
                <div className="relative w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(46,125,50,0.1)", border: "3px solid rgba(46,125,50,0.25)" }}>
                  <CheckCircle2 size={32} strokeWidth={1.75} style={{ color: "#2E7D32" }} />
                  <div className="absolute inset-0 rounded-full animate-ping"
                    style={{ background: "rgba(46,125,50,0.1)", animationDuration: "1.4s" }} />
                </div>
                <div>
                  <p className="font-playfair font-bold text-xl" style={{ color: "var(--color-brown)" }}>
                    You're all set!
                  </p>
                  <p className="font-dm-sans text-sm mt-1" style={{ color: "var(--color-grey)" }}>
                    Heading to your account…
                  </p>
                </div>
                <div className="w-full px-4 py-3 rounded-xl flex items-center gap-3"
                  style={{ background: "rgba(200,150,12,0.06)", border: "1px solid rgba(200,150,12,0.2)" }}>
                  <span className="text-xl">🏷️</span>
                  <p className="font-dm-sans text-sm font-medium text-left" style={{ color: "var(--color-brown)" }}>
                    Use{" "}
                    <strong className="px-1.5 py-0.5 rounded font-bold tracking-widest"
                      style={{ background: "rgba(192,39,45,0.1)", color: "var(--color-crimson)" }}>
                      WELCOME50
                    </strong>{" "}
                    for ₹50 off your first order!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Card footer */}
          <div className="px-7 py-4 border-t text-center" style={{ borderColor: "rgba(200,150,12,0.08)", background: "var(--color-cream)" }}>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/products" className="font-dm-sans text-xs transition-opacity hover:opacity-70 flex items-center gap-1"
                style={{ color: "var(--color-crimson)" }}>
                🫙 Browse Pickles
              </Link>
              <span style={{ color: "rgba(200,150,12,0.3)" }}>·</span>
              <Link href="/contact" className="font-dm-sans text-xs" style={{ color: "var(--color-grey)" }}>
                Need help?
              </Link>
              <span style={{ color: "rgba(200,150,12,0.3)" }}>·</span>
              <Link href="/privacy-policy" className="font-dm-sans text-xs" style={{ color: "var(--color-grey)" }}>
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Why sign in strip */}
        <div className="mt-8 w-full max-w-md">
          <p className="font-dm-sans text-xs text-center mb-3" style={{ color: "var(--color-grey)" }}>
            Why sign in?
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Package, label: "Track Orders" },
              { icon: Star, label: "Save Wishlist" },
              { icon: "🏷️", label: "Exclusive Offers", isEmoji: true },
            ].map((item) => (
              <div key={item.label}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl"
                style={{ background: "rgba(200,150,12,0.06)", border: "1px solid rgba(200,150,12,0.1)" }}
              >
                {item.isEmoji ? (
                  <span className="text-lg">{item.icon as string}</span>
                ) : (
                  <item.icon size={18} strokeWidth={1.75} style={{ color: "var(--color-gold)" }} />
                )}
                <span className="font-dm-sans text-xs font-medium" style={{ color: "var(--color-brown)" }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-warm-white)" }}>
        <div className="flex flex-col items-center gap-3">
          <span className="text-4xl animate-pulse">🫙</span>
          <p className="font-dm-sans text-sm" style={{ color: "var(--color-grey)" }}>Loading…</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}

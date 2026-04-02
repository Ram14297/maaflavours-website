"use client";
// src/components/auth/OtpLoginModal.tsx
// Maa Flavours — Complete OTP Login Modal (Email-based)
// 4-step authenticated flow:
//   Step 1: Enter email address
//   Step 2: Enter 6-digit OTP (sent to email by Supabase — free)
//   Step 3: New users enter name + optional mobile
//   Step 4: Success animation then auto-close

import {
  useState, useEffect, useRef, useCallback,
} from "react";
import {
  X, Mail, ArrowRight, CheckCircle2, User, Phone, ShieldCheck,
} from "lucide-react";
import OtpBoxes from "./OtpBoxes";
import ResendTimer from "./ResendTimer";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────
type AuthStep = "email" | "otp" | "profile" | "success";

export interface OtpLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: { name: string; email: string; isNewUser: boolean }) => void;
  redirectTo?: string;
  title?: string;
  subtitle?: string;
}

// ─── Keyframes injected once ─────────────────────────────────────────────
const KEYFRAMES = `
  @keyframes mf-scaleIn {
    from { opacity: 0; transform: scale(0.92) translateY(12px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes mf-fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes mf-slideStep {
    from { opacity: 0; transform: translateX(24px); }
    to   { opacity: 1; transform: translateX(0); }
  }
`;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  return (local.slice(0, 2) + "***@" + domain);
}

export default function OtpLoginModal({
  isOpen,
  onClose,
  onSuccess,
  redirectTo,
  title,
  subtitle,
}: OtpLoginModalProps) {
  // ─── State ──────────────────────────────────────────────────────────
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [otpError, setOtpError] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [profileError, setProfileError] = useState("");
  const [loggedInUser, setLoggedInUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendKey, setResendKey] = useState(0);

  const emailRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // ─── Body scroll lock ────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ─── Auto-focus on step change ───────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    if (step === "email") setTimeout(() => emailRef.current?.focus(), 150);
    if (step === "profile") setTimeout(() => nameRef.current?.focus(), 150);
  }, [isOpen, step]);

  // ─── Escape key ──────────────────────────────────────────────────────
  useEffect(() => {
    const fn = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" && step !== "success") handleClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  });

  // ─── Reset on close ──────────────────────────────────────────────────
  const reset = useCallback(() => {
    setStep("email");
    setEmail("");
    setEmailError("");
    setOtp(Array(6).fill(""));
    setOtpError("");
    setMaskedEmail("");
    setName("");
    setMobile("");
    setProfileError("");
    setLoggedInUser(null);
    setLoading(false);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  // ─── STEP 1: Send OTP ───────────────────────────────────────────────
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
        setEmailError(data.error || "Could not send OTP. Please try again.");
        return;
      }

      setMaskedEmail(data.maskedEmail || maskEmail(email));
      setStep("otp");
    } catch {
      setEmailError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── STEP 2: Verify OTP ─────────────────────────────────────────────
  const handleVerifyOtp = useCallback(async (code?: string) => {
    const otpCode = code ?? otp.join("");
    if (otpCode.length < 6) {
      setOtpError("Please enter all 8 digits of your OTP.");
      return;
    }

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
        setOtpError(data.error || "Incorrect OTP. Please try again.");
        setOtp(Array(6).fill(""));
        return;
      }

      if (data.isNewUser) {
        setStep("profile");
      } else {
        const user = { name: data.user?.name || "Customer", email: email.trim(), isNewUser: false };
        setLoggedInUser(user);
        setStep("success");
        triggerSuccess(user);
      }
    } catch {
      setOtpError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [email, otp]);

  // ─── Resend OTP ──────────────────────────────────────────────────────
  const handleResend = async () => {
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    const data = await res.json();
    if (data.success) {
      setOtp(Array(6).fill(""));
      setOtpError("");
      setResendKey((k) => k + 1);
      toast.success("OTP sent again!");
    } else {
      toast.error(data.error || "Could not resend OTP.");
    }
  };

  // ─── STEP 3: Save profile ────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!name.trim() || name.trim().length < 2) {
      setProfileError("Please enter your full name (minimum 2 characters).");
      return;
    }
    if (mobile && !/^[6-9]\d{9}$/.test(mobile.replace(/\D/g, ""))) {
      setProfileError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    setProfileError("");

    try {
      const mobileFormatted = mobile ? `+91${mobile.replace(/\D/g, "")}` : undefined;
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          mobile: mobileFormatted,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setProfileError(data.error || "Could not save profile. Try again.");
        return;
      }

      const user = { name: name.trim(), email: email.trim(), isNewUser: true };
      setLoggedInUser(user);
      setStep("success");
      triggerSuccess(user);
    } catch {
      setProfileError("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Trigger success across app ─────────────────────────────────────
  const triggerSuccess = (user: { name: string; email: string; isNewUser: boolean }) => {
    window.dispatchEvent(new CustomEvent("mf:auth:login", { detail: user }));
    onSuccess?.(user);

    setTimeout(() => {
      handleClose();
      if (redirectTo && redirectTo !== window.location.pathname) {
        window.location.href = redirectTo;
      } else {
        window.location.reload();
      }
    }, 1900);
  };

  if (!isOpen) return null;

  // ─── Step headings ───────────────────────────────────────────────────
  const STEP_TEXT: Record<AuthStep, { heading: string; sub: string }> = {
    email: {
      heading: title || "Sign In to Maa Flavours",
      sub: subtitle || "We'll send a 6-digit OTP to your email",
    },
    otp: {
      heading: "Check Your Email",
      sub: `OTP sent to ${maskedEmail}`,
    },
    profile: {
      heading: "Welcome to Maa Flavours! 🎉",
      sub: "One last step — tell us your name",
    },
    success: {
      heading: loggedInUser?.name
        ? `Welcome, ${loggedInUser.name.split(" ")[0]}! 🎉`
        : "Logged in successfully!",
      sub: "Authentic Andhra flavours await you",
    },
  };
  const { heading, sub } = STEP_TEXT[step];

  return (
    <>
      <style>{KEYFRAMES}</style>

      {/* ── Backdrop ────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 z-[100]"
        style={{
          background: "rgba(74,44,10,0.6)",
          backdropFilter: "blur(5px)",
          animation: "mf-fadeIn 0.2s ease",
        }}
        onClick={(e) => { if (e.target === e.currentTarget && step !== "success") handleClose(); }}
        aria-hidden
      />

      {/* ── Dialog ──────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 z-[101] flex items-center justify-center p-4"
        role="dialog"
        aria-modal
        aria-labelledby="auth-modal-title"
      >
        <div
          className="relative w-full flex flex-col rounded-3xl overflow-hidden"
          style={{
            maxWidth: 440,
            background: "var(--color-warm-white)",
            boxShadow: "0 32px 80px rgba(74,44,10,0.28), 0 8px 24px rgba(74,44,10,0.12)",
            animation: "mf-scaleIn 0.32s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          {/* Gold ornament */}
          <div
            className="h-[4px] flex-shrink-0"
            style={{
              background:
                "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)",
            }}
          />

          {/* Close button */}
          {step !== "success" && (
            <button
              onClick={handleClose}
              aria-label="Close login modal"
              className="absolute top-4 right-4 p-2 rounded-xl z-10 transition-all duration-200 hover:scale-110"
              style={{ color: "var(--color-grey)" }}
            >
              <X size={20} strokeWidth={2} />
            </button>
          )}

          {/* ── Header ────────────────────────────────────────────── */}
          <div className="px-7 pt-7 pb-5 text-center">
            {/* Icon per step */}
            <div className="flex justify-center mb-4">
              {step === "success" ? (
                <div
                  className="relative w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(46,125,50,0.1)", border: "3px solid rgba(46,125,50,0.25)" }}
                >
                  <CheckCircle2 size={32} strokeWidth={1.75} style={{ color: "#2E7D32" }} />
                  <div
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{ background: "rgba(46,125,50,0.1)", animationDuration: "1.4s" }}
                  />
                </div>
              ) : step === "otp" ? (
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(200,150,12,0.1)", border: "2px solid rgba(200,150,12,0.25)" }}
                >
                  <ShieldCheck size={28} strokeWidth={1.75} style={{ color: "var(--color-gold)" }} />
                </div>
              ) : step === "profile" ? (
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(192,39,45,0.08)", border: "2px solid rgba(192,39,45,0.2)" }}
                >
                  <User size={28} strokeWidth={1.75} style={{ color: "var(--color-crimson)" }} />
                </div>
              ) : (
                <div className="text-center">
                  <p className="font-dancing text-3xl leading-none" style={{ color: "var(--color-crimson)" }}>
                    Maa Flavours
                  </p>
                  <p className="font-cormorant italic text-sm mt-0.5" style={{ color: "var(--color-grey)" }}>
                    Authentic Andhra Taste
                  </p>
                </div>
              )}
            </div>

            <div className="ornament-line w-16 mx-auto mb-4" />

            <h2
              id="auth-modal-title"
              className="font-playfair font-bold text-xl"
              style={{ color: "var(--color-brown)" }}
            >
              {heading}
            </h2>
            <p className="font-dm-sans text-sm mt-1.5" style={{ color: "var(--color-grey)" }}>
              {sub}
            </p>
          </div>

          {/* ── Step Body ─────────────────────────────────────────── */}
          <div
            className="px-7 pb-6 flex flex-col gap-4"
            key={step}
            style={{ animation: "mf-slideStep 0.28s ease" }}
          >

            {/* ════════ STEP 1: Email ════════ */}
            {step === "email" && (
              <>
                <div>
                  <label htmlFor="auth-email" className="block font-dm-sans text-sm font-semibold mb-1.5"
                    style={{ color: "var(--color-brown)" }}>
                    Email Address
                  </label>
                  <div
                    className="flex items-stretch rounded-xl overflow-hidden transition-all duration-200"
                    style={{
                      border: `2px solid ${emailError ? "var(--color-crimson)" : "rgba(200,150,12,0.25)"}`,
                      boxShadow: emailError ? "0 0 0 3px rgba(192,39,45,0.1)" : "none",
                    }}
                  >
                    <div
                      className="flex items-center justify-center w-11 flex-shrink-0"
                      style={{ background: "var(--color-cream)", borderRight: "1.5px solid rgba(200,150,12,0.2)" }}
                    >
                      <Mail size={16} style={{ color: "var(--color-gold)" }} />
                    </div>
                    <input
                      id="auth-email"
                      ref={emailRef}
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="flex-1 px-4 py-3.5 font-dm-sans text-base bg-white outline-none"
                      style={{ color: "var(--color-brown)" }}
                      aria-describedby={emailError ? "email-err" : undefined}
                    />
                    {isValidEmail(email) && (
                      <div className="flex items-center pr-3">
                        <CheckCircle2 size={18} style={{ color: "#2E7D32" }} />
                      </div>
                    )}
                  </div>
                  {emailError && (
                    <p id="email-err" role="alert" className="font-dm-sans text-xs mt-1.5 flex gap-1.5 items-start"
                      style={{ color: "var(--color-crimson)" }}>
                      <span className="mt-px">⚠️</span>{emailError}
                    </p>
                  )}
                </div>

                <button onClick={handleSendOtp} disabled={loading}
                  className="btn-primary w-full py-4 text-base gap-3 disabled:opacity-60">
                  {loading
                    ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending OTP…</>
                    : <><Mail size={18} />Send OTP<ArrowRight size={18} /></>
                  }
                </button>

                <p className="font-dm-sans text-xs text-center" style={{ color: "var(--color-grey)" }}>
                  🔒 We'll send a 6-digit OTP to verify your email. Free, no spam.
                </p>
              </>
            )}

            {/* ════════ STEP 2: OTP ════════ */}
            {step === "otp" && (
              <>
                <OtpBoxes
                  value={otp}
                  onChange={(v) => { setOtp(v); setOtpError(""); }}
                  onComplete={handleVerifyOtp}
                  disabled={loading}
                  hasError={!!otpError}
                  autoFocus
                />

                {otpError && (
                  <p role="alert" className="font-dm-sans text-sm text-center flex items-center justify-center gap-1.5"
                    style={{ color: "var(--color-crimson)" }}>
                    <span>⚠️</span>{otpError}
                  </p>
                )}

                <button
                  onClick={() => handleVerifyOtp()}
                  disabled={loading || otp.length < 6 || otp.some((d) => !d)}
                  className="btn-primary w-full py-4 text-base gap-3 disabled:opacity-60"
                >
                  {loading
                    ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verifying…</>
                    : <><ShieldCheck size={18} />Verify &amp; Login</>
                  }
                </button>

                <ResendTimer key={resendKey} onResend={handleResend} />

                <p className="font-dm-sans text-xs text-center" style={{ color: "var(--color-grey)" }}>
                  Wrong email?{" "}
                  <button type="button"
                    onClick={() => { setStep("email"); setOtp(Array(6).fill("")); setOtpError(""); }}
                    className="font-semibold underline hover:no-underline"
                    style={{ color: "var(--color-crimson)" }}>
                    Change email
                  </button>
                </p>
              </>
            )}

            {/* ════════ STEP 3: New User Profile ════════ */}
            {step === "profile" && (
              <>
                <div
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
                  style={{ background: "rgba(46,125,50,0.07)", border: "1px solid rgba(46,125,50,0.2)" }}
                >
                  <CheckCircle2 size={16} style={{ color: "#2E7D32", flexShrink: 0 }} />
                  <p className="font-dm-sans text-sm" style={{ color: "#2E7D32" }}>
                    Email verified! Just one more thing.
                  </p>
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="auth-name" className="block font-dm-sans text-sm font-semibold mb-1.5"
                    style={{ color: "var(--color-brown)" }}>
                    Your Full Name *
                  </label>
                  <div className="flex rounded-xl overflow-hidden"
                    style={{ border: `2px solid ${profileError ? "var(--color-crimson)" : "rgba(200,150,12,0.25)"}` }}>
                    <div className="flex items-center justify-center w-11 flex-shrink-0"
                      style={{ background: "var(--color-cream)" }}>
                      <User size={16} style={{ color: "var(--color-gold)" }} />
                    </div>
                    <input id="auth-name" ref={nameRef} type="text"
                      value={name} onChange={(e) => { setName(e.target.value); setProfileError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveProfile()}
                      placeholder="e.g. Priya Reddy"
                      className="flex-1 px-3.5 py-3.5 font-dm-sans text-base bg-white outline-none"
                      style={{ color: "var(--color-brown)" }}
                      autoComplete="name" maxLength={80}
                    />
                  </div>
                </div>

                {/* Mobile (optional) */}
                <div>
                  <label htmlFor="auth-mobile" className="block font-dm-sans text-sm font-semibold mb-1.5"
                    style={{ color: "var(--color-brown)" }}>
                    Mobile Number{" "}
                    <span className="font-normal" style={{ color: "var(--color-grey)" }}>(optional, for delivery updates)</span>
                  </label>
                  <div className="flex rounded-xl overflow-hidden"
                    style={{ border: "2px solid rgba(200,150,12,0.2)" }}>
                    <div className="flex items-center gap-1.5 px-3 flex-shrink-0"
                      style={{ background: "var(--color-cream)", borderRight: "1.5px solid rgba(200,150,12,0.2)" }}>
                      <span className="text-sm">🇮🇳</span>
                      <span className="font-dm-sans font-bold text-sm" style={{ color: "var(--color-brown)" }}>+91</span>
                    </div>
                    <input id="auth-mobile" type="tel" inputMode="numeric"
                      value={mobile} onChange={(e) => { setMobile(e.target.value.replace(/\D/g, "").slice(0, 10)); setProfileError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveProfile()}
                      placeholder="98765 43210"
                      className="flex-1 px-3.5 py-3.5 font-dm-sans text-base bg-white outline-none"
                      style={{ color: "var(--color-brown)" }}
                      autoComplete="tel-national" maxLength={10}
                    />
                  </div>
                  <p className="font-dm-sans text-xs mt-1" style={{ color: "var(--color-grey)" }}>
                    For order delivery updates via SMS
                  </p>
                </div>

                {profileError && (
                  <p role="alert" className="font-dm-sans text-sm flex gap-1.5 items-start"
                    style={{ color: "var(--color-crimson)" }}>
                    <span>⚠️</span>{profileError}
                  </p>
                )}

                <button onClick={handleSaveProfile} disabled={loading || !name.trim()}
                  className="btn-primary w-full py-4 text-base gap-2 disabled:opacity-60">
                  {loading
                    ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Setting up…</>
                    : "🛒 Start Shopping"
                  }
                </button>
              </>
            )}

            {/* ════════ STEP 4: Success ════════ */}
            {step === "success" && (
              <div className="flex flex-col items-center gap-4 py-2 text-center">
                <p className="font-dm-sans text-sm" style={{ color: "var(--color-grey)" }}>
                  Redirecting you now…
                </p>
                <div
                  className="w-full px-4 py-3.5 rounded-xl flex items-center gap-3"
                  style={{ background: "rgba(200,150,12,0.06)", border: "1px solid rgba(200,150,12,0.2)" }}
                >
                  <span className="text-xl">🏷️</span>
                  <p className="font-dm-sans text-sm font-medium text-left" style={{ color: "var(--color-brown)" }}>
                    Use code{" "}
                    <strong
                      className="px-1.5 py-0.5 rounded font-bold tracking-widest"
                      style={{ background: "rgba(192,39,45,0.1)", color: "var(--color-crimson)" }}
                    >
                      WELCOME50
                    </strong>{" "}
                    for ₹50 off your first order!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Step dots ────────────────────────────────────────────── */}
          {step !== "success" && (
            <div className="flex items-center justify-center gap-2 pb-5">
              {(["email", "otp", "profile"] as AuthStep[]).map((s, i) => {
                const stepIdx = ["email", "otp", "profile"].indexOf(step);
                const thisIdx = i;
                const active = s === step;
                const done = thisIdx < stepIdx;
                return (
                  <div key={s} className="rounded-full transition-all duration-300"
                    style={{
                      width: active ? 20 : 6, height: 6,
                      background: active ? "var(--color-crimson)" : done ? "var(--color-gold)" : "rgba(200,150,12,0.2)",
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

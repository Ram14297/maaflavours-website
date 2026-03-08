"use client";
// src/components/home/Newsletter.tsx
// Maa Flavours — Newsletter Section
// "Get ₹50 Off Your First Order"
// Email capture, crimson/warm background, subtle pattern

import { useState } from "react";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (e: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      // TODO: POST to /api/newsletter with { email }
      await new Promise((r) => setTimeout(r, 800));
      setSubmitted(true);
      toast.success("Welcome! Your ₹50 coupon is on its way.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="relative overflow-hidden section-padding"
      style={{
        background: "linear-gradient(135deg, #9E1F24 0%, #C0272D 40%, #B8220A 100%)",
      }}
    >
      {/* ─── Background texture ──────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ccircle cx='30' cy='30' r='25' fill='none' stroke='white' stroke-width='1'/%3E%3Ccircle cx='30' cy='30' r='15' fill='none' stroke='white' stroke-width='0.5'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "60px",
        }}
      />

      {/* Gold top border */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--color-gold-light) 20%, var(--color-gold) 50%, var(--color-gold-light) 80%, transparent)",
        }}
      />

      {/* Decorative glow circles */}
      <div
        className="absolute -left-20 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(232,184,75,0.15) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute -right-20 bottom-0 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="section-container relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className="h-px w-8"
              style={{ background: "rgba(232,184,75,0.5)" }}
            />
            <span
              className="font-dm-sans text-xs font-semibold tracking-widest uppercase"
              style={{ color: "var(--color-gold-light)" }}
            >
              Exclusive Offer
            </span>
            <div
              className="h-px w-8"
              style={{ background: "rgba(232,184,75,0.5)" }}
            />
          </div>

          {/* Headline */}
          <h2
            className="font-playfair font-bold mb-3 leading-tight"
            style={{
              color: "white",
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
            }}
          >
            Get{" "}
            <span style={{ color: "var(--color-gold-light)" }}>₹50 Off</span>{" "}
            Your First Order
          </h2>

          <p
            className="font-cormorant italic text-xl mb-2"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            Join the Maa Flavours family today
          </p>

          <p
            className="font-dm-sans text-sm mb-8"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            No spam. Just pickle stories, new arrivals, and exclusive offers.
          </p>

          {/* Form or Success */}
          {submitted ? (
            <div
              className="flex flex-col items-center gap-3 py-6 px-8 rounded-2xl max-w-sm mx-auto"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(232,184,75,0.3)",
              }}
            >
              <CheckCircle2
                size={40}
                style={{ color: "var(--color-gold-light)" }}
              />
              <p
                className="font-playfair font-semibold text-xl text-white"
              >
                You're in! 🎉
              </p>
              <p
                className="font-dm-sans text-sm"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Check your inbox for your ₹50 coupon code.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              {/* Email input */}
              <div className="relative flex-1">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl font-dm-sans text-sm outline-none transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: error
                      ? "1.5px solid rgba(255,100,100,0.6)"
                      : "1.5px solid rgba(255,255,255,0.2)",
                    color: "white",
                    backdropFilter: "blur(4px)",
                  }}
                  aria-label="Email address for newsletter"
                  aria-describedby={error ? "newsletter-error" : undefined}
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-dm-sans font-semibold text-sm transition-all duration-200 flex-shrink-0 disabled:opacity-70"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-gold-light), var(--color-gold))",
                  color: "var(--color-brown)",
                  boxShadow: "0 3px 12px rgba(200,150,12,0.4)",
                }}
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-brown/30 border-t-brown rounded-full animate-spin" />
                ) : (
                  <>
                    Claim ₹50 Off
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Error */}
          {error && (
            <p
              id="newsletter-error"
              className="font-dm-sans text-xs mt-2"
              style={{ color: "rgba(255,180,180,0.9)" }}
            >
              {error}
            </p>
          )}

          {/* Fine print */}
          <p
            className="font-dm-sans text-xs mt-4"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Coupon valid on your first order above ₹299. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}

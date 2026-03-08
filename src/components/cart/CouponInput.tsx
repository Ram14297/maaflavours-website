"use client";
// src/components/cart/CouponInput.tsx
// Maa Flavours — Coupon code input inside cart drawer
// Shows applied coupon with remove option, or the input form
// Matches error/success states in brand colors

import { useState } from "react";
import { Tag, X, Loader2, CheckCircle2 } from "lucide-react";
import { AppliedCoupon } from "@/store/cartStore";

interface CouponInputProps {
  appliedCoupon: AppliedCoupon | null;
  isLoading: boolean;
  error: string;
  onApply: (code: string) => Promise<void>;
  onRemove: () => void;
}

export default function CouponInput({
  appliedCoupon,
  isLoading,
  error,
  onApply,
  onRemove,
}: CouponInputProps) {
  const [code, setCode] = useState("");
  const [focused, setFocused] = useState(false);

  const handleApply = () => {
    if (code.trim()) onApply(code);
  };

  // ─── Applied state ──────────────────────────────────────────────────────
  if (appliedCoupon) {
    return (
      <div
        className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl"
        style={{
          background: "rgba(46,125,50,0.07)",
          border: "1.5px solid rgba(46,125,50,0.2)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <CheckCircle2 size={18} style={{ color: "#2E7D32", flexShrink: 0 }} />
          <div>
            <p
              className="font-dm-sans font-bold text-sm leading-none"
              style={{ color: "#2E7D32" }}
            >
              {appliedCoupon.code}
            </p>
            <p
              className="font-dm-sans text-xs mt-0.5"
              style={{ color: "var(--color-grey)" }}
            >
              {appliedCoupon.description}
            </p>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="p-1.5 rounded-lg transition-colors duration-200 hover:bg-crimson/10 flex-shrink-0"
          style={{ color: "var(--color-grey)" }}
          aria-label="Remove coupon"
        >
          <X size={15} />
        </button>
      </div>
    );
  }

  // ─── Input state ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="flex items-center gap-0 rounded-xl overflow-hidden transition-all duration-200"
        style={{
          border: `1.5px solid ${
            error
              ? "var(--color-crimson)"
              : focused
              ? "var(--color-gold)"
              : "rgba(200,150,12,0.2)"
          }`,
          boxShadow: focused ? "0 0 0 3px rgba(200,150,12,0.1)" : "none",
        }}
      >
        {/* Tag icon */}
        <div
          className="flex items-center justify-center w-10 h-11 flex-shrink-0"
          style={{ background: "var(--color-cream)" }}
        >
          <Tag size={15} style={{ color: "var(--color-gold)" }} />
        </div>

        {/* Input */}
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
          placeholder="Enter coupon code"
          className="flex-1 px-3 h-11 font-dm-sans text-sm tracking-widest outline-none bg-white"
          style={{
            color: "var(--color-brown)",
            letterSpacing: "0.08em",
          }}
          aria-label="Coupon code"
          aria-describedby={error ? "coupon-error" : undefined}
          maxLength={20}
        />

        {/* Apply button */}
        <button
          onClick={handleApply}
          disabled={isLoading || !code.trim()}
          className="h-11 px-4 font-dm-sans text-sm font-semibold transition-all duration-200 disabled:opacity-50 flex-shrink-0"
          style={{
            background: "var(--color-brown)",
            color: "white",
            minWidth: "72px",
          }}
        >
          {isLoading ? (
            <Loader2 size={15} className="animate-spin mx-auto" />
          ) : (
            "Apply"
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p
          id="coupon-error"
          className="font-dm-sans text-xs flex items-center gap-1.5"
          style={{ color: "var(--color-crimson)" }}
          role="alert"
        >
          <span>⚠️</span>
          {error}
        </p>
      )}

      {/* Hint */}
      {!error && (
        <p
          className="font-dm-sans text-xs"
          style={{ color: "var(--color-grey)" }}
        >
          Try <strong style={{ color: "var(--color-gold)" }}>WELCOME50</strong> for ₹50 off your first order
        </p>
      )}
    </div>
  );
}

// src/components/cart/CartOrderSummary.tsx
// Maa Flavours — Order summary price breakdown inside cart drawer
// Shows: subtotal, coupon discount, delivery charge, grand total
// Matches Razorpay order creation data structure

"use client";
import React, { useMemo } from "react";
import { formatPrice } from "@/lib/utils";
import { AppliedCoupon } from "@/store/cartStore";

// ─── Free shipping nudge phrases ─────────────────────────────────────────────
const PHRASES_FAR = [   // > ₹200 away
  (x: string) => `🫙 Add one more pack and we'll deliver free!`,
  (x: string) => `🚚 Free delivery unlocks at ₹899 — just ${x} more to go!`,
  (x: string) => `💛 Stock up and save — free shipping in just ${x} more!`,
  (x: string) => `🌶️ Your cart is ${x} away from free shipping across India`,
];
const PHRASES_CLOSE = [  // ₹100–₹200 away
  (x: string) => `🎯 Almost there! ${x} more = free delivery`,
  (x: string) => `🫙 One more pack gets you free shipping! (${x} to go)`,
  (x: string) => `✨ So close! Add ${x} worth of pickles for free delivery`,
  (x: string) => `💪 ${x} more and shipping is on us!`,
];
const PHRASES_VERY_CLOSE = [  // < ₹100 away
  (x: string) => `🔥 Just ${x} more — free shipping is right there!`,
  (x: string) => `👀 ${x} away from free delivery — don't miss it!`,
  (x: string) => `🚀 Almost free shipping! Only ${x} left`,
  (x: string) => `⚡ ${x} more and delivery becomes FREE!`,
];
const PHRASES_UNLOCKED = [  // crossed ₹899
  (_x: string) => `🎉 Free shipping unlocked! Your pickles are coming home free`,
  (_x: string) => `✅ You've earned free delivery on this order!`,
  (_x: string) => `🚚 Free shipping added — Maa's proud of you! 😄`,
  (_x: string) => `🎊 Free delivery unlocked! Enjoy your Andhra pickles!`,
];

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

// ─── Free Shipping Banner ─────────────────────────────────────────────────────
function FreeShippingBanner({ subtotal }: { subtotal: number }) {
  const FREE_THRESHOLD = 89900; // ₹899 in paise
  const remaining      = Math.max(0, FREE_THRESHOLD - subtotal);
  const progress       = Math.min((subtotal / FREE_THRESHOLD) * 100, 100);
  const unlocked       = subtotal >= FREE_THRESHOLD;
  const remainRs       = Math.ceil(remaining / 100);

  // Pick a phrase based on current subtotal (changes as cart changes)
  const phrase = useMemo(() => {
    const seed = Math.floor(subtotal / 1000); // changes as items added
    const fmt  = `₹${remainRs}`;
    if (unlocked)          return pick(PHRASES_UNLOCKED,    seed)("free");
    if (remainRs < 100)    return pick(PHRASES_VERY_CLOSE,  seed)(fmt);
    if (remainRs < 200)    return pick(PHRASES_CLOSE,       seed)(fmt);
    return                        pick(PHRASES_FAR,         seed)(fmt);
  }, [subtotal, remainRs, unlocked]);

  // Colours per stage
  const colors = unlocked
    ? { bg: "rgba(46,125,50,0.08)", border: "#2E7D32", text: "#2E7D32", bar: "#2E7D32", glow: "rgba(46,125,50,0.25)" }
    : remainRs < 100
    ? { bg: "rgba(192,39,45,0.07)", border: "var(--color-crimson)", text: "var(--color-crimson)", bar: "var(--color-crimson)", glow: "rgba(192,39,45,0.20)" }
    : remainRs < 200
    ? { bg: "rgba(200,120,12,0.08)", border: "#E07B00", text: "#C87000", bar: "#E07B00", glow: "rgba(200,120,12,0.20)" }
    : { bg: "rgba(200,150,12,0.06)", border: "rgba(200,150,12,0.35)", text: "var(--color-brown)", bar: "var(--color-gold)", glow: "transparent" };

  return (
    <div
      className="rounded-2xl px-4 py-3.5 mb-4"
      style={{
        background:  colors.bg,
        border:      `2px solid ${colors.border}`,
        boxShadow:   `0 0 18px ${colors.glow}`,
        transition:  "all 0.4s ease",
      }}
    >
      {/* Message */}
      <p
        className="font-dm-sans text-sm font-bold mb-2.5 leading-snug"
        style={{ color: colors.text }}
      >
        {phrase}
      </p>

      {/* Progress bar */}
      <div className="relative">
        <div
          className="h-3 rounded-full overflow-hidden"
          style={{ background: "rgba(0,0,0,0.07)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width:      `${progress}%`,
              background: unlocked
                ? "linear-gradient(90deg,#2E7D32,#4CAF50)"
                : remainRs < 100
                ? "linear-gradient(90deg,var(--color-crimson),#E74C3C)"
                : "linear-gradient(90deg,var(--color-gold),#F5C842)",
            }}
          />
        </div>

        {/* % label */}
        <div className="flex justify-between items-center mt-1">
          <span className="font-dm-sans text-[10px]" style={{ color: colors.text, opacity: 0.7 }}>
            {unlocked ? "Free shipping" : `₹${Math.round(subtotal / 100)} of ₹899`}
          </span>
          <span
            className="font-dm-sans text-xs font-extrabold"
            style={{ color: colors.text }}
          >
            {unlocked ? "🚚 FREE" : `${Math.round(progress)}%`}
          </span>
        </div>
      </div>
    </div>
  );
}

interface CartOrderSummaryProps {
  subtotal: number;       // paise
  couponDiscount: number; // paise
  deliveryCharge: number; // paise
  total: number;          // paise
  appliedCoupon: AppliedCoupon | null;
  itemCount: number;
}

export default function CartOrderSummary({
  subtotal,
  couponDiscount,
  deliveryCharge,
  total,
  appliedCoupon,
  itemCount,
}: CartOrderSummaryProps) {
  return (
    <div className="flex flex-col gap-0">
      {/* ─── Free shipping nudge banner ──────────────────────────────── */}
      {!appliedCoupon && <FreeShippingBanner subtotal={subtotal} />}

      {/* ─── Price lines ────────────────────────────────────────────────── */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid rgba(200,150,12,0.12)" }}
      >
        {/* Gold top accent */}
        <div
          className="h-[2px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--color-gold) 20%, var(--color-gold-light) 50%, var(--color-gold) 80%, transparent)",
          }}
        />

        <div
          className="flex flex-col divide-y px-4"
          style={{ "--tw-divide-color": "rgba(200,150,12,0.08)" } as React.CSSProperties}
        >
          {/* Subtotal */}
          <div className="flex items-center justify-between py-3">
            <span
              className="font-dm-sans text-sm"
              style={{ color: "var(--color-grey)" }}
            >
              Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})
            </span>
            <span
              className="font-dm-sans font-semibold text-sm"
              style={{ color: "var(--color-brown)" }}
            >
              {formatPrice(subtotal)}
            </span>
          </div>

          {/* Coupon discount */}
          {couponDiscount > 0 && appliedCoupon && (
            <div className="flex items-center justify-between py-3">
              <span
                className="font-dm-sans text-sm flex items-center gap-1.5"
                style={{ color: "#2E7D32" }}
              >
                🏷️ Coupon{" "}
                <span
                  className="px-1.5 py-0.5 rounded text-xs font-bold"
                  style={{
                    background: "rgba(46,125,50,0.1)",
                    color: "#2E7D32",
                  }}
                >
                  {appliedCoupon.code}
                </span>
              </span>
              <span
                className="font-dm-sans font-semibold text-sm"
                style={{ color: "#2E7D32" }}
              >
                −{formatPrice(couponDiscount)}
              </span>
            </div>
          )}

          {/* Delivery */}
          <div className="flex items-center justify-between py-3">
            <span
              className="font-dm-sans text-sm"
              style={{ color: "var(--color-grey)" }}
            >
              Delivery
            </span>
            <span
              className="font-dm-sans text-xs italic"
              style={{ color: "var(--color-grey)" }}
            >
              Calculated at checkout
            </span>
          </div>

          {/* Total */}
          <div
            className="flex items-center justify-between py-3.5"
            style={{ background: "var(--color-cream)" }}
          >
            <div>
              <span
                className="font-playfair font-bold text-base"
                style={{ color: "var(--color-brown)" }}
              >
                Total
              </span>
              <span
                className="block font-dm-sans text-xs mt-0.5"
                style={{ color: "var(--color-grey)" }}
              >
                Excl. delivery charges
              </span>
            </div>
            <div className="text-right">
              <span
                className="font-playfair font-bold text-xl"
                style={{ color: "var(--color-crimson)" }}
              >
                {formatPrice(subtotal - couponDiscount)}
              </span>
              <p className="font-dm-sans text-xs mt-0.5" style={{ color: "var(--color-grey)" }}>
                + delivery
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Savings callout */}
      {couponDiscount > 0 && (
        <p
          className="font-dm-sans text-xs text-center mt-2 font-semibold"
          style={{ color: "#2E7D32" }}
        >
          🎉 You're saving{" "}
          <strong>{formatPrice(couponDiscount)}</strong> on this order!
        </p>
      )}
    </div>
  );
}

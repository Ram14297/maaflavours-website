// src/components/cart/CartOrderSummary.tsx
// Maa Flavours — Order summary price breakdown inside cart drawer
// Shows: subtotal, coupon discount, delivery charge, grand total
// Matches Razorpay order creation data structure

import { formatPrice } from "@/lib/utils";
import { AppliedCoupon } from "@/store/cartStore";

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
  const freeShippingThreshold = 49900; // ₹499 in paise
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  return (
    <div className="flex flex-col gap-0">
      {/* ─── Free shipping bar ──────────────────────────────────────────── */}
      {subtotal < freeShippingThreshold && !appliedCoupon && (
        <div
          className="px-4 py-3 mb-3 rounded-xl"
          style={{
            background: "rgba(200,150,12,0.06)",
            border: "1px solid rgba(200,150,12,0.15)",
          }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <p
              className="font-dm-sans text-xs"
              style={{ color: "var(--color-brown)" }}
            >
              🚚 Add{" "}
              <span className="font-bold">{formatPrice(amountToFreeShipping)}</span>{" "}
              more for{" "}
              <span className="font-bold" style={{ color: "var(--color-gold)" }}>
                Free Shipping
              </span>
            </p>
            <span
              className="font-dm-sans text-xs font-semibold"
              style={{ color: "var(--color-gold)" }}
            >
              {Math.round(freeShippingProgress)}%
            </span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(200,150,12,0.12)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${freeShippingProgress}%`,
                background: "linear-gradient(90deg, var(--color-gold), var(--color-gold-light))",
              }}
            />
          </div>
        </div>
      )}

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
          style={{ divideColor: "rgba(200,150,12,0.08)" }}
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
              className="font-dm-sans font-semibold text-sm"
              style={{
                color: deliveryCharge === 0 ? "#2E7D32" : "var(--color-brown)",
              }}
            >
              {deliveryCharge === 0 ? (
                <span className="flex items-center gap-1">
                  🎉 Free
                </span>
              ) : (
                formatPrice(deliveryCharge)
              )}
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
                Inclusive of all taxes
              </span>
            </div>
            <span
              className="font-playfair font-bold text-xl"
              style={{ color: "var(--color-crimson)" }}
            >
              {formatPrice(total)}
            </span>
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

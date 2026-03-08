"use client";
// src/components/checkout/OrderReviewStep.tsx
// Maa Flavours — Final Order Review Screen
// Shows: delivery address recap, cart items, price breakdown, confirm button
// This is the "review" step — user sees everything before final confirmation

import { ChevronLeft, Lock, Package, MapPin, Truck } from "lucide-react";
import { useCheckoutStore } from "@/store/checkoutStore";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";

const COD_CHARGE = 3000;

interface OrderReviewStepProps {
  onConfirm: () => void;
  isPlacing: boolean;
}

export default function OrderReviewStep({ onConfirm, isPlacing }: OrderReviewStepProps) {
  const { address, paymentMethod, setStep } = useCheckoutStore();
  const { items, coupon, subtotal, couponDiscount, deliveryCharge, total } = useCartStore();

  const sub = subtotal();
  const disc = couponDiscount();
  const del = deliveryCharge();
  const tot = total();
  const isCOD = paymentMethod === "cod";
  const finalTotal = isCOD ? tot + COD_CHARGE : tot;

  const PAYMENT_LABELS: Record<string, string> = {
    upi: "🔵 UPI",
    card: "💳 Credit / Debit Card",
    netbanking: "🏦 Net Banking",
    cod: "💵 Cash on Delivery",
    wallet: "👝 Wallet",
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ─── Address Recap ──────────────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "white",
          border: "1px solid rgba(200,150,12,0.15)",
          boxShadow: "0 2px 12px rgba(74,44,10,0.05)",
        }}
      >
        <div
          className="h-[3px]"
          style={{
            background: "linear-gradient(90deg, transparent, var(--color-gold) 25%, var(--color-gold-light) 50%, var(--color-gold) 75%, transparent)",
          }}
        />
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "rgba(200,150,12,0.1)" }}
        >
          <div className="flex items-center gap-2">
            <MapPin size={16} style={{ color: "var(--color-gold)" }} />
            <span className="font-dm-sans font-bold text-sm" style={{ color: "var(--color-brown)" }}>
              Delivery Address
            </span>
          </div>
          <button
            onClick={() => setStep("address")}
            className="font-dm-sans text-xs font-medium"
            style={{ color: "var(--color-crimson)" }}
          >
            ✏️ Edit
          </button>
        </div>
        <div className="px-5 py-4">
          <p className="font-dm-sans font-semibold text-sm" style={{ color: "var(--color-brown)" }}>
            {address.full_name} · +91 {address.mobile}
          </p>
          <p className="font-dm-sans text-sm mt-1" style={{ color: "var(--color-grey)" }}>
            {address.address_line1}
            {address.address_line2 && `, ${address.address_line2}`}
            {address.landmark && ` (Near ${address.landmark})`}
          </p>
          <p className="font-dm-sans text-sm" style={{ color: "var(--color-grey)" }}>
            {address.city} — {address.pincode}, {address.state}
          </p>
        </div>
      </div>

      {/* ─── Payment Method Recap ────────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "white",
          border: "1px solid rgba(200,150,12,0.15)",
          boxShadow: "0 2px 12px rgba(74,44,10,0.05)",
        }}
      >
        <div
          className="h-[3px]"
          style={{
            background: "linear-gradient(90deg, transparent, var(--color-gold) 25%, var(--color-gold-light) 50%, var(--color-gold) 75%, transparent)",
          }}
        />
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "rgba(200,150,12,0.1)" }}
        >
          <div className="flex items-center gap-2">
            <Lock size={16} style={{ color: "var(--color-gold)" }} />
            <span className="font-dm-sans font-bold text-sm" style={{ color: "var(--color-brown)" }}>
              Payment Method
            </span>
          </div>
          <button
            onClick={() => setStep("payment")}
            className="font-dm-sans text-xs font-medium"
            style={{ color: "var(--color-crimson)" }}
          >
            ✏️ Change
          </button>
        </div>
        <div className="px-5 py-4">
          <p className="font-dm-sans font-semibold text-sm" style={{ color: "var(--color-brown)" }}>
            {PAYMENT_LABELS[paymentMethod] || paymentMethod}
          </p>
          {isCOD && (
            <p className="font-dm-sans text-xs mt-1" style={{ color: "var(--color-grey)" }}>
              Keep {formatPrice(finalTotal)} ready at delivery · +₹30 COD charge applies
            </p>
          )}
        </div>
      </div>

      {/* ─── Items Recap ─────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "white",
          border: "1px solid rgba(200,150,12,0.15)",
          boxShadow: "0 2px 12px rgba(74,44,10,0.05)",
        }}
      >
        <div
          className="h-[3px]"
          style={{
            background: "linear-gradient(90deg, transparent, var(--color-gold) 25%, var(--color-gold-light) 50%, var(--color-gold) 75%, transparent)",
          }}
        />
        <div
          className="flex items-center gap-2 px-5 py-4 border-b"
          style={{ borderColor: "rgba(200,150,12,0.1)" }}
        >
          <Package size={16} style={{ color: "var(--color-gold)" }} />
          <span className="font-dm-sans font-bold text-sm" style={{ color: "var(--color-brown)" }}>
            Your Order ({items.length} item{items.length !== 1 ? "s" : ""})
          </span>
        </div>

        <div className="px-5 py-3 flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              {/* Placeholder image — REPLACE with actual product image */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{
                  background: "var(--color-cream)",
                  border: "1px solid rgba(200,150,12,0.15)",
                }}
              >
                {item.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-dm-sans font-semibold text-sm truncate" style={{ color: "var(--color-brown)" }}>
                  {item.productName}
                </p>
                <p className="font-dm-sans text-xs" style={{ color: "var(--color-grey)" }}>
                  {item.variantLabel} × {item.quantity}
                </p>
              </div>
              <span className="font-dm-sans font-bold text-sm" style={{ color: "var(--color-crimson)" }}>
                {formatPrice(item.unitPrice * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Price breakdown */}
        <div
          className="px-5 py-4 border-t flex flex-col gap-2"
          style={{ borderColor: "rgba(200,150,12,0.1)", background: "var(--color-cream)" }}
        >
          {[
            { label: `Subtotal`, value: formatPrice(sub), highlight: false },
            ...(disc > 0 && coupon ? [{ label: `Coupon (${coupon.code})`, value: `−${formatPrice(disc)}`, highlight: true, green: true }] : []),
            { label: "Delivery", value: del === 0 ? "🎉 Free" : formatPrice(del), highlight: false, green: del === 0 },
            ...(isCOD ? [{ label: "COD Charge", value: `+${formatPrice(COD_CHARGE)}`, highlight: false }] : []),
          ].map((row: any) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="font-dm-sans text-sm" style={{ color: "var(--color-grey)" }}>
                {row.label}
              </span>
              <span
                className="font-dm-sans font-semibold text-sm"
                style={{ color: row.green ? "#2E7D32" : "var(--color-brown)" }}
              >
                {row.value}
              </span>
            </div>
          ))}

          <div className="h-px mt-1" style={{ background: "rgba(200,150,12,0.15)" }} />
          <div className="flex items-center justify-between">
            <span className="font-playfair font-bold text-base" style={{ color: "var(--color-brown)" }}>
              Total to Pay
            </span>
            <span className="font-playfair font-bold text-2xl" style={{ color: "var(--color-crimson)" }}>
              {formatPrice(finalTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Delivery ETA ───────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
        style={{
          background: "rgba(200,150,12,0.06)",
          border: "1px solid rgba(200,150,12,0.18)",
        }}
      >
        <Truck size={20} style={{ color: "var(--color-gold)", flexShrink: 0 }} />
        <div>
          <p className="font-dm-sans font-semibold text-sm" style={{ color: "var(--color-brown)" }}>
            Estimated Delivery: 5–7 Working Days
          </p>
          <p className="font-dm-sans text-xs mt-0.5" style={{ color: "var(--color-grey)" }}>
            Pan-India delivery to {address.city}, {address.state}. We'll send you a tracking link via SMS.
          </p>
        </div>
      </div>

      {/* ─── CTA ────────────────────────────────────────────────────────── */}
      <div className="flex gap-3">
        <button
          onClick={() => setStep("payment")}
          className="btn-ghost py-3.5 px-5 flex items-center gap-2"
        >
          <ChevronLeft size={16} />
          Back
        </button>
        <button
          onClick={onConfirm}
          disabled={isPlacing}
          className="btn-primary flex-1 py-4 text-base justify-center gap-3 disabled:opacity-60"
        >
          {isPlacing ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Placing Order…
            </>
          ) : (
            <>
              <Lock size={17} />
              Confirm & Place Order
            </>
          )}
        </button>
      </div>
    </div>
  );
}

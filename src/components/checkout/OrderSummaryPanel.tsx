// src/components/checkout/OrderSummaryPanel.tsx
// Maa Flavours — Order Summary sidebar (right column on checkout page)
// Shows all cart items, applied coupon, price breakdown
// Read-only — links back to /products to continue shopping

import Link from "next/link";
import { ShoppingBag, Edit2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";

const COD_CHARGE = 3000;

export default function OrderSummaryPanel({ isCOD = false }: { isCOD?: boolean }) {
  const {
    items,
    coupon,
    subtotal,
    couponDiscount,
    deliveryCharge,
    total,
    itemCount,
  } = useCartStore();

  const sub = subtotal();
  const disc = couponDiscount();
  const del = deliveryCharge();
  const tot = total();
  const count = itemCount();
  const codTotal = isCOD ? tot + COD_CHARGE : tot;

  return (
    <div
      className="rounded-2xl overflow-hidden sticky top-[100px]"
      style={{
        background: "white",
        border: "1px solid rgba(200,150,12,0.15)",
        boxShadow: "0 2px 16px rgba(74,44,10,0.06)",
      }}
    >
      {/* Gold ornament */}
      <div
        className="h-[3px]"
        style={{
          background: "linear-gradient(90deg, transparent, var(--color-gold) 25%, var(--color-gold-light) 50%, var(--color-gold) 75%, transparent)",
        }}
      />

      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: "rgba(200,150,12,0.1)" }}
      >
        <div className="flex items-center gap-2">
          <ShoppingBag size={18} strokeWidth={1.75} style={{ color: "var(--color-brown)" }} />
          <h3 className="font-playfair font-bold text-base" style={{ color: "var(--color-brown)" }}>
            Order Summary
          </h3>
          <span
            className="font-dm-sans font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center text-white"
            style={{ background: "var(--color-crimson)" }}
          >
            {count}
          </span>
        </div>
        <Link
          href="/products"
          className="flex items-center gap-1 font-dm-sans text-xs font-medium transition-opacity hover:opacity-70"
          style={{ color: "var(--color-crimson)" }}
        >
          <Edit2 size={11} />
          Edit
        </Link>
      </div>

      {/* Item list */}
      <div
        className="flex flex-col divide-y px-5 py-2 max-h-[320px] overflow-y-auto scrollbar-brand"
        style={{ divideColor: "rgba(200,150,12,0.08)" }}
      >
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 py-3">
            {/* Image / Emoji placeholder */}
            {/* REPLACE with actual product image */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 relative"
              style={{
                background: "var(--color-cream)",
                border: "1px solid rgba(200,150,12,0.15)",
              }}
            >
              {item.emoji}
              {/* Quantity badge */}
              <span
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center font-dm-sans text-xs font-bold text-white"
                style={{ background: "var(--color-crimson)" }}
              >
                {item.quantity}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p
                className="font-dm-sans font-semibold text-sm truncate"
                style={{ color: "var(--color-brown)" }}
              >
                {item.productName}
              </p>
              <p
                className="font-dm-sans text-xs"
                style={{ color: "var(--color-grey)" }}
              >
                {item.variantLabel} · {formatPrice(item.unitPrice)} each
              </p>
            </div>

            <span
              className="font-dm-sans font-bold text-sm flex-shrink-0"
              style={{ color: "var(--color-crimson)" }}
            >
              {formatPrice(item.unitPrice * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Price breakdown */}
      <div
        className="px-5 py-4 border-t flex flex-col gap-2.5"
        style={{ borderColor: "rgba(200,150,12,0.1)" }}
      >
        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <span className="font-dm-sans text-sm" style={{ color: "var(--color-grey)" }}>
            Subtotal ({count} item{count !== 1 ? "s" : ""})
          </span>
          <span className="font-dm-sans font-semibold text-sm" style={{ color: "var(--color-brown)" }}>
            {formatPrice(sub)}
          </span>
        </div>

        {/* Coupon */}
        {disc > 0 && coupon && (
          <div className="flex items-center justify-between">
            <span className="font-dm-sans text-sm flex items-center gap-1.5" style={{ color: "#2E7D32" }}>
              🏷️
              <span
                className="px-1.5 py-0.5 rounded text-xs font-bold"
                style={{ background: "rgba(46,125,50,0.1)", color: "#2E7D32" }}
              >
                {coupon.code}
              </span>
            </span>
            <span className="font-dm-sans font-semibold text-sm" style={{ color: "#2E7D32" }}>
              −{formatPrice(disc)}
            </span>
          </div>
        )}

        {/* Delivery */}
        <div className="flex items-center justify-between">
          <span className="font-dm-sans text-sm" style={{ color: "var(--color-grey)" }}>
            Delivery
          </span>
          <span
            className="font-dm-sans font-semibold text-sm"
            style={{ color: del === 0 ? "#2E7D32" : "var(--color-brown)" }}
          >
            {del === 0 ? "🎉 Free" : formatPrice(del)}
          </span>
        </div>

        {/* COD charge */}
        {isCOD && (
          <div className="flex items-center justify-between">
            <span className="font-dm-sans text-sm" style={{ color: "var(--color-grey)" }}>
              COD Convenience
            </span>
            <span className="font-dm-sans font-semibold text-sm" style={{ color: "var(--color-crimson)" }}>
              +{formatPrice(COD_CHARGE)}
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="h-px" style={{ background: "rgba(200,150,12,0.12)" }} />

        {/* Total */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-playfair font-bold text-base" style={{ color: "var(--color-brown)" }}>
              Total
            </span>
            <p className="font-dm-sans text-xs" style={{ color: "var(--color-grey)" }}>
              Incl. all taxes
            </p>
          </div>
          <span className="font-playfair font-bold text-2xl" style={{ color: "var(--color-crimson)" }}>
            {formatPrice(isCOD ? codTotal : tot)}
          </span>
        </div>

        {/* Savings callout */}
        {disc > 0 && (
          <p className="font-dm-sans text-xs text-center font-semibold mt-1" style={{ color: "#2E7D32" }}>
            🎉 You're saving {formatPrice(disc)} on this order!
          </p>
        )}
      </div>

      {/* Footer trust */}
      <div
        className="px-5 py-3 border-t"
        style={{ borderColor: "rgba(200,150,12,0.1)", background: "var(--color-cream)" }}
      >
        <div className="flex items-center justify-around">
          {[
            { emoji: "🔒", text: "Secure" },
            { emoji: "🚚", text: "Pan-India" },
            { emoji: "🌿", text: "Homemade" },
          ].map((t) => (
            <div key={t.text} className="flex flex-col items-center gap-0.5">
              <span className="text-sm">{t.emoji}</span>
              <span className="font-dm-sans text-[0.6rem] font-medium" style={{ color: "var(--color-grey)" }}>
                {t.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

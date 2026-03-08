"use client";
// src/components/cart/CartDrawer.tsx
// Maa Flavours — Full Cart Drawer (complete implementation)
// Slides in from right with overlay backdrop
// Sections: header | item list | coupon | order summary | checkout CTA
// Connected to Zustand cartStore for all state

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X, ShoppingBag, Trash2, ArrowRight, Lock, Zap } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import CartLineItemRow from "./CartLineItem";
import CouponInput from "./CouponInput";
import CartOrderSummary from "./CartOrderSummary";
import CartEmpty from "./CartEmpty";

interface CartDrawerProps {
  onClose: () => void;
}

export default function CartDrawer({ onClose }: CartDrawerProps) {
  const {
    items,
    coupon,
    couponLoading,
    couponError,
    itemCount,
    subtotal,
    couponDiscount,
    deliveryCharge,
    total,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const drawerRef = useRef<HTMLDivElement>(null);
  const isEmpty = items.length === 0;

  // ─── Lock body scroll ─────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // ─── Close on Escape ──────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // ─── Focus trap ───────────────────────────────────────────────────────
  useEffect(() => {
    const el = drawerRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length) focusable[0].focus();
  }, []);

  const count = itemCount();
  const sub = subtotal();
  const disc = couponDiscount();
  const del = deliveryCharge();
  const tot = total();

  return (
    <>
      {/* ─── Backdrop ──────────────────────────────────────────────────── */}
      <div
        className="cart-overlay"
        onClick={onClose}
        aria-hidden="true"
        style={{ animation: "fadeIn 0.2s ease" }}
      />

      {/* ─── Drawer Panel ──────────────────────────────────────────────── */}
      <div
        ref={drawerRef}
        className="cart-drawer scrollbar-brand flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
        style={{ animation: "slideInRight 0.35s cubic-bezier(0.25,0.46,0.45,0.94)" }}
      >
        {/* ─── Gold top ornament ─────────────────────────────────────────── */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--color-gold) 20%, var(--color-gold-light) 50%, var(--color-gold) 80%, transparent)",
          }}
        />

        {/* ─── Header ──────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0 sticky top-0 z-10"
          style={{
            background: "var(--color-warm-white)",
            borderBottom: "1px solid rgba(200,150,12,0.12)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={21} strokeWidth={1.75} style={{ color: "var(--color-brown)" }} />
            <h2 className="font-playfair font-bold text-lg" style={{ color: "var(--color-brown)" }}>
              Your Cart
            </h2>
            {count > 0 && (
              <span
                className="flex items-center justify-center w-6 h-6 rounded-full font-dm-sans text-xs font-bold text-white"
                style={{ background: "var(--color-crimson)" }}
              >
                {count}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {!isEmpty && (
              <button
                onClick={() => { if (confirm("Remove all items from cart?")) clearCart(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-dm-sans text-xs font-medium transition-colors duration-200 hover:bg-crimson/10"
                style={{ color: "var(--color-grey)" }}
                aria-label="Clear cart"
              >
                <Trash2 size={13} />
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl transition-all duration-200 hover:bg-cream hover:scale-105"
              style={{ color: "var(--color-brown)" }}
              aria-label="Close cart"
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* ─── Content area ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto scrollbar-brand min-h-0">
          {isEmpty ? (
            <CartEmpty onClose={onClose} />
          ) : (
            <div className="flex flex-col">
              {/* Item list */}
              <div className="px-5 py-1">
                {items.map((item) => (
                  <CartLineItemRow
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>

              {/* Upsell strip */}
              <div
                className="mx-5 mb-4 px-4 py-3 rounded-xl flex items-center gap-3"
                style={{
                  background: "rgba(200,150,12,0.06)",
                  border: "1px solid rgba(200,150,12,0.15)",
                }}
              >
                <span className="text-xl flex-shrink-0">🌟</span>
                <p className="font-dm-sans text-xs leading-snug" style={{ color: "var(--color-brown)" }}>
                  <strong>Pair it up!</strong> Try{" "}
                  <Link
                    href="/products/maamidi-allam"
                    onClick={onClose}
                    className="font-semibold underline hover:no-underline"
                    style={{ color: "var(--color-crimson)" }}
                  >
                    Maamidi Allam
                  </Link>{" "}
                  — perfect with every Andhra meal.
                </p>
              </div>

              {/* Coupon */}
              <div className="px-5 pb-4">
                <p
                  className="font-dm-sans text-xs font-semibold tracking-widest uppercase mb-2"
                  style={{ color: "var(--color-brown)", letterSpacing: "0.1em" }}
                >
                  Have a Coupon?
                </p>
                <CouponInput
                  appliedCoupon={coupon}
                  isLoading={couponLoading}
                  error={couponError}
                  onApply={applyCoupon}
                  onRemove={removeCoupon}
                />
              </div>

              {/* Order summary */}
              <div className="px-5 pb-4">
                <CartOrderSummary
                  subtotal={sub}
                  couponDiscount={disc}
                  deliveryCharge={del}
                  total={tot}
                  appliedCoupon={coupon}
                  itemCount={count}
                />
              </div>

              {/* Trust badges */}
              <div
                className="mx-5 mb-4 px-4 py-3 rounded-xl flex items-center justify-around"
                style={{
                  background: "var(--color-cream)",
                  border: "1px solid rgba(200,150,12,0.1)",
                }}
              >
                {[
                  { icon: "🔒", text: "Secure Checkout" },
                  { icon: "🚚", text: "Pan-India Delivery" },
                  { icon: "🌿", text: "No Preservatives" },
                ].map((t) => (
                  <div key={t.text} className="flex flex-col items-center gap-0.5 text-center">
                    <span className="text-sm">{t.icon}</span>
                    <span
                      className="font-dm-sans text-[0.6rem] font-medium leading-tight"
                      style={{ color: "var(--color-grey)" }}
                    >
                      {t.text}
                    </span>
                  </div>
                ))}
              </div>

              <div className="h-2" />
            </div>
          )}
        </div>

        {/* ─── Footer CTAs ──────────────────────────────────────────────── */}
        {!isEmpty && (
          <div
            className="px-5 py-4 flex-shrink-0 flex flex-col gap-3"
            style={{
              borderTop: "1px solid rgba(200,150,12,0.12)",
              background: "var(--color-warm-white)",
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="font-dm-sans text-xs" style={{ color: "var(--color-grey)" }}>Order Total</span>
                <p className="font-playfair font-bold text-xl leading-tight" style={{ color: "var(--color-crimson)" }}>
                  {formatPrice(tot)}
                </p>
              </div>
              {disc > 0 && (
                <div
                  className="px-3 py-1.5 rounded-xl font-dm-sans text-xs font-bold"
                  style={{
                    background: "rgba(46,125,50,0.1)",
                    color: "#2E7D32",
                    border: "1px solid rgba(46,125,50,0.2)",
                  }}
                >
                  Saving {formatPrice(disc)} 🎉
                </div>
              )}
            </div>

            <Link
              href="/checkout"
              onClick={onClose}
              className="btn-primary w-full py-4 text-base justify-center gap-2.5"
            >
              <Lock size={17} />
              Proceed to Checkout
              <ArrowRight size={17} />
            </Link>

            <Link
              href="/checkout?express=true"
              onClick={onClose}
              className="w-full py-3.5 rounded-xl font-dm-sans font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 100%)",
                color: "var(--color-brown)",
                boxShadow: "0 2px 8px rgba(200,150,12,0.25)",
              }}
            >
              <Zap size={16} fill="var(--color-brown)" />
              Express Pay — UPI / Razorpay
            </Link>

            <button
              onClick={onClose}
              className="font-dm-sans text-sm text-center transition-colors hover:opacity-70"
              style={{ color: "var(--color-grey)" }}
            >
              ← Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}

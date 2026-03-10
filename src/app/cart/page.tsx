"use client";
// src/app/cart/page.tsx
// Maa Flavours — Full Cart Page (/cart)
// Mirrors CartDrawer layout but as a full page
// Connected to Zustand cart store

import Link from "next/link";
import { ShoppingBag, ArrowRight, Lock, Trash2, Zap } from "lucide-react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import NavbarWithCart from "@/components/layout/NavbarWithCart";
import Footer from "@/components/layout/Footer";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import CartLineItemRow from "@/components/cart/CartLineItem";
import CouponInput from "@/components/cart/CouponInput";
import CartOrderSummary from "@/components/cart/CartOrderSummary";

const FEATURED_PICKS = [
  { slug: "pulihora-gongura", name: "Pulihora Gongura", emoji: "🍃", price: "₹200" },
  { slug: "drumstick-pickle", name: "Drumstick Pickle", emoji: "🥢", price: "₹180" },
  { slug: "maamidi-allam",    name: "Maamidi Allam",   emoji: "🥭", price: "₹190" },
];

export default function CartPage() {
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

  const count = itemCount();
  const sub   = subtotal();
  const disc  = couponDiscount();
  const del   = deliveryCharge();
  const tot   = total();
  const isEmpty = items.length === 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-warm-white)" }}>
      <AnnouncementBar />
      <NavbarWithCart />

      <main className="flex-1 section-padding">
        <div className="section-container">

          {/* ─── Page header ───────────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1
                className="font-playfair font-bold"
                style={{ color: "var(--color-brown)", fontSize: "clamp(1.75rem,3vw,2.5rem)" }}
              >
                <ShoppingBag
                  size={28}
                  className="inline-block mr-3 mb-1"
                  style={{ color: "var(--color-gold)" }}
                />
                Your Cart
              </h1>
              {count > 0 && (
                <p
                  className="font-dm-sans text-sm mt-1 ml-1"
                  style={{ color: "var(--color-grey)" }}
                >
                  {count} item{count !== 1 ? "s" : ""} in your cart
                </p>
              )}
            </div>

            {!isEmpty && (
              <button
                onClick={() => {
                  if (confirm("Remove all items from cart?")) clearCart();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-dm-sans text-sm transition-colors duration-200 hover:bg-crimson/10"
                style={{ color: "var(--color-grey)" }}
              >
                <Trash2 size={14} />
                Clear Cart
              </button>
            )}
          </div>

          {/* ─── Empty state ──────────────────────────────────────────── */}
          {isEmpty ? (
            <div className="flex flex-col items-center text-center py-16 gap-6 max-w-md mx-auto">
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center text-5xl"
                style={{
                  background: "var(--color-cream)",
                  border: "2px dashed rgba(200,150,12,0.3)",
                }}
              >
                🫙
              </div>

              <div className="ornament-line w-20" />

              <div>
                <h2
                  className="font-playfair font-bold text-2xl mb-2"
                  style={{ color: "var(--color-brown)" }}
                >
                  Your cart is empty
                </h2>
                <p
                  className="font-cormorant italic text-lg leading-snug"
                  style={{ color: "var(--color-grey)" }}
                >
                  Add some authentic Andhra pickles and bring the taste of home to your table.
                </p>
              </div>

              {/* Quick picks */}
              <div className="w-full text-left">
                <p
                  className="font-dm-sans text-xs font-semibold tracking-widest uppercase mb-3 text-center"
                  style={{ color: "var(--color-gold)", letterSpacing: "0.1em" }}
                >
                  Popular Picks
                </p>
                <div className="flex flex-col gap-2">
                  {FEATURED_PICKS.map((pick) => (
                    <Link
                      key={pick.slug}
                      href={`/products/${pick.slug}`}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 group"
                      style={{
                        background: "var(--color-cream)",
                        border: "1px solid rgba(200,150,12,0.15)",
                      }}
                    >
                      <span className="text-xl">{pick.emoji}</span>
                      <span
                        className="font-dm-sans text-sm font-medium flex-1"
                        style={{ color: "var(--color-brown)" }}
                      >
                        {pick.name}
                      </span>
                      <span
                        className="font-dm-sans font-semibold text-sm"
                        style={{ color: "var(--color-crimson)" }}
                      >
                        {pick.price}
                      </span>
                      <span
                        className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: "var(--color-gold)" }}
                      >
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <Link href="/products" className="btn-primary w-full py-3.5 justify-center mt-2">
                Browse All Pickles
              </Link>
            </div>

          ) : (

            /* ─── Cart with items ──────────────────────────────────── */
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">

              {/* ─── Left: Item list ────────────────────────────────── */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "white",
                  border: "1px solid rgba(200,150,12,0.12)",
                  boxShadow: "0 2px 12px rgba(74,44,10,0.05)",
                }}
              >
                {/* Gold top accent */}
                <div
                  className="h-[3px]"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, var(--color-gold) 20%, var(--color-gold-light) 50%, var(--color-gold) 80%, transparent)",
                  }}
                />

                {/* Item rows */}
                <div className="px-5 py-1 divide-y"
                  style={{ "--tw-divide-color": "rgba(200,150,12,0.08)" } as React.CSSProperties}
                >
                  {items.map((item) => (
                    <CartLineItemRow
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </div>

                {/* Continue shopping */}
                <div
                  className="px-5 py-4"
                  style={{ borderTop: "1px solid rgba(200,150,12,0.1)" }}
                >
                  <Link
                    href="/products"
                    className="font-dm-sans text-sm font-medium transition-opacity hover:opacity-70 flex items-center gap-1"
                    style={{ color: "var(--color-gold)" }}
                  >
                    ← Continue Shopping
                  </Link>
                </div>
              </div>

              {/* ─── Right: Summary panel ───────────────────────────── */}
              <div className="flex flex-col gap-4 lg:sticky lg:top-24">

                {/* Coupon */}
                <div
                  className="rounded-2xl p-5"
                  style={{
                    background: "white",
                    border: "1px solid rgba(200,150,12,0.12)",
                    boxShadow: "0 2px 12px rgba(74,44,10,0.05)",
                  }}
                >
                  <p
                    className="font-dm-sans text-xs font-semibold tracking-widest uppercase mb-3"
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
                <div
                  className="rounded-2xl p-5"
                  style={{
                    background: "white",
                    border: "1px solid rgba(200,150,12,0.12)",
                    boxShadow: "0 2px 12px rgba(74,44,10,0.05)",
                  }}
                >
                  <CartOrderSummary
                    subtotal={sub}
                    couponDiscount={disc}
                    deliveryCharge={del}
                    total={tot}
                    appliedCoupon={coupon}
                    itemCount={count}
                  />
                </div>

                {/* Savings badge */}
                {disc > 0 && (
                  <div
                    className="flex items-center justify-between px-4 py-3 rounded-xl font-dm-sans"
                    style={{
                      background: "rgba(46,125,50,0.08)",
                      border: "1px solid rgba(46,125,50,0.2)",
                    }}
                  >
                    <span className="text-sm font-semibold" style={{ color: "#2E7D32" }}>
                      🎉 You're saving
                    </span>
                    <span className="font-bold text-base" style={{ color: "#2E7D32" }}>
                      {formatPrice(disc)}
                    </span>
                  </div>
                )}

                {/* Checkout CTAs */}
                <Link
                  href="/checkout"
                  className="btn-primary w-full py-4 text-base justify-center gap-2.5"
                >
                  <Lock size={17} />
                  Proceed to Checkout
                  <ArrowRight size={17} />
                </Link>

                <Link
                  href="/checkout?express=true"
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

                {/* Trust badges */}
                <div
                  className="rounded-xl px-4 py-3 flex items-center justify-around"
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
                    <div key={t.text} className="flex flex-col items-center gap-1 text-center">
                      <span className="text-lg">{t.icon}</span>
                      <span
                        className="font-dm-sans text-[0.65rem] font-medium"
                        style={{ color: "var(--color-grey)" }}
                      >
                        {t.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

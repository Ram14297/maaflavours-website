"use client";
// src/app/checkout/page.tsx
// Maa Flavours — Checkout Page
// Multi-step flow: Address → Payment → Review → (Order placed → redirect)
// Left column: step content | Right column: sticky order summary
// Mobile: stacked, order summary collapses below CTA on small screens

import { useState, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Lock } from "lucide-react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import NavbarWithCart from "@/components/layout/NavbarWithCart";
import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import AddressForm from "@/components/checkout/AddressForm";
import PaymentOptions from "@/components/checkout/PaymentOptions";
import OrderReviewStep from "@/components/checkout/OrderReviewStep";
import OrderSummaryPanel from "@/components/checkout/OrderSummaryPanel";
import { useCheckoutStore } from "@/store/checkoutStore";
import { useCartStore } from "@/store/cartStore";

// ─── Empty cart guard ───────────────────────────────────────────────────────
function EmptyCartRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/products");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 px-6 text-center">
      <div className="text-5xl">🫙</div>
      <h2 className="font-playfair font-bold text-2xl" style={{ color: "var(--color-brown)" }}>
        Your cart is empty
      </h2>
      <p className="font-dm-sans text-base" style={{ color: "var(--color-grey)" }}>
        Add some pickles before proceeding to checkout.
      </p>
      <Link href="/products" className="btn-primary py-3 px-7">
        Browse Pickles
      </Link>
    </div>
  );
}

// ─── Checkout content ───────────────────────────────────────────────────────
function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isExpress = searchParams.get("express") === "true";

  const { step, setStep, paymentMethod, isPlacingOrder, setPlacingOrder, setOrderError, resetCheckout } =
    useCheckoutStore();
  const { items, clearCart } = useCartStore();
  const [loginOpen, setLoginOpen] = useState(false);

  // Redirect if cart is empty
  if (items.length === 0) {
    return <EmptyCartRedirect />;
  }

  // ─── Handle successful payment (Razorpay / Razorpay returns here) ────
  const handleOrderSuccess = useCallback(
    (orderId: string, paymentId: string) => {
      clearCart();
      resetCheckout();
      router.push(
        `/order-confirmation/${orderId}?paymentId=${paymentId}&method=${paymentMethod}`
      );
    },
    [clearCart, resetCheckout, router, paymentMethod]
  );

  // ─── COD confirmation from review step ──────────────────────────────
  const handleReviewConfirm = useCallback(async () => {
    setPlacingOrder(true);
    setOrderError("");
    // PaymentOptions handles the actual API call
    // For COD from review step, trigger the PaymentOptions handler
    // This is a safety net — normally PaymentOptions handles it directly
    setPlacingOrder(false);
    setStep("payment");
  }, [setPlacingOrder, setOrderError, setStep]);

  return (
    <div className="section-container py-6 lg:py-10">
      {/* ─── Checkout header ──────────────────────────────────────────── */}
      <div className="text-center mb-6 lg:mb-8">
        {/* Logo */}
        <Link href="/" className="inline-block mb-4">
          <span className="font-dancing text-3xl" style={{ color: "var(--color-crimson)" }}>
            Maa Flavours
          </span>
        </Link>

        <div className="ornament-line w-24 mx-auto mb-4" />

        <h1
          className="font-playfair font-bold text-2xl sm:text-3xl"
          style={{ color: "var(--color-brown)" }}
        >
          {step === "address" && "Where shall we deliver?"}
          {step === "payment" && "How would you like to pay?"}
          {step === "review" && "Review your order"}
        </h1>
        <p
          className="font-cormorant italic text-lg mt-1"
          style={{ color: "var(--color-grey)" }}
        >
          {step === "address" && "Authentic Andhra pickles on the way to your table"}
          {step === "payment" && "Secure checkout — your details are safe with us"}
          {step === "review" && "Almost there — confirm and enjoy the flavours!"}
        </p>
      </div>

      {/* ─── Stepper ──────────────────────────────────────────────────── */}
      <CheckoutStepper currentStep={step} />

      {/* ─── Main layout ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

        {/* ─── Left: Step Content ───────────────────────────────────── */}
        <div className="min-w-0">
          {step === "address" && <AddressForm />}

          {step === "payment" && (
            <PaymentOptions onOrderSuccess={handleOrderSuccess} />
          )}

          {step === "review" && (
            <OrderReviewStep
              onConfirm={handleReviewConfirm}
              isPlacing={isPlacingOrder}
            />
          )}
        </div>

        {/* ─── Right: Order Summary (sticky) ────────────────────────── */}
        <div className="hidden lg:block">
          <OrderSummaryPanel isCOD={paymentMethod === "cod"} />
        </div>
      </div>

      {/* ─── Mobile order summary (below step content) ──────────────── */}
      <div className="lg:hidden mt-8">
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(200,150,12,0.15)" }}
        >
          <details>
            <summary
              className="flex items-center justify-between px-5 py-4 cursor-pointer"
              style={{
                background: "var(--color-cream)",
                borderBottom: "1px solid rgba(200,150,12,0.1)",
              }}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag size={17} style={{ color: "var(--color-brown)" }} />
                <span
                  className="font-dm-sans font-bold text-sm"
                  style={{ color: "var(--color-brown)" }}
                >
                  Show Order Summary
                </span>
              </div>
              <span
                className="font-playfair font-bold text-base"
                style={{ color: "var(--color-crimson)" }}
              >
                {/* Total shown in summary panel */}
              </span>
            </summary>
            <div className="bg-white">
              <OrderSummaryPanel isCOD={paymentMethod === "cod"} />
            </div>
          </details>
        </div>
      </div>

      {/* ─── Security & Trust Footer ──────────────────────────────────── */}
      <div
        className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-10 pt-8 border-t"
        style={{ borderColor: "rgba(200,150,12,0.12)" }}
      >
        {[
          { icon: "🔒", text: "256-bit SSL Encryption" },
          { icon: "🏦", text: "Razorpay Secured" },
          { icon: "💳", text: "PCI DSS Compliant" },
          { icon: "🚚", text: "Pan-India Delivery" },
          { icon: "🌿", text: "No Preservatives" },
        ].map((item) => (
          <div
            key={item.text}
            className="flex items-center gap-2 font-dm-sans text-xs"
            style={{ color: "var(--color-grey)" }}
          >
            <span>{item.icon}</span>
            {item.text}
          </div>
        ))}
      </div>

      {/* Footer links */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
        {[
          { label: "Privacy Policy", href: "/privacy-policy" },
          { label: "Return Policy", href: "/return-policy" },
          { label: "Contact Us", href: "/contact" },
        ].map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="font-dm-sans text-xs transition-opacity hover:opacity-70"
            style={{ color: "var(--color-grey)" }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Page wrapper ───────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--color-warm-white)" }}
    >
      <AnnouncementBar />
      <NavbarWithCart onAccountClick={() => setLoginOpen(true)} />

      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="flex flex-col items-center gap-3">
                <span className="text-4xl animate-pulse">🫙</span>
                <p className="font-dm-sans text-sm" style={{ color: "var(--color-grey)" }}>
                  Loading checkout…
                </p>
              </div>
            </div>
          }
        >
          <CheckoutContent />
        </Suspense>
      </main>
    </div>
  );
}

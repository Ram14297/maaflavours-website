"use client";
// src/app/checkout/confirmation/page.tsx
// Maa Flavours — Order Confirmation Page
// Shows after successful payment — receipt, ETA, next steps, WhatsApp link
// URL: /checkout/confirmation?orderId=xxx&paymentId=xxx&method=upi

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package, Truck, MessageCircle, ShoppingBag, ArrowRight } from "lucide-react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import NavbarWithCart from "@/components/layout/NavbarWithCart";
import Footer from "@/components/layout/Footer";

// ─── Confetti burst animation (CSS only, no lib needed) ─────────────────────
function ConfettiDots() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${10 + i * 7.5}%`,
            top: "-8px",
            background: i % 3 === 0
              ? "var(--color-crimson)"
              : i % 3 === 1
              ? "var(--color-gold)"
              : "var(--color-gold-light)",
            animation: `confettiFall ${1.2 + (i % 4) * 0.3}s ease-in ${i * 0.08}s forwards`,
            opacity: 0,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0%   { opacity: 1; transform: translateY(0) rotate(0deg); }
          100% { opacity: 0; transform: translateY(120px) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ─── What happens next steps ─────────────────────────────────────────────────
const NEXT_STEPS = [
  {
    icon: Package,
    title: "We're Preparing Your Order",
    desc: "Our team starts handpacking your pickles fresh in our Ongole kitchen.",
    color: "var(--color-gold)",
  },
  {
    icon: Truck,
    title: "Shipped in 1–2 Days",
    desc: "We'll send a tracking SMS to your mobile once your order is dispatched.",
    color: "var(--color-crimson)",
  },
  {
    icon: CheckCircle2,
    title: "Delivered in 5–7 Days",
    desc: "Pan-India delivery. Your authentic Andhra pickles arrive at your doorstep.",
    color: "#2E7D32",
  },
];

// ─── Confirmation Content ────────────────────────────────────────────────────
function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const paymentId = searchParams.get("paymentId") || "";
  const method = searchParams.get("method") || "upi";
  const isCOD = method === "COD";

  const [loginOpen, setLoginOpen] = useState(false);

  // Format order ID for display — show last 8 chars if long UUID
  const displayOrderId = orderId.length > 12
    ? `MF-${orderId.slice(-8).toUpperCase()}`
    : orderId.toUpperCase();

  return (
    <div className="section-container py-8 lg:py-14">
      <div className="max-w-2xl mx-auto">

        {/* ─── Hero success card ─────────────────────────────────────── */}
        <div
          className="relative rounded-3xl overflow-hidden text-center px-6 py-10 mb-8"
          style={{
            background: "white",
            border: "1px solid rgba(200,150,12,0.18)",
            boxShadow: "0 8px 40px rgba(74,44,10,0.1)",
          }}
        >
          {/* Confetti */}
          <ConfettiDots />

          {/* Gold ornament top */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background: "linear-gradient(90deg, transparent, var(--color-gold) 20%, var(--color-gold-light) 50%, var(--color-gold) 80%, transparent)",
            }}
          />

          {/* Success icon */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{
              background: "rgba(46,125,50,0.1)",
              border: "3px solid rgba(46,125,50,0.3)",
            }}
          >
            <CheckCircle2 size={40} style={{ color: "#2E7D32" }} strokeWidth={1.5} />
          </div>

          {/* Heading */}
          <h1
            className="font-playfair font-bold text-3xl sm:text-4xl mb-2"
            style={{ color: "var(--color-brown)" }}
          >
            Order Confirmed! 🎉
          </h1>
          <p
            className="font-cormorant italic text-xl mb-5"
            style={{ color: "var(--color-grey)" }}
          >
            Your authentic Andhra pickles are on their way
          </p>

          {/* Ornament */}
          <div className="ornament-line w-24 mx-auto mb-5" />

          {/* Order details */}
          <div
            className="inline-flex flex-col sm:flex-row gap-4 sm:gap-8 px-6 py-4 rounded-2xl"
            style={{
              background: "var(--color-cream)",
              border: "1px solid rgba(200,150,12,0.15)",
            }}
          >
            <div className="text-center">
              <p className="font-dm-sans text-xs font-semibold tracking-widest uppercase mb-1"
                style={{ color: "var(--color-gold)", letterSpacing: "0.1em" }}>
                Order ID
              </p>
              <p className="font-dm-sans font-bold text-base" style={{ color: "var(--color-brown)" }}>
                {displayOrderId}
              </p>
            </div>

            <div className="hidden sm:block w-px" style={{ background: "rgba(200,150,12,0.2)" }} />

            <div className="text-center">
              <p className="font-dm-sans text-xs font-semibold tracking-widest uppercase mb-1"
                style={{ color: "var(--color-gold)", letterSpacing: "0.1em" }}>
                Payment
              </p>
              <p
                className="font-dm-sans font-bold text-base"
                style={{ color: isCOD ? "var(--color-crimson)" : "#2E7D32" }}
              >
                {isCOD ? "Cash on Delivery" : "✓ Paid"}
              </p>
            </div>

            <div className="hidden sm:block w-px" style={{ background: "rgba(200,150,12,0.2)" }} />

            <div className="text-center">
              <p className="font-dm-sans text-xs font-semibold tracking-widest uppercase mb-1"
                style={{ color: "var(--color-gold)", letterSpacing: "0.1em" }}>
                Delivery ETA
              </p>
              <p className="font-dm-sans font-bold text-base" style={{ color: "var(--color-brown)" }}>
                5–7 Working Days
              </p>
            </div>
          </div>

          {/* Confirmation message */}
          <p
            className="font-dm-sans text-sm mt-5 leading-relaxed max-w-sm mx-auto"
            style={{ color: "var(--color-grey)" }}
          >
            {isCOD
              ? "Your COD order has been placed. Our team will contact you before dispatch."
              : "A confirmation SMS has been sent to your registered mobile number."}
          </p>
        </div>

        {/* ─── What Happens Next ────────────────────────────────────── */}
        <div className="mb-8">
          <div className="text-center mb-5">
            <span className="section-eyebrow block mb-1">What Happens Next</span>
            <h2
              className="font-playfair font-bold text-xl"
              style={{ color: "var(--color-brown)" }}
            >
              Your pickles are in good hands
            </h2>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div
              className="hidden sm:block absolute top-8 left-8 right-8 h-[2px]"
              style={{
                background: "linear-gradient(90deg, var(--color-gold) 0%, var(--color-gold-light) 50%, var(--color-gold) 100%)",
                zIndex: 0,
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
              {NEXT_STEPS.map((step) => (
                <div
                  key={step.title}
                  className="flex flex-col items-center text-center gap-3 px-4 py-5 rounded-2xl"
                  style={{
                    background: "white",
                    border: "1px solid rgba(200,150,12,0.12)",
                    boxShadow: "0 2px 12px rgba(74,44,10,0.05)",
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{
                      background: `${step.color}15`,
                      border: `2px solid ${step.color}30`,
                    }}
                  >
                    <step.icon size={24} strokeWidth={1.75} style={{ color: step.color }} />
                  </div>
                  <div>
                    <p
                      className="font-dm-sans font-bold text-sm mb-1"
                      style={{ color: "var(--color-brown)" }}
                    >
                      {step.title}
                    </p>
                    <p
                      className="font-dm-sans text-xs leading-relaxed"
                      style={{ color: "var(--color-grey)" }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Referral nudge ───────────────────────────────────────── */}
        <div
          className="rounded-2xl p-6 mb-6 text-center"
          style={{
            background: "linear-gradient(135deg, var(--color-cream) 0%, rgba(200,150,12,0.08) 100%)",
            border: "1px solid rgba(200,150,12,0.2)",
          }}
        >
          <p
            className="font-dancing text-2xl mb-2"
            style={{ color: "var(--color-crimson)" }}
          >
            "Share the love of Maa's pickles"
          </p>
          <p
            className="font-dm-sans text-sm mb-4"
            style={{ color: "var(--color-grey)" }}
          >
            Share with your family and friends — every pack brings a taste of home.
          </p>
          <a
            href={`https://wa.me/?text=Just ordered authentic Andhra pickles from Maa Flavours! 🫙🌶️ Try them at https://maaflavours.com — no preservatives, handmade in Ongole!`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 font-dm-sans font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-200 hover:opacity-90"
            style={{
              background: "#25D366",
              color: "white",
              boxShadow: "0 3px 12px rgba(37,211,102,0.3)",
            }}
          >
            <MessageCircle size={18} />
            Share on WhatsApp
          </a>
        </div>

        {/* ─── CTAs ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/account/orders"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-dm-sans font-semibold text-sm transition-all duration-200 hover:opacity-90"
            style={{
              border: "2px solid var(--color-brown)",
              color: "var(--color-brown)",
            }}
          >
            <Package size={17} />
            Track My Order
          </Link>

          <Link
            href="/products"
            className="btn-primary flex-1 py-3.5 justify-center gap-2"
          >
            <ShoppingBag size={17} />
            Continue Shopping
            <ArrowRight size={17} />
          </Link>
        </div>

        {/* Support note */}
        <p
          className="font-dm-sans text-xs text-center mt-6"
          style={{ color: "var(--color-grey)" }}
        >
          Questions? Reach us on{" "}
          <a
            href="https://wa.me/919701452929"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold"
            style={{ color: "#25D366" }}
          >
            WhatsApp
          </a>{" "}
          or email us at{" "}
          <a
            href="mailto:maaflavours74@gmail.com"
            className="font-semibold"
            style={{ color: "var(--color-crimson)" }}
          >
            maaflavours74@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}

// ─── Page export ─────────────────────────────────────────────────────────────
export default function OrderConfirmationPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--color-warm-white)" }}
    >
      <AnnouncementBar />
      <NavbarWithCart />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
              <span className="text-4xl animate-pulse">🎉</span>
            </div>
          }
        >
          <ConfirmationContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

"use client";
// src/app/checkout/phonepe-status/page.tsx
// Maa Flavours — PhonePe Payment Result Page
// User lands here after PhonePe redirect: /checkout/phonepe-status?orderId=xxx
// Polls /api/checkout/phonepe-status until success / failure / timeout

import { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

type PaymentStatus = "checking" | "success" | "failed" | "pending";

function PhonePeStatusContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const { clearCart } = useCartStore();

  const orderId = searchParams.get("orderId") || "";

  const [status, setStatus]   = useState<PaymentStatus>("checking");
  const [dots, setDots]       = useState(".");
  const pollCount             = useRef(0);
  const cartCleared           = useRef(false);

  // Animate dots for "checking" state
  useEffect(() => {
    if (status !== "checking") return;
    const t = setInterval(() => setDots((d) => (d.length < 3 ? d + "." : ".")), 500);
    return () => clearInterval(t);
  }, [status]);

  // Poll payment status
  useEffect(() => {
    if (!orderId) { setStatus("failed"); return; }

    const check = async () => {
      try {
        const res  = await fetch(`/api/checkout/phonepe-status?orderId=${orderId}`);
        const data = await res.json();

        if (data.status === "PAYMENT_SUCCESS") {
          setStatus("success");
          if (!cartCleared.current) { clearCart(); cartCleared.current = true; }
          return true; // stop polling
        }
        if (data.status === "PAYMENT_ERROR") {
          setStatus("failed");
          return true;
        }
      } catch { /* network error — keep polling */ }
      return false;
    };

    // First check immediately
    check().then((done) => {
      if (done) return;

      const interval = setInterval(async () => {
        pollCount.current += 1;
        const done = await check();
        if (done || pollCount.current >= 10) {
          clearInterval(interval);
          if (!done) setStatus("pending"); // gave up after ~20s
        }
      }, 2000);

      return () => clearInterval(interval);
    });
  }, [orderId, clearCart]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "var(--color-warm-white)" }}
    >
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{
          background: "white",
          border: "1px solid rgba(200,150,12,0.15)",
          boxShadow: "0 8px 40px rgba(74,44,10,0.1)",
        }}
      >
        {/* Gold ornament */}
        <div className="h-1" style={{
          background: "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)",
        }} />

        <div className="px-8 py-10 flex flex-col items-center text-center gap-6">

          {/* ── Checking ── */}
          {status === "checking" && (
            <>
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: "rgba(95,37,159,0.08)", border: "2px solid rgba(95,37,159,0.2)" }}>
                <Clock size={36} strokeWidth={1.5} style={{ color: "#5F259F" }} />
              </div>
              <div>
                <h1 className="font-playfair font-bold text-2xl" style={{ color: "var(--color-brown)" }}>
                  Verifying Payment{dots}
                </h1>
                <p className="font-dm-sans text-sm mt-2" style={{ color: "var(--color-grey)" }}>
                  Please wait while we confirm your PhonePe payment.
                  <br />
                  Do not close or refresh this page.
                </p>
              </div>
              <div className="w-48 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(95,37,159,0.1)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    background: "#5F259F",
                    animation: "progress-bar 2s linear infinite",
                    width: "60%",
                  }}
                />
              </div>
            </>
          )}

          {/* ── Success ── */}
          {status === "success" && (
            <>
              <div className="relative w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: "rgba(46,125,50,0.1)", border: "3px solid rgba(46,125,50,0.25)" }}>
                <CheckCircle2 size={36} strokeWidth={1.5} style={{ color: "#2E7D32" }} />
                <div className="absolute inset-0 rounded-full animate-ping"
                  style={{ background: "rgba(46,125,50,0.1)", animationDuration: "1.4s" }} />
              </div>
              <div>
                <h1 className="font-playfair font-bold text-2xl" style={{ color: "var(--color-brown)" }}>
                  Payment Successful! 🎉
                </h1>
                <p className="font-dm-sans text-sm mt-2" style={{ color: "var(--color-grey)" }}>
                  Your order has been confirmed. Your pickles are on the way!
                </p>
              </div>
              <div className="w-full px-4 py-3 rounded-xl flex items-center gap-3"
                style={{ background: "rgba(200,150,12,0.06)", border: "1px solid rgba(200,150,12,0.2)" }}>
                <span className="text-xl">📦</span>
                <p className="font-dm-sans text-sm font-medium text-left" style={{ color: "var(--color-brown)" }}>
                  Order ID: <span className="font-mono text-xs" style={{ color: "var(--color-grey)" }}>{orderId.slice(0, 12)}…</span>
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <Link href="/account/orders"
                  className="btn-primary w-full py-3.5 text-sm text-center">
                  View Order Details
                </Link>
                <Link href="/products"
                  className="font-dm-sans text-sm text-center underline hover:no-underline"
                  style={{ color: "var(--color-grey)" }}>
                  Continue Shopping
                </Link>
              </div>
            </>
          )}

          {/* ── Failed ── */}
          {status === "failed" && (
            <>
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: "rgba(192,39,45,0.08)", border: "2px solid rgba(192,39,45,0.18)" }}>
                <XCircle size={36} strokeWidth={1.5} style={{ color: "var(--color-crimson)" }} />
              </div>
              <div>
                <h1 className="font-playfair font-bold text-2xl" style={{ color: "var(--color-brown)" }}>
                  Payment Failed
                </h1>
                <p className="font-dm-sans text-sm mt-2" style={{ color: "var(--color-grey)" }}>
                  Your payment could not be processed. No amount was deducted.
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={() => router.push("/checkout")}
                  className="btn-primary w-full py-3.5 text-sm"
                >
                  Try Again
                </button>
                <Link href="/contact"
                  className="font-dm-sans text-sm text-center underline hover:no-underline"
                  style={{ color: "var(--color-grey)" }}>
                  Need help? Contact us
                </Link>
              </div>
            </>
          )}

          {/* ── Pending (timeout) ── */}
          {status === "pending" && (
            <>
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: "rgba(200,150,12,0.08)", border: "2px solid rgba(200,150,12,0.2)" }}>
                <Clock size={36} strokeWidth={1.5} style={{ color: "var(--color-gold)" }} />
              </div>
              <div>
                <h1 className="font-playfair font-bold text-2xl" style={{ color: "var(--color-brown)" }}>
                  Payment Pending
                </h1>
                <p className="font-dm-sans text-sm mt-2" style={{ color: "var(--color-grey)" }}>
                  We're still waiting for confirmation from PhonePe.
                  Check your orders page in a few minutes.
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <Link href="/account/orders"
                  className="btn-primary w-full py-3.5 text-sm text-center">
                  Check My Orders
                </Link>
                <Link href="/contact"
                  className="font-dm-sans text-sm text-center underline hover:no-underline"
                  style={{ color: "var(--color-grey)" }}>
                  Contact support
                </Link>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t text-center"
          style={{ borderColor: "rgba(200,150,12,0.08)", background: "var(--color-cream)" }}>
          <p className="font-dm-sans text-xs" style={{ color: "var(--color-grey)" }}>
            💜 Secured by PhonePe &nbsp;·&nbsp; 🔒 SSL Encrypted
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes progress-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}

export default function PhonePeStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-warm-white)" }}>
        <span className="text-4xl animate-pulse">💜</span>
      </div>
    }>
      <PhonePeStatusContent />
    </Suspense>
  );
}

"use client";
// src/components/checkout/PaymentOptions.tsx
// Maa Flavours — Payment Method Selection
// Cashfree (UPI / Card / Net Banking) | PhonePe QR (manual) | COD

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Banknote, ChevronLeft, Lock, CheckCircle2 } from "lucide-react";
import { useCheckoutStore, PaymentMethod } from "@/store/checkoutStore";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

const COD_CHARGE = 3000; // ₹30 in paise

// ─── Load Cashfree SDK ─────────────────────────────────────────────────────
function loadCashfree(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Cashfree) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── Payment method config ─────────────────────────────────────────────────
const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  tag?: string;
  tagColor?: string;
  codCharge?: boolean;
}[] = [
  {
    id: "cashfree",
    label: "UPI / Card / Net Banking",
    subtitle: "GPay, PhonePe, Paytm, BHIM, Credit/Debit Card, Net Banking — all in one",
    icon: <span className="text-xl">💳</span>,
    tag: "Recommended",
    tagColor: "#2D6A4F",
  },
  {
    id: "phonepe_qr",
    label: "PhonePe / UPI QR Code",
    subtitle: "Scan QR with any UPI app → pay → enter transaction ID",
    icon: <span className="text-xl font-bold" style={{ color: "#5F259F" }}>₹</span>,
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    subtitle: "Pay in cash when your order arrives",
    icon: <Banknote size={20} />,
    tag: "+ ₹30",
    codCharge: true,
  },
];

interface PaymentOptionsProps {
  onOrderSuccess: (orderId: string, paymentId: string) => void;
}

export default function PaymentOptions({ onOrderSuccess }: PaymentOptionsProps) {
  const router = useRouter();
  const {
    paymentMethod,
    setPaymentMethod,
    address,
    setStep,
    setPlacingOrder,
    isPlacingOrder,
    orderError,
    setOrderError,
  } = useCheckoutStore();

  const { items, coupon, total, clearCart } = useCartStore();
  const [codConfirmed, setCodConfirmed]   = useState(false);
  const [upiTxnId,    setUpiTxnId]        = useState("");

  const cartTotal = total();
  const codTotal  = paymentMethod === "cod" ? cartTotal + COD_CHARGE : cartTotal;

  // ─── Cashfree: UPI + Card + Net Banking ─────────────────────────────────
  const handleCashfreePayment = async () => {
    setPlacingOrder(true);
    setOrderError("");

    try {
      // Step 1: Create order in DB
      const orderRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productSlug:  i.productSlug,
            variantIndex: i.variantIndex,
            quantity:     i.quantity,
          })),
          couponCode:      coupon?.code,
          deliveryAddress: address,
          paymentMethod:   "cashfree",
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Failed to create order");

      const { orderId, amount } = orderData;

      // Step 2: Create Cashfree payment session
      const cfRes = await fetch("/api/checkout/cashfree-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mfOrderId:     orderId,
          amount:        amount || cartTotal,
          customerName:  address.full_name,
          customerPhone: address.mobile,
          customerEmail: "",
          customerId:    orderId,
        }),
      });

      const cfData = await cfRes.json();
      if (!cfRes.ok) throw new Error(cfData.error || "Failed to init payment");

      const { paymentSessionId, cfEnv } = cfData;

      // Step 3: Load Cashfree SDK & open modal
      const loaded = await loadCashfree();
      if (!loaded) throw new Error("Could not load payment SDK. Check your internet connection.");

      const cashfree = (window as any).Cashfree({ mode: cfEnv === "production" ? "production" : "sandbox" });

      cashfree.checkout({
        paymentSessionId,
        redirectTarget: "_modal",
      }).then((result: any) => {
        if (result.error) {
          setOrderError(result.error.message || "Payment failed. Please try again.");
          setPlacingOrder(false);
          toast.error(result.error.message || "Payment failed");
        } else if (result.paymentDetails || result.redirect) {
          // Payment successful
          clearCart();
          onOrderSuccess(orderId, paymentSessionId);
        }
      }).catch((err: any) => {
        setOrderError(err.message || "Payment failed");
        setPlacingOrder(false);
        toast.error("Payment failed. Please try again.");
      });

    } catch (err: any) {
      setOrderError(err.message || "Something went wrong");
      setPlacingOrder(false);
      toast.error(err.message || "Something went wrong. Please try again.");
    }
  };

  // ─── PhonePe QR: manual scan → enter txn ID ─────────────────────────────
  const handlePhonePeQR = async () => {
    if (!upiTxnId.trim()) {
      setOrderError("Please enter the UPI transaction ID after completing payment.");
      return;
    }
    setPlacingOrder(true);
    setOrderError("");

    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productSlug:  i.productSlug,
            variantIndex: i.variantIndex,
            quantity:     i.quantity,
          })),
          couponCode:      coupon?.code,
          deliveryAddress: address,
          paymentMethod:   "phonepe_qr",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order");

      clearCart();
      onOrderSuccess(data.orderId, upiTxnId.trim());
    } catch (err: any) {
      setOrderError(err.message || "Order placement failed");
      toast.error(err.message || "Failed to place order. Try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  // ─── COD ─────────────────────────────────────────────────────────────────
  const handleCOD = async () => {
    setPlacingOrder(true);
    setOrderError("");

    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productSlug:  i.productSlug,
            variantIndex: i.variantIndex,
            quantity:     i.quantity,
          })),
          couponCode:      coupon?.code,
          deliveryAddress: address,
          paymentMethod:   "cod",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order");

      clearCart();
      onOrderSuccess(data.orderId, "COD");
    } catch (err: any) {
      setOrderError(err.message || "Order placement failed");
      toast.error(err.message || "Failed to place order. Try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === "cashfree")   handleCashfreePayment();
    else if (paymentMethod === "phonepe_qr") handlePhonePeQR();
    else if (paymentMethod === "cod")    handleCOD();
  };

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "white", border: "1px solid rgba(200,150,12,0.15)", boxShadow: "0 2px 16px rgba(74,44,10,0.06)" }}>
      {/* Gold top ornament */}
      <div className="h-[3px]" style={{
        background: "linear-gradient(90deg, transparent, var(--color-gold) 25%, var(--color-gold-light) 50%, var(--color-gold) 75%, transparent)",
      }} />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "rgba(200,150,12,0.1)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(192,39,45,0.09)", border: "1.5px solid rgba(192,39,45,0.2)" }}>
            <Lock size={16} style={{ color: "var(--color-crimson)" }} />
          </div>
          <div>
            <h2 className="font-playfair font-bold text-lg" style={{ color: "var(--color-brown)" }}>Payment Method</h2>
            <p className="font-dm-sans text-xs mt-0.5" style={{ color: "var(--color-grey)" }}>All transactions are 256-bit SSL secured</p>
          </div>
        </div>
        <button onClick={() => setStep("address")}
          className="flex items-center gap-1 font-dm-sans text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: "var(--color-crimson)" }}>
          <ChevronLeft size={14} />Edit Address
        </button>
      </div>

      {/* Address recap */}
      <div className="mx-6 mt-4 px-4 py-3 rounded-xl flex items-start gap-3"
        style={{ background: "var(--color-cream)", border: "1px solid rgba(200,150,12,0.12)" }}>
        <span className="text-base mt-0.5">📍</span>
        <div>
          <p className="font-dm-sans font-semibold text-sm" style={{ color: "var(--color-brown)" }}>{address.full_name}</p>
          <p className="font-dm-sans text-xs mt-0.5" style={{ color: "var(--color-grey)" }}>
            {address.address_line1}{address.address_line2 && `, ${address.address_line2}`}, {address.city} — {address.pincode}, {address.state}
          </p>
          <p className="font-dm-sans text-xs mt-0.5" style={{ color: "var(--color-grey)" }}>+91 {address.mobile}</p>
        </div>
      </div>

      {/* Payment method selector */}
      <div className="px-6 py-5 flex flex-col gap-3">
        {PAYMENT_METHODS.map((method) => {
          const isSelected   = paymentMethod === method.id;
          const isPhonePe    = method.id === "phonepe_qr";
          const accentColor  = isPhonePe ? "#5F259F" : method.codCharge ? "var(--color-crimson)" : "#2D6A4F";
          return (
            <label key={method.id}
              className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200"
              style={{
                background: isSelected ? `${accentColor}0D` : "var(--color-cream)",
                border: `2px solid ${isSelected ? accentColor : "rgba(200,150,12,0.15)"}`,
                boxShadow: isSelected ? `0 0 0 3px ${accentColor}12` : "none",
              }}>
              {/* Radio */}
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ border: `2px solid ${isSelected ? accentColor : "rgba(200,150,12,0.3)"}` }}>
                {isSelected && <span className="w-2.5 h-2.5 rounded-full block" style={{ background: accentColor }} />}
              </div>
              <input type="radio" name="paymentMethod" value={method.id} checked={isSelected}
                onChange={() => setPaymentMethod(method.id)} className="sr-only" />
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: isSelected ? `${accentColor}18` : "rgba(200,150,12,0.08)", color: isSelected ? accentColor : "var(--color-gold)" }}>
                {method.icon}
              </div>
              {/* Text */}
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-dm-sans font-semibold text-sm" style={{ color: "var(--color-brown)" }}>{method.label}</span>
                  {method.tag && (
                    <span className="px-2 py-0.5 rounded-full font-dm-sans text-xs font-bold"
                      style={{ background: `${method.tagColor || accentColor}18`, color: method.tagColor || accentColor }}>
                      {method.tag}
                    </span>
                  )}
                </div>
                <p className="font-dm-sans text-xs mt-0.5" style={{ color: "var(--color-grey)" }}>{method.subtitle}</p>
              </div>
            </label>
          );
        })}
      </div>

      {/* PhonePe QR section */}
      {paymentMethod === "phonepe_qr" && (
        <div className="px-6 pb-4">
          <div className="rounded-2xl overflow-hidden" style={{ border: "2px solid #5F259F", background: "rgba(95,37,159,0.03)" }}>
            <div className="h-1" style={{ background: "linear-gradient(90deg, #5F259F, #8B2FC9, #5F259F)" }} />
            <div className="p-5">
              <p className="font-dm-sans font-bold text-sm text-center mb-4" style={{ color: "#5F259F" }}>
                Scan & Pay with Any UPI App
              </p>
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-2xl" style={{ background: "white", border: "2px solid rgba(95,37,159,0.2)", boxShadow: "0 4px 16px rgba(95,37,159,0.12)" }}>
                  <Image src="/QR_code.png" alt="PhonePe QR Code" width={200} height={200} className="rounded-lg" priority />
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl mb-4"
                style={{ background: "rgba(95,37,159,0.06)", border: "1px solid rgba(95,37,159,0.15)" }}>
                <CheckCircle2 size={18} style={{ color: "#5F259F", flexShrink: 0 }} />
                <div>
                  <p className="font-dm-sans font-bold text-sm" style={{ color: "#5F259F" }}>MANCHIKALAPATI PADMA KUMARI</p>
                  <p className="font-dm-sans text-xs" style={{ color: "var(--color-grey)" }}>Maa Flavours · UPI verified payee</p>
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3 rounded-xl mb-4"
                style={{ background: "white", border: "1px solid rgba(95,37,159,0.15)" }}>
                <span className="font-dm-sans text-sm" style={{ color: "var(--color-grey)" }}>Amount to pay</span>
                <span className="font-dm-sans font-bold text-lg" style={{ color: "#5F259F" }}>{formatPrice(cartTotal)}</span>
              </div>
              <div>
                <label htmlFor="upi-txn-id" className="font-dm-sans text-xs font-semibold block mb-1.5" style={{ color: "var(--color-brown)" }}>
                  Enter UPI Transaction ID after payment *
                </label>
                <input id="upi-txn-id" type="text" value={upiTxnId}
                  onChange={(e) => { setUpiTxnId(e.target.value); setOrderError(""); }}
                  placeholder="e.g. 407612345678"
                  className="w-full px-4 py-3 rounded-xl font-dm-sans text-sm outline-none transition-all"
                  style={{ border: "2px solid rgba(95,37,159,0.3)", background: "white", color: "var(--color-brown)" }}
                  onFocus={(e) => (e.target.style.borderColor = "#5F259F")}
                  onBlur={(e)  => (e.target.style.borderColor = "rgba(95,37,159,0.3)")} />
                <p className="font-dm-sans text-xs mt-1.5" style={{ color: "var(--color-grey)" }}>
                  Find in your UPI app → Payment History after completing payment.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COD section */}
      {paymentMethod === "cod" && (
        <div className="px-6 pb-4">
          <div className="flex items-start gap-3 p-4 rounded-xl"
            style={{ background: "rgba(200,150,12,0.06)", border: "1px solid rgba(200,150,12,0.2)" }}>
            <span className="text-lg flex-shrink-0">💡</span>
            <div>
              <p className="font-dm-sans font-semibold text-sm" style={{ color: "var(--color-brown)" }}>
                Cash on Delivery (+₹30 convenience fee)
              </p>
              <p className="font-dm-sans text-xs mt-1 leading-relaxed" style={{ color: "var(--color-grey)" }}>
                Please keep <strong style={{ color: "var(--color-brown)" }}>{formatPrice(codTotal)}</strong> ready at delivery.
              </p>
              <label className="flex items-center gap-2 mt-2.5 cursor-pointer">
                <input type="checkbox" checked={codConfirmed} onChange={(e) => setCodConfirmed(e.target.checked)}
                  className="w-4 h-4 rounded" style={{ accentColor: "var(--color-crimson)" }} />
                <span className="font-dm-sans text-xs" style={{ color: "var(--color-brown)" }}>
                  I understand the COD convenience charge
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {orderError && (
        <div className="mx-6 mb-4 px-4 py-3 rounded-xl flex items-start gap-2"
          style={{ background: "rgba(192,39,45,0.07)", border: "1px solid rgba(192,39,45,0.2)" }} role="alert">
          <span className="text-base flex-shrink-0">⚠️</span>
          <p className="font-dm-sans text-sm" style={{ color: "var(--color-crimson)" }}>{orderError}</p>
        </div>
      )}

      {/* CTA */}
      <div className="px-6 pb-6" style={{ borderTop: "1px solid rgba(200,150,12,0.1)", paddingTop: "1.25rem" }}>
        <button
          onClick={handlePlaceOrder}
          disabled={
            isPlacingOrder ||
            (paymentMethod === "cod"        && !codConfirmed) ||
            (paymentMethod === "phonepe_qr" && !upiTxnId.trim())
          }
          className="w-full py-4 text-base rounded-xl font-dm-sans font-bold flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-60"
          style={{
            background: paymentMethod === "phonepe_qr"
              ? "linear-gradient(135deg, #5F259F, #8B2FC9)"
              : paymentMethod === "cashfree"
              ? "linear-gradient(135deg, #2D6A4F, #40916C)"
              : "linear-gradient(135deg, var(--color-crimson), #9E1F24)",
            color: "white",
            boxShadow: paymentMethod === "phonepe_qr"
              ? "0 4px 16px rgba(95,37,159,0.35)"
              : paymentMethod === "cashfree"
              ? "0 4px 16px rgba(45,106,79,0.35)"
              : "0 4px 16px rgba(192,39,45,0.3)",
          }}>
          {isPlacingOrder ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {paymentMethod === "cod" ? "Placing Order…" : paymentMethod === "phonepe_qr" ? "Confirming Order…" : "Opening Payment…"}
            </>
          ) : (
            <>
              <Lock size={17} />
              {paymentMethod === "cod"
                ? `Place Order — ${formatPrice(codTotal)}`
                : paymentMethod === "phonepe_qr"
                ? `Confirm Order — ${formatPrice(cartTotal)}`
                : `Pay Securely — ${formatPrice(cartTotal)}`}
            </>
          )}
        </button>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-4 mt-4">
          {(["🔒 SSL Secured",
            paymentMethod === "phonepe_qr" ? "💜 PhonePe / UPI" : paymentMethod === "cashfree" ? "🏦 Cashfree PG" : "💵 COD",
            "🛡️ Secure Checkout"
          ]).map((badge) => (
            <span key={badge} className="font-dm-sans text-xs" style={{ color: "var(--color-grey)" }}>{badge}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

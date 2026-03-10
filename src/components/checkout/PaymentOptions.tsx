"use client";
// src/components/checkout/PaymentOptions.tsx
// Maa Flavours — Payment Method Selection
// PhonePe QR (primary) | UPI | Card | Net Banking | COD
// PhonePe QR: scan → pay → enter transaction ID → place order

import { useState } from "react";
import { Smartphone, CreditCard, Landmark, Banknote, ChevronLeft, Lock, CheckCircle2 } from "lucide-react";
import { useCheckoutStore, PaymentMethod } from "@/store/checkoutStore";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

const COD_CHARGE = 3000; // ₹30 in paise

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
    id: "phonepe_qr",
    label: "PhonePe / UPI QR Code",
    subtitle: "Scan QR → pay → enter transaction ID. Fastest & preferred.",
    icon: <span className="text-xl font-bold" style={{ color: "#5F259F" }}>₹</span>,
    tag: "Recommended",
    tagColor: "#5F259F",
  },
  {
    id: "upi",
    label: "UPI (GPay, Paytm, BHIM)",
    subtitle: "Pay via any UPI app using Razorpay gateway",
    icon: <Smartphone size={20} />,
    tag: "Instant",
  },
  {
    id: "card",
    label: "Credit / Debit Card",
    subtitle: "Visa, Mastercard, Rupay — all cards accepted",
    icon: <CreditCard size={20} />,
  },
  {
    id: "netbanking",
    label: "Net Banking",
    subtitle: "All major banks supported",
    icon: <Landmark size={20} />,
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

// ─── Razorpay loader ───────────────────────────────────────────────────────
function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface PaymentOptionsProps {
  onOrderSuccess: (orderId: string, paymentId: string) => void;
}

export default function PaymentOptions({ onOrderSuccess }: PaymentOptionsProps) {
  const {
    paymentMethod,
    setPaymentMethod,
    address,
    setStep,
    setPlacingOrder,
    isPlacingOrder,
    orderError,
    setOrderError,
    setRazorpayOrderId,
  } = useCheckoutStore();

  const { items, coupon, total, clearCart } = useCartStore();
  const [codConfirmed, setCodConfirmed] = useState(false);
  const [upiTxnId, setUpiTxnId] = useState("");

  const cartTotal = total();
  const codTotal = paymentMethod === "cod" ? cartTotal + COD_CHARGE : cartTotal;

  // ─── PhonePe QR order placement ──────────────────────────────────────
  const handlePhonePeQR = async () => {
    if (!upiTxnId.trim()) {
      setOrderError("Please enter the UPI transaction ID from your PhonePe payment.");
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
            productSlug: i.productSlug,
            variantIndex: i.variantIndex,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
          couponCode: coupon?.code,
          deliveryAddress: address,
          paymentMethod: "phonepe_qr",
          upiTransactionId: upiTxnId.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to place order. Please try again.");
      const { orderId } = await res.json();

      clearCart();
      onOrderSuccess(orderId, upiTxnId.trim());
    } catch (err: any) {
      setOrderError(err.message || "Order placement failed");
      toast.error(err.message || "Failed to place order. Try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  // ─── Create Razorpay order → open checkout modal ────────────────────
  const handleRazorpayPayment = async () => {
    setPlacingOrder(true);
    setOrderError("");

    try {
      const orderRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productSlug: i.productSlug,
            variantIndex: i.variantIndex,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
          couponCode: coupon?.code,
          deliveryAddress: address,
          paymentMethod,
        }),
      });

      if (!orderRes.ok) {
        throw new Error("Failed to create order. Please try again.");
      }

      const { razorpayOrderId, amount, currency, key } = await orderRes.json();
      setRazorpayOrderId(razorpayOrderId);

      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Could not load payment gateway. Check your connection.");

      const options = {
        key,
        amount,
        currency,
        order_id: razorpayOrderId,
        name: "Maa Flavours",
        description: `${items.length} pickle jar${items.length > 1 ? "s" : ""}`,
        image: "/maa-flavours-logo.png",
        prefill: {
          name: address.full_name,
          contact: `+91${address.mobile}`,
        },
        theme: {
          color: "#C0272D",
          hide_topbar: false,
        },
        modal: {
          ondismiss: () => {
            setPlacingOrder(false);
            toast("Payment cancelled", { icon: "✕" });
          },
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await fetch("/api/checkout/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) throw new Error("Payment verification failed");
            const verified = await verifyRes.json();

            if (verified.success) {
              clearCart();
              onOrderSuccess(response.razorpay_order_id, response.razorpay_payment_id);
            } else {
              throw new Error("Payment could not be verified. Contact support.");
            }
          } catch (verifyErr: any) {
            setOrderError(verifyErr.message || "Verification failed");
            toast.error("Payment verification failed. Contact support.");
          } finally {
            setPlacingOrder(false);
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        setOrderError(response.error?.description || "Payment failed. Please try again.");
        setPlacingOrder(false);
        toast.error("Payment failed. Please try again.");
      });
      rzp.open();
    } catch (err: any) {
      setOrderError(err.message || "Something went wrong");
      setPlacingOrder(false);
      toast.error(err.message || "Something went wrong. Please try again.");
    }
  };

  // ─── COD order placement ─────────────────────────────────────────────
  const handleCOD = async () => {
    setPlacingOrder(true);
    setOrderError("");

    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productSlug: i.productSlug,
            variantIndex: i.variantIndex,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
          couponCode: coupon?.code,
          deliveryAddress: address,
          paymentMethod: "cod",
        }),
      });

      if (!res.ok) throw new Error("Failed to place order. Please try again.");
      const { orderId } = await res.json();

      clearCart();
      onOrderSuccess(orderId, "COD");
    } catch (err: any) {
      setOrderError(err.message || "Order placement failed");
      toast.error(err.message || "Failed to place order. Try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === "phonepe_qr") {
      handlePhonePeQR();
    } else if (paymentMethod === "cod") {
      handleCOD();
    } else {
      handleRazorpayPayment();
    }
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "white",
        border: "1px solid rgba(200,150,12,0.15)",
        boxShadow: "0 2px 16px rgba(74,44,10,0.06)",
      }}
    >
      {/* Gold top ornament */}
      <div
        className="h-[3px]"
        style={{
          background: "linear-gradient(90deg, transparent, var(--color-gold) 25%, var(--color-gold-light) 50%, var(--color-gold) 75%, transparent)",
        }}
      />

      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-5 border-b"
        style={{ borderColor: "rgba(200,150,12,0.1)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(192,39,45,0.09)",
              border: "1.5px solid rgba(192,39,45,0.2)",
            }}
          >
            <Lock size={16} style={{ color: "var(--color-crimson)" }} />
          </div>
          <div>
            <h2 className="font-playfair font-bold text-lg" style={{ color: "var(--color-brown)" }}>
              Payment Method
            </h2>
            <p className="font-dm-sans text-xs mt-0.5" style={{ color: "var(--color-grey)" }}>
              All transactions are 256-bit SSL secured
            </p>
          </div>
        </div>
        <button
          onClick={() => setStep("address")}
          className="flex items-center gap-1 font-dm-sans text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: "var(--color-crimson)" }}
        >
          <ChevronLeft size={14} />
          Edit Address
        </button>
      </div>

      {/* Delivery address recap */}
      <div
        className="mx-6 mt-4 px-4 py-3 rounded-xl flex items-start gap-3"
        style={{
          background: "var(--color-cream)",
          border: "1px solid rgba(200,150,12,0.12)",
        }}
      >
        <span className="text-base mt-0.5">📍</span>
        <div>
          <p className="font-dm-sans font-semibold text-sm" style={{ color: "var(--color-brown)" }}>
            {address.full_name}
          </p>
          <p className="font-dm-sans text-xs mt-0.5" style={{ color: "var(--color-grey)" }}>
            {address.address_line1}, {address.address_line2 && `${address.address_line2}, `}
            {address.city} — {address.pincode}, {address.state}
          </p>
          <p className="font-dm-sans text-xs mt-0.5" style={{ color: "var(--color-grey)" }}>
            +91 {address.mobile}
          </p>
        </div>
      </div>

      {/* Payment method selector */}
      <div className="px-6 py-5 flex flex-col gap-3">
        {PAYMENT_METHODS.map((method) => {
          const isSelected = paymentMethod === method.id;
          return (
            <label
              key={method.id}
              className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200"
              style={{
                background: isSelected
                  ? method.id === "phonepe_qr" ? "rgba(95,37,159,0.05)" : "rgba(192,39,45,0.05)"
                  : "var(--color-cream)",
                border: `2px solid ${isSelected
                  ? method.id === "phonepe_qr" ? "#5F259F" : "var(--color-crimson)"
                  : "rgba(200,150,12,0.15)"}`,
                boxShadow: isSelected
                  ? method.id === "phonepe_qr" ? "0 0 0 3px rgba(95,37,159,0.07)" : "0 0 0 3px rgba(192,39,45,0.07)"
                  : "none",
              }}
            >
              {/* Radio */}
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  border: `2px solid ${isSelected
                    ? method.id === "phonepe_qr" ? "#5F259F" : "var(--color-crimson)"
                    : "rgba(200,150,12,0.3)"}`,
                }}
              >
                {isSelected && (
                  <span
                    className="w-2.5 h-2.5 rounded-full block"
                    style={{ background: method.id === "phonepe_qr" ? "#5F259F" : "var(--color-crimson)" }}
                  />
                )}
              </div>

              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={isSelected}
                onChange={() => setPaymentMethod(method.id)}
                className="sr-only"
              />

              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: isSelected
                    ? method.id === "phonepe_qr" ? "rgba(95,37,159,0.1)" : "rgba(192,39,45,0.1)"
                    : "rgba(200,150,12,0.08)",
                  color: isSelected
                    ? method.id === "phonepe_qr" ? "#5F259F" : "var(--color-crimson)"
                    : "var(--color-gold)",
                }}
              >
                {method.icon}
              </div>

              {/* Text */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="font-dm-sans font-semibold text-sm"
                    style={{ color: "var(--color-brown)" }}
                  >
                    {method.label}
                  </span>
                  {method.tag && (
                    <span
                      className="px-2 py-0.5 rounded-full font-dm-sans text-xs font-bold"
                      style={{
                        background: method.codCharge
                          ? "rgba(192,39,45,0.1)"
                          : method.tagColor
                          ? `${method.tagColor}18`
                          : "rgba(200,150,12,0.12)",
                        color: method.codCharge
                          ? "var(--color-crimson)"
                          : method.tagColor || "var(--color-gold)",
                      }}
                    >
                      {method.tag}
                    </span>
                  )}
                </div>
                <p
                  className="font-dm-sans text-xs mt-0.5"
                  style={{ color: "var(--color-grey)" }}
                >
                  {method.subtitle}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      {/* ── PhonePe QR section ──────────────────────────────────────────── */}
      {paymentMethod === "phonepe_qr" && (
        <div className="px-6 pb-4">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: "2px solid #5F259F",
              background: "linear-gradient(135deg, rgba(95,37,159,0.04) 0%, rgba(95,37,159,0.02) 100%)",
            }}
          >
            {/* Purple top bar */}
            <div className="h-1" style={{ background: "linear-gradient(90deg, #5F259F, #8B2FC9, #5F259F)" }} />

            <div className="p-5">
              <p
                className="font-dm-sans font-bold text-sm text-center mb-4"
                style={{ color: "#5F259F" }}
              >
                Scan & Pay with PhonePe / Any UPI App
              </p>

              {/* UPI ID / QR placeholder */}
              <div className="flex justify-center mb-4">
                <div
                  className="w-full rounded-2xl flex flex-col items-center justify-center gap-2 py-5 px-4"
                  style={{
                    background: "white",
                    border: "2px dashed rgba(95,37,159,0.3)",
                  }}
                >
                  <span className="text-3xl">📱</span>
                  <p className="font-dm-sans font-bold text-sm text-center" style={{ color: "#5F259F" }}>
                    Pay to UPI ID
                  </p>
                  <div
                    className="px-4 py-2 rounded-xl font-dm-sans font-bold text-base tracking-wide select-all"
                    style={{
                      background: "rgba(95,37,159,0.08)",
                      border: "1px solid rgba(95,37,159,0.2)",
                      color: "#5F259F",
                    }}
                  >
                    maaflavours@ybl
                  </div>
                  <p className="font-dm-sans text-xs text-center mt-1" style={{ color: "var(--color-grey)" }}>
                    Open any UPI app → Pay to above ID → enter Transaction ID below
                  </p>
                </div>
              </div>

              {/* Payee info */}
              <div
                className="flex items-center gap-3 p-3 rounded-xl mb-4"
                style={{
                  background: "rgba(95,37,159,0.06)",
                  border: "1px solid rgba(95,37,159,0.15)",
                }}
              >
                <CheckCircle2 size={18} style={{ color: "#5F259F", flexShrink: 0 }} />
                <div>
                  <p className="font-dm-sans font-bold text-sm" style={{ color: "#5F259F" }}>
                    MANCHIKALAPATI PADMA KUMARI
                  </p>
                  <p className="font-dm-sans text-xs" style={{ color: "var(--color-grey)" }}>
                    Maa Flavours · UPI verified payee
                  </p>
                </div>
              </div>

              {/* Amount to pay */}
              <div
                className="flex items-center justify-between px-4 py-3 rounded-xl mb-4"
                style={{
                  background: "white",
                  border: "1px solid rgba(95,37,159,0.15)",
                }}
              >
                <span className="font-dm-sans text-sm" style={{ color: "var(--color-grey)" }}>
                  Amount to pay
                </span>
                <span className="font-dm-sans font-bold text-lg" style={{ color: "#5F259F" }}>
                  {formatPrice(cartTotal)}
                </span>
              </div>

              {/* Transaction ID input */}
              <div>
                <label
                  htmlFor="upi-txn-id"
                  className="font-dm-sans text-xs font-semibold block mb-1.5"
                  style={{ color: "var(--color-brown)" }}
                >
                  Enter UPI Transaction ID *
                </label>
                <input
                  id="upi-txn-id"
                  type="text"
                  value={upiTxnId}
                  onChange={(e) => { setUpiTxnId(e.target.value); setOrderError(""); }}
                  placeholder="e.g. 407612345678"
                  className="w-full px-4 py-3 rounded-xl font-dm-sans text-sm outline-none transition-all"
                  style={{
                    border: "2px solid rgba(95,37,159,0.3)",
                    background: "white",
                    color: "var(--color-brown)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#5F259F")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(95,37,159,0.3)")}
                />
                <p className="font-dm-sans text-xs mt-1.5" style={{ color: "var(--color-grey)" }}>
                  Find this in your PhonePe app under Payment History after completing payment.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COD confirmation note */}
      {paymentMethod === "cod" && (
        <div className="px-6 pb-4">
          <div
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{
              background: "rgba(200,150,12,0.06)",
              border: "1px solid rgba(200,150,12,0.2)",
            }}
          >
            <span className="text-lg flex-shrink-0">💡</span>
            <div>
              <p
                className="font-dm-sans font-semibold text-sm"
                style={{ color: "var(--color-brown)" }}
              >
                Cash on Delivery (+₹30 convenience fee)
              </p>
              <p
                className="font-dm-sans text-xs mt-1 leading-relaxed"
                style={{ color: "var(--color-grey)" }}
              >
                Please keep{" "}
                <strong style={{ color: "var(--color-brown)" }}>
                  {formatPrice(codTotal)}
                </strong>{" "}
                ready at delivery. Our courier partner collects the amount.
              </p>

              <label className="flex items-center gap-2 mt-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={codConfirmed}
                  onChange={(e) => setCodConfirmed(e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: "var(--color-crimson)" }}
                />
                <span
                  className="font-dm-sans text-xs"
                  style={{ color: "var(--color-brown)" }}
                >
                  I understand the COD convenience charge
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Error display */}
      {orderError && (
        <div
          className="mx-6 mb-4 px-4 py-3 rounded-xl flex items-start gap-2"
          style={{
            background: "rgba(192,39,45,0.07)",
            border: "1px solid rgba(192,39,45,0.2)",
          }}
          role="alert"
        >
          <span className="text-base flex-shrink-0">⚠️</span>
          <p className="font-dm-sans text-sm" style={{ color: "var(--color-crimson)" }}>
            {orderError}
          </p>
        </div>
      )}

      {/* Place Order CTA */}
      <div
        className="px-6 pb-6"
        style={{ borderTop: "1px solid rgba(200,150,12,0.1)", paddingTop: "1.25rem" }}
      >
        <button
          onClick={handlePlaceOrder}
          disabled={
            isPlacingOrder ||
            (paymentMethod === "cod" && !codConfirmed) ||
            (paymentMethod === "phonepe_qr" && !upiTxnId.trim())
          }
          className="w-full py-4 text-base rounded-xl font-dm-sans font-bold flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-60"
          style={
            paymentMethod === "phonepe_qr"
              ? {
                  background: "linear-gradient(135deg, #5F259F, #8B2FC9)",
                  color: "white",
                  boxShadow: "0 4px 16px rgba(95,37,159,0.35)",
                }
              : {
                  background: "linear-gradient(135deg, var(--color-crimson), #9E1F24)",
                  color: "white",
                  boxShadow: "0 4px 16px rgba(192,39,45,0.3)",
                }
          }
        >
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
                ? `Confirm PhonePe Order — ${formatPrice(cartTotal)}`
                : `Pay Securely — ${formatPrice(cartTotal)}`}
            </>
          )}
        </button>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-4 mt-4">
          {paymentMethod === "phonepe_qr"
            ? ["🔒 SSL Secured", "💜 PhonePe", "🏦 UPI Verified"].map((badge) => (
                <span key={badge} className="font-dm-sans text-xs" style={{ color: "var(--color-grey)" }}>
                  {badge}
                </span>
              ))
            : ["🔒 SSL Secured", "🏦 Razorpay", "💳 PCI DSS"].map((badge) => (
                <span key={badge} className="font-dm-sans text-xs" style={{ color: "var(--color-grey)" }}>
                  {badge}
                </span>
              ))}
        </div>
      </div>
    </div>
  );
}

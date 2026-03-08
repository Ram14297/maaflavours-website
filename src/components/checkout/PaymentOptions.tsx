"use client";
// src/components/checkout/PaymentOptions.tsx
// Maa Flavours — Payment Method Selection
// Shows: UPI (default), Credit/Debit Card, Net Banking, Cash on Delivery
// Launches Razorpay modal for digital payments
// COD has a ₹30 convenience charge added

import { useState } from "react";
import { Smartphone, CreditCard, Landmark, Banknote, ChevronLeft, Lock } from "lucide-react";
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
  codCharge?: boolean;
}[] = [
  {
    id: "upi",
    label: "UPI",
    subtitle: "Pay via GPay, PhonePe, Paytm, BHIM UPI",
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

  const cartTotal = total();
  const codTotal = paymentMethod === "cod" ? cartTotal + COD_CHARGE : cartTotal;

  // ─── Create Razorpay order → open checkout modal ────────────────────
  const handleRazorpayPayment = async () => {
    setPlacingOrder(true);
    setOrderError("");

    try {
      // 1. Create order on backend
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

      // 2. Load Razorpay script
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Could not load payment gateway. Check your connection.");

      // 3. Open Razorpay modal
      const options = {
        key,
        amount,
        currency,
        order_id: razorpayOrderId,
        name: "Maa Flavours",
        description: `${items.length} pickle jar${items.length > 1 ? "s" : ""}`,
        // REPLACE with actual logo URL
        image: "/images/brand/logo-square.png",
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
          // 4. Verify payment on backend
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
    if (paymentMethod === "cod") {
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
                background: isSelected ? "rgba(192,39,45,0.05)" : "var(--color-cream)",
                border: `2px solid ${isSelected ? "var(--color-crimson)" : "rgba(200,150,12,0.15)"}`,
                boxShadow: isSelected ? "0 0 0 3px rgba(192,39,45,0.07)" : "none",
              }}
            >
              {/* Radio */}
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  border: `2px solid ${isSelected ? "var(--color-crimson)" : "rgba(200,150,12,0.3)"}`,
                }}
              >
                {isSelected && (
                  <span
                    className="w-2.5 h-2.5 rounded-full block"
                    style={{ background: "var(--color-crimson)" }}
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
                    ? "rgba(192,39,45,0.1)"
                    : "rgba(200,150,12,0.08)",
                  color: isSelected ? "var(--color-crimson)" : "var(--color-gold)",
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
                          : "rgba(200,150,12,0.12)",
                        color: method.codCharge
                          ? "var(--color-crimson)"
                          : "var(--color-gold)",
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
            (paymentMethod === "cod" && !codConfirmed)
          }
          className="btn-primary w-full py-4 text-base justify-center gap-3 disabled:opacity-60"
        >
          {isPlacingOrder ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {paymentMethod === "cod" ? "Placing Order…" : "Opening Payment…"}
            </>
          ) : (
            <>
              <Lock size={17} />
              {paymentMethod === "cod"
                ? `Place Order — ${formatPrice(codTotal)}`
                : `Pay Securely — ${formatPrice(cartTotal)}`}
            </>
          )}
        </button>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-4 mt-4">
          {["🔒 SSL Secured", "🏦 Razorpay", "💳 PCI DSS"].map((badge) => (
            <span
              key={badge}
              className="font-dm-sans text-xs"
              style={{ color: "var(--color-grey)" }}
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";
// src/app/order-confirmation/[orderId]/page.tsx
// Maa Flavours — Order Confirmation Page
// The complete "Thank You" experience after a successful order
// Fetches live order data from Supabase
// Sections:
//   1. Animated success header with order ID
//   2. COD vs Paid distinction
//   3. Order items summary
//   4. Price breakdown
//   5. Delivery address
//   6. Delivery timeline (live status)
//   7. Estimated delivery dates
//   8. WhatsApp share / referral card
//   9. Next steps actions
//  10. Support footer

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Package,
  MapPin,
  Phone,
  ShoppingBag,
  ArrowRight,
  Clock,
  HelpCircle,
} from "lucide-react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import NavbarWithCart from "@/components/layout/NavbarWithCart";
import Footer from "@/components/layout/Footer";
import OrderStatusBadge from "@/components/order/OrderStatusBadge";
import DeliveryTimeline from "@/components/order/DeliveryTimeline";
import OrderItemsTable from "@/components/order/OrderItemsTable";
import OrderPriceSummary from "@/components/order/OrderPriceSummary";
import ShareOrderCard from "@/components/order/ShareOrderCard";
import { formatPrice } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────
interface Order {
  id: string;
  status: string;
  payment_method: string;
  payment_status: string;
  razorpay_payment_id?: string | null;
  razorpay_order_id?: string | null;
  subtotal_paise: number;
  discount_paise: number;
  coupon_code?: string | null;
  delivery_charge_paise: number;
  cod_charge_paise: number;
  total_paise: number;
  delivery_address: {
    full_name: string;
    mobile: string;
    address_line1: string;
    address_line2?: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: Array<{
    productSlug: string;
    productName: string;
    variantLabel: string;
    variantIndex: number;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  created_at: string;
  confirmed_at?: string | null;
  packed_at?: string | null;
  shipped_at?: string | null;
  out_for_delivery_at?: string | null;
  delivered_at?: string | null;
  tracking_id?: string | null;
  tracking_url?: string | null;
  courier_name?: string | null;
}

// ─── Confetti animation ───────────────────────────────────────────────────
function ConfettiBurst() {
  return (
    <>
      <style>{`
        @keyframes confettiFall {
          0%   { opacity: 1; transform: translateY(-10px) rotate(0deg) scale(1); }
          80%  { opacity: 0.8; }
          100% { opacity: 0; transform: translateY(180px) rotate(720deg) scale(0.5); }
        }
        .confetti-piece { animation: confettiFall var(--dur) ease-in var(--delay) both; }
      `}</style>
      <div className="absolute inset-x-0 top-0 h-48 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => {
          const colors = [
            "var(--color-crimson)",
            "var(--color-gold)",
            "var(--color-gold-light)",
            "#4A2C0A",
          ];
          return (
            <div
              key={i}
              className="confetti-piece absolute"
              style={{
                left: `${5 + i * 4.5}%`,
                top: "-8px",
                width: i % 2 === 0 ? "8px" : "6px",
                height: i % 2 === 0 ? "8px" : "12px",
                borderRadius: i % 3 === 0 ? "50%" : "2px",
                background: colors[i % colors.length],
                ["--dur" as any]: `${1.2 + (i % 5) * 0.25}s`,
                ["--delay" as any]: `${i * 0.06}s`,
              }}
            />
          );
        })}
      </div>
    </>
  );
}

// ─── ETA calculator ──────────────────────────────────────────────────────
function getEstimatedDelivery(createdAt: string): string {
  const date = new Date(createdAt);
  const min = new Date(date);
  const max = new Date(date);
  min.setDate(min.getDate() + 5);
  max.setDate(max.getDate() + 7);

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  return `${fmt(min)} – ${fmt(max)}`;
}

// ─── Order fetcher using params orderId ──────────────────────────────────
function useOrder(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!orderId || orderId === "undefined") {
      setLoading(false);
      return;
    }

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("Order not found");
          throw new Error("Failed to load order");
        }
        const { order: data } = await res.json();
        setOrder(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  return { order, loading, error };
}

// ─── Section Card wrapper ─────────────────────────────────────────────────
function SectionCard({
  title,
  icon,
  children,
  goldTop = true,
}: {
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  goldTop?: boolean;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "white",
        border: "1px solid rgba(200,150,12,0.15)",
        boxShadow: "0 2px 12px rgba(74,44,10,0.06)",
      }}
    >
      {goldTop && (
        <div
          className="h-[3px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--color-gold) 25%, var(--color-gold-light) 50%, var(--color-gold) 75%, transparent)",
          }}
        />
      )}
      {title && (
        <div
          className="flex items-center gap-2.5 px-5 py-4 border-b"
          style={{ borderColor: "rgba(200,150,12,0.1)" }}
        >
          {icon && (
            <span style={{ color: "var(--color-gold)" }}>{icon}</span>
          )}
          <h3
            className="font-playfair font-bold text-base"
            style={{ color: "var(--color-brown)" }}
          >
            {title}
          </h3>
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Skeleton loaders ─────────────────────────────────────────────────────
function ConfirmationSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 flex flex-col gap-5">
      {[200, 300, 200, 150].map((h, i) => (
        <div
          key={i}
          className="rounded-2xl animate-pulse"
          style={{
            height: `${h}px`,
            background: "rgba(200,150,12,0.07)",
            border: "1px solid rgba(200,150,12,0.1)",
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Page Content ────────────────────────────────────────────────────
function ConfirmationPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = (params.orderId as string) || "";

  // Get payment ID from URL (passed from Razorpay callback in checkout)
  const paymentIdFromUrl = searchParams.get("paymentId") || "";
  const methodFromUrl = searchParams.get("method") || "";

  const { order, loading, error } = useOrder(orderId);

  // ─── Display order ID — formatted ──────────────────────────────────────
  const displayId = orderId.length > 12
    ? `MF-${orderId.slice(-8).toUpperCase()}`
    : orderId.toUpperCase() || "MF-XXXXXXXX";

  // ─── Loading ──────────────────────────────────────────────────────────
  if (loading) return <ConfirmationSkeleton />;

  // ─── Error / not found ────────────────────────────────────────────────
  if (error && !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center flex flex-col items-center gap-5">
        <div className="text-5xl">😕</div>
        <h2
          className="font-playfair font-bold text-2xl"
          style={{ color: "var(--color-brown)" }}
        >
          Order Details Unavailable
        </h2>
        <p className="font-dm-sans text-base" style={{ color: "var(--color-grey)" }}>
          We couldn't load your order details. Your order was still placed — check your SMS for confirmation.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link href="/account/orders" className="btn-primary py-3 px-6">
            View My Orders
          </Link>
          <Link href="/contact" className="btn-ghost py-3 px-6">
            Contact Support
          </Link>
        </div>
      </div>
    );
  }

  // ─── Determine order data (real or URL fallback) ───────────────────────
  const isCOD =
    (order?.payment_method || methodFromUrl) === "cod";

  const status = order?.status || "confirmed";
  const customerName = order?.delivery_address?.full_name || "";
  const estimatedDelivery = getEstimatedDelivery(
    order?.created_at || new Date().toISOString()
  );

  const timestamps: Record<string, string | null> = {
    confirmed: order?.confirmed_at || order?.created_at || null,
    processing: order?.confirmed_at || null,
    packed: order?.packed_at || null,
    shipped: order?.shipped_at || null,
    out_for_delivery: order?.out_for_delivery_at || null,
    delivered: order?.delivered_at || null,
  };

  return (
    <div className="section-container py-8 lg:py-12">
      <div className="max-w-3xl mx-auto">

        {/* ─── 1. Hero Success Header ──────────────────────────────── */}
        <div
          className="relative rounded-3xl overflow-hidden px-6 py-10 text-center mb-6"
          style={{
            background: "white",
            border: "1px solid rgba(200,150,12,0.18)",
            boxShadow: "0 8px 48px rgba(74,44,10,0.1)",
          }}
        >
          {/* Confetti burst */}
          <ConfettiBurst />

          {/* Gold ornament top */}
          <div
            className="absolute top-0 left-0 right-0 h-1 z-10"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--color-gold) 20%, var(--color-gold-light) 50%, var(--color-gold) 80%, transparent)",
            }}
          />

          {/* Success icon */}
          <div
            className="relative w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 z-10"
            style={{
              background: "rgba(46,125,50,0.1)",
              border: "3px solid rgba(46,125,50,0.25)",
            }}
          >
            <CheckCircle2 size={38} strokeWidth={1.75} style={{ color: "#2E7D32" }} />
            {/* Pulse ring */}
            <div
              className="absolute inset-0 rounded-full animate-ping"
              style={{
                background: "rgba(46,125,50,0.08)",
                animationDuration: "2s",
              }}
            />
          </div>

          {/* Status badge */}
          <div className="flex justify-center mb-4 relative z-10">
            <OrderStatusBadge status={status} size="md" />
          </div>

          {/* Thank you heading */}
          <h1
            className="font-playfair font-bold leading-tight mb-2 relative z-10"
            style={{
              color: "var(--color-brown)",
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            }}
          >
            {customerName
              ? `${customerName.split(" ")[0]}, your order is confirmed!`
              : "Your order is confirmed! 🎉"}
          </h1>

          <p
            className="font-cormorant italic text-xl mb-5 relative z-10"
            style={{ color: "var(--color-grey)" }}
          >
            {isCOD
              ? "Your pickles will be on their way soon."
              : "Payment received. Authentic Andhra flavours are on the way!"}
          </p>

          <div className="ornament-line w-24 mx-auto mb-5 relative z-10" />

          {/* Order meta chips */}
          <div className="flex flex-wrap justify-center gap-3 relative z-10">
            {/* Order ID */}
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
              style={{
                background: "var(--color-cream)",
                border: "1px solid rgba(200,150,12,0.2)",
              }}
            >
              <Package size={15} style={{ color: "var(--color-gold)" }} />
              <div className="text-left">
                <p
                  className="font-dm-sans text-xs"
                  style={{ color: "var(--color-grey)" }}
                >
                  Order ID
                </p>
                <p
                  className="font-dm-sans font-bold text-sm"
                  style={{ color: "var(--color-brown)" }}
                >
                  {displayId}
                </p>
              </div>
            </div>

            {/* Payment status */}
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
              style={{
                background: isCOD
                  ? "rgba(200,150,12,0.06)"
                  : "rgba(46,125,50,0.08)",
                border: `1px solid ${isCOD ? "rgba(200,150,12,0.2)" : "rgba(46,125,50,0.2)"}`,
              }}
            >
              <span className="text-base">{isCOD ? "💵" : "✅"}</span>
              <div className="text-left">
                <p
                  className="font-dm-sans text-xs"
                  style={{ color: "var(--color-grey)" }}
                >
                  Payment
                </p>
                <p
                  className="font-dm-sans font-bold text-sm"
                  style={{
                    color: isCOD ? "var(--color-gold)" : "#2E7D32",
                  }}
                >
                  {isCOD ? "Cash on Delivery" : "Paid ✓"}
                </p>
              </div>
            </div>

            {/* Delivery ETA */}
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
              style={{
                background: "var(--color-cream)",
                border: "1px solid rgba(200,150,12,0.2)",
              }}
            >
              <Clock size={15} style={{ color: "var(--color-gold)" }} />
              <div className="text-left">
                <p
                  className="font-dm-sans text-xs"
                  style={{ color: "var(--color-grey)" }}
                >
                  Estimated Delivery
                </p>
                <p
                  className="font-dm-sans font-bold text-sm"
                  style={{ color: "var(--color-brown)" }}
                >
                  {estimatedDelivery}
                </p>
              </div>
            </div>
          </div>

          {/* COD reminder */}
          {isCOD && order && (
            <div
              className="mt-5 mx-auto max-w-sm px-4 py-3 rounded-xl relative z-10"
              style={{
                background: "rgba(200,150,12,0.06)",
                border: "1px solid rgba(200,150,12,0.2)",
              }}
            >
              <p
                className="font-dm-sans text-sm font-medium"
                style={{ color: "var(--color-brown)" }}
              >
                💡 Keep{" "}
                <strong>
                  {formatPrice(order.total_paise)}
                </strong>{" "}
                ready at delivery
              </p>
            </div>
          )}

          {/* Tracking (if shipped) */}
          {order?.tracking_id && (
            <div
              className="mt-5 mx-auto max-w-sm px-4 py-3 rounded-xl relative z-10"
              style={{
                background: "rgba(46,125,50,0.07)",
                border: "1px solid rgba(46,125,50,0.2)",
              }}
            >
              <p
                className="font-dm-sans text-xs font-semibold mb-1"
                style={{ color: "#2E7D32" }}
              >
                🚚 {order.courier_name || "Courier"} · Tracking ID
              </p>
              {order.tracking_url ? (
                <a
                  href={order.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-dm-sans font-bold text-base hover:underline"
                  style={{ color: "var(--color-crimson)" }}
                >
                  {order.tracking_id}
                </a>
              ) : (
                <p
                  className="font-dm-sans font-bold text-base"
                  style={{ color: "var(--color-brown)" }}
                >
                  {order.tracking_id}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ─── Two-column layout (desktop) ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">

          {/* ─── LEFT COLUMN ──────────────────────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* 2. Order Items */}
            <SectionCard
              title="Your Pickle Order"
              icon={<Package size={18} />}
            >
              <div className="px-5">
                {order?.items?.length ? (
                  <OrderItemsTable items={order.items} showLinks />
                ) : (
                  /* Fallback if order not loaded yet — show generic message */
                  <div className="py-6 text-center">
                    <span className="text-3xl block mb-2">🫙</span>
                    <p
                      className="font-dm-sans text-sm"
                      style={{ color: "var(--color-grey)" }}
                    >
                      Your authentic Andhra pickles are being prepared.
                    </p>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* 3. Price Summary */}
            {order && (
              <SectionCard title="Price Breakdown" icon={<span>💰</span>}>
                <div className="px-5 py-4">
                  <OrderPriceSummary
                    data={{
                      subtotalPaise: order.subtotal_paise,
                      discountPaise: order.discount_paise,
                      deliveryChargePaise: order.delivery_charge_paise,
                      codChargePaise: order.cod_charge_paise,
                      totalPaise: order.total_paise,
                      couponCode: order.coupon_code,
                      paymentMethod: order.payment_method,
                      paymentStatus: order.payment_status,
                      razorpayPaymentId: order.razorpay_payment_id || paymentIdFromUrl,
                    }}
                  />
                </div>
              </SectionCard>
            )}

            {/* 4. Delivery Address */}
            {order?.delivery_address && (
              <SectionCard
                title="Delivering To"
                icon={<MapPin size={18} />}
              >
                <div className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "rgba(200,150,12,0.1)",
                        border: "1.5px solid rgba(200,150,12,0.2)",
                      }}
                    >
                      <MapPin size={16} style={{ color: "var(--color-gold)" }} />
                    </div>
                    <div>
                      <p
                        className="font-dm-sans font-bold text-base"
                        style={{ color: "var(--color-brown)" }}
                      >
                        {order.delivery_address.full_name}
                      </p>
                      <p
                        className="font-dm-sans text-sm mt-1 leading-relaxed"
                        style={{ color: "var(--color-grey)" }}
                      >
                        {order.delivery_address.address_line1}
                        {order.delivery_address.address_line2 &&
                          `, ${order.delivery_address.address_line2}`}
                        {order.delivery_address.landmark &&
                          ` (Near ${order.delivery_address.landmark})`}
                      </p>
                      <p
                        className="font-dm-sans text-sm"
                        style={{ color: "var(--color-grey)" }}
                      >
                        {order.delivery_address.city},{" "}
                        {order.delivery_address.state} —{" "}
                        {order.delivery_address.pincode}
                      </p>
                      <p
                        className="font-dm-sans text-sm mt-1.5 flex items-center gap-1.5"
                        style={{ color: "var(--color-brown)" }}
                      >
                        <Phone size={13} />
                        +91 {order.delivery_address.mobile}
                      </p>
                    </div>
                  </div>
                </div>
              </SectionCard>
            )}
          </div>

          {/* ─── RIGHT COLUMN ─────────────────────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* 5. Delivery Timeline */}
            <SectionCard title="Order Journey" icon={<span>🗺️</span>}>
              <div className="px-5 py-5">
                <DeliveryTimeline
                  currentStatus={status}
                  timestamps={timestamps}
                />
              </div>
            </SectionCard>

            {/* 6. What happens next */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: "var(--color-cream)",
                border: "1px solid rgba(200,150,12,0.15)",
              }}
            >
              <h4
                className="font-playfair font-bold text-base mb-3"
                style={{ color: "var(--color-brown)" }}
              >
                📋 What Happens Next
              </h4>
              <div className="flex flex-col gap-2.5">
                {[
                  {
                    icon: "📱",
                    text: "SMS confirmation sent to your registered mobile",
                  },
                  {
                    icon: "🏺",
                    text: "Handpacked fresh in our Ongole kitchen within 24h",
                  },
                  {
                    icon: "📦",
                    text: "Bubble-wrapped and shipped in 1–2 working days",
                  },
                  {
                    icon: "🔔",
                    text: "Tracking SMS sent once dispatched",
                  },
                  {
                    icon: "🚚",
                    text: `Estimated delivery: ${estimatedDelivery}`,
                  },
                ].map((step) => (
                  <div key={step.text} className="flex items-start gap-2.5">
                    <span className="text-base flex-shrink-0">{step.icon}</span>
                    <p
                      className="font-dm-sans text-xs leading-relaxed"
                      style={{ color: "var(--color-brown)" }}
                    >
                      {step.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 7. Share Card */}
            <ShareOrderCard
              orderId={orderId}
              customerName={customerName}
            />
          </div>
        </div>

        {/* ─── Bottom CTAs ──────────────────────────────────────────── */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href="/account/orders"
            className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-dm-sans font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
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
            className="btn-primary flex-1 py-3.5 justify-center gap-2.5"
          >
            <ShoppingBag size={17} />
            Continue Shopping
            <ArrowRight size={17} />
          </Link>
        </div>

        {/* ─── Support Footer ───────────────────────────────────────── */}
        <div
          className="mt-8 p-5 rounded-2xl text-center flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8"
          style={{
            background: "var(--color-cream)",
            border: "1px solid rgba(200,150,12,0.12)",
          }}
        >
          <div className="flex items-center gap-2">
            <HelpCircle size={16} style={{ color: "var(--color-gold)" }} />
            <span
              className="font-dm-sans text-sm font-semibold"
              style={{ color: "var(--color-brown)" }}
            >
              Need help with your order?
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-dm-sans text-sm font-semibold transition-opacity hover:opacity-75"
              style={{ color: "#25D366" }}
            >
              <span>💬</span>
              WhatsApp Us
            </a>
            <span style={{ color: "rgba(200,150,12,0.3)" }}>·</span>
            <a
              href="mailto:support@maaflavours.com"
              className="font-dm-sans text-sm font-semibold transition-opacity hover:opacity-75"
              style={{ color: "var(--color-crimson)" }}
            >
              support@maaflavours.com
            </a>
            <span style={{ color: "rgba(200,150,12,0.3)" }}>·</span>
            <Link
              href="/faq"
              className="font-dm-sans text-sm font-medium transition-opacity hover:opacity-75"
              style={{ color: "var(--color-grey)" }}
            >
              FAQ
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Page export ─────────────────────────────────────────────────────────
export default function OrderConfirmationPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--color-warm-white)" }}
    >
      <AnnouncementBar />
      <NavbarWithCart />

      <main className="flex-1">
        <Suspense fallback={<ConfirmationSkeleton />}>
          <ConfirmationPageContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}


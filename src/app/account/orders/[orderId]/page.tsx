"use client";
// src/app/account/orders/[orderId]/page.tsx
// Maa Flavours — Order Detail & Tracking Page
// Full order breakdown: status timeline, items table, price summary,
// delivery address, tracking info, support section

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Package, MapPin, Phone,
  MessageCircle, Copy, Check, ExternalLink, RefreshCw, XCircle,
} from "lucide-react";
import OrderStatusBadge from "@/components/order/OrderStatusBadge";
import DeliveryTimeline from "@/components/order/DeliveryTimeline";
import OrderItemsTable from "@/components/order/OrderItemsTable";
import OrderPriceSummary from "@/components/order/OrderPriceSummary";
import { formatDate, formatPrice } from "@/lib/utils";

// ─── Full order type ─────────────────────────────────────────────────────
interface OrderDetail {
  id: string;
  order_number?: string | null;
  status: string;
  payment_method: string;
  payment_status: string;
  cashfree_payment_id?: string | null;
  razorpay_payment_id?: string | null;  // legacy — kept for old orders
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


function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "white", border: "1px solid rgba(200,150,12,0.12)", boxShadow: "0 2px 8px rgba(74,44,10,0.05)" }}>
      <div className="h-[2px]" style={{
        background: "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)",
      }} />
      <div className="flex items-center gap-2.5 px-5 py-4 border-b" style={{ borderColor: "rgba(200,150,12,0.08)" }}>
        <span style={{ color: "var(--color-gold)" }}>{icon}</span>
        <h3 className="font-playfair font-bold text-base" style={{ color: "var(--color-brown)" }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [trackingCopied, setTrackingCopied] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelDone, setCancelDone] = useState<{ refundNote: string | null } | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setOrder(data.order || null);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    }
    if (orderId) fetchOrder();
  }, [orderId]);

  // ── Cancel helpers ────────────────────────────────────────────────────
  const canCancel = order &&
    ["pending", "confirmed"].includes(order.status);

  async function handleCancel() {
    if (!order) return;
    setCancelling(true);
    setCancelError(null);
    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setCancelError(data.error || "Something went wrong. Please try again.");
      } else {
        setCancelDone({ refundNote: data.refundNote });
        setOrder(prev => prev ? { ...prev, status: "cancelled" } : prev);
        setShowCancelModal(false);
      }
    } catch {
      setCancelError("Network error. Please try again.");
    }
    setCancelling(false);
  }

  const copyTracking = async () => {
    if (order?.tracking_id) {
      await navigator.clipboard.writeText(order.tracking_id);
      setTrackingCopied(true);
      setTimeout(() => setTrackingCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <div className="h-7 w-40 rounded-lg animate-pulse" style={{ background: "rgba(200,150,12,0.1)" }} />
        {[200, 300, 180, 160].map((h, i) => (
          <div key={i} className="rounded-2xl animate-pulse"
            style={{ height: h, background: "rgba(200,150,12,0.07)", border: "1px solid rgba(200,150,12,0.1)" }} />
        ))}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16 flex flex-col items-center gap-4">
        <span className="text-4xl">😕</span>
        <h3 className="font-playfair font-bold text-xl" style={{ color: "var(--color-brown)" }}>
          Order not found
        </h3>
        <Link href="/account/orders" className="btn-ghost py-2.5 px-6 gap-2">
          <ArrowLeft size={16} />Back to Orders
        </Link>
      </div>
    );
  }

  const displayId = order.order_number || `MF-${order.id.slice(-8).toUpperCase()}`;

  const timestamps: Record<string, string | null> = {
    confirmed: order.confirmed_at || order.created_at,
    processing: order.confirmed_at || null,
    packed: order.packed_at || null,
    shipped: order.shipped_at || null,
    out_for_delivery: order.out_for_delivery_at || null,
    delivered: order.delivered_at || null,
  };

  const eta = (() => {
    const d = new Date(order.created_at);
    const min = new Date(d); min.setDate(min.getDate() + 5);
    const max = new Date(d); max.setDate(max.getDate() + 7);
    const fmt = (dt: Date) => dt.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    return `${fmt(min)} – ${fmt(max)}`;
  })();

  return (
    <div className="flex flex-col gap-5">

      {/* ─── Back + header ──────────────────────────────────────────── */}
      <div>
        <Link href="/account/orders"
          className="inline-flex items-center gap-1.5 font-dm-sans text-sm mb-3 transition-opacity hover:opacity-70"
          style={{ color: "var(--color-grey)" }}>
          <ArrowLeft size={14} />Back to Orders
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-playfair font-bold text-2xl" style={{ color: "var(--color-brown)" }}>
              {displayId}
            </h2>
            <p className="font-dm-sans text-sm mt-0.5" style={{ color: "var(--color-grey)" }}>
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
          <OrderStatusBadge status={order.status} size="md" />
        </div>
      </div>

      {/* ─── Cancel success banner ─────────────────────────────────── */}
      {cancelDone && (
        <div className="rounded-2xl px-5 py-4"
          style={{ background: "rgba(192,39,45,0.05)", border: "1.5px solid rgba(192,39,45,0.2)" }}>
          <p className="font-dm-sans font-bold text-sm" style={{ color: "#C0272D" }}>
            ✅ Order cancelled successfully
          </p>
          {cancelDone.refundNote && (
            <p className="font-dm-sans text-xs mt-1" style={{ color: "var(--color-grey)" }}>
              {cancelDone.refundNote}
            </p>
          )}
          {!cancelDone.refundNote && (
            <p className="font-dm-sans text-xs mt-1" style={{ color: "var(--color-grey)" }}>
              Your COD order has been cancelled. No payment was charged.
            </p>
          )}
        </div>
      )}

      {/* ─── Cancel button ──────────────────────────────────────────── */}
      {canCancel && !cancelDone && (
        <div className="rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          style={{ background: "rgba(192,39,45,0.04)", border: "1px solid rgba(192,39,45,0.15)" }}>
          <div>
            <p className="font-dm-sans text-sm font-semibold" style={{ color: "var(--color-brown)" }}>
              Want to cancel this order?
            </p>
            <p className="font-dm-sans text-xs mt-0.5" style={{ color: "var(--color-grey)" }}>
              You can cancel anytime before your order is shipped.
            </p>
          </div>
          <button
            onClick={() => { setCancelError(null); setShowCancelModal(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-dm-sans text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ background: "rgba(192,39,45,0.1)", color: "#C0272D", border: "1.5px solid rgba(192,39,45,0.3)" }}>
            <XCircle size={15} />Cancel Order
          </button>
        </div>
      )}

      {/* ─── Tracking banner (if tracking exists) ──────────────────── */}
      {order.tracking_id && (
        <div className="rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          style={{ background: "rgba(46,125,50,0.06)", border: "1.5px solid rgba(46,125,50,0.2)" }}>
          <div>
            <p className="font-dm-sans font-bold text-sm" style={{ color: "#2E7D32" }}>
              🚚 {order.courier_name ? `${order.courier_name} · ` : ""}Shipment Tracking
            </p>
            <p className="font-dm-sans text-xs mt-0.5" style={{ color: "var(--color-grey)" }}>
              Your pickles are on the way!
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-dm-sans font-bold text-sm px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(46,125,50,0.1)", color: "#2E7D32", letterSpacing: "0.04em" }}>
              {order.tracking_id}
            </span>
            <button onClick={copyTracking}
              className="p-1.5 rounded-lg transition-all hover:scale-105"
              style={{ background: "rgba(46,125,50,0.1)", color: "#2E7D32" }}>
              {trackingCopied ? <Check size={14} /> : <Copy size={14} />}
            </button>
            {order.tracking_url && (
              <a href={order.tracking_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-dm-sans text-xs font-semibold transition-opacity hover:opacity-80"
                style={{ background: "#2E7D32", color: "white" }}>
                Track Live <ExternalLink size={11} />
              </a>
            )}
          </div>
        </div>
      )}

      {/* ─── Two-column layout (desktop) ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">

        {/* ── LEFT ── */}
        <div className="flex flex-col gap-5">

          {/* Items */}
          <SectionCard title="Ordered Items" icon={<Package size={18} />}>
            <div className="px-5">
              <OrderItemsTable items={order.items} showLinks />
            </div>
          </SectionCard>

          {/* Price breakdown */}
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
                  paymentId: order.cashfree_payment_id || order.razorpay_payment_id,
                }}
              />
            </div>
          </SectionCard>

          {/* Delivery address */}
          <SectionCard title="Delivering To" icon={<MapPin size={18} />}>
            <div className="px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(200,150,12,0.1)", border: "1.5px solid rgba(200,150,12,0.2)" }}>
                  <MapPin size={16} style={{ color: "var(--color-gold)" }} />
                </div>
                <div>
                  <p className="font-dm-sans font-bold text-sm" style={{ color: "var(--color-brown)" }}>
                    {order.delivery_address.full_name}
                  </p>
                  <p className="font-dm-sans text-sm mt-0.5 leading-relaxed" style={{ color: "var(--color-grey)" }}>
                    {order.delivery_address.address_line1}
                    {order.delivery_address.address_line2 && `, ${order.delivery_address.address_line2}`}
                    {order.delivery_address.landmark && ` (Near ${order.delivery_address.landmark})`}
                  </p>
                  <p className="font-dm-sans text-sm" style={{ color: "var(--color-grey)" }}>
                    {order.delivery_address.city}, {order.delivery_address.state} — {order.delivery_address.pincode}
                  </p>
                  <p className="font-dm-sans text-sm mt-1 flex items-center gap-1.5" style={{ color: "var(--color-brown)" }}>
                    <Phone size={12} />+91 {order.delivery_address.mobile}
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ── RIGHT ── */}
        <div className="flex flex-col gap-5">

          {/* Order timeline */}
          <SectionCard title="Order Journey" icon={<span>🗺️</span>}>
            <div className="px-5 py-5">
              <DeliveryTimeline currentStatus={order.status} timestamps={timestamps} />
            </div>
          </SectionCard>

          {/* ETA card */}
          <div className="rounded-2xl p-5"
            style={{ background: "var(--color-cream)", border: "1px solid rgba(200,150,12,0.15)" }}>
            <p className="font-dm-sans font-bold text-sm mb-2" style={{ color: "var(--color-brown)" }}>
              📅 Estimated Delivery
            </p>
            <p className="font-playfair font-bold text-xl" style={{ color: "var(--color-crimson)" }}>
              {eta}
            </p>
            <p className="font-dm-sans text-xs mt-1" style={{ color: "var(--color-grey)" }}>
              5–7 working days · Pan-India delivery
            </p>

            {order.status === "delivered" && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ background: "rgba(46,125,50,0.1)", border: "1px solid rgba(46,125,50,0.2)" }}>
                <span>🎉</span>
                <p className="font-dm-sans text-sm font-semibold" style={{ color: "#2E7D32" }}>
                  Delivered successfully!
                </p>
              </div>
            )}
          </div>

          {/* WhatsApp share */}
          <div className="rounded-2xl p-5 text-center"
            style={{ background: "white", border: "1px solid rgba(200,150,12,0.12)" }}>
            <p className="font-dancing text-xl mb-1" style={{ color: "var(--color-crimson)" }}>
              Love your pickles?
            </p>
            <p className="font-dm-sans text-xs mb-3" style={{ color: "var(--color-grey)" }}>
              Share Maa Flavours with your family!
            </p>
            <a
              href={`https://wa.me/?text=${encodeURIComponent("I just ordered authentic Andhra homemade pickles from Maa Flavours! Try them at https://maaflavours.com — use WELCOME50 for ₹50 off!")}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-dm-sans font-semibold text-sm text-white transition-opacity hover:opacity-90"
              style={{ background: "#25D366" }}>
              <MessageCircle size={16} />Share on WhatsApp
            </a>
          </div>

          {/* Reorder */}
          <Link href="/products"
            className="flex items-center justify-center gap-2 py-3 rounded-xl font-dm-sans font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{ border: "2px solid var(--color-brown)", color: "var(--color-brown)" }}>
            <RefreshCw size={15} />Order Again
          </Link>
        </div>
      </div>

      {/* ─── Support ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ background: "var(--color-cream)", border: "1px solid rgba(200,150,12,0.12)" }}>
        <div>
          <p className="font-dm-sans font-semibold text-sm" style={{ color: "var(--color-brown)" }}>
            ❓ Need help with this order?
          </p>
          <p className="font-dm-sans text-xs mt-0.5" style={{ color: "var(--color-grey)" }}>
            Our team responds within 2 hours during business hours
          </p>
        </div>
        <div className="flex gap-3 flex-wrap justify-center sm:justify-end">
          <a href="https://wa.me/919701452929"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-dm-sans text-sm font-semibold text-white transition-opacity hover:opacity-80"
            style={{ background: "#25D366" }}>
            <MessageCircle size={14} />WhatsApp
          </a>
          <a href="mailto:maaflavours74@gmail.com"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-dm-sans text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ border: "1.5px solid var(--color-brown)", color: "var(--color-brown)" }}>
            Email Us
          </a>
        </div>
      </div>

      {/* ─── Cancel confirmation modal ──────────────────────────────── */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => !cancelling && setShowCancelModal(false)}>
          <div className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{ background: "white", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}
            onClick={e => e.stopPropagation()}>
            <div className="h-[3px]" style={{
              background: "linear-gradient(90deg,transparent,#C0272D 20%,#C0272D 80%,transparent)"
            }} />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(192,39,45,0.1)" }}>
                  <XCircle size={22} style={{ color: "#C0272D" }} />
                </div>
                <div>
                  <h3 className="font-playfair font-bold text-lg" style={{ color: "var(--color-brown)" }}>
                    Cancel Order?
                  </h3>
                  <p className="font-dm-sans text-xs" style={{ color: "var(--color-grey)" }}>{displayId}</p>
                </div>
              </div>

              {order?.payment_method !== "cod" ? (
                <div className="rounded-xl px-4 py-3 mb-4"
                  style={{ background: "rgba(46,125,50,0.06)", border: "1px solid rgba(46,125,50,0.2)" }}>
                  <p className="font-dm-sans text-sm font-semibold" style={{ color: "#2E7D32" }}>
                    💳 Prepaid order — refund included
                  </p>
                  <p className="font-dm-sans text-xs mt-1" style={{ color: "var(--color-grey)" }}>
                    Your full payment will be refunded within 2–3 working days to your original payment method.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl px-4 py-3 mb-4"
                  style={{ background: "rgba(200,150,12,0.06)", border: "1px solid rgba(200,150,12,0.2)" }}>
                  <p className="font-dm-sans text-sm font-semibold" style={{ color: "var(--color-brown)" }}>
                    🤝 COD order — no payment was made
                  </p>
                  <p className="font-dm-sans text-xs mt-1" style={{ color: "var(--color-grey)" }}>
                    Since this was a cash on delivery order, no refund is needed.
                  </p>
                </div>
              )}

              {cancelError && (
                <div className="rounded-xl px-4 py-3 mb-4"
                  style={{ background: "rgba(192,39,45,0.06)", border: "1px solid rgba(192,39,45,0.2)" }}>
                  <p className="font-dm-sans text-sm" style={{ color: "#C0272D" }}>{cancelError}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setShowCancelModal(false)} disabled={cancelling}
                  className="flex-1 py-2.5 rounded-xl font-dm-sans text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ border: "1.5px solid rgba(200,150,12,0.25)", color: "var(--color-brown)" }}>
                  Keep Order
                </button>
                <button onClick={handleCancel} disabled={cancelling}
                  className="flex-1 py-2.5 rounded-xl font-dm-sans text-sm font-semibold text-white transition-opacity hover:opacity-80"
                  style={{ background: cancelling ? "#aaa" : "#C0272D" }}>
                  {cancelling ? "Cancelling…" : "Yes, Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

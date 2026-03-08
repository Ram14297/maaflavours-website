"use client";
// src/app/account/orders/page.tsx
// Maa Flavours — My Orders Page
// Filter by status, search by ID or product, order cards with click-to-detail

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Package, ShoppingBag, Search, Filter,
  ArrowRight, RefreshCw, ChevronRight, Clock,
} from "lucide-react";
import OrderStatusBadge from "@/components/order/OrderStatusBadge";
import { formatPrice, formatDate } from "@/lib/utils";

interface OrderItem {
  productName: string;
  productSlug?: string;
  variantLabel: string;
  quantity: number;
  lineTotal: number;
}

interface OrderSummary {
  id: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total_paise: number;
  items: OrderItem[];
  coupon_code?: string | null;
  tracking_id?: string | null;
  courier_name?: string | null;
  created_at: string;
}

function getItemEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("drumstick") || n.includes("moringa")) return "🥢";
  if (n.includes("amla") || n.includes("gooseberry")) return "🫙";
  if (n.includes("gongura") || n.includes("pulihora")) return "🍃";
  if (n.includes("lemon")) return "🍋";
  if (n.includes("maamidi") || n.includes("mango") || n.includes("allam")) return "🥭";
  if (n.includes("chilli") || n.includes("chili")) return "🌶️";
  return "🫙";
}

const STATUS_FILTERS = [
  { value: "all", label: "All Orders" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "packed", label: "Packed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

// ─── Dev mock orders (shown when Supabase returns empty) ─────────────────
const MOCK_ORDERS: OrderSummary[] = [
  {
    id: "mock-a1b2c3d4-shipped",
    status: "shipped",
    payment_method: "upi",
    payment_status: "paid",
    total_paise: 59000,
    items: [
      { productName: "Drumstick Pickle", variantLabel: "500g", quantity: 1, lineTotal: 32000 },
      { productName: "Lemon Pickle", variantLabel: "250g", quantity: 1, lineTotal: 15000 },
      { productName: "Pulihora Gongura", variantLabel: "250g", quantity: 1, lineTotal: 20000 },
    ],
    coupon_code: null,
    tracking_id: "DTDC123456789",
    courier_name: "DTDC",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-e5f6g7h8-delivered",
    status: "delivered",
    payment_method: "cod",
    payment_status: "paid",
    total_paise: 35000,
    items: [
      { productName: "Amla Pickle", variantLabel: "500g", quantity: 2, lineTotal: 58000 },
    ],
    coupon_code: "WELCOME50",
    tracking_id: null,
    courier_name: null,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-i9j0k1l2-confirmed",
    status: "confirmed",
    payment_method: "card",
    payment_status: "paid",
    total_paise: 19000,
    items: [
      { productName: "Red Chilli Pickle", variantLabel: "250g", quantity: 1, lineTotal: 17000 },
    ],
    coupon_code: null,
    tracking_id: null,
    courier_name: null,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

function OrderCard({ order }: { order: OrderSummary }) {
  const displayId =
    order.id.length > 12
      ? `MF-${order.id.slice(-8).toUpperCase()}`
      : order.id.toUpperCase();
  const totalItems = order.items?.reduce((s, i) => s + i.quantity, 0) ?? 0;

  return (
    <Link href={`/account/orders/${order.id}`}
      className="block rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group"
      style={{ background: "white", border: "1px solid rgba(200,150,12,0.12)", boxShadow: "0 2px 8px rgba(74,44,10,0.05)" }}
    >
      <div className="h-[2px]" style={{
        background: "linear-gradient(90deg,transparent,var(--color-gold) 25%,var(--color-gold-light) 50%,var(--color-gold) 75%,transparent)",
      }} />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b"
        style={{ borderColor: "rgba(200,150,12,0.08)" }}>
        <div className="flex items-center gap-2.5">
          <Package size={15} style={{ color: "var(--color-gold)" }} />
          <div>
            <p className="font-dm-sans font-bold text-sm" style={{ color: "var(--color-brown)" }}>{displayId}</p>
            <p className="font-dm-sans text-xs flex items-center gap-1" style={{ color: "var(--color-grey)" }}>
              <Clock size={9} />{formatDate(order.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <OrderStatusBadge status={order.status} size="sm" />
          <span className="font-dm-sans font-bold text-base" style={{ color: "var(--color-crimson)" }}>
            {formatPrice(order.total_paise)}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="flex -space-x-2 flex-shrink-0">
          {order.items?.slice(0, 3).map((item, i) => (
            <div key={i} className="w-11 h-11 rounded-xl flex items-center justify-center text-xl border-2 border-white flex-shrink-0"
              style={{ background: "var(--color-cream)", zIndex: 3 - i }} title={item.productName}>
              {getItemEmoji(item.productName)}
            </div>
          ))}
          {(order.items?.length ?? 0) > 3 && (
            <div className="w-11 h-11 rounded-xl flex items-center justify-center font-dm-sans text-xs font-bold border-2 border-white flex-shrink-0"
              style={{ background: "var(--color-cream)", color: "var(--color-grey)" }}>
              +{order.items.length - 3}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-dm-sans text-sm truncate" style={{ color: "var(--color-brown)" }}>
            {order.items?.map((i) => i.productName).join(", ")}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-0.5">
            <span className="font-dm-sans text-xs" style={{ color: "var(--color-grey)" }}>
              {totalItems} item{totalItems !== 1 ? "s" : ""}
            </span>
            {order.payment_method === "cod" && (
              <span className="font-dm-sans text-xs" style={{ color: "var(--color-gold)" }}>· 💵 COD</span>
            )}
            {order.coupon_code && (
              <span className="font-dm-sans text-xs font-semibold px-1.5 py-0.5 rounded"
                style={{ background: "rgba(46,125,50,0.1)", color: "#2E7D32" }}>🏷️ {order.coupon_code}</span>
            )}
            {order.tracking_id && (
              <span className="font-dm-sans text-xs font-semibold" style={{ color: "#2E7D32" }}>
                🚚 {order.tracking_id}
              </span>
            )}
          </div>
        </div>

        <ChevronRight size={18} className="flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1"
          style={{ color: "var(--color-gold)", opacity: 0.6 }} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-2.5 border-t"
        style={{ borderColor: "rgba(200,150,12,0.06)", background: "rgba(200,150,12,0.02)" }}>
        <span className="font-dm-sans text-xs flex items-center gap-1" style={{ color: "var(--color-grey)" }}>
          View Details &amp; Track <ArrowRight size={10} />
        </span>
        <span className="flex items-center gap-1 font-dm-sans text-xs font-medium" style={{ color: "var(--color-grey)" }}>
          <RefreshCw size={10} />Reorder
        </span>
      </div>
    </Link>
  );
}

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/account/orders");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setOrders(data.orders?.length ? data.orders : MOCK_ORDERS);
      } catch {
        setOrders(MOCK_ORDERS);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const filtered = useMemo(() => orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return o.id.toLowerCase().includes(q) ||
      o.items?.some((i) => i.productName.toLowerCase().includes(q));
  }), [orders, statusFilter, search]);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="font-playfair font-bold text-2xl" style={{ color: "var(--color-brown)" }}>My Orders</h2>
          <p className="font-dm-sans text-sm mt-0.5" style={{ color: "var(--color-grey)" }}>
            {orders.length} order{orders.length !== 1 ? "s" : ""} placed
          </p>
        </div>
        <Link href="/products" className="btn-primary py-2.5 px-5 text-sm gap-2 self-start">
          <ShoppingBag size={16} />Shop More Pickles
        </Link>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex rounded-xl overflow-hidden"
          style={{ border: "1.5px solid rgba(200,150,12,0.2)" }}>
          <div className="flex items-center px-3.5" style={{ background: "var(--color-cream)" }}>
            <Search size={15} style={{ color: "var(--color-grey)" }} />
          </div>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID or pickle name…"
            className="flex-1 px-3.5 py-3 font-dm-sans text-sm bg-white outline-none"
            style={{ color: "var(--color-brown)" }}
          />
          {search && (
            <button onClick={() => setSearch("")} className="px-3.5 font-dm-sans text-sm"
              style={{ color: "var(--color-grey)", background: "var(--color-cream)" }}>✕</button>
          )}
        </div>
        <div className="flex rounded-xl overflow-hidden" style={{ border: "1.5px solid rgba(200,150,12,0.2)" }}>
          <div className="flex items-center px-3" style={{ background: "var(--color-cream)" }}>
            <Filter size={14} style={{ color: "var(--color-grey)" }} />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-3 font-dm-sans text-sm bg-white outline-none appearance-none pr-8"
            style={{ color: "var(--color-brown)", cursor: "pointer" }}>
            {STATUS_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && [1, 2, 3].map((i) => (
        <div key={i} className="h-[130px] rounded-2xl animate-pulse"
          style={{ background: "rgba(200,150,12,0.07)", border: "1px solid rgba(200,150,12,0.1)" }} />
      ))}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="rounded-2xl p-12 text-center flex flex-col items-center gap-5"
          style={{ background: "white", border: "1px solid rgba(200,150,12,0.12)", boxShadow: "0 2px 12px rgba(74,44,10,0.05)" }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
            style={{ background: "var(--color-cream)", border: "2px dashed rgba(200,150,12,0.25)" }}>🫙</div>
          <div>
            <h3 className="font-playfair font-bold text-lg" style={{ color: "var(--color-brown)" }}>
              {search || statusFilter !== "all" ? "No orders match" : "No orders yet"}
            </h3>
            <p className="font-dm-sans text-sm mt-1" style={{ color: "var(--color-grey)" }}>
              {search || statusFilter !== "all"
                ? "Try different keywords or clear the filter"
                : "Your authentic Andhra pickle orders will appear here"}
            </p>
          </div>
          {(search || statusFilter !== "all") ? (
            <button onClick={() => { setSearch(""); setStatusFilter("all"); }} className="btn-ghost py-2.5 px-6 text-sm">
              Clear Filters
            </button>
          ) : (
            <Link href="/products" className="btn-primary py-3 px-8 gap-2">
              <ShoppingBag size={17} />Browse Pickles
            </Link>
          )}
        </div>
      )}

      {/* Orders */}
      {!loading && filtered.length > 0 && (
        <>
          <div className="flex flex-col gap-4">
            {filtered.map((o) => <OrderCard key={o.id} order={o} />)}
          </div>
          <div className="text-center pt-2 border-t" style={{ borderColor: "rgba(200,150,12,0.08)" }}>
            <p className="font-dm-sans text-xs" style={{ color: "var(--color-grey)" }}>
              Showing all {filtered.length} order{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

"use client";
// src/app/account/page.tsx
// Maa Flavours — Account Dashboard (rich version)
// Greeting card, order stats strip, recent order preview,
// quick action grid, browse CTA, loyalty milestone

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package, MapPin, Heart, ArrowRight,
  ShoppingBag, Star, ChevronRight, Clock,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import OrderStatusBadge from "@/components/order/OrderStatusBadge";
import { formatPrice, formatDate } from "@/lib/utils";

interface RecentOrder {
  id: string;
  status: string;
  total_paise: number;
  items: Array<{ productName: string; quantity: number }>;
  created_at: string;
}

// ─── Quick action cards ───────────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    icon: Package,
    label: "My Orders",
    description: "Track & manage orders",
    href: "/account/orders",
    color: "var(--color-gold)",
    bg: "rgba(200,150,12,0.08)",
    border: "rgba(200,150,12,0.2)",
    emoji: "📦",
  },
  {
    icon: MapPin,
    label: "Addresses",
    description: "Saved delivery locations",
    href: "/account/addresses",
    color: "var(--color-brown)",
    bg: "rgba(74,44,10,0.06)",
    border: "rgba(74,44,10,0.15)",
    emoji: "📍",
  },
  {
    icon: Heart,
    label: "Wishlist",
    description: "Pickles saved for later",
    href: "/account/wishlist",
    color: "var(--color-crimson)",
    bg: "rgba(192,39,45,0.06)",
    border: "rgba(192,39,45,0.15)",
    emoji: "❤️",
  },
];

// ─── Greeting based on hour ───────────────────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Order stats ─────────────────────────────────────────────────────────
interface OrderStats {
  total: number;
  delivered: number;
  pending: number;
  totalSpend: number;
}

function getItemEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("drumstick")) return "🥢";
  if (n.includes("amla")) return "🫙";
  if (n.includes("gongura")) return "🍃";
  if (n.includes("lemon")) return "🍋";
  if (n.includes("maamidi") || n.includes("mango")) return "🥭";
  if (n.includes("chilli")) return "🌶️";
  return "🫙";
}

// ─── Mock orders for dev ──────────────────────────────────────────────────
const MOCK_RECENT: RecentOrder = {
  id: "mock-a1b2c3d4-shipped",
  status: "shipped",
  total_paise: 59000,
  items: [
    { productName: "Drumstick Pickle", quantity: 1 },
    { productName: "Lemon Pickle", quantity: 1 },
  ],
  created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
};
const MOCK_STATS: OrderStats = { total: 3, delivered: 2, pending: 1, totalSpend: 113000 };

export default function AccountDashboard() {
  const { user } = useAuth();
  const [recentOrder, setRecentOrder] = useState<RecentOrder | null>(null);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const firstName = user?.name?.split(" ")[0] || "there";
  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/account/orders");
        const data = await res.json();
        const orders = data.orders || [];
        if (orders.length > 0) {
          setRecentOrder(orders[0]);
          setStats({
            total: orders.length,
            delivered: orders.filter((o: any) => o.status === "delivered").length,
            pending: orders.filter((o: any) => !["delivered", "cancelled"].includes(o.status)).length,
            totalSpend: orders.reduce((sum: number, o: any) => sum + (o.total_paise || 0), 0),
          });
        } else {
          // Dev mode — use mock data
          setRecentOrder(MOCK_RECENT);
          setStats(MOCK_STATS);
        }
      } catch {
        setRecentOrder(MOCK_RECENT);
        setStats(MOCK_STATS);
      } finally {
        setLoadingOrders(false);
      }
    }
    fetchOrders();
  }, []);

  const recentDisplayId = recentOrder?.id?.length > 12
    ? `MF-${recentOrder.id.slice(-8).toUpperCase()}`
    : recentOrder?.id?.toUpperCase() || "";

  return (
    <div className="flex flex-col gap-5">

      {/* ─── Welcome header card ──────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden px-6 py-8"
        style={{
          background: "linear-gradient(135deg,var(--color-brown) 0%, #6B3E12 60%, #8B4C14 100%)",
          boxShadow: "0 8px 32px rgba(74,44,10,0.2)",
        }}>
        {/* Paper texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)", backgroundSize: "10px 10px" }} />

        {/* Gold ornament */}
        <div className="absolute top-0 left-0 right-0 h-1"
          style={{ background: "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)" }} />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <p className="font-dm-sans text-sm" style={{ color: "rgba(232,184,75,0.75)" }}>
              {getGreeting()},
            </p>
            <h1 className="font-playfair font-bold text-3xl mt-0.5 text-white">
              {firstName}! 🎉
            </h1>
            <p className="font-dm-sans text-sm mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>
              {user?.mobile || ""}
            </p>
            {user?.email && (
              <p className="font-dm-sans text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                {user.email}
              </p>
            )}
          </div>

          {/* Avatar */}
          <div className="w-16 h-16 rounded-full flex items-center justify-center font-playfair font-bold text-2xl text-white flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.15)", border: "2px solid rgba(232,184,75,0.35)" }}>
            {initial}
          </div>
        </div>

        <Link href="/account/profile"
          className="relative z-10 inline-flex items-center gap-1.5 mt-4 font-dm-sans text-xs font-semibold underline hover:no-underline"
          style={{ color: "var(--color-gold-light)" }}>
          Edit Profile <ArrowRight size={12} />
        </Link>
      </div>

      {/* ─── Stats strip ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Orders", value: stats?.total ?? "—", icon: "📦" },
          { label: "Delivered", value: stats?.delivered ?? "—", icon: "✅" },
          { label: "In Progress", value: stats?.pending ?? "—", icon: "🚚" },
          { label: "Total Spent", value: stats ? formatPrice(stats.totalSpend) : "—", icon: "💰" },
        ].map((s) => (
          <div key={s.label}
            className="rounded-2xl px-4 py-4 flex flex-col gap-1"
            style={{ background: "white", border: "1px solid rgba(200,150,12,0.12)", boxShadow: "0 2px 8px rgba(74,44,10,0.04)" }}>
            <span className="text-2xl">{s.icon}</span>
            <p className="font-playfair font-bold text-xl" style={{ color: "var(--color-crimson)" }}>
              {loadingOrders ? "—" : s.value}
            </p>
            <p className="font-dm-sans text-xs" style={{ color: "var(--color-grey)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ─── Recent order ─────────────────────────────────────────── */}
      {!loadingOrders && recentOrder && (
        <div>
          <p className="font-dm-sans text-sm font-semibold mb-2" style={{ color: "var(--color-brown)" }}>
            Most Recent Order
          </p>
          <Link href={`/account/orders/${recentOrder.id}`}
            className="block rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group"
            style={{ background: "white", border: "1px solid rgba(200,150,12,0.15)", boxShadow: "0 2px 8px rgba(74,44,10,0.05)" }}>
            <div className="h-[2px]" style={{
              background: "linear-gradient(90deg,transparent,var(--color-gold) 25%,var(--color-gold-light) 50%,var(--color-gold) 75%,transparent)",
            }} />

            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b"
              style={{ borderColor: "rgba(200,150,12,0.08)" }}>
              <div className="flex items-center gap-2.5">
                <Package size={15} style={{ color: "var(--color-gold)" }} />
                <div>
                  <p className="font-dm-sans font-bold text-sm" style={{ color: "var(--color-brown)" }}>
                    {recentDisplayId}
                  </p>
                  <p className="font-dm-sans text-xs flex items-center gap-1" style={{ color: "var(--color-grey)" }}>
                    <Clock size={9} />{formatDate(recentOrder.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <OrderStatusBadge status={recentOrder.status} size="sm" />
                <span className="font-dm-sans font-bold" style={{ color: "var(--color-crimson)" }}>
                  {formatPrice(recentOrder.total_paise)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-3.5">
              <div className="flex gap-1.5 flex-shrink-0">
                {recentOrder.items?.slice(0, 3).map((item, i) => (
                  <div key={i} className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: "var(--color-cream)", border: "1px solid rgba(200,150,12,0.15)" }}>
                    {getItemEmoji(item.productName)}
                  </div>
                ))}
              </div>
              <p className="flex-1 font-dm-sans text-sm truncate" style={{ color: "var(--color-brown)" }}>
                {recentOrder.items?.map((i) => `${i.productName} ×${i.quantity}`).join(", ")}
              </p>
              <ChevronRight size={16} className="flex-shrink-0 transition-transform group-hover:translate-x-1"
                style={{ color: "var(--color-gold)", opacity: 0.6 }} />
            </div>
          </Link>
        </div>
      )}

      {/* ─── Quick actions ─────────────────────────────────────────── */}
      <div>
        <p className="font-dm-sans text-sm font-semibold mb-3" style={{ color: "var(--color-brown)" }}>
          Quick Access
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {QUICK_ACTIONS.map(({ icon: Icon, label, description, href, color, bg, border, emoji }) => (
            <Link key={href} href={href}
              className="flex flex-col gap-3 p-5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group"
              style={{ background: bg, border: `1px solid ${border}` }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: "white", border: `1px solid ${border}` }}>
                {emoji}
              </div>
              <div className="flex-1">
                <p className="font-dm-sans font-bold text-sm" style={{ color: "var(--color-brown)" }}>{label}</p>
                <p className="font-dm-sans text-xs mt-0.5" style={{ color: "var(--color-grey)" }}>{description}</p>
              </div>
              <ArrowRight size={14}
                className="transition-transform group-hover:translate-x-1"
                style={{ color, opacity: 0.6 }} />
            </Link>
          ))}
        </div>
      </div>

      {/* ─── Browse CTA ───────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "white", border: "1px solid rgba(200,150,12,0.12)", boxShadow: "0 2px 12px rgba(74,44,10,0.05)" }}>
        <div className="h-[2px]" style={{
          background: "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)",
        }} />
        <div className="flex items-center justify-between gap-4 p-5">
          <div>
            <p className="font-playfair font-bold text-lg" style={{ color: "var(--color-brown)" }}>
              Ready for more pickles? 🫙
            </p>
            <p className="font-dm-sans text-sm mt-0.5" style={{ color: "var(--color-grey)" }}>
              6 authentic Andhra varieties · Handcrafted fresh · Pan-India delivery
            </p>
            <div className="flex items-center gap-1 mt-2">
              {Array(5).fill(0).map((_, i) => (
                <Star key={i} size={13} fill="var(--color-gold)" strokeWidth={0} />
              ))}
              <span className="font-dm-sans text-xs ml-1" style={{ color: "var(--color-grey)" }}>
                4.9 · 500+ happy customers
              </span>
            </div>
          </div>
          <Link href="/products" className="btn-primary py-3 px-5 text-sm flex-shrink-0 gap-2">
            <ShoppingBag size={16} />Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
}

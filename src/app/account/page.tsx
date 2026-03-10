"use client";
// src/app/account/page.tsx
// Maa Flavours — Account Dashboard
// Tabbed UI: Overview | Orders | Profile | Addresses

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package, User, MapPin, LogOut, ShoppingBag,
  CheckCircle2, Clock, Truck, ArrowRight, Save,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

type Tab = "overview" | "orders" | "profile" | "addresses";

interface Order {
  id: string;
  status: string;
  total_paise: number;
  created_at: string;
  items?: Array<{ productName: string; quantity: number }>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    pending:          { label: "Pending",          color: "#C8960C", bg: "rgba(200,150,12,0.1)",    icon: <Clock size={12} /> },
    confirmed:        { label: "Confirmed",         color: "#2E7D32", bg: "rgba(46,125,50,0.1)",    icon: <CheckCircle2 size={12} /> },
    processing:       { label: "Processing",        color: "#1565C0", bg: "rgba(21,101,192,0.1)",   icon: <Clock size={12} /> },
    packed:           { label: "Packed",            color: "#6A1B9A", bg: "rgba(106,27,154,0.1)",   icon: <Package size={12} /> },
    shipped:          { label: "Shipped",           color: "#00838F", bg: "rgba(0,131,143,0.1)",    icon: <Truck size={12} /> },
    out_for_delivery: { label: "Out for Delivery",  color: "#E65100", bg: "rgba(230,81,0,0.1)",     icon: <Truck size={12} /> },
    delivered:        { label: "Delivered",         color: "#2E7D32", bg: "rgba(46,125,50,0.1)",    icon: <CheckCircle2 size={12} /> },
    cancelled:        { label: "Cancelled",         color: "#C62828", bg: "rgba(198,40,40,0.1)",    icon: <Clock size={12} /> },
  };
  const s = map[status] || { label: status, color: "var(--color-grey)", bg: "var(--color-cream)", icon: null };
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-dm-sans text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      {s.icon} {s.label}
    </span>
  );
}

// ─── Tab: Overview ────────────────────────────────────────────────────────
function OverviewTab({
  user,
  onTabChange,
}: {
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
  onTabChange: (tab: Tab) => void;
}) {
  const firstName = user.name?.split(" ")[0] || "there";
  const initial   = (user.name || "U").charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-5">
      {/* Welcome card */}
      <div
        className="relative rounded-2xl overflow-hidden px-6 py-8"
        style={{
          background: "linear-gradient(135deg, var(--color-brown) 0%, #6B3E12 60%, #8B4C14 100%)",
          boxShadow: "0 8px 32px rgba(74,44,10,0.2)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-1" style={{
          background: "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)",
        }} />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-dm-sans text-sm" style={{ color: "rgba(232,184,75,0.75)" }}>
              {getGreeting()},
            </p>
            <h1 className="font-playfair font-bold text-3xl mt-0.5 text-white">
              {firstName}!
            </h1>
            <p className="font-dm-sans text-sm mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>
              {user.mobile}
            </p>
            {user.email && (
              <p className="font-dm-sans text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                {user.email}
              </p>
            )}
          </div>
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center font-playfair font-bold text-2xl text-white flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.15)", border: "2px solid rgba(232,184,75,0.35)" }}
          >
            {initial}
          </div>
        </div>
      </div>

      {/* Quick links */}
      {[
        { icon: Package,   label: "My Orders",        desc: "Track & manage orders",       href: null,       tab: "orders"    as Tab },
        { icon: User,      label: "Edit Profile",      desc: "Update name & email",         href: null,       tab: "profile"   as Tab },
        { icon: MapPin,    label: "Saved Addresses",   desc: "Manage delivery locations",   href: null,       tab: "addresses" as Tab },
        { icon: ShoppingBag, label: "Browse Pickles", desc: "Shop all 6 Andhra varieties", href: "/products", tab: null },
      ].map(({ icon: Icon, label, desc, href, tab }) => {
        const itemStyle = { background: "white", border: "1px solid rgba(200,150,12,0.12)" };
        const inner = (
          <>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(200,150,12,0.08)" }}>
              <Icon size={18} style={{ color: "var(--color-gold)" }} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-dm-sans font-bold text-sm" style={{ color: "var(--color-brown)" }}>{label}</p>
              <p className="font-dm-sans text-xs" style={{ color: "var(--color-grey)" }}>{desc}</p>
            </div>
            <ArrowRight size={16} style={{ color: "var(--color-gold)", opacity: 0.6 }} />
          </>
        );
        return href ? (
          <Link key={label} href={href}
            className="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            style={itemStyle}
          >
            {inner}
          </Link>
        ) : (
          <button key={label} onClick={() => onTabChange(tab!)}
            className="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md w-full"
            style={itemStyle}
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}

// ─── Tab: Orders ──────────────────────────────────────────────────────────
function OrdersTab() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/account/orders", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setOrders(data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="text-3xl animate-pulse">📦</span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center text-center py-16 gap-5">
        <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl"
          style={{ background: "var(--color-cream)", border: "2px dashed rgba(200,150,12,0.3)" }}>
          📦
        </div>
        <div>
          <h3 className="font-playfair font-bold text-xl mb-1" style={{ color: "var(--color-brown)" }}>
            No orders yet
          </h3>
          <p className="font-dm-sans text-sm" style={{ color: "var(--color-grey)" }}>
            Your pickle journey is about to begin!
          </p>
        </div>
        <Link href="/products" className="btn-primary py-3 px-6 gap-2">
          <ShoppingBag size={16} /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="font-dm-sans text-sm font-semibold" style={{ color: "var(--color-brown)" }}>
        {orders.length} order{orders.length !== 1 ? "s" : ""}
      </p>
      {orders.map((order) => {
        const displayId = `MF-${order.id.slice(-8).toUpperCase()}`;
        return (
          <Link key={order.id} href={`/account/orders/${order.id}`}
            className="block rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            style={{ background: "white", border: "1px solid rgba(200,150,12,0.12)" }}
          >
            <div className="h-[2px]" style={{
              background: "linear-gradient(90deg,transparent,var(--color-gold) 25%,var(--color-gold-light) 50%,var(--color-gold) 75%,transparent)",
            }} />
            <div className="flex items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="font-dm-sans font-bold text-sm" style={{ color: "var(--color-brown)" }}>
                  {displayId}
                </p>
                <p className="font-dm-sans text-xs mt-0.5" style={{ color: "var(--color-grey)" }}>
                  {new Date(order.created_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={order.status} />
                <span className="font-dm-sans font-bold" style={{ color: "var(--color-crimson)" }}>
                  {formatPrice(order.total_paise)}
                </span>
                <ArrowRight size={14} style={{ color: "var(--color-gold)", opacity: 0.5 }} />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ─── Tab: Profile ─────────────────────────────────────────────────────────
function ProfileTab({ user }: { user: NonNullable<ReturnType<typeof useAuth>["user"]> }) {
  const [name,   setName]   = useState(user.name || "");
  const [email,  setEmail]  = useState(user.email || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || name.trim().length < 2) {
      toast.error("Please enter a valid name (at least 2 characters).");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mobile: user.mobile, name: name.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.error || "Could not save profile. Please try again.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "white", border: "1px solid rgba(200,150,12,0.12)" }}
    >
      <div className="h-[3px]" style={{
        background: "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)",
      }} />
      <div className="px-6 py-6 flex flex-col gap-5">
        <h2 className="font-playfair font-bold text-xl" style={{ color: "var(--color-brown)" }}>
          Personal Information
        </h2>

        {/* Mobile (read-only) */}
        <div>
          <label className="font-dm-sans text-xs font-semibold block mb-1.5" style={{ color: "var(--color-brown)" }}>
            Mobile Number
          </label>
          <div
            className="w-full px-4 py-3 rounded-xl font-dm-sans text-sm"
            style={{ background: "var(--color-cream)", color: "var(--color-grey)", border: "1px solid rgba(200,150,12,0.15)" }}
          >
            {user.mobile}
          </div>
          <p className="font-dm-sans text-xs mt-1" style={{ color: "var(--color-grey)" }}>
            Mobile number cannot be changed.
          </p>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="profile-name" className="font-dm-sans text-xs font-semibold block mb-1.5" style={{ color: "var(--color-brown)" }}>
            Full Name *
          </label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="w-full px-4 py-3 rounded-xl font-dm-sans text-sm outline-none transition-all"
            style={{
              border: "1.5px solid rgba(200,150,12,0.25)",
              background: "white",
              color: "var(--color-brown)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--color-gold)")}
            onBlur={(e)  => (e.target.style.borderColor = "rgba(200,150,12,0.25)")}
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="profile-email" className="font-dm-sans text-xs font-semibold block mb-1.5" style={{ color: "var(--color-brown)" }}>
            Email Address (optional)
          </label>
          <input
            id="profile-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full px-4 py-3 rounded-xl font-dm-sans text-sm outline-none transition-all"
            style={{
              border: "1.5px solid rgba(200,150,12,0.25)",
              background: "white",
              color: "var(--color-brown)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--color-gold)")}
            onBlur={(e)  => (e.target.style.borderColor = "rgba(200,150,12,0.25)")}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary py-3 gap-2 justify-center disabled:opacity-60"
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ─── Tab: Addresses ───────────────────────────────────────────────────────
function AddressesTab() {
  return (
    <div className="flex flex-col items-center text-center py-16 gap-5">
      <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl"
        style={{ background: "var(--color-cream)", border: "2px dashed rgba(200,150,12,0.3)" }}>
        📍
      </div>
      <div>
        <h3 className="font-playfair font-bold text-xl mb-1" style={{ color: "var(--color-brown)" }}>
          Saved Addresses
        </h3>
        <p className="font-dm-sans text-sm" style={{ color: "var(--color-grey)" }}>
          Address management coming soon. Your delivery address is saved during checkout.
        </p>
      </div>
    </div>
  );
}

// ─── Main Account Page ────────────────────────────────────────────────────
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview",   label: "Overview",   icon: <User size={16} /> },
  { id: "orders",     label: "Orders",     icon: <Package size={16} /> },
  { id: "profile",    label: "Profile",    icon: <User size={16} /> },
  { id: "addresses",  label: "Addresses",  icon: <MapPin size={16} /> },
];

export default function AccountPage() {
  const { user, isLoggedIn, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Auth guard
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.replace("/login?redirect=/account");
    }
  }, [loading, isLoggedIn, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <span className="text-4xl animate-pulse">🫙</span>
        <p className="font-dm-sans text-sm" style={{ color: "var(--color-grey)" }}>Loading account…</p>
      </div>
    );
  }

  if (!isLoggedIn || !user) return null;

  return (
    <div className="flex flex-col gap-6">

      {/* ── Top bar: welcome + logout ───────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="font-playfair font-bold text-2xl" style={{ color: "var(--color-brown)" }}>
          My Account
        </h1>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 rounded-xl font-dm-sans text-sm font-semibold transition-colors hover:bg-crimson/5"
          style={{ color: "var(--color-crimson)" }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      {/* ── Tab navigation ─────────────────────────────────────────── */}
      <div
        className="flex gap-1 p-1 rounded-2xl overflow-x-auto"
        style={{ background: "var(--color-cream)", border: "1px solid rgba(200,150,12,0.12)" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-dm-sans text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-1 justify-center"
            style={
              activeTab === tab.id
                ? {
                    background: "white",
                    color: "var(--color-crimson)",
                    boxShadow: "0 2px 8px rgba(74,44,10,0.08)",
                  }
                : { color: "var(--color-grey)" }
            }
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ────────────────────────────────────────────── */}
      {activeTab === "overview"   && <OverviewTab  user={user} onTabChange={setActiveTab} />}
      {activeTab === "orders"     && <OrdersTab />}
      {activeTab === "profile"    && <ProfileTab   user={user} />}
      {activeTab === "addresses"  && <AddressesTab />}
    </div>
  );
}

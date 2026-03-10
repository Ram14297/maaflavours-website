"use client";
// src/app/account/page.tsx
// Maa Flavours — Account Dashboard
// Tabbed UI: Overview | Orders | Profile | Addresses

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package, User, MapPin, LogOut, ShoppingBag,
  CheckCircle2, Clock, Truck, ArrowRight, Save, Plus,
  Phone, Edit3, Trash2, Check, Loader2, X,
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

// ─── Address types ────────────────────────────────────────────────────────
interface Address {
  id: string; full_name: string; mobile: string;
  address_line1: string; address_line2?: string; landmark?: string;
  city: string; state: string; pincode: string; is_default: boolean;
}
const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Andaman & Nicobar Islands","Chandigarh",
  "Dadra & Nagar Haveli","Daman & Diu","Delhi","Jammu & Kashmir","Ladakh",
  "Lakshadweep","Puducherry",
];
function blankAddr(): Omit<Address,"id"|"is_default"> {
  return { full_name:"", mobile:"", address_line1:"", address_line2:"", landmark:"", city:"", state:"", pincode:"" };
}

// ─── Address Form Modal ───────────────────────────────────────────────────
function AddressModal({ open, onClose, onSave, initial }: {
  open: boolean; onClose: () => void;
  onSave: (a: Omit<Address,"id"|"is_default">) => Promise<void>;
  initial?: Partial<Address>;
}) {
  const [form, setForm] = useState({ ...blankAddr(), ...initial });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [saving, setSaving] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  const set = (k: string, v: string) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:""})); };

  const handlePincode = async (val: string) => {
    set("pincode", val);
    if (val.length !== 6) return;
    setPincodeLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
      const data = await res.json();
      if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length) {
        const po = data[0].PostOffice[0];
        setForm(f => ({ ...f, pincode: val, city: po.Division || po.Block || po.District || "", state: po.State || "" }));
      }
    } catch {/* no-op */} finally { setPincodeLoading(false); }
  };

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.full_name.trim() || form.full_name.length < 2) e.full_name = "Enter your full name.";
    if (!/^[6-9]\d{9}$/.test(form.mobile.replace(/\D/g,""))) e.mobile = "Enter a valid 10-digit mobile number.";
    if (!form.address_line1.trim() || form.address_line1.length < 5) e.address_line1 = "Enter a valid address.";
    if (!form.city.trim()) e.city = "Enter your city.";
    if (!form.state) e.state = "Select your state.";
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = "Enter a valid 6-digit pincode.";
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch (err: any) { toast.error(err.message || "Failed to save address"); }
    finally { setSaving(false); }
  };

  useEffect(() => { if (open) setForm({ ...blankAddr(), ...initial }); }, [open]);

  if (!open) return null;
  const inp = (err: string) => `w-full px-3.5 py-3 rounded-xl font-dm-sans text-sm bg-white outline-none transition-all duration-200`;
  const inpStyle = (err: string) => ({ border: `2px solid ${err ? "var(--color-crimson)" : "rgba(200,150,12,0.25)"}`, color: "var(--color-brown)" });

  return (
    <>
      <div className="fixed inset-0 z-[100]" style={{ background: "rgba(74,44,10,0.55)", backdropFilter: "blur(4px)" }} onClick={onClose} aria-hidden />
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg rounded-3xl overflow-hidden flex flex-col"
          style={{ background: "var(--color-warm-white)", boxShadow: "0 24px 64px rgba(74,44,10,0.25)", maxHeight: "90vh" }}>
          <div className="h-1 flex-shrink-0" style={{ background: "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)" }} />
          <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: "rgba(200,150,12,0.1)" }}>
            <h3 className="font-playfair font-bold text-lg" style={{ color: "var(--color-brown)" }}>{initial?.id ? "Edit Address" : "Add New Address"}</h3>
            <button onClick={onClose} className="p-2 rounded-xl transition-colors hover:bg-cream" style={{ color: "var(--color-grey)" }}><X size={18} /></button>
          </div>
          <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-4">
            {[
              { label: "Full Name", id: "full_name", type: "text", placeholder: "Priya Reddy", autoComplete: "name" },
            ].map(({ label, id, type, placeholder, autoComplete }) => (
              <div key={id}>
                <label className="block font-dm-sans text-sm font-semibold mb-1.5" style={{ color: "var(--color-brown)" }}>{label} *</label>
                <input type={type} value={(form as any)[id]} onChange={e => set(id, e.target.value)}
                  placeholder={placeholder} autoComplete={autoComplete}
                  className={inp(errors[id])} style={inpStyle(errors[id])} />
                {errors[id] && <p className="font-dm-sans text-xs mt-1" style={{ color: "var(--color-crimson)" }}>⚠️ {errors[id]}</p>}
              </div>
            ))}
            <div>
              <label className="block font-dm-sans text-sm font-semibold mb-1.5" style={{ color: "var(--color-brown)" }}>Mobile Number *</label>
              <div className="flex rounded-xl overflow-hidden" style={{ border: `2px solid ${errors.mobile ? "var(--color-crimson)" : "rgba(200,150,12,0.25)"}` }}>
                <div className="flex items-center gap-2 px-3 flex-shrink-0" style={{ background: "var(--color-cream)" }}>
                  <span className="text-sm">🇮🇳</span>
                  <span className="font-dm-sans font-bold text-sm" style={{ color: "var(--color-brown)" }}>+91</span>
                </div>
                <input type="tel" inputMode="numeric" value={form.mobile}
                  onChange={e => set("mobile", e.target.value.replace(/\D/g,"").slice(0,10))}
                  placeholder="98765 43210" autoComplete="tel-national"
                  className="flex-1 px-3.5 py-3 font-dm-sans text-sm bg-white outline-none" style={{ color: "var(--color-brown)" }} />
              </div>
              {errors.mobile && <p className="font-dm-sans text-xs mt-1" style={{ color: "var(--color-crimson)" }}>⚠️ {errors.mobile}</p>}
            </div>
            <div>
              <label className="block font-dm-sans text-sm font-semibold mb-1.5" style={{ color: "var(--color-brown)" }}>House / Flat / Building *</label>
              <input type="text" value={form.address_line1} onChange={e => set("address_line1", e.target.value)}
                placeholder="Flat 4B, Green Valley Apartments" autoComplete="address-line1"
                className={inp(errors.address_line1)} style={inpStyle(errors.address_line1)} />
              {errors.address_line1 && <p className="font-dm-sans text-xs mt-1" style={{ color: "var(--color-crimson)" }}>⚠️ {errors.address_line1}</p>}
            </div>
            <div>
              <label className="block font-dm-sans text-sm font-semibold mb-1.5" style={{ color: "var(--color-brown)" }}>Street / Area / Locality</label>
              <input type="text" value={form.address_line2||""} onChange={e => set("address_line2", e.target.value)}
                placeholder="Beside HDFC Bank, Madhapur" autoComplete="address-line2"
                className={inp("")} style={inpStyle("")} />
            </div>
            <div>
              <label className="block font-dm-sans text-sm font-semibold mb-1.5" style={{ color: "var(--color-brown)" }}>Landmark</label>
              <input type="text" value={form.landmark||""} onChange={e => set("landmark", e.target.value)}
                placeholder="Near Durgam Cheruvu" className={inp("")} style={inpStyle("")} />
            </div>
            <div>
              <label className="block font-dm-sans text-sm font-semibold mb-1.5" style={{ color: "var(--color-brown)" }}>Pincode *</label>
              <div className="relative">
                <input type="text" inputMode="numeric" value={form.pincode}
                  onChange={e => handlePincode(e.target.value.replace(/\D/g,"").slice(0,6))}
                  placeholder="500032" maxLength={6} className={inp(errors.pincode)} style={inpStyle(errors.pincode)} />
                {pincodeLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Loader2 size={16} className="animate-spin" style={{ color: "var(--color-gold)" }} /></div>}
              </div>
              {form.city && form.state && !pincodeLoading && (
                <p className="font-dm-sans text-xs mt-1 flex items-center gap-1" style={{ color: "#2E7D32" }}><Check size={12} />Auto-filled: {form.city}, {form.state}</p>
              )}
              {errors.pincode && <p className="font-dm-sans text-xs mt-1" style={{ color: "var(--color-crimson)" }}>⚠️ {errors.pincode}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-dm-sans text-sm font-semibold mb-1.5" style={{ color: "var(--color-brown)" }}>City *</label>
                <input type="text" value={form.city} onChange={e => set("city", e.target.value)}
                  placeholder="Hyderabad" autoComplete="address-level2"
                  className={inp(errors.city)} style={inpStyle(errors.city)} />
                {errors.city && <p className="font-dm-sans text-xs mt-1" style={{ color: "var(--color-crimson)" }}>⚠️ {errors.city}</p>}
              </div>
              <div>
                <label className="block font-dm-sans text-sm font-semibold mb-1.5" style={{ color: "var(--color-brown)" }}>State *</label>
                <select value={form.state} onChange={e => set("state", e.target.value)}
                  className={inp(errors.state)} style={{ ...inpStyle(errors.state), cursor: "pointer" }}>
                  <option value="">Select state</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.state && <p className="font-dm-sans text-xs mt-1" style={{ color: "var(--color-crimson)" }}>⚠️ {errors.state}</p>}
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t flex-shrink-0 flex gap-3" style={{ borderColor: "rgba(200,150,12,0.1)" }}>
            <button onClick={onClose} className="btn-ghost flex-1 py-3 text-sm">Cancel</button>
            <button onClick={handleSubmit} disabled={saving} className="btn-primary flex-1 py-3 text-sm gap-2 disabled:opacity-60">
              {saving ? <><Loader2 size={16} className="animate-spin" />Saving…</> : <><Check size={16} />{initial?.id ? "Update" : "Save Address"}</>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Tab: Addresses ───────────────────────────────────────────────────────
function AddressesTab() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Address | undefined>();

  useEffect(() => { fetchAddresses(); }, []);

  async function fetchAddresses() {
    try {
      const res = await fetch("/api/account/addresses");
      const data = await res.json();
      setAddresses(data.addresses?.length ? data.addresses : []);
    } catch {/* silent */} finally { setLoading(false); }
  }

  async function handleSave(form: Omit<Address,"id"|"is_default">) {
    if (editTarget) {
      setAddresses(prev => prev.map(a => a.id === editTarget.id ? { ...a, ...form } : a));
      toast.success("Address updated!");
    } else {
      setAddresses(prev => [...prev, { ...form, id: `local-${Date.now()}`, is_default: prev.length === 0 }]);
      toast.success("Address saved!");
    }
    setEditTarget(undefined);
  }

  function handleEdit(a: Address) { setEditTarget(a); setModalOpen(true); }
  function handleDelete(id: string) {
    if (!confirm("Remove this address?")) return;
    setAddresses(prev => prev.filter(a => a.id !== id));
    toast.success("Address removed");
  }
  function handleSetDefault(id: string) {
    setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id })));
    toast.success("Default address updated!");
  }

  return (
    <>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-playfair font-bold text-2xl" style={{ color: "var(--color-brown)" }}>Your Addresses</h2>
            <p className="font-dm-sans text-sm mt-0.5" style={{ color: "var(--color-grey)" }}>
              {loading ? "Loading…" : `${addresses.length} saved address${addresses.length !== 1 ? "es" : ""}`}
            </p>
          </div>
          {addresses.length > 0 && (
            <button onClick={() => { setEditTarget(undefined); setModalOpen(true); }} className="btn-primary py-2.5 px-4 text-sm gap-2">
              <Plus size={16} />Add New
            </button>
          )}
        </div>

        {/* Loading skeleton */}
        {loading && [1,2].map(i => (
          <div key={i} className="h-[140px] rounded-2xl animate-pulse" style={{ background: "rgba(200,150,12,0.07)", border: "1px solid rgba(200,150,12,0.1)" }} />
        ))}

        {/* Address cards + Add card */}
        {!loading && (
          <div className="flex flex-col gap-4">
            {addresses.map(addr => (
              <div key={addr.id} className="rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md"
                style={{ background: "white", border: `2px solid ${addr.is_default ? "rgba(200,150,12,0.3)" : "rgba(200,150,12,0.12)"}`, boxShadow: addr.is_default ? "0 4px 16px rgba(200,150,12,0.12)" : "0 2px 8px rgba(74,44,10,0.05)" }}>
                <div className="h-[2px]" style={{ background: addr.is_default ? "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)" : "rgba(200,150,12,0.08)" }} />
                <div className="flex items-start gap-4 px-5 py-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: addr.is_default ? "rgba(200,150,12,0.1)" : "rgba(200,150,12,0.06)" }}>
                    <MapPin size={18} style={{ color: addr.is_default ? "var(--color-gold)" : "var(--color-grey)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-dm-sans font-bold text-sm" style={{ color: "var(--color-brown)" }}>{addr.full_name}</p>
                      {addr.is_default && (
                        <span className="px-2 py-0.5 rounded-full font-dm-sans text-xs font-bold" style={{ background: "rgba(200,150,12,0.12)", color: "var(--color-gold)" }}>⭐ Default</span>
                      )}
                    </div>
                    <p className="font-dm-sans text-sm mt-1 leading-relaxed" style={{ color: "var(--color-grey)" }}>
                      {addr.address_line1}{addr.address_line2 && `, ${addr.address_line2}`}{addr.landmark && ` (Near ${addr.landmark})`}
                    </p>
                    <p className="font-dm-sans text-sm" style={{ color: "var(--color-grey)" }}>{addr.city}, {addr.state} — {addr.pincode}</p>
                    <p className="font-dm-sans text-sm mt-0.5 flex items-center gap-1.5" style={{ color: "var(--color-brown)" }}><Phone size={12} />+91 {addr.mobile}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap px-5 py-3 border-t" style={{ borderColor: "rgba(200,150,12,0.08)", background: "rgba(200,150,12,0.02)" }}>
                  {!addr.is_default && (
                    <button onClick={() => handleSetDefault(addr.id)} className="flex items-center gap-1.5 font-dm-sans text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                      style={{ background: "rgba(200,150,12,0.1)", color: "var(--color-gold)", border: "1px solid rgba(200,150,12,0.2)" }}><Check size={12} />Set as Default</button>
                  )}
                  <button onClick={() => handleEdit(addr)} className="flex items-center gap-1.5 font-dm-sans text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                    style={{ background: "rgba(74,44,10,0.06)", color: "var(--color-brown)", border: "1px solid rgba(74,44,10,0.12)" }}><Edit3 size={12} />Edit</button>
                  <button onClick={() => handleDelete(addr.id)} className="flex items-center gap-1.5 font-dm-sans text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:scale-105 ml-auto"
                    style={{ background: "rgba(192,39,45,0.06)", color: "var(--color-crimson)", border: "1px solid rgba(192,39,45,0.15)" }}><Trash2 size={12} />Remove</button>
                </div>
              </div>
            ))}

            {/* + Add address tile */}
            <button onClick={() => { setEditTarget(undefined); setModalOpen(true); }}
              className="w-full rounded-2xl flex flex-col items-center justify-center gap-2 py-8 transition-all duration-200 hover:shadow-md group"
              style={{ border: "2px dashed rgba(200,150,12,0.35)", background: "rgba(200,150,12,0.03)" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                style={{ background: "rgba(200,150,12,0.1)", border: "1.5px dashed rgba(200,150,12,0.4)" }}>
                <Plus size={22} style={{ color: "var(--color-gold)" }} />
              </div>
              <span className="font-dm-sans text-sm font-semibold" style={{ color: "var(--color-brown)" }}>Add address</span>
            </button>
          </div>
        )}
      </div>

      <AddressModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(undefined); }}
        onSave={handleSave}
        initial={editTarget}
      />
    </>
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

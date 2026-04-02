"use client";
// src/app/account/addresses/page.tsx
// Maa Flavours — Saved Addresses Page
// View all saved addresses, add new, set default, delete
// Addresses are pulled from Supabase customer_addresses table

import { useState, useEffect } from "react";
import { MapPin, Plus, Check, Trash2, Phone, Edit3, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Address {
  id: string;
  full_name: string;
  mobile: string;
  address_line1: string;
  address_line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman & Nicobar Islands", "Chandigarh", "Dadra & Nagar Haveli",
  "Daman & Diu", "Delhi", "Jammu & Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

// ─── Blank address form ──────────────────────────────────────────────────
function blankAddress(): Omit<Address, "id" | "is_default"> {
  return {
    full_name: "", mobile: "", address_line1: "", address_line2: "",
    landmark: "", city: "", state: "", pincode: "",
  };
}

// ─── Address Form Modal ──────────────────────────────────────────────────
function AddressFormModal({
  open, onClose, onSave, initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (a: Omit<Address, "id" | "is_default">) => Promise<void>;
  initial?: Partial<Address>;
}) {
  const [form, setForm] = useState({ ...blankAddress(), ...initial });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  // Pincode auto-fill via India Post API
  const handlePincode = async (val: string) => {
    set("pincode", val);
    if (val.length !== 6) return;
    setPincodeLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
      const data = await res.json();
      if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length) {
        const po = data[0].PostOffice[0];
        setForm((f) => ({
          ...f, pincode: val,
          city: po.Division || po.Block || po.District || "",
          state: po.State || "",
        }));
      }
    } catch { /* no-op */ }
    finally { setPincodeLoading(false); }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.full_name.trim() || form.full_name.length < 2) e.full_name = "Enter your full name.";
    if (!/^[6-9]\d{9}$/.test(form.mobile.replace(/\D/g, ""))) e.mobile = "Enter a valid 10-digit mobile number.";
    if (!form.address_line1.trim() || form.address_line1.length < 5) e.address_line1 = "Enter a valid address.";
    if (!form.city.trim()) e.city = "Enter your city.";
    if (!form.state) e.state = "Select your state.";
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = "Enter a valid 6-digit pincode.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const Field = ({
    label, id, required = false, children,
  }: { label: string; id: string; required?: boolean; children: React.ReactNode }) => (
    <div>
      <label htmlFor={id} className="block font-dm-sans text-sm font-semibold mb-1.5"
        style={{ color: "var(--color-brown)" }}>
        {label}{required && " *"}
      </label>
      {children}
      {errors[id] && (
        <p className="font-dm-sans text-xs mt-1" style={{ color: "var(--color-crimson)" }}>⚠️ {errors[id]}</p>
      )}
    </div>
  );

  const inputClass = (err: string) =>
    `w-full px-3.5 py-3 rounded-xl font-dm-sans text-sm bg-white outline-none transition-all duration-200`;
  const inputStyle = (err: string) => ({
    border: `2px solid ${err ? "var(--color-crimson)" : "rgba(200,150,12,0.25)"}`,
    color: "var(--color-brown)",
  });

  return (
    <>
      <div className="fixed inset-0 z-[100]"
        style={{ background: "rgba(74,44,10,0.55)", backdropFilter: "blur(4px)" }}
        onClick={onClose} aria-hidden
      />
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg rounded-3xl overflow-hidden flex flex-col"
          style={{ background: "var(--color-warm-white)", boxShadow: "0 24px 64px rgba(74,44,10,0.25)", maxHeight: "90vh" }}>
          {/* Gold ornament */}
          <div className="h-1 flex-shrink-0" style={{
            background: "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)",
          }} />

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
            style={{ borderColor: "rgba(200,150,12,0.1)" }}>
            <h3 className="font-playfair font-bold text-lg" style={{ color: "var(--color-brown)" }}>
              {initial?.id ? "Edit Address" : "Add New Address"}
            </h3>
            <button onClick={onClose} className="p-2 rounded-xl transition-colors hover:bg-cream"
              style={{ color: "var(--color-grey)" }}>
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-4">
            <Field label="Full Name" id="full_name" required>
              <input id="full_name" type="text" value={form.full_name}
                onChange={(e) => set("full_name", e.target.value)}
                placeholder="Priya Reddy" autoComplete="name"
                className={inputClass(errors.full_name)} style={inputStyle(errors.full_name)} />
            </Field>

            <Field label="Mobile Number" id="mobile" required>
              <div className="flex rounded-xl overflow-hidden" style={{ border: `2px solid ${errors.mobile ? "var(--color-crimson)" : "rgba(200,150,12,0.25)"}` }}>
                <div className="flex items-center gap-2 px-3 flex-shrink-0" style={{ background: "var(--color-cream)" }}>
                  <span className="text-sm">🇮🇳</span>
                  <span className="font-dm-sans font-bold text-sm" style={{ color: "var(--color-brown)" }}>+91</span>
                </div>
                <input type="tel" inputMode="numeric" value={form.mobile}
                  onChange={(e) => set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="98765 43210" autoComplete="tel-national"
                  className="flex-1 px-3.5 py-3 font-dm-sans text-sm bg-white outline-none"
                  style={{ color: "var(--color-brown)" }} />
              </div>
              {errors.mobile && <p className="font-dm-sans text-xs mt-1" style={{ color: "var(--color-crimson)" }}>⚠️ {errors.mobile}</p>}
            </Field>

            <Field label="House / Flat / Building" id="address_line1" required>
              <input id="address_line1" type="text" value={form.address_line1}
                onChange={(e) => set("address_line1", e.target.value)}
                placeholder="Flat 4B, Green Valley Apartments" autoComplete="address-line1"
                className={inputClass(errors.address_line1)} style={inputStyle(errors.address_line1)} />
            </Field>

            <Field label="Street / Area / Locality" id="address_line2">
              <input id="address_line2" type="text" value={form.address_line2 || ""}
                onChange={(e) => set("address_line2", e.target.value)}
                placeholder="Beside HDFC Bank, Madhapur" autoComplete="address-line2"
                className={inputClass("")} style={inputStyle("")} />
            </Field>

            <Field label="Landmark" id="landmark">
              <input id="landmark" type="text" value={form.landmark || ""}
                onChange={(e) => set("landmark", e.target.value)}
                placeholder="Near Durgam Cheruvu" autoComplete="off"
                className={inputClass("")} style={inputStyle("")} />
            </Field>

            <Field label="Pincode" id="pincode" required>
              <div className="relative">
                <input id="pincode" type="text" inputMode="numeric"
                  value={form.pincode}
                  onChange={(e) => handlePincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="500032" maxLength={6}
                  className={inputClass(errors.pincode)} style={inputStyle(errors.pincode)} />
                {pincodeLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 size={16} className="animate-spin" style={{ color: "var(--color-gold)" }} />
                  </div>
                )}
              </div>
              {form.city && form.state && !pincodeLoading && (
                <p className="font-dm-sans text-xs mt-1 flex items-center gap-1" style={{ color: "#2E7D32" }}>
                  <Check size={12} />Auto-filled: {form.city}, {form.state}
                </p>
              )}
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="City" id="city" required>
                <input id="city" type="text" value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="Hyderabad" autoComplete="address-level2"
                  className={inputClass(errors.city)} style={inputStyle(errors.city)} />
              </Field>

              <Field label="State" id="state" required>
                <select id="state" value={form.state}
                  onChange={(e) => set("state", e.target.value)}
                  className={inputClass(errors.state)}
                  style={{ ...inputStyle(errors.state), cursor: "pointer" }}>
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t flex-shrink-0 flex gap-3"
            style={{ borderColor: "rgba(200,150,12,0.1)" }}>
            <button onClick={onClose} className="btn-ghost flex-1 py-3 text-sm">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={saving}
              className="btn-primary flex-1 py-3 text-sm gap-2 disabled:opacity-60">
              {saving
                ? <><Loader2 size={16} className="animate-spin" />Saving…</>
                : <><Check size={16} />{initial?.id ? "Update Address" : "Save Address"}</>
              }
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Address Card ─────────────────────────────────────────────────────────
function AddressCard({
  address, onSetDefault, onEdit, onDelete,
}: {
  address: Address;
  onSetDefault: (id: string) => void;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md"
      style={{
        background: "white",
        border: `2px solid ${address.is_default ? "rgba(200,150,12,0.3)" : "rgba(200,150,12,0.12)"}`,
        boxShadow: address.is_default ? "0 4px 16px rgba(200,150,12,0.12)" : "0 2px 8px rgba(74,44,10,0.05)",
      }}>
      <div className="h-[2px]" style={{
        background: address.is_default
          ? "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)"
          : "rgba(200,150,12,0.08)",
      }} />

      <div className="flex items-start gap-4 px-5 py-4">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: address.is_default ? "rgba(200,150,12,0.1)" : "rgba(200,150,12,0.06)" }}>
          <MapPin size={18} style={{ color: address.is_default ? "var(--color-gold)" : "var(--color-grey)" }} />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-dm-sans font-bold text-sm" style={{ color: "var(--color-brown)" }}>
              {address.full_name}
            </p>
            {address.is_default && (
              <span className="px-2 py-0.5 rounded-full font-dm-sans text-xs font-bold"
                style={{ background: "rgba(200,150,12,0.12)", color: "var(--color-gold)" }}>
                ⭐ Default
              </span>
            )}
          </div>
          <p className="font-dm-sans text-sm mt-1 leading-relaxed" style={{ color: "var(--color-grey)" }}>
            {address.address_line1}
            {address.address_line2 && `, ${address.address_line2}`}
            {address.landmark && ` (Near ${address.landmark})`}
          </p>
          <p className="font-dm-sans text-sm" style={{ color: "var(--color-grey)" }}>
            {address.city}, {address.state} — {address.pincode}
          </p>
          <p className="font-dm-sans text-sm mt-0.5 flex items-center gap-1.5" style={{ color: "var(--color-brown)" }}>
            <Phone size={12} />+91 {address.mobile}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap px-5 py-3 border-t"
        style={{ borderColor: "rgba(200,150,12,0.08)", background: "rgba(200,150,12,0.02)" }}>
        {!address.is_default && (
          <button onClick={() => onSetDefault(address.id)}
            className="flex items-center gap-1.5 font-dm-sans text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:scale-105"
            style={{ background: "rgba(200,150,12,0.1)", color: "var(--color-gold)", border: "1px solid rgba(200,150,12,0.2)" }}>
            <Check size={12} />Set as Default
          </button>
        )}
        <button onClick={() => onEdit(address)}
          className="flex items-center gap-1.5 font-dm-sans text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:scale-105"
          style={{ background: "rgba(74,44,10,0.06)", color: "var(--color-brown)", border: "1px solid rgba(74,44,10,0.12)" }}>
          <Edit3 size={12} />Edit
        </button>
        <button onClick={() => onDelete(address.id)}
          className="flex items-center gap-1.5 font-dm-sans text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:scale-105 ml-auto"
          style={{ background: "rgba(192,39,45,0.06)", color: "var(--color-crimson)", border: "1px solid rgba(192,39,45,0.15)" }}>
          <Trash2 size={12} />Remove
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Address | undefined>();

  useEffect(() => {
    fetchAddresses();
  }, []);

  async function fetchAddresses() {
    try {
      const res = await fetch("/api/account/addresses");
      const data = await res.json();
      setAddresses(data.addresses || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  async function handleSave(form: Omit<Address, "id" | "is_default">) {
    if (editTarget && !editTarget.id.startsWith("local-")) {
      // Update existing in DB
      const res = await fetch(`/api/account/addresses/${editTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to update");
      toast.success("Address updated!");
    } else {
      // Create new in DB
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to save");
      toast.success("Address saved!");
    }
    setEditTarget(undefined);
    fetchAddresses(); // refresh from DB
  }

  function handleEdit(address: Address) {
    setEditTarget(address);
    setModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this address?")) return;
    const res = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Failed to remove address"); return; }
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.success("Address removed");
  }

  async function handleSetDefault(id: string) {
    const res = await fetch(`/api/account/addresses/${id}`, { method: "PATCH" });
    if (!res.ok) { toast.error("Failed to update default"); return; }
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, is_default: a.id === id }))
    );
    toast.success("Default address updated!");
  }

  return (
    <>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-playfair font-bold text-2xl" style={{ color: "var(--color-brown)" }}>
              Saved Addresses
            </h2>
            <p className="font-dm-sans text-sm mt-0.5" style={{ color: "var(--color-grey)" }}>
              {addresses.length} saved address{addresses.length !== 1 ? "es" : ""}
            </p>
          </div>
          <button
            onClick={() => { setEditTarget(undefined); setModalOpen(true); }}
            className="btn-primary py-2.5 px-4 text-sm gap-2"
          >
            <Plus size={16} />Add New
          </button>
        </div>

        {/* Loading */}
        {loading && [1, 2].map((i) => (
          <div key={i} className="h-[150px] rounded-2xl animate-pulse"
            style={{ background: "rgba(200,150,12,0.07)", border: "1px solid rgba(200,150,12,0.1)" }} />
        ))}

        {/* Empty state */}
        {!loading && addresses.length === 0 && (
          <div className="rounded-2xl p-12 text-center flex flex-col items-center gap-5"
            style={{ background: "white", border: "1px solid rgba(200,150,12,0.12)", boxShadow: "0 2px 12px rgba(74,44,10,0.05)" }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "var(--color-cream)", border: "2px dashed rgba(200,150,12,0.25)" }}>
              <MapPin size={32} strokeWidth={1.5} style={{ color: "var(--color-gold)", opacity: 0.6 }} />
            </div>
            <div>
              <h3 className="font-playfair font-bold text-lg" style={{ color: "var(--color-brown)" }}>
                No addresses saved yet
              </h3>
              <p className="font-dm-sans text-sm mt-1" style={{ color: "var(--color-grey)" }}>
                Add your delivery address for faster checkout
              </p>
            </div>
            <button onClick={() => setModalOpen(true)} className="btn-primary py-3 px-8 gap-2">
              <Plus size={17} />Add First Address
            </button>
          </div>
        )}

        {/* Address cards */}
        {!loading && addresses.length > 0 && (
          <>
            <div className="flex flex-col gap-4">
              {addresses.map((addr) => (
                <AddressCard
                  key={addr.id}
                  address={addr}
                  onSetDefault={handleSetDefault}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
            <div className="px-4 py-3 rounded-xl flex items-start gap-2"
              style={{ background: "rgba(200,150,12,0.05)", border: "1px solid rgba(200,150,12,0.12)" }}>
              <span>💡</span>
              <p className="font-dm-sans text-xs" style={{ color: "var(--color-grey)" }}>
                Your default address is pre-selected at checkout for faster ordering.
                Addresses saved here are only used for your Maa Flavours orders.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Add/Edit modal */}
      <AddressFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(undefined); }}
        onSave={handleSave}
        initial={editTarget}
      />
    </>
  );
}

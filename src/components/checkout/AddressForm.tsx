"use client";
// src/components/checkout/AddressForm.tsx
// Maa Flavours — Delivery Address Form
// Fields: name, mobile, address lines, landmark, pincode (auto-fill), city, state
// React Hook Form validation with Zod schema
// On submit → moves checkout to payment step

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, MapPin, CheckCircle2 } from "lucide-react";
import { useCheckoutStore, DeliveryAddress } from "@/store/checkoutStore";
import PincodeField from "./PincodeField";

// ─── Validation schema ──────────────────────────────────────────────────────
const AddressSchema = z.object({
  full_name: z.string().min(2, "Please enter your full name").max(80),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  address_line1: z.string().min(5, "Please enter your flat/house/building").max(120),
  address_line2: z.string().max(120).optional().default(""),
  landmark: z.string().max(80).optional().default(""),
  pincode: z
    .string()
    .regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  city: z.string().min(2, "City is required").max(60),
  state: z.string().min(2, "State is required").max(60),
});

type AddressFormData = z.infer<typeof AddressSchema>;

// ─── Indian states list ─────────────────────────────────────────────────────
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

// ─── Reusable field wrapper ─────────────────────────────────────────────────
function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="block font-dm-sans text-sm font-semibold mb-1.5"
        style={{ color: "var(--color-brown)" }}
      >
        {label}
        {required && <span style={{ color: "var(--color-crimson)" }}> *</span>}
      </label>
      {children}
      {error && (
        <p
          className="font-dm-sans text-xs mt-1"
          style={{ color: "var(--color-crimson)" }}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Input styling helper ───────────────────────────────────────────────────
function inputClass(hasError?: boolean) {
  return `input-brand w-full ${hasError ? "border-crimson" : ""}`;
}

type SavedAddress = {
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
};

export default function AddressForm() {
  const { address, updateAddress, setStep, pincodeData } = useCheckoutStore();
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    resolver: zodResolver(AddressSchema),
    defaultValues: {
      full_name: address.full_name,
      mobile: address.mobile,
      address_line1: address.address_line1,
      address_line2: address.address_line2,
      landmark: address.landmark,
      pincode: address.pincode,
      city: address.city,
      state: address.state,
    },
  });

  const pincode = watch("pincode");

  // ─── Fetch saved addresses ────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/account/addresses")
      .then(r => r.json())
      .then(d => { if (d.addresses?.length) setSavedAddresses(d.addresses); })
      .catch(() => {});
  }, []);

  // ─── Fill form from saved address ────────────────────────────────────
  const fillFromSaved = (a: SavedAddress) => {
    setSelectedSavedId(a.id);
    setValue("full_name",     a.full_name,       { shouldValidate: true });
    setValue("mobile",        a.mobile,          { shouldValidate: true });
    setValue("address_line1", a.address_line1,   { shouldValidate: true });
    setValue("address_line2", a.address_line2 || "");
    setValue("landmark",      a.landmark || "");
    setValue("pincode",       a.pincode,         { shouldValidate: true });
    setValue("city",          a.city,            { shouldValidate: true });
    setValue("state",         a.state,           { shouldValidate: true });
  };

  // ─── Sync auto-filled city/state from pincode lookup ─────────────────
  useEffect(() => {
    if (pincodeData.isValid && pincodeData.city) {
      setValue("city", pincodeData.city, { shouldValidate: true });
      setValue("state", pincodeData.state, { shouldValidate: true });
    }
  }, [pincodeData.city, pincodeData.state, pincodeData.isValid, setValue]);

  const onSubmit = (data: AddressFormData) => {
    updateAddress({
      full_name: data.full_name,
      mobile: data.mobile,
      address_line1: data.address_line1,
      address_line2: data.address_line2 || "",
      landmark: data.landmark || "",
      pincode: data.pincode,
      city: data.city,
      state: data.state,
    });
    setStep("payment");
    // Scroll to top on mobile
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "white",
          border: "1px solid rgba(200,150,12,0.15)",
          boxShadow: "0 2px 16px rgba(74,44,10,0.06)",
        }}
      >
        {/* ─── Gold top ornament ─────────────────────────────────────── */}
        <div
          className="h-[3px]"
          style={{
            background: "linear-gradient(90deg, transparent, var(--color-gold) 25%, var(--color-gold-light) 50%, var(--color-gold) 75%, transparent)",
          }}
        />

        {/* ─── Card Header ──────────────────────────────────────────── */}
        <div
          className="flex items-center gap-3 px-6 py-5 border-b"
          style={{ borderColor: "rgba(200,150,12,0.1)" }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: "rgba(192,39,45,0.09)",
              border: "1.5px solid rgba(192,39,45,0.2)",
            }}
          >
            <MapPin size={16} style={{ color: "var(--color-crimson)" }} />
          </div>
          <div>
            <h2
              className="font-playfair font-bold text-lg"
              style={{ color: "var(--color-brown)" }}
            >
              Delivery Address
            </h2>
            <p
              className="font-dm-sans text-xs mt-0.5"
              style={{ color: "var(--color-grey)" }}
            >
              Enter where you'd like your pickles delivered
            </p>
          </div>
        </div>

        {/* ─── Saved Addresses ──────────────────────────────────────── */}
        {savedAddresses.length > 0 && (
          <div className="px-6 pt-5 pb-1">
            <p className="font-dm-sans text-xs font-semibold mb-3 uppercase tracking-wide"
              style={{ color: "var(--color-grey)" }}>
              Saved Addresses
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
              {savedAddresses.map(a => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => fillFromSaved(a)}
                  className="flex-shrink-0 w-56 text-left rounded-xl p-3 transition-all duration-200 relative"
                  style={{
                    border: `1.5px solid ${selectedSavedId === a.id ? "var(--color-crimson)" : "rgba(200,150,12,0.25)"}`,
                    background: selectedSavedId === a.id ? "rgba(192,39,45,0.04)" : "var(--color-cream)",
                  }}
                >
                  {selectedSavedId === a.id && (
                    <CheckCircle2 size={14} className="absolute top-2.5 right-2.5"
                      style={{ color: "var(--color-crimson)" }} />
                  )}
                  {a.is_default && (
                    <span className="inline-block font-dm-sans text-[10px] font-semibold px-1.5 py-0.5 rounded-full mb-1"
                      style={{ background: "rgba(200,150,12,0.12)", color: "var(--color-gold)" }}>
                      Default
                    </span>
                  )}
                  <p className="font-dm-sans text-sm font-semibold truncate"
                    style={{ color: "var(--color-brown)" }}>{a.full_name}</p>
                  <p className="font-dm-sans text-xs mt-0.5 truncate"
                    style={{ color: "var(--color-grey)" }}>{a.address_line1}</p>
                  <p className="font-dm-sans text-xs truncate"
                    style={{ color: "var(--color-grey)" }}>{a.city}, {a.pincode}</p>
                </button>
              ))}
            </div>
            <div className="mt-3 mb-1 flex items-center gap-2">
              <div className="h-px flex-1" style={{ background: "rgba(200,150,12,0.15)" }} />
              <span className="font-dm-sans text-xs" style={{ color: "var(--color-grey)" }}>or enter manually</span>
              <div className="h-px flex-1" style={{ background: "rgba(200,150,12,0.15)" }} />
            </div>
          </div>
        )}

        {/* ─── Form Fields ──────────────────────────────────────────── */}
        <div className="px-6 py-6 flex flex-col gap-5">
          {/* Row 1: Name + Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" required error={errors.full_name?.message}>
              <input
                {...register("full_name")}
                type="text"
                placeholder="e.g. Priya Reddy"
                className={inputClass(!!errors.full_name)}
                autoComplete="name"
              />
            </Field>

            <Field label="Mobile Number" required error={errors.mobile?.message}>
              <div className="relative">
                <span
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 font-dm-sans text-sm font-semibold"
                  style={{ color: "var(--color-grey)" }}
                >
                  +91
                </span>
                <input
                  {...register("mobile")}
                  type="tel"
                  inputMode="numeric"
                  placeholder="10-digit mobile"
                  maxLength={10}
                  className={inputClass(!!errors.mobile)}
                  style={{ paddingLeft: "3rem" }}
                  autoComplete="tel-national"
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setValue("mobile", v, { shouldValidate: true });
                  }}
                />
              </div>
            </Field>
          </div>

          {/* Address Line 1 */}
          <Field label="Flat / House No. / Building" required error={errors.address_line1?.message}>
            <input
              {...register("address_line1")}
              type="text"
              placeholder="e.g. Plot 12, Kaveri Apartments"
              className={inputClass(!!errors.address_line1)}
              autoComplete="address-line1"
            />
          </Field>

          {/* Address Line 2 */}
          <Field label="Area / Street / Colony">
            <input
              {...register("address_line2")}
              type="text"
              placeholder="e.g. Labbipet, Near State Bank"
              className="input-brand w-full"
              autoComplete="address-line2"
            />
          </Field>

          {/* Landmark */}
          <Field label="Landmark (Optional)">
            <input
              {...register("landmark")}
              type="text"
              placeholder="e.g. Opposite SBI ATM"
              className="input-brand w-full"
            />
          </Field>

          {/* Row: Pincode + City + State */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <PincodeField
              value={pincode || ""}
              onChange={(val) => setValue("pincode", val, { shouldValidate: true })}
              error={errors.pincode?.message}
            />

            <Field label="City" required error={errors.city?.message}>
              <input
                {...register("city")}
                type="text"
                placeholder="e.g. Vijayawada"
                className={inputClass(!!errors.city)}
                autoComplete="address-level2"
              />
            </Field>

            <Field label="State" required error={errors.state?.message}>
              <select
                {...register("state")}
                className={inputClass(!!errors.state)}
                style={{
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B6B6B' stroke-width='2'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 10px center",
                  backgroundSize: "16px",
                  paddingRight: "36px",
                }}
              >
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Delivery note */}
          <div
            className="flex items-start gap-3 px-4 py-3 rounded-xl"
            style={{
              background: "rgba(200,150,12,0.05)",
              border: "1px solid rgba(200,150,12,0.15)",
            }}
          >
            <span className="text-lg flex-shrink-0">🚚</span>
            <p
              className="font-dm-sans text-xs leading-relaxed"
              style={{ color: "var(--color-brown)" }}
            >
              We deliver <strong>Pan-India</strong> in 5–7 working days via trusted courier partners.
              Fragile items are bubble-wrapped for safe transit.
            </p>
          </div>
        </div>

        {/* ─── Footer CTA ───────────────────────────────────────────── */}
        <div
          className="px-6 pb-6"
          style={{ borderTop: "1px solid rgba(200,150,12,0.1)", paddingTop: "1.25rem" }}
        >
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-4 text-base gap-3 disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Continue to Payment
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

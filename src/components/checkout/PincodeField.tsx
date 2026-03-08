"use client";
// src/components/checkout/PincodeField.tsx
// Maa Flavours — Smart Pincode Field
// Auto-fills city and state on 6-digit pincode entry via India Post API
// Shows loading spinner, error state, and success checkmark

import { useEffect, useRef } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useCheckoutStore } from "@/store/checkoutStore";

interface PincodeFieldProps {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}

export default function PincodeField({ value, onChange, error }: PincodeFieldProps) {
  const { pincodeData, lookupPincode } = useCheckoutStore();
  const timerRef = useRef<NodeJS.Timeout>();

  // Debounced lookup — fires 600ms after user stops typing
  useEffect(() => {
    clearTimeout(timerRef.current);
    if (value.length === 6) {
      timerRef.current = setTimeout(() => lookupPincode(value), 600);
    }
    return () => clearTimeout(timerRef.current);
  }, [value, lookupPincode]);

  const showSuccess = pincodeData.isValid && value.length === 6;
  const showError = (pincodeData.error || error) && !pincodeData.loading;

  return (
    <div>
      <label
        htmlFor="pincode"
        className="block font-dm-sans text-sm font-semibold mb-1.5"
        style={{ color: "var(--color-brown)" }}
      >
        Pincode *
      </label>

      <div className="relative">
        <input
          id="pincode"
          type="tel"
          inputMode="numeric"
          maxLength={6}
          value={value}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 6);
            onChange(v);
          }}
          placeholder="e.g. 523001"
          className="input-brand w-full pr-10"
          style={{
            borderColor: showSuccess
              ? "#2E7D32"
              : showError
              ? "var(--color-crimson)"
              : undefined,
          }}
          aria-describedby={showError ? "pincode-error" : showSuccess ? "pincode-success" : undefined}
          autoComplete="postal-code"
        />

        {/* Status icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {pincodeData.loading && (
            <Loader2 size={16} className="animate-spin" style={{ color: "var(--color-gold)" }} />
          )}
          {showSuccess && (
            <CheckCircle2 size={16} style={{ color: "#2E7D32" }} />
          )}
          {showError && (
            <AlertCircle size={16} style={{ color: "var(--color-crimson)" }} />
          )}
        </div>
      </div>

      {/* Auto-filled confirmation */}
      {showSuccess && (
        <p
          id="pincode-success"
          className="font-dm-sans text-xs mt-1 flex items-center gap-1"
          style={{ color: "#2E7D32" }}
        >
          ✓ {pincodeData.city}, {pincodeData.state} — auto-filled below
        </p>
      )}

      {/* Error */}
      {showError && (
        <p
          id="pincode-error"
          className="font-dm-sans text-xs mt-1"
          style={{ color: "var(--color-crimson)" }}
          role="alert"
        >
          {pincodeData.error || error}
        </p>
      )}
    </div>
  );
}

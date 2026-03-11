"use client";
// src/components/auth/OtpBoxes.tsx
// Maa Flavours — OTP Input Row (configurable length)
// Auto-advances to next box on digit entry
// Backspace moves to previous box
// Paste support — pastes all digits at once
// All boxes numeric keyboard on mobile (inputMode="numeric")

import { useRef, KeyboardEvent, ClipboardEvent, useEffect } from "react";

interface OtpBoxesProps {
  value: string[];          // length-element array, each "" or single digit
  onChange: (newValue: string[]) => void;
  onComplete?: (otp: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  autoFocus?: boolean;
  length?: number;          // default 6; pass 8 for Supabase 8-digit OTPs
}

export default function OtpBoxes({
  value,
  onChange,
  onComplete,
  disabled = false,
  hasError = false,
  autoFocus = true,
  length = 6,
}: OtpBoxesProps) {
  const last = length - 1;
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(length).fill(null));

  // Auto-focus first empty box on mount
  useEffect(() => {
    if (!autoFocus) return;
    const firstEmpty = value.findIndex((v) => !v);
    const focusIdx = firstEmpty === -1 ? last : firstEmpty;
    inputRefs.current[focusIdx]?.focus();
  }, []); // eslint-disable-line

  const handleChange = (idx: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = [...value];
    next[idx] = digit;
    onChange(next);

    if (digit) {
      if (idx < last) inputRefs.current[idx + 1]?.focus();
      if (next.every((v) => v)) onComplete?.(next.join(""));
    }
  };

  const handleKeyDown = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (value[idx]) {
        const next = [...value];
        next[idx] = "";
        onChange(next);
      } else if (idx > 0) {
        const next = [...value];
        next[idx - 1] = "";
        onChange(next);
        inputRefs.current[idx - 1]?.focus();
      }
      e.preventDefault();
    }

    if (e.key === "ArrowLeft" && idx > 0) inputRefs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < last) inputRefs.current[idx + 1]?.focus();

    if (/^\d$/.test(e.key)) {
      const next = [...value];
      next[idx] = e.key;
      onChange(next);
      if (idx < last) inputRefs.current[idx + 1]?.focus();
      if (next.every((v) => v)) onComplete?.(next.join(""));
      e.preventDefault();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;

    const next = Array(length).fill("").map((_, i) => pasted[i] || "");
    onChange(next);

    const focusIdx = Math.min(pasted.length, last);
    inputRefs.current[focusIdx]?.focus();

    if (next.every((v) => v)) onComplete?.(next.join(""));
  };

  return (
    <div
      className="flex items-center justify-center gap-2 sm:gap-2"
      role="group"
      aria-label="OTP input"
    >
      {value.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => { inputRefs.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          className="text-center font-dm-sans font-bold transition-all duration-200 focus:outline-none rounded-xl disabled:opacity-50"
          style={{
            fontSize: length > 6 ? "1.1rem" : "1.5rem",
            width: length > 6 ? "clamp(32px, 9vw, 42px)" : "clamp(40px, 11vw, 52px)",
            height: length > 6 ? "clamp(42px, 11vw, 52px)" : "clamp(52px, 14vw, 64px)",
            background: digit ? "rgba(192,39,45,0.05)" : "var(--color-cream)",
            border: `2px solid ${
              hasError
                ? "var(--color-crimson)"
                : digit
                ? "var(--color-crimson)"
                : "rgba(200,150,12,0.25)"
            }`,
            color: "var(--color-brown)",
            boxShadow: digit ? "0 0 0 3px rgba(192,39,45,0.08)" : "none",
            caretColor: "var(--color-crimson)",
          }}
          aria-label={`OTP digit ${idx + 1}`}
        />
      ))}
    </div>
  );
}

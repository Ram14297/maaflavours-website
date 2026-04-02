"use client";
// src/components/auth/OtpBoxes.tsx
// Maa Flavours — Dynamic OTP Input Row (currently 6 digits)
// Auto-advances to next box on digit entry
// Backspace moves to previous box
// Paste support — pastes all digits at once
// All boxes numeric keyboard on mobile (inputMode="numeric")

import { useRef, KeyboardEvent, ClipboardEvent, useEffect } from "react";

interface OtpBoxesProps {
  value: string[];          // array of "" or single digit, length = OTP length
  onChange: (newValue: string[]) => void;
  onComplete?: (otp: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  autoFocus?: boolean;
}

export default function OtpBoxes({
  value,
  onChange,
  onComplete,
  disabled = false,
  hasError = false,
  autoFocus = true,
}: OtpBoxesProps) {
  const len = value.length;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first empty box on mount
  useEffect(() => {
    if (!autoFocus) return;
    const firstEmpty = value.findIndex((v) => !v);
    const focusIdx = firstEmpty === -1 ? len - 1 : firstEmpty;
    inputRefs.current[focusIdx]?.focus();
  }, []); // eslint-disable-line

  const handleChange = (idx: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1); // keep only last digit
    const next = [...value];
    next[idx] = digit;
    onChange(next);

    if (digit) {
      // Move to next box
      if (idx < len - 1) {
        inputRefs.current[idx + 1]?.focus();
      }
      // Auto-submit when all filled
      if (next.every((v) => v)) {
        onComplete?.(next.join(""));
      }
    }
  };

  const handleKeyDown = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (value[idx]) {
        // Clear current box
        const next = [...value];
        next[idx] = "";
        onChange(next);
      } else if (idx > 0) {
        // Move back and clear previous
        const next = [...value];
        next[idx - 1] = "";
        onChange(next);
        inputRefs.current[idx - 1]?.focus();
      }
      e.preventDefault();
    }

    if (e.key === "ArrowLeft" && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowRight" && idx < len - 1) {
      inputRefs.current[idx + 1]?.focus();
    }

    // Allow re-entering same digit
    if (/^\d$/.test(e.key)) {
      const next = [...value];
      next[idx] = e.key;
      onChange(next);
      if (idx < len - 1) inputRefs.current[idx + 1]?.focus();
      if (next.every((v) => v)) onComplete?.(next.join(""));
      e.preventDefault();
    }
  };

  // Handle paste: paste OTP from clipboard
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, len);
    if (!pasted) return;

    const next = Array(len)
      .fill("")
      .map((_, i) => pasted[i] || "");
    onChange(next);

    // Focus last filled or last box
    const focusIdx = Math.min(pasted.length, len - 1);
    inputRefs.current[focusIdx]?.focus();

    if (next.every((v) => v)) {
      onComplete?.(next.join(""));
    }
  };

  return (
    <div
      className="flex items-center justify-center gap-2 px-2"
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
          className="text-center font-dm-sans font-bold text-xl transition-all duration-200 focus:outline-none rounded-xl disabled:opacity-50"
          style={{
            width: "clamp(36px, 9vw, 48px)",
            height: "clamp(44px, 11vw, 56px)",
            background: digit
              ? "rgba(192,39,45,0.05)"
              : "var(--color-cream)",
            border: `2px solid ${
              hasError
                ? "var(--color-crimson)"
                : digit
                ? "var(--color-crimson)"
                : "rgba(200,150,12,0.25)"
            }`,
            color: "var(--color-brown)",
            boxShadow: digit
              ? "0 0 0 3px rgba(192,39,45,0.08)"
              : "none",
            caretColor: "var(--color-crimson)",
          }}
          aria-label={`OTP digit ${idx + 1}`}
        />
      ))}
    </div>
  );
}

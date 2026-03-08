"use client";
// src/components/auth/ResendTimer.tsx
// Maa Flavours — OTP Resend Timer
// Shows "Resend OTP in 0:30" countdown
// After 30s shows clickable "Resend OTP" link
// Resets on each resend

import { useState, useEffect, useCallback } from "react";

interface ResendTimerProps {
  onResend: () => Promise<void>;
  initialSeconds?: number;
}

export default function ResendTimer({
  onResend,
  initialSeconds = 30,
}: ResendTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isResending, setIsResending] = useState(false);

  // Count down
  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const handleResend = useCallback(async () => {
    setIsResending(true);
    try {
      await onResend();
      setSeconds(initialSeconds); // Reset countdown
    } finally {
      setIsResending(false);
    }
  }, [onResend, initialSeconds]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display = `${mins}:${secs.toString().padStart(2, "0")}`;

  if (seconds > 0) {
    return (
      <p
        className="font-dm-sans text-sm text-center"
        style={{ color: "var(--color-grey)" }}
      >
        Resend OTP in{" "}
        <span className="font-bold tabular-nums" style={{ color: "var(--color-brown)" }}>
          {display}
        </span>
      </p>
    );
  }

  return (
    <p
      className="font-dm-sans text-sm text-center"
      style={{ color: "var(--color-grey)" }}
    >
      Didn't receive the OTP?{" "}
      <button
        type="button"
        onClick={handleResend}
        disabled={isResending}
        className="font-bold underline transition-opacity disabled:opacity-50 hover:no-underline"
        style={{ color: "var(--color-crimson)" }}
      >
        {isResending ? "Sending…" : "Resend OTP"}
      </button>
    </p>
  );
}

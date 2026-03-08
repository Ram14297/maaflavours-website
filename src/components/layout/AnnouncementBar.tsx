"use client";
// src/components/layout/AnnouncementBar.tsx
// Maa Flavours — Sticky announcement bar at the very top
// Crimson background, gold text, dismissible, auto-rotating messages

import { useState, useEffect } from "react";
import { X } from "lucide-react";

const MESSAGES = [
  "🚚 Free Shipping on orders above ₹499 — Pan-India Delivery",
  "🌿 No Preservatives. No Shortcuts. Just Pure Andhra Flavour.",
  "✅ 100% Homemade & Vegetarian — Handcrafted in Ongole",
];

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  // Check if user dismissed it this session
  useEffect(() => {
    const dismissed = sessionStorage.getItem("mf_announcement_dismissed");
    if (dismissed) setVisible(false);
  }, []);

  // Rotate messages every 4 seconds
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % MESSAGES.length);
        setAnimating(false);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, [visible]);

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem("mf_announcement_dismissed", "true");
  };

  if (!visible) return null;

  return (
    <div
      className="relative z-announcement"
      style={{
        background: "var(--color-crimson)",
        borderBottom: "1px solid rgba(200, 150, 12, 0.3)",
      }}
    >
      <div className="section-container flex items-center justify-center gap-3 py-2.5 px-10">
        {/* Message with fade transition */}
        <p
          className="text-center font-dm-sans text-sm font-medium tracking-wide transition-opacity duration-300"
          style={{
            color: "var(--color-gold-light)",
            opacity: animating ? 0 : 1,
          }}
        >
          {MESSAGES[currentIndex]}
        </p>

        {/* Dot indicators */}
        <div className="hidden sm:flex items-center gap-1 absolute right-12">
          {MESSAGES.map((_, i) => (
            <span
              key={i}
              className="block rounded-full transition-all duration-300"
              style={{
                width: i === currentIndex ? "16px" : "5px",
                height: "5px",
                backgroundColor:
                  i === currentIndex
                    ? "var(--color-gold-light)"
                    : "rgba(232, 184, 75, 0.35)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-all duration-200 hover:bg-white/10"
        aria-label="Dismiss announcement"
        style={{ color: "var(--color-gold-light)" }}
      >
        <X size={15} strokeWidth={2.5} />
      </button>
    </div>
  );
}

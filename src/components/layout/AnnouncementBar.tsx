"use client";
// src/components/layout/AnnouncementBar.tsx
// Maa Flavours — Sticky announcement bar at the very top
// Messages controlled from Admin → Settings → Announcement
// Pipe-separated messages auto-rotate every 4 seconds
// Dismissible per session

import { useState, useEffect } from "react";
import { X } from "lucide-react";

const FALLBACK_MESSAGES = [
  "🚚 Free Shipping on orders above ₹899 — Pan-India Delivery",
  "🌿 No Preservatives. No Shortcuts. Just Pure Andhra Flavour.",
];

export default function AnnouncementBar() {
  const [messages, setMessages]   = useState<string[]>([]);
  const [enabled, setEnabled]     = useState(false);
  const [visible, setVisible]     = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  // Fetch settings from public API
  useEffect(() => {
    const dismissed = sessionStorage.getItem("mf_announcement_dismissed");
    if (dismissed) return; // Don't even fetch if dismissed this session

    fetch("/api/settings/public")
      .then(r => r.json())
      .then(data => {
        const ann = data?.announcement;
        if (ann?.enabled && ann?.text) {
          const msgs = (ann.text as string)
            .split("|")
            .map((m: string) => m.trim())
            .filter(Boolean);
          setMessages(msgs.length ? msgs : FALLBACK_MESSAGES);
          setEnabled(true);
          setVisible(true);
        }
      })
      .catch(() => {}); // Silent fail — bar just won't show
  }, []);

  // Rotate messages every 4 seconds
  useEffect(() => {
    if (!visible || messages.length <= 1) return;
    const interval = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % messages.length);
        setAnimating(false);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, [visible, messages.length]);

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem("mf_announcement_dismissed", "true");
  };

  if (!visible || !enabled || messages.length === 0) return null;

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
          {messages[currentIndex]}
        </p>

        {/* Dot indicators — only if multiple messages */}
        {messages.length > 1 && (
          <div className="hidden sm:flex items-center gap-1 absolute right-12">
            {messages.map((_, i) => (
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
        )}
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

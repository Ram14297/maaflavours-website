"use client";
// src/components/order/ShareOrderCard.tsx
// Maa Flavours — Share Order / Referral Card
// WhatsApp share button with pre-filled message
// Referral message tailored for Andhra audiences

import { MessageCircle, Copy, Check } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface ShareOrderCardProps {
  orderId: string;
  customerName?: string;
}

export default function ShareOrderCard({
  orderId,
  customerName,
}: ShareOrderCardProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `https://maaflavours.com`;
  const shareMessage = `Hey! I just ordered authentic Andhra homemade pickles from Maa Flavours 🫙🌶️ — no preservatives, handmade in Ongole. Try them at ${shareUrl} — use code WELCOME50 for ₹50 off!`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, var(--color-cream) 0%, rgba(200,150,12,0.06) 100%)",
        border: "1px solid rgba(200,150,12,0.2)",
      }}
    >
      {/* Gold ornament */}
      <div
        className="h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--color-gold) 25%, var(--color-gold-light) 50%, var(--color-gold) 75%, transparent)",
        }}
      />

      <div className="p-5 text-center">
        {/* Decorative jar */}
        <div className="text-4xl mb-3">🫙❤️</div>

        <h3
          className="font-dancing text-2xl mb-1.5"
          style={{ color: "var(--color-crimson)" }}
        >
          "Share Maa's Flavours"
        </h3>

        <p
          className="font-cormorant italic text-lg mb-4 leading-snug"
          style={{ color: "var(--color-grey)" }}
        >
          Every jar brings a little taste of home.
          <br />
          Share with people you love.
        </p>

        {/* Share buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-dm-sans font-semibold text-sm text-white transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
            style={{
              background: "#25D366",
              boxShadow: "0 4px 14px rgba(37,211,102,0.3)",
            }}
          >
            <MessageCircle size={18} />
            Share on WhatsApp
          </a>

          {/* Copy link */}
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-dm-sans font-semibold text-sm transition-all duration-200"
            style={{
              border: "1.5px solid rgba(200,150,12,0.25)",
              color: "var(--color-brown)",
              background: "white",
            }}
          >
            {copied ? (
              <>
                <Check size={16} style={{ color: "#2E7D32" }} />
                <span style={{ color: "#2E7D32" }}>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                Copy Link
              </>
            )}
          </button>
        </div>

        {/* Coupon hint */}
        <div
          className="flex items-center justify-center gap-2 mt-4 px-4 py-2.5 rounded-xl"
          style={{
            background: "rgba(192,39,45,0.06)",
            border: "1px dashed rgba(192,39,45,0.2)",
          }}
        >
          <span className="text-base">🏷️</span>
          <p
            className="font-dm-sans text-xs font-medium"
            style={{ color: "var(--color-brown)" }}
          >
            Friends get{" "}
            <strong
              className="font-bold"
              style={{ color: "var(--color-crimson)" }}
            >
              ₹50 off
            </strong>{" "}
            with code{" "}
            <strong
              className="px-1.5 py-0.5 rounded font-bold tracking-widest"
              style={{
                background: "rgba(192,39,45,0.1)",
                color: "var(--color-crimson)",
                letterSpacing: "0.05em",
              }}
            >
              WELCOME50
            </strong>{" "}
            on their first order
          </p>
        </div>
      </div>
    </div>
  );
}

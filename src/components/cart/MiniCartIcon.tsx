"use client";
// src/components/cart/MiniCartIcon.tsx
// Maa Flavours — Mini Cart Icon button with live item count badge
// Connects to Zustand store — renders live count without prop drilling
// Use anywhere in the UI where a cart trigger is needed

import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

interface MiniCartIconProps {
  size?: number;
  className?: string;
}

export default function MiniCartIcon({
  size = 22,
  className = "",
}: MiniCartIconProps) {
  const { itemCount, openCart } = useCartStore();
  const count = itemCount();

  return (
    <button
      onClick={openCart}
      className={`relative p-2 rounded-xl transition-all duration-200 hover:bg-cream hover:scale-105 ${className}`}
      aria-label={`Open cart — ${count} item${count !== 1 ? "s" : ""}`}
      style={{ color: "var(--color-brown)" }}
    >
      <ShoppingBag size={size} strokeWidth={1.75} />

      {/* Count badge */}
      {count > 0 && (
        <span
          className="absolute -top-1 -right-1 flex items-center justify-center font-dm-sans font-bold text-white rounded-full leading-none"
          style={{
            background: "var(--color-crimson)",
            minWidth: "18px",
            height: "18px",
            fontSize: "0.625rem",
            padding: "0 4px",
            boxShadow: "0 1px 4px rgba(192,39,45,0.4)",
            animation: count > 0 ? "pulseGold 0.3s ease" : "none",
          }}
          aria-hidden="true"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

"use client";
// src/components/cart/CartFlyout.tsx
// Maa Flavours — Hover Cart Flyout Preview
// Small dropdown above cart icon showing 2 items + total + go-to-cart CTA
// Appears on desktop hover of the cart icon in Navbar

import { useRef, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";

interface CartFlyoutProps {
  onClose: () => void;
  onViewCart: () => void;
}

export default function CartFlyout({ onClose, onViewCart }: CartFlyoutProps) {
  const { items, total, itemCount, openCart } = useCartStore();
  const count = itemCount();
  const tot = total();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const previewItems = items.slice(0, 2);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-[300px] rounded-2xl overflow-hidden z-50"
      style={{
        background: "var(--color-warm-white)",
        border: "1px solid rgba(200,150,12,0.18)",
        boxShadow: "0 12px 40px rgba(74,44,10,0.14)",
        animation: "scaleIn 0.15s ease-out",
        transformOrigin: "top right",
      }}
      role="region"
      aria-label="Cart preview"
    >
      {/* Gold top ornament */}
      <div
        className="h-[3px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--color-gold) 30%, var(--color-gold-light) 50%, var(--color-gold) 70%, transparent)",
        }}
      />

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "rgba(200,150,12,0.1)" }}
      >
        <div className="flex items-center gap-2">
          <ShoppingBag size={16} style={{ color: "var(--color-brown)" }} strokeWidth={1.75} />
          <span className="font-dm-sans font-semibold text-sm" style={{ color: "var(--color-brown)" }}>
            Your Cart ({count} item{count !== 1 ? "s" : ""})
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg transition-colors hover:bg-cream"
          style={{ color: "var(--color-grey)" }}
          aria-label="Close preview"
        >
          <X size={14} />
        </button>
      </div>

      {/* Items preview */}
      {previewItems.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <div className="text-2xl mb-2">🫙</div>
          <p className="font-dm-sans text-sm" style={{ color: "var(--color-grey)" }}>
            Your cart is empty
          </p>
          <Link
            href="/products"
            onClick={onClose}
            className="btn-primary mt-3 py-2 px-4 text-xs inline-flex"
          >
            Browse Pickles
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col px-3 py-2">
            {previewItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-2.5 border-b last:border-0"
                style={{ borderColor: "rgba(200,150,12,0.08)" }}>
                {/* Emoji image placeholder */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                  style={{
                    background: "var(--color-cream)",
                    border: "1px solid rgba(200,150,12,0.15)",
                  }}
                >
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-dm-sans font-semibold text-xs truncate"
                    style={{ color: "var(--color-brown)" }}
                  >
                    {item.productName}
                  </p>
                  <p className="font-dm-sans text-xs" style={{ color: "var(--color-grey)" }}>
                    {item.variantLabel} × {item.quantity}
                  </p>
                </div>
                <span className="font-dm-sans font-bold text-sm flex-shrink-0"
                  style={{ color: "var(--color-crimson)" }}>
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
            {items.length > 2 && (
              <p className="font-dm-sans text-xs text-center py-2" style={{ color: "var(--color-grey)" }}>
                +{items.length - 2} more item{items.length - 2 > 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Footer */}
          <div
            className="px-4 py-3 border-t flex flex-col gap-2"
            style={{ borderColor: "rgba(200,150,12,0.1)", background: "var(--color-cream)" }}
          >
            <div className="flex items-center justify-between">
              <span className="font-dm-sans text-sm" style={{ color: "var(--color-grey)" }}>Total</span>
              <span className="font-playfair font-bold text-base" style={{ color: "var(--color-crimson)" }}>
                {formatPrice(tot)}
              </span>
            </div>
            <button
              onClick={() => { onClose(); onViewCart(); }}
              className="btn-primary w-full py-2.5 text-sm justify-center"
            >
              View Cart & Checkout →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

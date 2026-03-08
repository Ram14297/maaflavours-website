"use client";
// src/components/cart/CartLineItem.tsx
// Maa Flavours — Single cart line item row inside the cart drawer
// Shows: product image/emoji, name, variant, qty controls, price, remove button

import { useState } from "react";
import Link from "next/link";
import { Trash2, Minus, Plus } from "lucide-react";
import { CartLineItem as CartLineItemType } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";

interface CartLineItemProps {
  item: CartLineItemType;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

export default function CartLineItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: CartLineItemProps) {
  const [removing, setRemoving] = useState(false);

  const handleRemove = () => {
    setRemoving(true);
    setTimeout(() => onRemove(item.id), 250);
  };

  const lineTotal = item.unitPrice * item.quantity;

  return (
    <div
      className="flex gap-3.5 py-4 border-b last:border-0 transition-all duration-250"
      style={{
        borderColor: "rgba(200,150,12,0.1)",
        opacity: removing ? 0 : 1,
        transform: removing ? "translateX(20px)" : "none",
      }}
    >
      {/* ─── Product Image ──────────────────────────────────────────────── */}
      {/* REPLACE with actual product image */}
      <Link
        href={`/products/${item.productSlug}`}
        className="flex-shrink-0 rounded-xl overflow-hidden flex items-center justify-center relative"
        style={{
          width: "72px",
          height: "72px",
          background: "linear-gradient(135deg, var(--color-cream) 0%, var(--color-cream-dark) 100%)",
          border: "1px solid rgba(200,150,12,0.15)",
        }}
        tabIndex={-1}
        aria-label={`View ${item.productName}`}
      >
        <span className="text-3xl" style={{ filter: "drop-shadow(0 2px 4px rgba(74,44,10,0.15))" }}>
          {item.emoji}
        </span>
        {/* Veg dot */}
        <span
          className="absolute bottom-1 right-1 w-3.5 h-3.5 flex items-center justify-center rounded"
          style={{ background: "white", border: "1px solid #2E7D32" }}
        >
          <span className="block w-2 h-2 rounded-full" style={{ background: "#2E7D32" }} />
        </span>
      </Link>

      {/* ─── Details ────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 gap-1">
        {/* Name + remove */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/products/${item.productSlug}`}>
              <h4
                className="font-dm-sans font-semibold text-sm leading-tight truncate hover:underline"
                style={{ color: "var(--color-brown)" }}
              >
                {item.productName}
              </h4>
            </Link>
            <p
              className="font-dm-sans text-xs mt-0.5"
              style={{ color: "var(--color-grey)" }}
            >
              {item.variantLabel} · {formatPrice(item.unitPrice)} each
            </p>
          </div>

          {/* Remove button */}
          <button
            onClick={handleRemove}
            className="p-1.5 rounded-lg transition-colors duration-200 hover:bg-crimson/10 flex-shrink-0"
            style={{ color: "var(--color-grey)" }}
            aria-label={`Remove ${item.productName} from cart`}
          >
            <Trash2 size={14} strokeWidth={1.75} />
          </button>
        </div>

        {/* Qty + line total */}
        <div className="flex items-center justify-between">
          {/* Quantity stepper */}
          <div
            className="flex items-center rounded-lg overflow-hidden"
            style={{ border: "1.5px solid rgba(200,150,12,0.2)" }}
          >
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="w-8 h-8 flex items-center justify-center transition-colors duration-150 disabled:opacity-40"
              style={{
                background: "var(--color-cream)",
                color: "var(--color-brown)",
                borderRight: "1px solid rgba(200,150,12,0.15)",
              }}
              aria-label="Decrease quantity"
            >
              <Minus size={12} strokeWidth={2.5} />
            </button>

            <span
              className="w-9 h-8 flex items-center justify-center font-dm-sans font-bold text-sm"
              style={{ color: "var(--color-brown)", background: "white" }}
              aria-label={`Quantity: ${item.quantity}`}
            >
              {item.quantity}
            </span>

            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              disabled={item.quantity >= item.maxQuantity}
              className="w-8 h-8 flex items-center justify-center transition-colors duration-150 disabled:opacity-40"
              style={{
                background: "var(--color-cream)",
                color: "var(--color-brown)",
                borderLeft: "1px solid rgba(200,150,12,0.15)",
              }}
              aria-label="Increase quantity"
            >
              <Plus size={12} strokeWidth={2.5} />
            </button>
          </div>

          {/* Line total */}
          <span
            className="font-dm-sans font-bold text-base"
            style={{ color: "var(--color-crimson)" }}
          >
            {formatPrice(lineTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}

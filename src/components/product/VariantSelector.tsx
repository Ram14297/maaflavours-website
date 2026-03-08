"use client";
// src/components/product/VariantSelector.tsx
// Maa Flavours — Product Weight/Size Variant Selector
// Pill buttons showing each size option with its price
// Shows savings when discount is applied

import { formatPrice } from "@/lib/utils";
import { PRODUCTS } from "@/lib/constants/products";

type Variant = (typeof PRODUCTS)[0]["variants"][0] & { discounted_price?: number };

interface VariantSelectorProps {
  variants: Variant[];
  selectedIndex: number;
  onChange: (index: number) => void;
}

export default function VariantSelector({
  variants,
  selectedIndex,
  onChange,
}: VariantSelectorProps) {
  return (
    <div>
      {/* Label */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="font-dm-sans text-sm font-semibold"
          style={{ color: "var(--color-brown)" }}
        >
          Pack Size
        </span>
        <span
          className="font-dm-sans text-xs"
          style={{ color: "var(--color-grey)" }}
        >
          Choose a size
        </span>
      </div>

      {/* Variant pills */}
      <div className="flex gap-3">
        {variants.map((variant, idx) => {
          const isSelected = selectedIndex === idx;
          const hasDiscount = !!variant.discounted_price;
          const displayPrice = variant.discounted_price ?? variant.price;
          const savingsPercent = hasDiscount
            ? Math.round(((variant.price - variant.discounted_price!) / variant.price) * 100)
            : 0;

          return (
            <button
              key={variant.label}
              onClick={() => onChange(idx)}
              className="relative flex-1 flex flex-col items-center gap-1 py-4 px-3 rounded-2xl transition-all duration-250"
              style={{
                background: isSelected
                  ? "rgba(192,39,45,0.07)"
                  : "var(--color-cream)",
                border: `2px solid ${isSelected ? "var(--color-crimson)" : "rgba(200,150,12,0.2)"}`,
                boxShadow: isSelected
                  ? "0 0 0 3px rgba(192,39,45,0.1), 0 4px 12px rgba(192,39,45,0.1)"
                  : "none",
                transform: isSelected ? "translateY(-1px)" : "none",
              }}
              aria-pressed={isSelected}
              aria-label={`${variant.label} — ${formatPrice(displayPrice)}`}
            >
              {/* Weight label */}
              <span
                className="font-dm-sans font-bold text-xl leading-none"
                style={{
                  color: isSelected ? "var(--color-crimson)" : "var(--color-brown)",
                }}
              >
                {variant.label}
              </span>

              {/* Price */}
              <span
                className="font-dm-sans font-semibold text-sm"
                style={{
                  color: isSelected ? "var(--color-crimson)" : "var(--color-grey)",
                }}
              >
                {formatPrice(displayPrice)}
              </span>

              {/* Original price if discounted */}
              {hasDiscount && (
                <span
                  className="font-dm-sans text-xs line-through"
                  style={{ color: "var(--color-grey)" }}
                >
                  {formatPrice(variant.price)}
                </span>
              )}

              {/* Selection checkmark */}
              {isSelected && (
                <div
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "var(--color-crimson)" }}
                >
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}

              {/* Savings badge */}
              {savingsPercent > 0 && (
                <div
                  className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full font-dm-sans text-[0.6rem] font-bold"
                  style={{
                    background: "var(--color-gold)",
                    color: "var(--color-brown)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {savingsPercent}% off
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Shelf life note */}
      <p
        className="font-dm-sans text-xs mt-3 flex items-center gap-1.5"
        style={{ color: "var(--color-grey)" }}
      >
        <span>🗓️</span>
        Best consumed within{" "}
        <span style={{ color: "var(--color-brown)", fontWeight: 600 }}>
          3 months
        </span>{" "}
        of opening
      </p>
    </div>
  );
}

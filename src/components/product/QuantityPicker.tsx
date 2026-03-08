"use client";
// src/components/product/QuantityPicker.tsx
// Maa Flavours — Quantity increment/decrement control
// Respects max stock, min of 1

import { Minus, Plus } from "lucide-react";

interface QuantityPickerProps {
  quantity: number;
  onChange: (qty: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export default function QuantityPicker({
  quantity,
  onChange,
  min = 1,
  max = 10,
  label = "Quantity",
}: QuantityPickerProps) {
  const decrement = () => {
    if (quantity > min) onChange(quantity - 1);
  };

  const increment = () => {
    if (quantity < max) onChange(quantity + 1);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= min && val <= max) {
      onChange(val);
    }
  };

  return (
    <div>
      <span
        className="block font-dm-sans text-sm font-semibold mb-3"
        style={{ color: "var(--color-brown)" }}
      >
        {label}
      </span>

      <div className="flex items-center gap-0">
        {/* Decrement */}
        <button
          onClick={decrement}
          disabled={quantity <= min}
          className="w-11 h-11 flex items-center justify-center rounded-l-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: quantity <= min ? "var(--color-cream)" : "var(--color-cream)",
            border: "1.5px solid rgba(200,150,12,0.2)",
            borderRight: "none",
            color: "var(--color-brown)",
          }}
          aria-label="Decrease quantity"
        >
          <Minus size={16} strokeWidth={2.5} />
        </button>

        {/* Input */}
        <input
          type="number"
          value={quantity}
          onChange={handleInput}
          min={min}
          max={max}
          className="w-14 h-11 text-center font-dm-sans font-bold text-lg outline-none"
          style={{
            border: "1.5px solid rgba(200,150,12,0.2)",
            borderLeft: "none",
            borderRight: "none",
            color: "var(--color-brown)",
            background: "white",
            // Hide number input arrows
            MozAppearance: "textfield",
            WebkitAppearance: "none",
          }}
          aria-label="Quantity"
        />

        {/* Increment */}
        <button
          onClick={increment}
          disabled={quantity >= max}
          className="w-11 h-11 flex items-center justify-center rounded-r-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: "var(--color-cream)",
            border: "1.5px solid rgba(200,150,12,0.2)",
            borderLeft: "none",
            color: "var(--color-brown)",
          }}
          aria-label="Increase quantity"
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* Stock note */}
      {max <= 5 && max > 0 && (
        <p
          className="font-dm-sans text-xs mt-2 flex items-center gap-1"
          style={{ color: "var(--color-crimson)" }}
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
          Only {max} left in stock!
        </p>
      )}
      {max === 0 && (
        <p
          className="font-dm-sans text-xs mt-2"
          style={{ color: "var(--color-crimson)" }}
        >
          Currently out of stock
        </p>
      )}
    </div>
  );
}

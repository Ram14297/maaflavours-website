"use client";
// src/components/product/SearchBar.tsx
// Maa Flavours — Product Search Bar
// Debounced search input, clears on Escape, shows clear button

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search pickles…",
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // ─── Debounce to avoid rapid URL updates ─────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, 350);
    return () => clearTimeout(timer);
  }, [localValue, onChange]);

  // ─── Sync external value changes (e.g. clear all) ────────────────────
  useEffect(() => {
    if (value !== localValue) setLocalValue(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleClear = () => {
    setLocalValue("");
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative group">
      {/* Search icon */}
      <Search
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200"
        style={{
          color: localValue ? "var(--color-gold)" : "var(--color-grey)",
        }}
      />

      <input
        ref={inputRef}
        type="search"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && handleClear()}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2.5 font-dm-sans text-sm rounded-xl transition-all duration-200 outline-none"
        style={{
          background: "var(--color-warm-white)",
          border: `1.5px solid ${localValue ? "var(--color-gold)" : "rgba(200,150,12,0.2)"}`,
          color: "var(--color-brown)",
          boxShadow: localValue ? "0 0 0 3px rgba(200,150,12,0.12)" : "none",
        }}
        aria-label="Search products"
      />

      {/* Clear button */}
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full transition-colors duration-150"
          style={{ color: "var(--color-grey)" }}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

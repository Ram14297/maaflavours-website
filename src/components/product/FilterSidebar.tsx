import React from "react";
// src/components/product/FilterSidebar.tsx
// Maa Flavours — Desktop Filter Sidebar
// Sticky left panel: spice level, weight, price range filters
// Used on the Products page at lg+ breakpoints

import { X } from "lucide-react";
import {
  SPICE_FILTER_OPTIONS,
  WEIGHT_OPTIONS,
  PRICE_RANGES,
  ProductFilters,
  SpiceFilterValue,
  WeightValue,
  PriceRangeValue,
} from "@/lib/constants/filters";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  filters: ProductFilters;
  activeFilterCount: number;
  onToggleSpice: (value: SpiceFilterValue) => void;
  onToggleWeight: (value: WeightValue) => void;
  onSetPriceRange: (value: PriceRangeValue) => void;
  onClearAll: () => void;
}

// ─── Individual filter group section ─────────────────────────────────────
function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-5">
      <h3
        className="font-dm-sans text-xs font-700 tracking-widest uppercase mb-4 flex items-center gap-2"
        style={{ color: "var(--color-brown)", fontWeight: 700, letterSpacing: "0.1em" }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function FilterSidebar({
  filters,
  activeFilterCount,
  onToggleSpice,
  onToggleWeight,
  onSetPriceRange,
  onClearAll,
}: FilterSidebarProps) {
  return (
    <aside
      className="w-[240px] flex-shrink-0 sticky top-[120px] self-start"
      aria-label="Product filters"
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "white",
          border: "1px solid rgba(200,150,12,0.15)",
          boxShadow: "0 2px 16px rgba(74,44,10,0.06)",
        }}
      >
        {/* ─── Header ───────────────────────────────────────────────── */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{
            background: "var(--color-cream)",
            borderBottom: "1px solid rgba(200,150,12,0.12)",
          }}
        >
          {/* Gold top ornament */}
          <div
            className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--color-gold) 30%, var(--color-gold-light) 50%, var(--color-gold) 70%, transparent)",
            }}
          />

          <div className="flex items-center gap-2">
            <span
              className="font-playfair font-semibold text-base"
              style={{ color: "var(--color-brown)" }}
            >
              Filters
            </span>
            {activeFilterCount > 0 && (
              <span
                className="flex items-center justify-center w-5 h-5 rounded-full font-dm-sans text-xs font-bold text-white"
                style={{ background: "var(--color-crimson)" }}
              >
                {activeFilterCount}
              </span>
            )}
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 font-dm-sans text-xs font-medium transition-colors duration-200 hover:opacity-70"
              style={{ color: "var(--color-crimson)" }}
              aria-label="Clear all filters"
            >
              <X size={12} />
              Clear all
            </button>
          )}
        </div>

        <div className="px-5 divide-y" style={{ "--tw-divide-color": "rgba(200,150,12,0.08)" } as React.CSSProperties}>

          {/* ─── Spice Level ──────────────────────────────────────────── */}
          <FilterSection title="Spice Level">
            <div className="flex flex-col gap-2">
              {SPICE_FILTER_OPTIONS.map((option) => {
                const isActive = filters.spice.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    {/* Custom checkbox */}
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200 border-2"
                      style={{
                        background: isActive ? "var(--color-crimson)" : "transparent",
                        borderColor: isActive
                          ? "var(--color-crimson)"
                          : "rgba(200,150,12,0.3)",
                      }}
                      onClick={() => onToggleSpice(option.value)}
                      role="checkbox"
                      aria-checked={isActive}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && onToggleSpice(option.value)}
                    >
                      {isActive && (
                        <svg
                          width="10"
                          height="8"
                          viewBox="0 0 10 8"
                          fill="none"
                        >
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="white"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>

                    <span
                      className="flex items-center gap-2 font-dm-sans text-sm flex-1 py-1"
                      onClick={() => onToggleSpice(option.value)}
                      style={{
                        color: isActive ? "var(--color-brown)" : "var(--color-grey)",
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      <span className="text-xs">{option.emoji}</span>
                      {option.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </FilterSection>

          {/* ─── Weight / Size ────────────────────────────────────────── */}
          <FilterSection title="Pack Size">
            <div className="flex gap-2.5">
              {WEIGHT_OPTIONS.map((option) => {
                const isActive = filters.weight.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => onToggleWeight(option.value)}
                    className="flex-1 py-2 rounded-xl font-dm-sans text-sm font-semibold transition-all duration-200"
                    style={{
                      background: isActive ? "var(--color-crimson)" : "var(--color-cream)",
                      color: isActive ? "white" : "var(--color-brown)",
                      border: `1.5px solid ${isActive ? "var(--color-crimson)" : "rgba(200,150,12,0.2)"}`,
                      boxShadow: isActive ? "0 2px 8px rgba(192,39,45,0.2)" : "none",
                    }}
                    aria-pressed={isActive}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </FilterSection>

          {/* ─── Price Range ──────────────────────────────────────────── */}
          <FilterSection title="Price Range">
            <div className="flex flex-col gap-1.5">
              {PRICE_RANGES.map((range) => {
                const isActive = filters.priceRange === range.value;
                return (
                  <button
                    key={range.value}
                    onClick={() => onSetPriceRange(range.value)}
                    className="text-left px-3 py-2 rounded-lg font-dm-sans text-sm transition-all duration-200"
                    style={{
                      background: isActive
                        ? "rgba(192,39,45,0.08)"
                        : "transparent",
                      color: isActive ? "var(--color-crimson)" : "var(--color-grey)",
                      fontWeight: isActive ? 600 : 400,
                      borderLeft: isActive
                        ? "3px solid var(--color-crimson)"
                        : "3px solid transparent",
                    }}
                    aria-pressed={isActive}
                  >
                    {range.label}
                  </button>
                );
              })}
            </div>
          </FilterSection>

          {/* ─── Quick info ───────────────────────────────────────────── */}
          <div className="py-4">
            <div
              className="rounded-xl p-3 text-center"
              style={{
                background: "rgba(200,150,12,0.06)",
                border: "1px solid rgba(200,150,12,0.15)",
              }}
            >
              <p
                className="font-dancing text-base mb-1"
                style={{ color: "var(--color-gold)" }}
              >
                All pickles are
              </p>
              <div className="flex items-center justify-center gap-1.5">
                <span
                  className="block w-3 h-3 rounded-full"
                  style={{
                    border: "1.5px solid #2E7D32",
                    background: "#2E7D32",
                  }}
                />
                <span
                  className="font-dm-sans text-xs font-semibold"
                  style={{ color: "#2E7D32" }}
                >
                  100% Vegetarian
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

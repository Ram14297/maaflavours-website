"use client";
// src/components/product/MobileFilterDrawer.tsx
// Maa Flavours — Mobile Filter Drawer
// Full-height slide-up overlay drawer for mobile/tablet
// Contains all the same filters as the desktop sidebar

import { useEffect } from "react";
import { X, Check } from "lucide-react";
import {
  SPICE_FILTER_OPTIONS,
  WEIGHT_OPTIONS,
  PRICE_RANGES,
  SORT_OPTIONS,
  ProductFilters,
  SpiceFilterValue,
  WeightValue,
  PriceRangeValue,
  SortValue,
} from "@/lib/constants/filters";

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ProductFilters;
  sortBy: SortValue;
  activeFilterCount: number;
  onToggleSpice: (value: SpiceFilterValue) => void;
  onToggleWeight: (value: WeightValue) => void;
  onSetPriceRange: (value: PriceRangeValue) => void;
  onUpdateSort: (value: SortValue) => void;
  onClearAll: () => void;
  resultCount: number;
}

// ─── Section header inside the drawer ────────────────────────────────────
function DrawerSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-5 border-b" style={{ borderColor: "rgba(200,150,12,0.1)" }}>
      <h3
        className="font-dm-sans text-xs font-bold tracking-widest uppercase mb-4"
        style={{ color: "var(--color-brown)", letterSpacing: "0.1em" }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  filters,
  sortBy,
  activeFilterCount,
  onToggleSpice,
  onToggleWeight,
  onSetPriceRange,
  onUpdateSort,
  onClearAll,
  resultCount,
}: MobileFilterDrawerProps) {
  // ─── Lock body scroll when open ─────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 lg:hidden"
        style={{ background: "rgba(74,44,10,0.5)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className="fixed bottom-0 left-0 right-0 z-51 lg:hidden rounded-t-3xl flex flex-col"
        style={{
          background: "var(--color-warm-white)",
          boxShadow: "0 -8px 40px rgba(74,44,10,0.15)",
          maxHeight: "90vh",
          animation: "slideUp 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Filter products"
      >
        {/* Gold top ornament */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px] rounded-t-3xl"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--color-gold) 30%, var(--color-gold-light) 50%, var(--color-gold) 70%, transparent)",
          }}
        />

        {/* ─── Drag handle ────────────────────────────────────────────── */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: "rgba(200,150,12,0.3)" }}
          />
        </div>

        {/* ─── Header ─────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0"
          style={{ borderColor: "rgba(200,150,12,0.12)" }}
        >
          <div className="flex items-center gap-2">
            <span
              className="font-playfair font-bold text-lg"
              style={{ color: "var(--color-brown)" }}
            >
              Filters & Sort
            </span>
            {activeFilterCount > 0 && (
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center font-dm-sans text-xs font-bold text-white"
                style={{ background: "var(--color-crimson)" }}
              >
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-cream transition-colors"
            style={{ color: "var(--color-brown)" }}
            aria-label="Close filters"
          >
            <X size={20} />
          </button>
        </div>

        {/* ─── Scrollable Content ─────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 px-5 pb-6 scrollbar-brand">

          {/* Sort By */}
          <DrawerSection title="Sort By">
            <div className="grid grid-cols-2 gap-2">
              {SORT_OPTIONS.map((option) => {
                const isActive = sortBy === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => onUpdateSort(option.value)}
                    className="relative py-2.5 px-3 rounded-xl font-dm-sans text-sm text-left transition-all duration-200"
                    style={{
                      background: isActive
                        ? "rgba(192,39,45,0.08)"
                        : "var(--color-cream)",
                      color: isActive ? "var(--color-crimson)" : "var(--color-brown)",
                      border: `1.5px solid ${isActive ? "var(--color-crimson)" : "rgba(200,150,12,0.15)"}`,
                      fontWeight: isActive ? 600 : 400,
                    }}
                    aria-pressed={isActive}
                  >
                    {isActive && (
                      <Check
                        size={12}
                        className="inline mr-1.5"
                        style={{ color: "var(--color-crimson)" }}
                      />
                    )}
                    {option.label}
                  </button>
                );
              })}
            </div>
          </DrawerSection>

          {/* Spice Level */}
          <DrawerSection title="Spice Level">
            <div className="grid grid-cols-2 gap-2.5">
              {SPICE_FILTER_OPTIONS.map((option) => {
                const isActive = filters.spice.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => onToggleSpice(option.value)}
                    className="flex items-center gap-2.5 py-3 px-4 rounded-xl font-dm-sans text-sm transition-all duration-200"
                    style={{
                      background: isActive ? "rgba(192,39,45,0.08)" : "var(--color-cream)",
                      color: isActive ? "var(--color-crimson)" : "var(--color-brown)",
                      border: `1.5px solid ${isActive ? "var(--color-crimson)" : "rgba(200,150,12,0.15)"}`,
                      fontWeight: isActive ? 600 : 400,
                    }}
                    aria-pressed={isActive}
                  >
                    <span className="text-base flex-shrink-0">{option.emoji}</span>
                    <span className="leading-tight">{option.label}</span>
                    {isActive && (
                      <Check size={14} className="ml-auto flex-shrink-0" style={{ color: "var(--color-crimson)" }} />
                    )}
                  </button>
                );
              })}
            </div>
          </DrawerSection>

          {/* Pack Size */}
          <DrawerSection title="Pack Size">
            <div className="flex gap-3">
              {WEIGHT_OPTIONS.map((option) => {
                const isActive = filters.weight.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => onToggleWeight(option.value)}
                    className="flex-1 py-3 rounded-xl font-dm-sans text-base font-semibold transition-all duration-200"
                    style={{
                      background: isActive ? "var(--color-crimson)" : "var(--color-cream)",
                      color: isActive ? "white" : "var(--color-brown)",
                      border: `1.5px solid ${isActive ? "var(--color-crimson)" : "rgba(200,150,12,0.2)"}`,
                      boxShadow: isActive ? "0 3px 10px rgba(192,39,45,0.25)" : "none",
                    }}
                    aria-pressed={isActive}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </DrawerSection>

          {/* Price Range */}
          <DrawerSection title="Price Range">
            <div className="flex flex-col gap-2">
              {PRICE_RANGES.map((range) => {
                const isActive = filters.priceRange === range.value;
                return (
                  <button
                    key={range.value}
                    onClick={() => onSetPriceRange(range.value)}
                    className="flex items-center justify-between py-3 px-4 rounded-xl font-dm-sans text-sm transition-all duration-200"
                    style={{
                      background: isActive
                        ? "rgba(192,39,45,0.08)"
                        : "var(--color-cream)",
                      color: isActive ? "var(--color-crimson)" : "var(--color-grey)",
                      border: `1.5px solid ${isActive ? "var(--color-crimson)" : "rgba(200,150,12,0.12)"}`,
                      fontWeight: isActive ? 600 : 400,
                    }}
                    aria-pressed={isActive}
                  >
                    {range.label}
                    {isActive && (
                      <Check size={16} style={{ color: "var(--color-crimson)" }} />
                    )}
                  </button>
                );
              })}
            </div>
          </DrawerSection>
        </div>

        {/* ─── Footer Actions ──────────────────────────────────────────── */}
        <div
          className="flex gap-3 px-5 py-4 border-t flex-shrink-0"
          style={{ borderColor: "rgba(200,150,12,0.12)" }}
        >
          {activeFilterCount > 0 && (
            <button
              onClick={() => { onClearAll(); onClose(); }}
              className="btn-ghost flex-1 py-3"
            >
              Clear All
            </button>
          )}
          <button
            onClick={onClose}
            className="btn-primary py-3"
            style={{ flex: activeFilterCount > 0 ? 1.5 : 1 }}
          >
            Show {resultCount} Product{resultCount !== 1 ? "s" : ""}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}

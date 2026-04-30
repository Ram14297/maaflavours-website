"use client";
// src/components/product/ActiveFilterTags.tsx
// Maa Flavours — Active filter chips displayed below the sort bar

import { X } from "lucide-react";
import {
  WEIGHT_OPTIONS,
  PRICE_RANGES,
  ProductFilters,
  WeightValue,
  PriceRangeValue,
} from "@/lib/constants/filters";

interface ActiveFilterTagsProps {
  filters: ProductFilters;
  onToggleWeight: (value: WeightValue) => void;
  onSetPriceRange: (value: PriceRangeValue) => void;
  onClearAll: () => void;
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-dm-sans text-xs font-semibold transition-all duration-200 hover:opacity-80"
      style={{ background: "rgba(192,39,45,0.09)", color: "var(--color-crimson)", border: "1px solid rgba(192,39,45,0.25)" }}
    >
      {label}
      <button
        onClick={onRemove}
        className="flex items-center justify-center w-3.5 h-3.5 rounded-full"
        aria-label={`Remove ${label} filter`}
        style={{ color: "var(--color-crimson)" }}
      >
        <X size={10} strokeWidth={2.5} />
      </button>
    </span>
  );
}

export default function ActiveFilterTags({
  filters,
  onToggleWeight,
  onSetPriceRange,
  onClearAll,
}: ActiveFilterTagsProps) {
  const hasActive =
    filters.weight.length > 0 ||
    filters.priceRange !== "all" ||
    filters.search;

  if (!hasActive) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 py-3 px-4 rounded-xl" style={{
      background: "rgba(200,150,12,0.04)",
      border: "1px solid rgba(200,150,12,0.1)",
    }}>
      <span className="font-dm-sans text-xs font-semibold mr-1" style={{ color: "var(--color-grey)" }}>
        Active:
      </span>

      {/* Weight filter tags */}
      {filters.weight.map((weightVal) => {
        const opt = WEIGHT_OPTIONS.find((o) => o.value === weightVal);
        return opt ? (
          <FilterTag key={weightVal} label={opt.label} onRemove={() => onToggleWeight(weightVal)} />
        ) : null;
      })}

      {/* Price range tag */}
      {filters.priceRange !== "all" && (
        <FilterTag
          label={PRICE_RANGES.find((r) => r.value === filters.priceRange)?.label || ""}
          onRemove={() => onSetPriceRange("all")}
        />
      )}

      {/* Search tag */}
      {filters.search && (
        <FilterTag label={`"${filters.search}"`} onRemove={() => {}} />
      )}

      {/* Clear all */}
      <button onClick={onClearAll} className="ml-auto font-dm-sans text-xs font-medium" style={{ color: "var(--color-crimson)" }}>
        Clear all ×
      </button>
    </div>
  );
}

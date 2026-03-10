"use client";
// src/components/product/SortBar.tsx
// Maa Flavours — Sort Bar above the product grid
// Includes: results count, sort dropdown, grid/list toggle, mobile filter button

import { SlidersHorizontal, LayoutGrid, List, ChevronDown } from "lucide-react";
import { SORT_OPTIONS, SortValue } from "@/lib/constants/filters";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list";

interface SortBarProps {
  resultCount: number;
  totalCount: number;
  sortBy: SortValue;
  onSortChange: (value: SortValue) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  activeFilterCount: number;
  onOpenMobileFilters: () => void;
}

export default function SortBar({
  resultCount,
  totalCount,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  activeFilterCount,
  onOpenMobileFilters,
}: SortBarProps) {
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentSort = SORT_OPTIONS.find((o) => o.value === sortBy)!;

  // ─── Close dropdown on outside click ─────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      className="flex items-center justify-between gap-4 py-3 px-4 rounded-2xl mb-5"
      style={{
        background: "white",
        border: "1px solid rgba(200,150,12,0.12)",
        boxShadow: "0 1px 8px rgba(74,44,10,0.05)",
      }}
    >
      {/* ─── Left: Results count + Mobile filter button ────────────────── */}
      <div className="flex items-center gap-3">
        {/* Mobile filter trigger — hidden on desktop */}
        <button
          onClick={onOpenMobileFilters}
          className="lg:hidden relative flex items-center gap-2 py-2 px-3 rounded-xl font-dm-sans text-sm font-semibold transition-all duration-200"
          style={{
            background: activeFilterCount > 0 ? "rgba(192,39,45,0.08)" : "var(--color-cream)",
            color: activeFilterCount > 0 ? "var(--color-crimson)" : "var(--color-brown)",
            border: `1.5px solid ${activeFilterCount > 0 ? "var(--color-crimson)" : "rgba(200,150,12,0.2)"}`,
          }}
          aria-label="Open filters"
        >
          <SlidersHorizontal size={16} />
          Filters
          {activeFilterCount > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center font-dm-sans text-xs font-bold text-white"
              style={{ background: "var(--color-crimson)" }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Results label */}
        <p
          className="font-dm-sans text-sm"
          style={{ color: "var(--color-grey)" }}
        >
          <span
            className="font-bold"
            style={{ color: "var(--color-brown)" }}
          >
            {resultCount}
          </span>
          {resultCount !== totalCount && (
            <>
              {" "}of{" "}
              <span style={{ color: "var(--color-brown)" }}>{totalCount}</span>
            </>
          )}{" "}
          {resultCount === 1 ? "pickle" : "pickles"}
          {resultCount !== totalCount && " found"}
        </p>
      </div>

      {/* ─── Right: Sort + View toggle ─────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Sort dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setSortDropdownOpen((o) => !o)}
            className="flex items-center gap-2 py-2 px-3.5 rounded-xl font-dm-sans text-sm font-medium transition-all duration-200"
            style={{
              background: sortDropdownOpen ? "var(--color-cream)" : "transparent",
              color: "var(--color-brown)",
              border: `1.5px solid ${sortDropdownOpen ? "rgba(200,150,12,0.3)" : "rgba(200,150,12,0.15)"}`,
            }}
            aria-haspopup="listbox"
            aria-expanded={sortDropdownOpen}
          >
            <span className="hidden sm:inline text-xs text-grey">Sort:</span>
            <span className="font-semibold truncate max-w-[120px]">
              {currentSort.label}
            </span>
            <ChevronDown
              size={14}
              className="transition-transform duration-200 flex-shrink-0"
              style={{ transform: sortDropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>

          {/* Dropdown menu */}
          {sortDropdownOpen && (
            <div
              className="absolute right-0 top-full mt-1.5 w-52 rounded-xl overflow-hidden z-30"
              style={{
                background: "white",
                border: "1px solid rgba(200,150,12,0.2)",
                boxShadow: "0 8px 32px rgba(74,44,10,0.12)",
                animation: "scaleIn 0.15s ease-out",
              }}
              role="listbox"
            >
              {/* Gold top accent */}
              <div
                className="h-[2px]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, var(--color-gold), var(--color-gold-light), var(--color-gold), transparent)",
                }}
              />

              {SORT_OPTIONS.map((option) => {
                const isActive = sortBy === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSortChange(option.value);
                      setSortDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 font-dm-sans text-sm transition-colors duration-150"
                    style={{
                      background: isActive ? "rgba(192,39,45,0.06)" : "transparent",
                      color: isActive ? "var(--color-crimson)" : "var(--color-brown)",
                      fontWeight: isActive ? 600 : 400,
                      borderLeft: isActive ? "3px solid var(--color-crimson)" : "3px solid transparent",
                    }}
                    role="option"
                    aria-selected={isActive}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* View mode toggle — grid / list */}
        <div
          className="flex items-center rounded-xl overflow-hidden"
          style={{ border: "1.5px solid rgba(200,150,12,0.2)" }}
        >
          <button
            onClick={() => onViewModeChange("grid")}
            className="p-2.5 transition-colors duration-150"
            style={{
              background: viewMode === "grid" ? "var(--color-cream)" : "transparent",
              color: viewMode === "grid" ? "var(--color-brown)" : "var(--color-grey)",
            }}
            aria-label="Grid view"
            aria-pressed={viewMode === "grid"}
          >
            <LayoutGrid size={16} />
          </button>
          <div
            className="w-px h-5 self-center"
            style={{ background: "rgba(200,150,12,0.2)" }}
          />
          <button
            onClick={() => onViewModeChange("list")}
            className="p-2.5 transition-colors duration-150"
            style={{
              background: viewMode === "list" ? "var(--color-cream)" : "transparent",
              color: viewMode === "list" ? "var(--color-brown)" : "var(--color-grey)",
            }}
            aria-label="List view"
            aria-pressed={viewMode === "list"
            }
          >
            <List size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

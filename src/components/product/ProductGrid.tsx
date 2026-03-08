// src/components/product/ProductGrid.tsx
// Maa Flavours — Product Grid / List container
// Handles grid vs list layout, empty state, and loading skeleton
// Used inside the Products page

import { PRODUCTS } from "@/lib/constants/products";
import ProductCard from "./ProductCard";
import { PackageSearch } from "lucide-react";

type ProductSeed = (typeof PRODUCTS)[0];
type ViewMode = "grid" | "list";

interface ProductGridProps {
  products: ProductSeed[];
  viewMode?: ViewMode;
  isLoading?: boolean;
  onAddToCart?: (product: ProductSeed, variantIndex: number) => void;
}

// ─── Skeleton loader for a single card ──────────────────────────────────
function ProductCardSkeleton({ view }: { view: ViewMode }) {
  if (view === "list") {
    return (
      <div
        className="flex gap-5 rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(200,150,12,0.1)" }}
      >
        <div className="w-40 h-32 skeleton" />
        <div className="flex-1 py-4 pr-4 flex flex-col gap-3">
          <div className="skeleton h-4 w-20 rounded" />
          <div className="skeleton h-5 w-48 rounded" />
          <div className="skeleton h-4 w-32 rounded" />
          <div className="flex items-center justify-between mt-auto">
            <div className="skeleton h-7 w-16 rounded" />
            <div className="skeleton h-9 w-28 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid rgba(200,150,12,0.1)" }}
    >
      <div className="aspect-square skeleton" />
      <div className="p-4 flex flex-col gap-3">
        <div className="skeleton h-4 w-24 rounded-full" />
        <div className="skeleton h-5 w-36 rounded" />
        <div className="skeleton h-4 w-28 rounded" />
        <div className="flex gap-2">
          <div className="skeleton h-8 flex-1 rounded-lg" />
          <div className="skeleton h-8 flex-1 rounded-lg" />
        </div>
        <div className="flex items-center justify-between">
          <div className="skeleton h-6 w-14 rounded" />
          <div className="skeleton h-9 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────
function EmptyState({ onClearFilters }: { onClearFilters?: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center gap-5">
      {/* Icon */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{
          background: "var(--color-cream)",
          border: "2px dashed rgba(200,150,12,0.3)",
        }}
      >
        <PackageSearch size={32} style={{ color: "var(--color-gold)" }} />
      </div>

      <div>
        <h3
          className="font-playfair font-semibold text-xl mb-2"
          style={{ color: "var(--color-brown)" }}
        >
          No pickles found
        </h3>
        <p
          className="font-dm-sans text-sm max-w-xs mx-auto"
          style={{ color: "var(--color-grey)" }}
        >
          Your current filters don't match any of our pickles. Try adjusting your filters.
        </p>
      </div>

      {onClearFilters && (
        <button
          onClick={onClearFilters}
          className="btn-ghost py-2.5 px-6"
        >
          Clear All Filters
        </button>
      )}

      {/* Decorative gold line */}
      <div className="ornament-line w-32 mt-2" />
    </div>
  );
}

export default function ProductGrid({
  products,
  viewMode = "grid",
  isLoading = false,
  onAddToCart,
}: ProductGridProps) {
  // ─── Loading skeleton ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5"
            : "flex flex-col gap-4"
        }
        aria-busy="true"
        aria-label="Loading products"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} view={viewMode} />
        ))}
      </div>
    );
  }

  // ─── Empty state ──────────────────────────────────────────────────────
  if (products.length === 0) {
    return (
      <div className="w-full">
        <EmptyState />
      </div>
    );
  }

  // ─── Grid or List ─────────────────────────────────────────────────────
  return (
    <div
      className={
        viewMode === "list"
          ? "flex flex-col gap-4"
          : "grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5"
      }
      aria-label="Product listing"
    >
      {products.map((product, index) => (
        <div
          key={product.slug}
          className="reveal"
          style={{ animationDelay: `${index * 0.06}s` }}
        >
          <ProductCard
            product={product}
            view={viewMode}
            onAddToCart={onAddToCart}
          />
        </div>
      ))}
    </div>
  );
}

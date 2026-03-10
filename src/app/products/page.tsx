"use client";
// src/app/products/page.tsx
// Maa Flavours — Products / Shop Page
// Layout: sticky sort bar + filter sidebar (desktop) | mobile filter drawer
// Features: search, filter by spice/weight/price, sort, grid/list view toggle

import { useState, useEffect } from "react";
import { Suspense } from "react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FilterSidebar from "@/components/product/FilterSidebar";
import MobileFilterDrawer from "@/components/product/MobileFilterDrawer";
import SortBar from "@/components/product/SortBar";
import ProductGrid from "@/components/product/ProductGrid";
import ActiveFilterTags from "@/components/product/ActiveFilterTags";
import SearchBar from "@/components/product/SearchBar";
import { useProductFilters } from "@/hooks/useProductFilters";
import { PRODUCTS, ProductSeed } from "@/lib/constants/products";
import { ShoppingBag } from "lucide-react";

type ViewMode = "grid" | "list";

// ─── Breadcrumb ────────────────────────────────────────────────────────────
function Breadcrumb() {
  return (
    <nav
      className="flex items-center gap-2 font-dm-sans text-sm mb-2"
      aria-label="Breadcrumb"
    >
      <a
        href="/"
        className="transition-colors duration-200 hover:text-gold"
        style={{ color: "var(--color-grey)" }}
      >
        Home
      </a>
      <span style={{ color: "rgba(200,150,12,0.4)" }}>›</span>
      <span style={{ color: "var(--color-brown)", fontWeight: 600 }}>
        All Pickles
      </span>
    </nav>
  );
}

// ─── Page header ───────────────────────────────────────────────────────────
function PageHeader() {
  return (
    <div className="py-8 lg:py-10">
      <Breadcrumb />
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="section-eyebrow block mb-1.5">Handcrafted in Ongole</span>
          <h1
            className="font-playfair font-bold leading-tight"
            style={{
              color: "var(--color-brown)",
              fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
            }}
          >
            Our Signature Pickles
          </h1>
          <p
            className="font-cormorant italic text-lg mt-1"
            style={{ color: "var(--color-grey)" }}
          >
            6 varieties, each made the way Maa always made it
          </p>
        </div>

        {/* Trust mini-strip */}
        <div
          className="flex items-center gap-4 px-4 py-2.5 rounded-xl flex-shrink-0 self-start sm:self-auto"
          style={{
            background: "var(--color-cream)",
            border: "1px solid rgba(200,150,12,0.15)",
          }}
        >
          <div className="flex items-center gap-1.5">
            <span
              className="block w-3 h-3 rounded-full"
              style={{ background: "#2E7D32", border: "1.5px solid #2E7D32" }}
            />
            <span
              className="font-dm-sans text-xs font-semibold"
              style={{ color: "#2E7D32" }}
            >
              100% Veg
            </span>
          </div>
          <div
            className="w-px h-4"
            style={{ background: "rgba(200,150,12,0.25)" }}
          />
          <span
            className="font-dm-sans text-xs font-medium"
            style={{ color: "var(--color-grey)" }}
          >
            🌿 No Preservatives
          </span>
          <div
            className="w-px h-4"
            style={{ background: "rgba(200,150,12,0.25)" }}
          />
          <span
            className="font-dm-sans text-xs font-medium"
            style={{ color: "var(--color-grey)" }}
          >
            🚚 Free Ship ≥₹499
          </span>
        </div>
      </div>

      {/* Gold divider */}
      <div className="ornament-line mt-6" />
    </div>
  );
}

// ─── Inner content (needs useSearchParams — wrapped in Suspense) ────────────
function ProductsContent() {
  // ─── Live products from Supabase via API ────────────────────────────────
  const [liveProducts, setLiveProducts] = useState<ProductSeed[]>(PRODUCTS);

  useEffect(() => {
    fetch("/api/products?limit=50")
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data.products) || data.products.length === 0) return;
        const mapped: ProductSeed[] = data.products
          .map((p: any) => {
            if (!p?.slug || !Array.isArray(p.variants) || p.variants.length === 0) return null;
            // Merge live API data with static metadata (description, ingredients, etc.)
            const base = PRODUCTS.find((sp) => sp.slug === p.slug);
            if (!base) return null;
            return {
              ...base,
              name:       p.name       || base.name,
              subtitle:   p.subtitle   || base.subtitle,
              spice_level: p.spice_level || base.spice_level,
              is_featured: p.is_featured ?? base.is_featured,
              variants: p.variants.map((v: any) => ({
                weight_grams: v.weight_grams,
                label:        v.label,
                price:        v.price,   // ← live price from Supabase
              })),
            } as ProductSeed;
          })
          .filter(Boolean) as ProductSeed[];
        if (mapped.length > 0) setLiveProducts(mapped);
      })
      .catch(() => {/* silent — keep static fallback */});
  }, []);

  const {
    filters,
    sortBy,
    activeFilterCount,
    filteredProducts,
    toggleSpice,
    toggleWeight,
    setPriceRange,
    setSearch,
    updateSort,
    clearAllFilters,
  } = useProductFilters(liveProducts);

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // ─── Scroll reveal observer ────────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("revealed");
      }),
      { threshold: 0.06, rootMargin: "0px 0px -30px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [filteredProducts]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--color-warm-white)" }}
    >
      <AnnouncementBar />
      <Navbar
        cartCount={cartCount}
        onCartClick={() => setCartOpen(true)}
        onAccountClick={() => setLoginOpen(true)}
      />

      <main className="flex-1 section-container">
        {/* Page header */}
        <PageHeader />

        {/* Search + Layout */}
        <div className="flex gap-7">

          {/* ─── Desktop Sidebar ──────────────────────────────────────── */}
          <div className="hidden lg:block">
            {/* Search above sidebar */}
            <div className="mb-4 w-[240px]">
              <SearchBar
                value={filters.search}
                onChange={setSearch}
                placeholder="Search pickles…"
              />
            </div>
            <FilterSidebar
              filters={filters}
              activeFilterCount={activeFilterCount}
              onToggleSpice={toggleSpice}
              onToggleWeight={toggleWeight}
              onSetPriceRange={setPriceRange}
              onClearAll={clearAllFilters}
            />
          </div>

          {/* ─── Main Content Area ────────────────────────────────────── */}
          <div className="flex-1 min-w-0 pb-16">
            {/* Mobile search */}
            <div className="lg:hidden mb-4">
              <SearchBar
                value={filters.search}
                onChange={setSearch}
                placeholder="Search pickles…"
              />
            </div>

            {/* Sort bar */}
            <SortBar
              resultCount={filteredProducts.length}
              totalCount={liveProducts.length}
              sortBy={sortBy}
              onSortChange={updateSort}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              activeFilterCount={activeFilterCount}
              onOpenMobileFilters={() => setMobileFilterOpen(true)}
            />

            {/* Active filter tags */}
            <ActiveFilterTags
              filters={filters}
              onToggleSpice={toggleSpice}
              onToggleWeight={toggleWeight}
              onSetPriceRange={setPriceRange}
              onClearAll={clearAllFilters}
            />

            {/* Product grid */}
            <ProductGrid
              products={filteredProducts}
              viewMode={viewMode}
              onAddToCart={(_product, _variantIndex) => {
                // TODO: Connect to cart store (Step 4)
                setCartCount((c) => c + 1);
              }}
            />

            {/* Bottom spacer with brand note */}
            {filteredProducts.length > 0 && (
              <div className="mt-12 pt-8 border-t text-center" style={{ borderColor: "rgba(200,150,12,0.12)" }}>
                <p
                  className="font-dancing text-xl mb-1"
                  style={{ color: "var(--color-gold)" }}
                >
                  All pickles are made in small batches in Ongole
                </p>
                <p
                  className="font-dm-sans text-sm"
                  style={{ color: "var(--color-grey)" }}
                >
                  Questions? Chat with us on{" "}
                  <a
                    href="https://wa.me/919701452929"
                    className="font-semibold hover:underline"
                    style={{ color: "#25D366" }}
                  >
                    WhatsApp
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        filters={filters}
        sortBy={sortBy}
        activeFilterCount={activeFilterCount}
        onToggleSpice={toggleSpice}
        onToggleWeight={toggleWeight}
        onSetPriceRange={setPriceRange}
        onUpdateSort={updateSort}
        onClearAll={clearAllFilters}
        resultCount={filteredProducts.length}
      />
    </div>
  );
}

// ─── Exported Page ──────────────────────────────────────────────────────────
// Suspense boundary required because useSearchParams is used inside
export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "var(--color-warm-white)" }}
        >
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, var(--color-cream), var(--color-cream-dark))",
                border: "2px solid rgba(200,150,12,0.2)",
                animation: "pulseGold 1.5s ease-in-out infinite",
              }}
            >
              <ShoppingBag size={24} style={{ color: "var(--color-gold)" }} />
            </div>
            <p
              className="font-cormorant italic text-xl"
              style={{ color: "var(--color-brown)" }}
            >
              Loading our pickles…
            </p>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}

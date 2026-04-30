"use client";
// src/app/products/page.tsx
// Maa Flavours — Products / Shop Page
// Layout: sticky sort bar + filter sidebar (desktop) | mobile filter drawer
// Features: search, filter by spice/weight/price, sort, grid/list view toggle

import { useState, useEffect } from "react";
import { Suspense } from "react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import NavbarWithCart from "@/components/layout/NavbarWithCart";
import Footer from "@/components/layout/Footer";
import FilterSidebar from "@/components/product/FilterSidebar";
import MobileFilterDrawer from "@/components/product/MobileFilterDrawer";
import SortBar from "@/components/product/SortBar";
import ProductGrid from "@/components/product/ProductGrid";
import ProductCard from "@/components/product/ProductCard";
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
          <span className="section-eyebrow block mb-1.5">Authentically Handcrafted</span>
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
          {/* Veg indicator — FSSAI-style square + dot */}
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
              style={{
                border: "1.5px solid #2E7D32",
                background: "rgba(46,125,50,0.06)",
              }}
            >
              <span
                className="block rounded-full"
                style={{ width: "9px", height: "9px", background: "#2E7D32" }}
              />
            </div>
            <span
              className="font-dm-sans text-xs font-bold"
              style={{ color: "#1B5E20" }}
            >
              100% Pure Veg
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
  const [liveProducts, setLiveProducts]   = useState<ProductSeed[]>(PRODUCTS);
  const [powderProducts, setPowderProducts] = useState<ProductSeed[]>([]);

  useEffect(() => {
    // Fetch ALL active products (pickles + powders)
    fetch("/api/products?limit=100")
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data.products) || data.products.length === 0) return;

        function mapProduct(p: any): ProductSeed | null {
          if (!p?.slug || !Array.isArray(p.variants) || p.variants.length === 0) return null;
          const base = PRODUCTS.find((sp) => sp.slug === p.slug);
          return {
            tag:               p.tag              || "",
            short_description: p.short_description || p.description || "",
            description:       p.description       || "",
            ingredients:       p.ingredients       || "",
            shelf_life_days:   p.shelf_life_days   || 180,
            is_vegetarian:     p.is_vegetarian     ?? true,
            image_placeholder: p.slug,
            ...( base || {} ),
            slug:        p.slug,
            name:        p.name        || base?.name        || p.slug,
            subtitle:    p.subtitle    || base?.subtitle    || "",
            spice_level: p.spice_level || base?.spice_level || "medium",
            is_featured: p.is_featured ?? base?.is_featured ?? false,
            primary_image_url: p.primary_image_url || null,
            product_type: p.product_type || "pickle",
            variants: p.variants.map((v: any) => ({
              weight_grams: v.weight_grams,
              label:        v.label,
              price:        v.price,
            })),
          } as ProductSeed;
        }

        const all     = data.products.map(mapProduct).filter(Boolean) as ProductSeed[];
        const pickles = all.filter(p => (p as any).product_type !== "powder");
        const powders = all.filter(p => (p as any).product_type === "powder");

        if (pickles.length > 0) setLiveProducts(pickles);
        setPowderProducts(powders);
      })
      .catch(() => {/* silent — keep static fallback */});
  }, []);

  const {
    filters,
    sortBy,
    activeFilterCount,
    filteredProducts,
    toggleWeight,
    setPriceRange,
    setSearch,
    updateSort,
    clearAllFilters,
  } = useProductFilters(liveProducts);

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

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
      <NavbarWithCart />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-10">
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
              
              onToggleWeight={toggleWeight}
              onSetPriceRange={setPriceRange}
              onClearAll={clearAllFilters}
            />

            {/* Product grid */}
            <ProductGrid
              products={filteredProducts}
              viewMode={viewMode}
              onAddToCart={(_product, _variantIndex) => {}}
            />

            {/* Bottom spacer with brand note */}
            {filteredProducts.length > 0 && (
              <div className="mt-12 pt-8 border-t text-center" style={{ borderColor: "rgba(200,150,12,0.12)" }}>
                <p
                  className="font-dancing text-xl mb-1"
                  style={{ color: "var(--color-gold)" }}
                >
                  All pickles are made in small batches with love
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

        {/* ─── Spice Powders Section ──────────────────────────────────── */}
        {powderProducts.length > 0 && (
          <div className="mt-16 pb-16">
            {/* Section header */}
            <div className="flex items-center gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🌶️</span>
                  <span className="font-dm-sans text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-gold)" }}>
                    New
                  </span>
                </div>
                <h2 className="font-playfair font-bold text-2xl sm:text-3xl" style={{ color: "var(--color-brown)" }}>
                  Spice Powders
                </h2>
                <p className="font-dm-sans text-sm mt-1" style={{ color: "var(--color-grey)" }}>
                  Freshly ground Andhra podis — made in small batches, no preservatives
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {powderProducts.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        filters={filters}
        sortBy={sortBy}
        activeFilterCount={activeFilterCount}
        
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

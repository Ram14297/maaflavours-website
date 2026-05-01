"use client";
// src/app/powders/page.tsx
// Maa Flavours — Spice Powders (Podi) Page
// Shows powder products fetched from API.
// If none exist yet → shows "Grinding soon..." placeholder.

import { useState, useEffect } from "react";
import { Suspense } from "react";
import { Flame } from "lucide-react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import NavbarWithCart from "@/components/layout/NavbarWithCart";
import Footer from "@/components/layout/Footer";
import FilterSidebar from "@/components/product/FilterSidebar";
import MobileFilterDrawer from "@/components/product/MobileFilterDrawer";
import SortBar from "@/components/product/SortBar";
import ProductGrid from "@/components/product/ProductGrid";
import ActiveFilterTags from "@/components/product/ActiveFilterTags";
import SearchBar from "@/components/product/SearchBar";
import { useProductFilters } from "@/hooks/useProductFilters";
import { ProductSeed } from "@/lib/constants/products";

// ─── Breadcrumb ────────────────────────────────────────────────────────────────
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
        Spice Powders
      </span>
    </nav>
  );
}

// ─── Page header ───────────────────────────────────────────────────────────────
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
            Spice Powders (Podi)
          </h1>
          <p
            className="font-cormorant italic text-lg mt-1"
            style={{ color: "var(--color-grey)" }}
          >
            Authentic Andhra podi, ground fresh in small batches
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
              100% Natural
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
            No Preservatives
          </span>
          <div
            className="w-px h-4"
            style={{ background: "rgba(200,150,12,0.25)" }}
          />
          <span
            className="font-dm-sans text-xs font-medium"
            style={{ color: "var(--color-grey)" }}
          >
            Free Ship ≥₹499
          </span>
        </div>
      </div>

      {/* Gold divider */}
      <div className="ornament-line mt-6" />
    </div>
  );
}

// ─── Grinding Soon placeholder ─────────────────────────────────────────────────
function GrindingSoon() {
  return (
    <div
      className="flex flex-col items-center justify-center py-28 px-6 text-center"
      style={{ minHeight: "40vh" }}
    >
      {/* Icon */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{
          background: "linear-gradient(135deg, var(--color-cream), var(--color-cream-dark))",
          border: "2px solid rgba(200,150,12,0.25)",
          boxShadow: "0 4px 24px rgba(200,150,12,0.12)",
        }}
      >
        <Flame size={36} style={{ color: "var(--color-gold)" }} />
      </div>

      {/* Heading */}
      <h2
        className="font-playfair font-bold mb-3"
        style={{
          color: "var(--color-brown)",
          fontSize: "clamp(1.5rem, 3vw, 2rem)",
        }}
      >
        Grinding soon...
      </h2>

      {/* Subtext */}
      <p
        className="font-dm-sans text-base max-w-md mb-2"
        style={{ color: "var(--color-grey)" }}
      >
        Our authentic Andhra Spice Powders (Podi) are almost ready.
      </p>
      <p
        className="font-cormorant italic text-lg mb-8"
        style={{ color: "var(--color-gold)" }}
      >
        Fresh-ground, no fillers, purely traditional.
      </p>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <a
          href="/products"
          className="btn-primary px-6 py-3"
        >
          Shop Our Pickles
        </a>
        <a
          href="https://wa.me/919701452929"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost px-6 py-3"
          style={{ color: "#25D366", borderColor: "#25D366" }}
        >
          Notify Me on WhatsApp
        </a>
      </div>
    </div>
  );
}

// ─── Inner content ─────────────────────────────────────────────────────────────
function PowdersContent() {
  const [liveProducts, setLiveProducts] = useState<ProductSeed[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/products?limit=50&type=powder")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.products) && data.products.length > 0) {
          const mapped: ProductSeed[] = data.products
            .map((p: any) => {
              if (!p?.slug || !Array.isArray(p.variants) || p.variants.length === 0) return null;
              return {
                slug:        p.slug,
                name:        p.name,
                subtitle:    p.subtitle   || "",
                tag:         p.tag        || "",
                spice_level: p.spice_level || "medium",
                is_featured: p.is_featured ?? false,
                short_description: p.short_description || "",
                description: p.description || "",
                ingredients: p.ingredients || "",
                shelf_life_days: p.shelf_life_days || 180,
                is_vegetarian: true,
                image_placeholder: p.slug,
                primary_image_url: p.primary_image_url || null,
                variants: p.variants.map((v: any) => ({
                  weight_grams: v.weight_grams,
                  label:        v.label,
                  price:        v.price,
                })),
              } as unknown as ProductSeed;
            })
            .filter(Boolean) as ProductSeed[];
          setLiveProducts(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
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

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Scroll reveal
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
        <PageHeader />

        {/* Loading state while fetch is in progress */}
        {!loaded ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, var(--color-cream), var(--color-cream-dark))",
                  border: "2px solid rgba(200,150,12,0.2)",
                  animation: "pulseGold 1.5s ease-in-out infinite",
                }}
              >
                <Flame size={24} style={{ color: "var(--color-gold)" }} />
              </div>
              <p className="font-cormorant italic text-xl" style={{ color: "var(--color-brown)" }}>
                Loading spice powders…
              </p>
            </div>
          </div>
        ) : loaded && liveProducts.length === 0 ? (
          <GrindingSoon />
        ) : (
          <div className="flex gap-7">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
              <div className="mb-4 w-[240px]">
                <SearchBar
                  value={filters.search}
                  onChange={setSearch}
                  placeholder="Search powders…"
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

            {/* Main content */}
            <div className="flex-1 min-w-0 pb-16">
              <div className="lg:hidden mb-4">
                <SearchBar
                  value={filters.search}
                  onChange={setSearch}
                  placeholder="Search powders…"
                />
              </div>

              <SortBar
                resultCount={filteredProducts.length}
                totalCount={liveProducts.length}
                sortBy={sortBy}
                onSortChange={updateSort}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                activeFilterCount={activeFilterCount}
                onOpenMobileFilters={() => setMobileFilterOpen(true)}
                itemLabel="powder"
              />

              <ActiveFilterTags
                filters={filters}
                
                onToggleWeight={toggleWeight}
                onSetPriceRange={setPriceRange}
                onClearAll={clearAllFilters}
              />

              <ProductGrid
                products={filteredProducts}
                viewMode={viewMode}
                onAddToCart={(_product, _variantIndex) => {}}
              />

              {filteredProducts.length > 0 && (
                <div className="mt-12 pt-8 border-t text-center" style={{ borderColor: "rgba(200,150,12,0.12)" }}>
                  <p
                    className="font-dancing text-xl mb-1"
                    style={{ color: "var(--color-gold)" }}
                  >
                    All powders are ground fresh in small batches
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
        )}
      </main>

      <Footer />

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

// ─── Exported Page ─────────────────────────────────────────────────────────────
export default function PowdersPage() {
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
              <Flame size={24} style={{ color: "var(--color-gold)" }} />
            </div>
            <p
              className="font-cormorant italic text-xl"
              style={{ color: "var(--color-brown)" }}
            >
              Loading spice powders…
            </p>
          </div>
        </div>
      }
    >
      <PowdersContent />
    </Suspense>
  );
}

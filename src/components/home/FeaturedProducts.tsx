"use client";
// src/components/home/FeaturedProducts.tsx
// Maa Flavours — Featured Products Section
// 1 col mobile → 2 cols sm → 3 cols lg → 4 cols xl
// Each card links to /products/[slug] for navigation
// Prices fetched live from Supabase via /api/products (fallback: static constants)

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Star } from "lucide-react";
import { PRODUCTS } from "@/lib/constants/products";
import { formatPrice, getSpiceLevelConfig } from "@/lib/utils";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cartStore";

type ProductEntry = (typeof PRODUCTS)[0];

interface ProductCardProps {
  product: ProductEntry;
}

function ProductCard({ product }: ProductCardProps) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [adding, setAdding] = useState(false);

  const selectedVariant = product.variants[selectedVariantIndex] as typeof product.variants[0] & { discounted_price?: number };
  const spiceConfig = getSpiceLevelConfig(product.spice_level);
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();   // prevent Link navigation
    e.stopPropagation();
    setAdding(true);
    try {
      await addItem(product.slug, selectedVariantIndex, 1);
      toast.success(`${product.name} added to cart!`);
    } catch {
      toast.error("Could not add to cart. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="product-card group relative flex flex-col bg-white"
      style={{ borderRadius: "14px" }}
      aria-label={`View ${product.name}`}
    >
      {/* ─── Gold corner ornaments ─────────────────────────────────────── */}
      <span className="corner-tl" />
      <span className="corner-tr" />
      <span className="corner-bl" />
      <span className="corner-br" />

      {/* ─── Image Area ────────────────────────────────────────────────── */}
      {/* REPLACE with actual product image */}
      <div
        className="relative w-full aspect-square overflow-hidden rounded-t-[12px]"
        style={{
          background:
            "linear-gradient(135deg, var(--color-cream) 0%, var(--color-cream-dark) 100%)",
        }}
      >
        {/* Placeholder — REPLACE with Next.js Image */}
        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
          <span className="text-5xl" style={{ filter: "drop-shadow(0 3px 6px rgba(74,44,10,0.15))" }}>
            🫙
          </span>
          <span
            className="font-dm-sans text-xs text-center px-3"
            style={{ color: "var(--color-grey)" }}
          >
            {/* REPLACE with actual product image path: /images/products/{product.slug}.jpg */}
            Product Image
          </span>
        </div>

        {/* Tag badge */}
        <div
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full font-dm-sans text-[0.6875rem] font-600 leading-none"
          style={{
            background: "white",
            color: "var(--color-brown)",
            boxShadow: "0 2px 8px rgba(74,44,10,0.12)",
            fontWeight: 600,
            border: "1px solid rgba(200,150,12,0.2)",
          }}
        >
          {product.tag}
        </div>

        {/* Veg dot — top right */}
        <div
          className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded"
          style={{
            background: "white",
            border: "1.5px solid #2E7D32",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          <span
            className="block w-3 h-3 rounded-full"
            style={{ background: "#2E7D32" }}
          />
        </div>
      </div>

      {/* ─── Card Content ──────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4">
        {/* Spice badge */}
        <div className="flex items-center justify-between mb-2">
          <span
            className={`badge-spice text-[0.6875rem] font-semibold ${spiceConfig.className}`}
          >
            {spiceConfig.emoji} {spiceConfig.label}
          </span>

          {/* Star rating placeholder */}
          <div className="flex items-center gap-1">
            <Star
              size={11}
              fill="var(--color-gold)"
              style={{ color: "var(--color-gold)" }}
            />
            <span
              className="font-dm-sans text-xs font-semibold"
              style={{ color: "var(--color-brown)" }}
            >
              4.9
            </span>
          </div>
        </div>

        {/* Product name */}
        <h3
          className="font-playfair font-semibold mb-1 leading-tight"
          style={{
            color: "var(--color-brown)",
            fontSize: "1rem",
          }}
        >
          {product.name}
        </h3>
        <p
          className="font-cormorant italic mb-3 leading-snug"
          style={{ color: "var(--color-grey)", fontSize: "0.9rem" }}
        >
          {product.subtitle}
        </p>

        {/* Weight selector */}
        <div className="flex gap-2 mb-4">
          {product.variants.map((variant, idx) => (
            <button
              key={variant.label}
              onClick={(e) => {
                e.preventDefault();   // prevent Link navigation
                e.stopPropagation();
                setSelectedVariantIndex(idx);
              }}
              className="flex-1 py-1.5 px-2 rounded-lg font-dm-sans text-xs font-semibold transition-all duration-200"
              style={{
                background:
                  selectedVariantIndex === idx
                    ? "var(--color-crimson)"
                    : "var(--color-cream)",
                color:
                  selectedVariantIndex === idx ? "white" : "var(--color-brown)",
                border:
                  selectedVariantIndex === idx
                    ? "1.5px solid var(--color-crimson)"
                    : "1.5px solid rgba(200,150,12,0.2)",
                boxShadow:
                  selectedVariantIndex === idx
                    ? "0 2px 6px rgba(192,39,45,0.2)"
                    : "none",
              }}
            >
              {variant.label}
            </button>
          ))}
        </div>

        {/* Price + Add to Cart */}
        <div className="flex flex-col gap-2 mt-auto">
          <div className="flex flex-col leading-tight">
            <span
              className="font-dm-sans font-bold text-lg leading-none"
              style={{ color: "var(--color-crimson)" }}
            >
              {formatPrice(selectedVariant.price)}
            </span>
            {selectedVariant.discounted_price && (
              <span
                className="font-dm-sans text-xs line-through"
                style={{ color: "var(--color-grey)" }}
              >
                {formatPrice(selectedVariant.discounted_price)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-dm-sans text-sm font-semibold transition-all duration-200 disabled:opacity-70"
            style={{
              background: adding ? "var(--color-gold)" : "var(--color-brown)",
              color: "white",
              boxShadow: "0 2px 8px rgba(74,44,10,0.2)",
            }}
          >
            {adding ? (
              <>
                <span
                  className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"
                />
                Adding...
              </>
            ) : (
              <>
                <ShoppingBag size={15} />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}

// ─── Map API product to ProductEntry shape ─────────────────────────────────
function mapApiProduct(p: any): ProductEntry | null {
  if (!p?.slug || !Array.isArray(p.variants) || p.variants.length === 0) return null;
  // Merge static metadata (description, ingredients, etc.) with live prices from API
  const base = PRODUCTS.find((sp) => sp.slug === p.slug);
  return {
    ...(base ?? {}),
    slug:              p.slug,
    name:              p.name,
    subtitle:          p.subtitle || base?.subtitle || "",
    tag:               p.tag || base?.tag || "",
    spice_level:       p.spice_level || base?.spice_level || "medium",
    short_description: p.short_description || base?.short_description || "",
    description:       p.description || base?.description || "",
    ingredients:       p.ingredients || base?.ingredients || "",
    shelf_life_days:   p.shelf_life_days || base?.shelf_life_days || 90,
    is_vegetarian:     p.is_vegetarian ?? true,
    is_featured:       p.is_featured ?? false,
    image_placeholder: p.slug,
    // Live variant prices from Supabase
    variants: p.variants.map((v: any) => ({
      weight_grams: v.weight_grams,
      label:        v.label,
      price:        v.price,
    })),
  } as ProductEntry;
}

export default function FeaturedProducts() {
  // Start with static products, replace with live Supabase prices on mount
  const [products, setProducts] = useState<ProductEntry[]>(PRODUCTS);

  useEffect(() => {
    fetch("/api/products?featured=true&limit=6")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.products) && data.products.length > 0) {
          const mapped = data.products
            .map(mapApiProduct)
            .filter(Boolean) as ProductEntry[];
          if (mapped.length > 0) setProducts(mapped);
        }
      })
      .catch(() => {/* silent — keep static fallback */});
  }, []);

  return (
    <section
      className="section-padding bg-cream-texture"
      id="featured-products"
    >
      <div className="section-container">
        {/* ─── Section Header ──────────────────────────────────────────── */}
        <div className="text-center mb-12 lg:mb-16">
          <span className="section-eyebrow block mb-3">Handcrafted with Love</span>

          <h2 className="section-title mb-4">Our Signature Pickles</h2>

          {/* Gold ornament */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-16 ornament-line" />
            <span style={{ color: "var(--color-gold)", fontSize: "1.25rem" }}>✦</span>
            <div className="h-px w-16 ornament-line" />
          </div>

          <p
            className="font-cormorant italic text-xl"
            style={{ color: "var(--color-grey)" }}
          >
            Each pack holds a memory, a tradition, a flavour
          </p>
        </div>

        {/* ─── Product Grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>

        {/* ─── View All CTA ─────────────────────────────────────────────── */}
        <div className="flex justify-center mt-12">
          <a
            href="/products"
            className="btn-ghost inline-flex items-center gap-2 py-3 px-8"
          >
            View All Pickles
            <span style={{ color: "var(--color-gold)" }}>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

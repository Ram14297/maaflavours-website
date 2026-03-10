"use client";
// src/components/product/ProductCard.tsx
// Maa Flavours — Product Card for Shop/Listing page
// Full card: image, tag, veg badge, spice badge, name, weight selector, price, CTA
// Two variants: "grid" (default) and "list" view

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Star, Heart, Eye } from "lucide-react";
import { formatPrice, getSpiceLevelConfig } from "@/lib/utils";
import { PRODUCTS } from "@/lib/constants/products";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";

type ProductSeed = (typeof PRODUCTS)[0];

interface ProductCardProps {
  product: ProductSeed;
  view?: "grid" | "list";
  onAddToCart?: (product: ProductSeed, variantIndex: number) => void;
}

export default function ProductCard({
  product,
  view = "grid",
  onAddToCart,
}: ProductCardProps) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [adding, setAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [imageHovered, setImageHovered] = useState(false);

  const selectedVariant = product.variants[selectedVariantIndex];
  const spiceConfig = getSpiceLevelConfig(product.spice_level);
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent click from bubbling to parent <Link>
    e.preventDefault();
    setAdding(true);
    try {
      addItem(product.slug, selectedVariantIndex, 1);
      onAddToCart?.(product, selectedVariantIndex);
      toast.success(`${product.name} (${selectedVariant.label}) added to cart!`);
    } catch {
      toast.error("Could not add to cart. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    setWishlisted((w) => !w);
    toast(wishlisted ? "Removed from wishlist" : "Added to wishlist ♥", {
      icon: wishlisted ? "🗑️" : "❤️",
    });
  };

  // ─── LIST VIEW ─────────────────────────────────────────────────────────
  if (view === "list") {
    return (
      <Link
        href={`/products/${product.slug}`}
        className="group flex gap-5 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
        style={{
          background: "white",
          border: "1px solid rgba(200,150,12,0.15)",
          boxShadow: "0 2px 12px rgba(74,44,10,0.06)",
        }}
        aria-label={`View ${product.name}`}
      >
        {/* Image */}
        {/* REPLACE with actual product image */}
        <div
          className="w-40 sm:w-48 flex-shrink-0 flex items-center justify-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, var(--color-cream) 0%, var(--color-cream-dark) 100%)",
          }}
        >
          <div className="text-center py-6 px-4">
            <span className="text-4xl block mb-1">🫙</span>
            <span
              className="font-dm-sans text-xs"
              style={{ color: "var(--color-grey)" }}
            >
              {/* REPLACE: /images/products/{product.slug}.jpg */}
              Product Image
            </span>
          </div>
          {/* Veg badge */}
          <div
            className="absolute top-2 left-2 w-5 h-5 flex items-center justify-center rounded"
            style={{ background: "white", border: "1.5px solid #2E7D32" }}
          >
            <span className="block w-2.5 h-2.5 rounded-full" style={{ background: "#2E7D32" }} />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 py-4 pr-4 gap-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span
                className={`badge-spice text-[0.6875rem] font-semibold ${spiceConfig.className}`}
              >
                {spiceConfig.emoji} {spiceConfig.label}
              </span>
              <h3
                className="font-playfair font-bold text-lg mt-1.5 leading-tight"
                style={{ color: "var(--color-brown)" }}
              >
                {product.name}
              </h3>
              <p
                className="font-cormorant italic text-base"
                style={{ color: "var(--color-grey)" }}
              >
                {product.subtitle}
              </p>
            </div>
            <button
              onClick={handleWishlist}
              className="p-2 rounded-lg flex-shrink-0 transition-all"
              style={{ color: wishlisted ? "var(--color-crimson)" : "var(--color-grey)" }}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart size={18} fill={wishlisted ? "var(--color-crimson)" : "none"} />
            </button>
          </div>

          <p
            className="font-dm-sans text-sm leading-relaxed line-clamp-2 hidden sm:block"
            style={{ color: "var(--color-grey)" }}
          >
            {product.short_description}
          </p>

          <div className="flex items-center justify-between mt-auto gap-4">
            {/* Weight + Price */}
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                {product.variants.map((v, i) => (
                  <button
                    key={v.label}
                    onClick={(e) => { e.preventDefault(); setSelectedVariantIndex(i); }}
                    className="px-3 py-1 rounded-lg font-dm-sans text-xs font-semibold transition-all duration-200"
                    style={{
                      background: selectedVariantIndex === i ? "var(--color-crimson)" : "var(--color-cream)",
                      color: selectedVariantIndex === i ? "white" : "var(--color-brown)",
                      border: `1.5px solid ${selectedVariantIndex === i ? "var(--color-crimson)" : "rgba(200,150,12,0.2)"}`,
                    }}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
              <span
                className="font-dm-sans font-bold text-lg"
                style={{ color: "var(--color-crimson)" }}
              >
                {formatPrice(selectedVariant.price)}
              </span>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-dm-sans text-sm font-semibold transition-all duration-200 disabled:opacity-60 flex-shrink-0"
              style={{
                background: "var(--color-brown)",
                color: "white",
                boxShadow: "0 2px 8px rgba(74,44,10,0.2)",
              }}
            >
              {adding ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ShoppingBag size={16} />
              )}
              {adding ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        </div>
      </Link>
    );
  }

  // ─── GRID VIEW (default) ────────────────────────────────────────────────
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "white",
        border: "1px solid rgba(200,150,12,0.15)",
        boxShadow: "0 2px 16px rgba(74,44,10,0.07)",
      }}
      aria-label={`View ${product.name}`}
      onMouseEnter={() => setImageHovered(true)}
      onMouseLeave={() => setImageHovered(false)}
    >
      {/* ─── Gold border glow on hover ─────────────────────────────────── */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 z-10"
        style={{
          boxShadow: "0 0 0 2px rgba(200,150,12,0.45)",
          opacity: imageHovered ? 1 : 0,
        }}
      />

      {/* ─── Gold corner ornaments ─────────────────────────────────────── */}
      <span className="corner-tl z-20" />
      <span className="corner-tr z-20" />
      <span className="corner-bl z-20" />
      <span className="corner-br z-20" />

      {/* ─── Image Area ─────────────────────────────────────────────────── */}
      {/* REPLACE with actual product image */}
      <div
        className="relative aspect-square overflow-hidden rounded-t-2xl"
        style={{
          background: "linear-gradient(135deg, var(--color-cream) 0%, var(--color-cream-dark) 100%)",
        }}
      >
        {/* Placeholder — REPLACE with Next.js <Image /> */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 transition-transform duration-400 group-hover:scale-105">
          <span
            className="text-5xl transition-transform duration-300"
            style={{
              filter: "drop-shadow(0 3px 8px rgba(74,44,10,0.2))",
              transform: imageHovered ? "scale(1.1) translateY(-4px)" : "scale(1)",
            }}
          >
            🫙
          </span>
          <span
            className="font-dm-sans text-xs text-center px-2"
            style={{ color: "var(--color-grey)" }}
          >
            {/* REPLACE: /images/products/{product.slug}.jpg */}
            Product Photo
          </span>
        </div>

        {/* Product tag */}
        <div
          className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full font-dm-sans text-[0.6rem] font-600 z-20"
          style={{
            background: "white",
            color: "var(--color-brown)",
            boxShadow: "0 2px 6px rgba(74,44,10,0.1)",
            border: "1px solid rgba(200,150,12,0.2)",
            fontWeight: 600,
          }}
        >
          {product.tag}
        </div>

        {/* Veg dot */}
        <div
          className="absolute top-2.5 right-2.5 w-6 h-6 flex items-center justify-center rounded z-20"
          style={{ background: "white", border: "1.5px solid #2E7D32" }}
        >
          <span className="block w-3 h-3 rounded-full" style={{ background: "#2E7D32" }} />
        </div>

        {/* Wishlist button — appears on hover; pointer-events disabled when hidden */}
        <button
          onClick={handleWishlist}
          className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-20"
          style={{
            background: "white",
            boxShadow: "0 2px 8px rgba(74,44,10,0.12)",
            opacity: imageHovered ? 1 : 0,
            transform: imageHovered ? "scale(1)" : "scale(0.8)",
            color: wishlisted ? "var(--color-crimson)" : "var(--color-grey)",
            pointerEvents: imageHovered ? "auto" : "none",
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={14} fill={wishlisted ? "var(--color-crimson)" : "none"} />
        </button>

        {/* Quick view button — appears on hover */}
        <div
          className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full font-dm-sans text-xs font-semibold transition-all duration-200 z-20"
          style={{
            background: "rgba(74,44,10,0.85)",
            color: "white",
            backdropFilter: "blur(4px)",
            opacity: imageHovered ? 1 : 0,
            transform: imageHovered ? "translateY(0)" : "translateY(4px)",
          }}
        >
          <Eye size={12} />
          Quick View
        </div>
      </div>

      {/* ─── Card Content ────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4">
        {/* Top: Spice + Rating */}
        <div className="flex items-center justify-between mb-2">
          <span className={`badge-spice text-[0.65rem] font-semibold ${spiceConfig.className}`}>
            {spiceConfig.emoji} {spiceConfig.label}
          </span>
          <div className="flex items-center gap-0.5">
            <Star size={11} fill="var(--color-gold)" style={{ color: "var(--color-gold)" }} />
            <span
              className="font-dm-sans text-xs font-semibold"
              style={{ color: "var(--color-brown)" }}
            >
              4.9
            </span>
          </div>
        </div>

        {/* Name */}
        <h3
          className="font-playfair font-bold text-[0.9375rem] leading-tight mb-0.5"
          style={{ color: "var(--color-brown)" }}
        >
          {product.name}
        </h3>
        <p
          className="font-cormorant italic text-sm mb-3 leading-tight"
          style={{ color: "var(--color-grey)" }}
        >
          {product.subtitle}
        </p>

        {/* Weight selector */}
        <div className="flex gap-2 mb-3">
          {product.variants.map((variant, idx) => (
            <button
              key={variant.label}
              onClick={(e) => {
                e.preventDefault();
                setSelectedVariantIndex(idx);
              }}
              className="flex-1 py-1.5 rounded-lg font-dm-sans text-xs font-semibold transition-all duration-150"
              style={{
                background: selectedVariantIndex === idx ? "var(--color-crimson)" : "var(--color-cream)",
                color: selectedVariantIndex === idx ? "white" : "var(--color-brown)",
                border: `1.5px solid ${selectedVariantIndex === idx ? "var(--color-crimson)" : "rgba(200,150,12,0.2)"}`,
              }}
              aria-pressed={selectedVariantIndex === idx}
            >
              {variant.label}
            </button>
          ))}
        </div>

        {/* Price + Add to Cart */}
        <div className="flex flex-col gap-2 mt-auto">
          <div className="flex items-end justify-between">
            <div>
              <span
                className="font-dm-sans font-bold text-lg leading-none block"
                style={{ color: "var(--color-crimson)" }}
              >
                {formatPrice(selectedVariant.price)}
              </span>
              <span
                className="font-dm-sans text-[0.65rem]"
                style={{ color: "var(--color-grey)" }}
              >
                Free ship ≥ ₹499
              </span>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-dm-sans text-xs font-semibold transition-all duration-200 disabled:opacity-60"
            style={{
              background: adding ? "var(--color-gold)" : "var(--color-brown)",
              color: "white",
              boxShadow: "0 2px 6px rgba(74,44,10,0.2)",
            }}
          >
            {adding ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingBag size={13} />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}

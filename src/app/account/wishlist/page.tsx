"use client";
// src/app/account/wishlist/page.tsx
// Maa Flavours — Wishlist Page
// Shows products saved to wishlist, add to cart from wishlist, remove
// State managed via Zustand wishlistStore (in-memory + localStorage)

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { PRODUCTS } from "@/lib/constants/products";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

// ─── Wishlist storage (localStorage) ─────────────────────────────────────
const WISHLIST_KEY = "mf_wishlist";
function getWishlist(): string[] {
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]"); }
  catch { return []; }
}
function saveWishlist(slugs: string[]) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(slugs));
}

// ─── Spice badge ──────────────────────────────────────────────────────────
function SpiceBadge({ level }: { level: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    mild:   { label: "Mild",    color: "#2E7D32", bg: "rgba(46,125,50,0.1)" },
    medium: { label: "Medium",  color: "#B8750A", bg: "rgba(184,117,10,0.1)" },
    spicy:  { label: "Spicy",   color: "var(--color-badge-red)", bg: "rgba(178,34,34,0.1)" },
    "extra-hot": { label: "Extra Hot", color: "#8B0000", bg: "rgba(139,0,0,0.1)" },
  };
  const s = map[level] || map.spicy;
  return (
    <span className="font-dm-sans text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ background: s.bg, color: s.color }}>
      {level === "mild" ? "🟢" : level === "medium" ? "🟡" : "🔴"} {s.label}
    </span>
  );
}

// ─── Product Wishlist Card ────────────────────────────────────────────────
function WishlistCard({
  slug, onRemove,
}: { slug: string; onRemove: (slug: string) => void }) {
  const product = PRODUCTS.find((p) => p.slug === slug);
  const addToCart = useCartStore((s) => s.addItem);
  const [selectedVariant, setSelectedVariant] = useState(0);

  if (!product) return null; // Unknown slug — skip

  const variant = product.variants[selectedVariant];
  const EMOJI_MAP: Record<string, string> = {
    "drumstick-pickle": "🥢",
    "amla-pickle": "🫙",
    "pulihora-gongura": "🍃",
    "lemon-pickle": "🍋",
    "maamidi-allam": "🥭",
    "red-chilli-pickle": "🌶️",
  };
  const emoji = EMOJI_MAP[slug] || "🫙";

  const handleAddToCart = () => {
    addToCart(product.slug, selectedVariant, 1);
    toast.success(`${product.name} added to cart! 🛒`);
  };

  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group"
      style={{ background: "white", border: "1px solid rgba(200,150,12,0.12)", boxShadow: "0 2px 8px rgba(74,44,10,0.05)" }}>
      <div className="h-[2px]" style={{
        background: "linear-gradient(90deg,transparent,var(--color-gold) 25%,var(--color-gold-light) 50%,var(--color-gold) 75%,transparent)",
      }} />

      <div className="flex items-start gap-4 p-4">
        {/* Image placeholder */}
        <Link href={`/products/${product.slug}`}
          className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
          style={{ background: "linear-gradient(135deg,var(--color-cream) 0%, #EDE3C8 100%)", border: "1px solid rgba(200,150,12,0.15)" }}>
          {/* REPLACE with actual product image */}
          {emoji}
          {/* Veg dot */}
          <span className="absolute bottom-1 right-1 w-4 h-4 flex items-center justify-center rounded"
            style={{ background: "white", border: "1px solid #2E7D32" }}>
            <span className="block w-2.5 h-2.5 rounded-full" style={{ background: "#2E7D32" }} />
          </span>
        </Link>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link href={`/products/${product.slug}`}>
                <h3 className="font-dm-sans font-bold text-sm sm:text-base hover:underline"
                  style={{ color: "var(--color-brown)" }}>
                  {product.name}
                </h3>
              </Link>
              <p className="font-cormorant italic text-sm mt-0.5" style={{ color: "var(--color-grey)" }}>
                {product.subtitle}
              </p>
            </div>
            {/* Remove */}
            <button onClick={() => onRemove(slug)}
              className="p-1.5 rounded-lg flex-shrink-0 transition-all hover:scale-110 hover:bg-red-50"
              style={{ color: "var(--color-crimson)" }}
              title="Remove from wishlist">
              <Heart size={16} fill="currentColor" />
            </button>
          </div>

          {/* Spice badge */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <SpiceBadge level={product.spice_level} />
            <span className="font-dm-sans text-xs px-2 py-0.5 rounded-full"
              style={{ background: "rgba(200,150,12,0.1)", color: "var(--color-gold)" }}>
              🏷️ {product.tag}
            </span>
          </div>

          {/* Variant selector + price */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <div className="flex rounded-lg overflow-hidden"
              style={{ border: "1.5px solid rgba(200,150,12,0.2)" }}>
              {product.variants.map((v, i) => (
                <button key={i} onClick={() => setSelectedVariant(i)}
                  className="px-3 py-1.5 font-dm-sans text-xs font-semibold transition-all duration-200"
                  style={{
                    background: selectedVariant === i ? "var(--color-brown)" : "white",
                    color: selectedVariant === i ? "white" : "var(--color-grey)",
                    borderRight: i < product.variants.length - 1 ? "1px solid rgba(200,150,12,0.2)" : "none",
                  }}>
                  {v.label}
                </button>
              ))}
            </div>
            <span className="font-playfair font-bold text-lg" style={{ color: "var(--color-crimson)" }}>
              {formatPrice(variant.price)}
            </span>
          </div>

          {/* Add to cart */}
          <button onClick={handleAddToCart}
            className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl font-dm-sans text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            style={{ background: "var(--color-crimson)", color: "white" }}>
            <ShoppingCart size={15} />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setWishlist(getWishlist());
    setMounted(true);
  }, []);

  const handleRemove = (slug: string) => {
    const next = wishlist.filter((s) => s !== slug);
    setWishlist(next);
    saveWishlist(next);
    toast("Removed from wishlist", { icon: "💔" });
  };

  const clearAll = () => {
    if (!confirm("Clear entire wishlist?")) return;
    setWishlist([]);
    saveWishlist([]);
    toast("Wishlist cleared");
  };

  if (!mounted) return null; // Avoid SSR mismatch

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-playfair font-bold text-2xl" style={{ color: "var(--color-brown)" }}>
            Wishlist
          </h2>
          <p className="font-dm-sans text-sm mt-0.5" style={{ color: "var(--color-grey)" }}>
            {wishlist.length} pickle{wishlist.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        {wishlist.length > 0 && (
          <button onClick={clearAll}
            className="font-dm-sans text-xs font-semibold flex items-center gap-1.5 transition-opacity hover:opacity-70"
            style={{ color: "var(--color-crimson)" }}>
            <Trash2 size={13} />Clear all
          </button>
        )}
      </div>

      {/* Empty state */}
      {wishlist.length === 0 && (
        <div className="rounded-2xl p-12 text-center flex flex-col items-center gap-5"
          style={{ background: "white", border: "1px solid rgba(200,150,12,0.12)", boxShadow: "0 2px 12px rgba(74,44,10,0.05)" }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "var(--color-cream)", border: "2px dashed rgba(192,39,45,0.2)" }}>
            <Heart size={32} strokeWidth={1.5} style={{ color: "var(--color-crimson)", opacity: 0.5 }} />
          </div>
          <div>
            <h3 className="font-playfair font-bold text-lg" style={{ color: "var(--color-brown)" }}>
              Your wishlist is empty
            </h3>
            <p className="font-dm-sans text-sm mt-1" style={{ color: "var(--color-grey)" }}>
              Tap the ♥ heart on any pickle to save it here for later
            </p>
          </div>
          <Link href="/products" className="btn-primary py-3 px-8 gap-2">
            <ShoppingBag size={17} />Browse Pickles
          </Link>
        </div>
      )}

      {/* Wishlist cards */}
      {wishlist.length > 0 && (
        <>
          <div className="flex flex-col gap-4">
            {wishlist.map((slug) => (
              <WishlistCard key={slug} slug={slug} onRemove={handleRemove} />
            ))}
          </div>

          {/* CTA bar */}
          <div className="rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
            style={{ background: "var(--color-cream)", border: "1px solid rgba(200,150,12,0.15)" }}>
            <div>
              <p className="font-dm-sans font-semibold text-sm" style={{ color: "var(--color-brown)" }}>
                Want to explore more?
              </p>
              <p className="font-dm-sans text-xs mt-0.5" style={{ color: "var(--color-grey)" }}>
                All 6 authentic Andhra pickle varieties available
              </p>
            </div>
            <Link href="/products"
              className="flex items-center gap-1.5 font-dm-sans text-sm font-bold flex-shrink-0"
              style={{ color: "var(--color-crimson)" }}>
              See all <ArrowRight size={14} />
            </Link>
          </div>
        </>
      )}

      {/* How it works tip */}
      <div className="px-4 py-3 rounded-xl flex items-start gap-2"
        style={{ background: "rgba(200,150,12,0.04)", border: "1px solid rgba(200,150,12,0.1)" }}>
        <span className="text-base">💡</span>
        <p className="font-dm-sans text-xs" style={{ color: "var(--color-grey)" }}>
          Tap the ♥ heart icon on any product page or product card to add it to your wishlist.
          Wishlist is saved on this device.
        </p>
      </div>
    </div>
  );
}

"use client";
// src/components/product/RelatedProducts.tsx
// Maa Flavours — Related Products strip below the product detail
// Shows other pickles (excluding current), horizontal scroll on mobile

import Link from "next/link";
import { ArrowRight, Star, ShoppingBag } from "lucide-react";
import { PRODUCTS } from "@/lib/constants/products";
import { formatPrice, getSpiceLevelConfig } from "@/lib/utils";
import { useState } from "react";
import toast from "react-hot-toast";

interface RelatedProductsProps {
  currentSlug: string;
}

function RelatedCard({ product }: { product: (typeof PRODUCTS)[0] }) {
  const [adding, setAdding] = useState(false);
  const spiceConfig = getSpiceLevelConfig(product.spice_level);
  const lowestPrice = Math.min(...product.variants.map((v) => v.price));

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    setAdding(true);
    await new Promise((r) => setTimeout(r, 500));
    toast.success(`${product.name} added!`);
    setAdding(false);
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex-shrink-0 w-[200px] sm:w-[220px] rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "white",
        border: "1px solid rgba(200,150,12,0.15)",
        boxShadow: "0 2px 12px rgba(74,44,10,0.06)",
      }}
    >
      {/* Image placeholder — REPLACE with actual product image */}
      <div
        className="aspect-square flex flex-col items-center justify-center gap-1.5 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, var(--color-cream), var(--color-cream-dark))",
        }}
      >
        <span className="text-4xl group-hover:scale-110 transition-transform duration-300">🫙</span>
        <p
          className="font-dm-sans text-[0.6rem] text-center"
          style={{ color: "var(--color-grey)" }}
        >
          {/* REPLACE: /images/products/{product.slug}.jpg */}
          Product Image
        </p>

        {/* Veg dot */}
        <div
          className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded"
          style={{ background: "white", border: "1.5px solid #2E7D32" }}
        >
          <span className="block w-2.5 h-2.5 rounded-full" style={{ background: "#2E7D32" }} />
        </div>
      </div>

      <div className="flex flex-col flex-1 p-3 gap-2">
        {/* Spice */}
        <span className={`badge-spice text-[0.6rem] font-semibold self-start ${spiceConfig.className}`}>
          {spiceConfig.emoji} {spiceConfig.label}
        </span>

        {/* Name */}
        <h4
          className="font-playfair font-semibold text-sm leading-tight"
          style={{ color: "var(--color-brown)" }}
        >
          {product.name}
        </h4>

        <div className="flex items-center gap-1">
          <Star size={11} fill="var(--color-gold)" style={{ color: "var(--color-gold)" }} />
          <span className="font-dm-sans text-xs font-semibold" style={{ color: "var(--color-brown)" }}>
            4.9
          </span>
        </div>

        {/* Price + Add */}
        <div className="flex items-center justify-between mt-auto">
          <span
            className="font-dm-sans font-bold text-base"
            style={{ color: "var(--color-crimson)" }}
          >
            {formatPrice(lowestPrice)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-dm-sans text-xs font-semibold transition-all duration-200"
            style={{
              background: adding ? "var(--color-gold)" : "var(--color-brown)",
              color: "white",
            }}
          >
            {adding ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ShoppingBag size={12} />
            )}
            {adding ? "..." : "Add"}
          </button>
        </div>
      </div>
    </Link>
  );
}

export default function RelatedProducts({ currentSlug }: RelatedProductsProps) {
  const related = PRODUCTS.filter((p) => p.slug !== currentSlug);

  return (
    <section className="py-10 border-t" style={{ borderColor: "rgba(200,150,12,0.12)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="section-eyebrow block mb-1">You Might Also Like</span>
          <h2
            className="font-playfair font-bold text-xl"
            style={{ color: "var(--color-brown)" }}
          >
            More Andhra Pickles
          </h2>
        </div>
        <Link
          href="/products"
          className="hidden sm:flex items-center gap-1.5 font-dm-sans text-sm font-semibold transition-colors duration-200 hover:text-gold"
          style={{ color: "var(--color-crimson)" }}
        >
          See All <ArrowRight size={15} />
        </Link>
      </div>

      {/* Horizontal scroll strip */}
      <div
        className="flex gap-4 overflow-x-auto pb-3 scrollbar-brand -mx-1 px-1"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {related.map((product) => (
          <div
            key={product.slug}
            style={{ scrollSnapAlign: "start" }}
          >
            <RelatedCard product={product} />
          </div>
        ))}
      </div>

      {/* Mobile see all */}
      <div className="sm:hidden mt-4 text-center">
        <Link href="/products" className="btn-ghost py-2.5 px-6 text-sm">
          See All Pickles →
        </Link>
      </div>
    </section>
  );
}

// src/app/products/[slug]/not-found.tsx
// Maa Flavours — 404 for product not found
// Shows when a product slug doesn't match any product in the catalog

import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "var(--color-warm-white)" }}
    >
      {/* Decorative jar */}
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-6"
        style={{
          background: "var(--color-cream)",
          border: "2px dashed rgba(200,150,12,0.3)",
        }}
      >
        🫙
      </div>

      {/* Gold ornament */}
      <div className="ornament-line w-24 mb-6" />

      <span className="section-eyebrow block mb-3">Pickle Not Found</span>

      <h1
        className="font-playfair font-bold text-3xl mb-3 leading-tight"
        style={{ color: "var(--color-brown)" }}
      >
        This Jar Has Run Out
      </h1>
      <p
        className="font-dm-sans text-base mb-8 max-w-sm"
        style={{ color: "var(--color-grey)" }}
      >
        We couldn't find this pickle. It may have been moved or is temporarily unavailable.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/products" className="btn-primary py-3 px-7">
          Browse All Pickles
        </Link>
        <Link href="/" className="btn-ghost py-3 px-7">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

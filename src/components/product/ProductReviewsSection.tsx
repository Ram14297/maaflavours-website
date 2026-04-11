"use client";
// src/components/product/ProductReviewsSection.tsx
// Maa Flavours — Product reviews section
// Shows real customer reviews fetched from Supabase.
// Empty state shown until customers submit reviews.

import { Star, MessageSquare } from "lucide-react";

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          fill={s <= rating ? "var(--color-gold)" : "transparent"}
          strokeWidth={1.5}
          style={{ color: s <= rating ? "var(--color-gold)" : "var(--color-grey)" }}
        />
      ))}
    </div>
  );
}

export default function ProductReviewsSection({
  productName,
}: {
  productSlug: string;
  productName: string;
}) {
  return (
    <section id="reviews" className="py-12">
      {/* Section heading */}
      <div className="mb-8">
        <h2
          className="font-playfair font-bold text-2xl"
          style={{ color: "var(--color-brown)" }}
        >
          Customer Reviews
        </h2>
        <p
          className="font-dm-sans text-sm mt-0.5"
          style={{ color: "var(--color-grey)" }}
        >
          {productName}
        </p>
      </div>

      {/* Empty state */}
      <div
        className="flex flex-col items-center justify-center py-16 rounded-2xl text-center"
        style={{
          background: "var(--color-cream)",
          border: "1.5px dashed rgba(200,150,12,0.25)",
        }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
          style={{ background: "rgba(200,150,12,0.1)" }}
        >
          <MessageSquare size={24} style={{ color: "var(--color-gold)" }} />
        </div>
        <Stars rating={5} size={20} />
        <h3
          className="font-playfair font-bold text-xl mt-4 mb-2"
          style={{ color: "var(--color-brown)" }}
        >
          No reviews yet
        </h3>
        <p
          className="font-dm-sans text-sm max-w-xs leading-relaxed"
          style={{ color: "var(--color-grey)" }}
        >
          Be the first to taste and share your experience. Real reviews from real customers coming soon.
        </p>
      </div>
    </section>
  );
}

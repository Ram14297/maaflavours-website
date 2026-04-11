"use client";
// src/components/reviews/TestimonialsSection.tsx
// Maa Flavours — Customer Testimonials / Google Reviews Section
// Carousel on mobile, 3-col grid on desktop
// Data fetched from Supabase testimonials table

import { useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote, ExternalLink } from "lucide-react";

export interface Testimonial {
  id: string;
  name: string;
  city: string;
  rating: number;
  review: string;
  product: string | null;
  source: string;
  created_at: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          fill={star <= rating ? "var(--color-gold)" : "transparent"}
          strokeWidth={1.5}
          style={{ color: star <= rating ? "var(--color-gold)" : "var(--color-grey)" }}
        />
      ))}
    </div>
  );
}

function SourceBadge({ source }: { source: string }) {
  if (source === "google") {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-dm-sans text-xs font-semibold"
        style={{
          background: "rgba(66,133,244,0.08)",
          color: "#4285F4",
          border: "1px solid rgba(66,133,244,0.2)",
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Google
      </span>
    );
  }
  if (source === "whatsapp") {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-dm-sans text-xs font-semibold"
        style={{
          background: "rgba(37,211,102,0.08)",
          color: "#25D366",
          border: "1px solid rgba(37,211,102,0.2)",
        }}
      >
        WhatsApp
      </span>
    );
  }
  return null;
}

function ReviewCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div
      className="card-ornate flex flex-col gap-4 p-6 h-full"
      style={{ background: "white" }}
    >
      {/* Top row: quote + source badge */}
      <div className="flex items-start justify-between">
        <Quote
          size={24}
          style={{ color: "var(--color-gold)", opacity: 0.4, flexShrink: 0 }}
        />
        <SourceBadge source={testimonial.source} />
      </div>

      {/* Review text */}
      <p
        className="font-dm-sans text-sm leading-relaxed flex-1"
        style={{ color: "var(--color-grey)" }}
      >
        &ldquo;{testimonial.review}&rdquo;
      </p>

      {/* Product tag */}
      {testimonial.product && (
        <div
          className="inline-flex self-start px-3 py-1 rounded-full font-dm-sans text-xs font-semibold"
          style={{
            background: "rgba(192,39,45,0.08)",
            color: "var(--color-crimson)",
            border: "1px solid rgba(192,39,45,0.15)",
          }}
        >
          {testimonial.product}
        </div>
      )}

      {/* Bottom: reviewer info + stars */}
      <div
        className="flex items-center justify-between pt-3 border-t"
        style={{ borderColor: "rgba(200,150,12,0.12)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-playfair font-bold text-sm flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, var(--color-cream-dark), var(--color-cream))",
              color: "var(--color-brown)",
              border: "1.5px solid rgba(200,150,12,0.2)",
            }}
          >
            {testimonial.name[0]}
          </div>
          <div>
            <p
              className="font-dm-sans font-semibold text-sm leading-none"
              style={{ color: "var(--color-brown)" }}
            >
              {testimonial.name}
            </p>
            <p className="font-dm-sans text-xs mt-0.5" style={{ color: "var(--color-grey)" }}>
              {testimonial.city}
            </p>
          </div>
        </div>
        <StarRating rating={testimonial.rating} />
      </div>
    </div>
  );
}

interface Props {
  testimonials: Testimonial[];
  googleReviewLink?: string;
}

export default function TestimonialsSection({ testimonials, googleReviewLink }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  const prev = () =>
    setActiveIndex((i) => (i === 0 ? testimonials.length - 1 : i - 1));
  const next = () =>
    setActiveIndex((i) => (i === testimonials.length - 1 ? 0 : i + 1));

  if (!testimonials.length) return null;

  const avgRating =
    Math.round(
      (testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length) * 10
    ) / 10;

  return (
    <section className="section-padding" style={{ background: "var(--color-cream)" }}>
      <div className="section-container">

        {/* ─── Header ─────────────────────────────────────────────────── */}
        <div className="text-center mb-12 lg:mb-14">
          <p className="font-dancing text-2xl mb-2" style={{ color: "var(--color-crimson)" }}>
            Loved Across India
          </p>
          <h2
            className="font-playfair font-bold leading-tight mb-4"
            style={{ color: "var(--color-brown)", fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
          >
            What Our Customers Say
          </h2>

          {/* Divider */}
          <div
            className="h-px w-24 mx-auto mb-5"
            style={{
              background:
                "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)",
            }}
          />

          {/* Aggregate rating */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={20}
                  fill="var(--color-gold)"
                  style={{ color: "var(--color-gold)" }}
                />
              ))}
            </div>
            <span
              className="font-dm-sans font-bold text-xl"
              style={{ color: "var(--color-brown)" }}
            >
              {avgRating}/5
            </span>
            <span className="font-dm-sans text-sm" style={{ color: "var(--color-grey)" }}>
              · {testimonials.length}+ Happy Customers
            </span>
          </div>
        </div>

        {/* ─── Desktop Grid ────────────────────────────────────────────── */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {testimonials.map((t) => (
            <ReviewCard key={t.id} testimonial={t} />
          ))}
        </div>

        {/* ─── Mobile Carousel ─────────────────────────────────────────── */}
        <div className="md:hidden">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-400"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((t) => (
                <div key={t.id} className="w-full flex-shrink-0 px-1">
                  <ReviewCard testimonial={t} />
                </div>
              ))}
            </div>
          </div>

          {/* Carousel controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                background: "white",
                border: "1.5px solid rgba(200,150,12,0.3)",
                color: "var(--color-brown)",
                boxShadow: "0 2px 8px rgba(74,44,10,0.08)",
              }}
              aria-label="Previous review"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-1.5">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === activeIndex ? "20px" : "6px",
                    height: "6px",
                    background:
                      i === activeIndex
                        ? "var(--color-gold)"
                        : "rgba(200,150,12,0.3)",
                  }}
                  aria-label={`Go to review ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                background: "white",
                border: "1.5px solid rgba(200,150,12,0.3)",
                color: "var(--color-brown)",
                boxShadow: "0 2px 8px rgba(74,44,10,0.08)",
              }}
              aria-label="Next review"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* ─── CTA — Leave a Review ────────────────────────────────────── */}
        {googleReviewLink && (
          <div className="text-center mt-12">
            <p
              className="font-cormorant italic text-lg mb-4"
              style={{ color: "var(--color-grey)" }}
            >
              Tried our pickles? We&apos;d love to hear from you!
            </p>
            <a
              href={googleReviewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 btn-primary py-3.5 px-8"
            >
              <ExternalLink size={16} />
              Leave a Google Review
            </a>
          </div>
        )}

      </div>
    </section>
  );
}

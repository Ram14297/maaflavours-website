"use client";
// src/components/home/Reviews.tsx
// Maa Flavours — Customer Reviews Section
// Carousel on mobile, 3-col grid on desktop
// Name, city, star rating, review text, product purchased

import { useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

// Static seed reviews — replace with Supabase-fetched data
const REVIEWS = [
  {
    id: 1,
    name: "Surekha Reddy",
    city: "Hyderabad",
    rating: 5,
    product: "Pulihora Gongura",
    review:
      "I've been searching for a gongura pickle that tastes exactly like what my grandmother used to make. Maa Flavours nailed it — the balance of sour and spice is perfect. Ordered three jars already!",
    date: "2 weeks ago",
  },
  {
    id: 2,
    name: "Venkat Rao",
    city: "Bangalore",
    rating: 5,
    product: "Drumstick Pickle",
    review:
      "Living in Bangalore and missing Andhra food is real. This drumstick pickle solves that problem completely. The oil is fragrant, the drumstick texture is spot on. Highly recommend!",
    date: "1 month ago",
  },
  {
    id: 3,
    name: "Priya Naidu",
    city: "Chennai",
    rating: 5,
    product: "Lemon Pickle",
    review:
      "The lemon pickle is tangy perfection. You can tell it's made with love — the spices are balanced beautifully, not too salty, not too oily. Exactly how Maa used to make it back home.",
    date: "3 weeks ago",
  },
  {
    id: 4,
    name: "Ramesh Babu",
    city: "Pune",
    rating: 5,
    product: "Maamidi Allam",
    review:
      "Maamidi Allam with hot dosa is heaven! The sweet-spicy balance is incredible. My kids devour it. We've gifted jars to relatives visiting and everyone wants to order online now.",
    date: "2 months ago",
  },
  {
    id: 5,
    name: "Kavitha Sharma",
    city: "Mumbai",
    rating: 5,
    product: "Amla Pickle",
    review:
      "The amla pickle is absolutely delicious. You can taste the freshness — zero artificial smell or taste. Just pure homemade goodness. Will be a regular customer for sure.",
    date: "1 month ago",
  },
  {
    id: 6,
    name: "Anjali Devi",
    city: "Delhi",
    rating: 5,
    product: "Red Chilli Pickle",
    review:
      "For someone who loves spicy food, this red chilli pickle is a dream. Packs serious heat but with amazing flavour depth. Pairs perfectly with curd rice. Cannot stop ordering!",
    date: "3 weeks ago",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          fill={star <= rating ? "var(--color-gold)" : "transparent"}
          strokeWidth={1.5}
          style={{
            color:
              star <= rating ? "var(--color-gold)" : "var(--color-grey)",
          }}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: (typeof REVIEWS)[0] }) {
  return (
    <div
      className="card-ornate flex flex-col gap-4 p-6 h-full"
      style={{ background: "white" }}
    >
      {/* Quote icon */}
      <Quote
        size={24}
        style={{
          color: "var(--color-gold)",
          opacity: 0.4,
          flexShrink: 0,
        }}
      />

      {/* Review text */}
      <p
        className="font-dm-sans text-sm leading-relaxed flex-1"
        style={{ color: "var(--color-grey)" }}
      >
        "{review.review}"
      </p>

      {/* Product tag */}
      <div
        className="inline-flex self-start px-3 py-1 rounded-full font-dm-sans text-xs font-semibold"
        style={{
          background: "rgba(192,39,45,0.08)",
          color: "var(--color-crimson)",
          border: "1px solid rgba(192,39,45,0.15)",
        }}
      >
        {review.product}
      </div>

      {/* Bottom: reviewer info */}
      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "rgba(200,150,12,0.12)" }}>
        <div className="flex items-center gap-3">
          {/* Avatar initial */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-playfair font-bold text-sm flex-shrink-0"
            style={{
              background:
                "linear-gradient(135deg, var(--color-cream-dark), var(--color-cream))",
              color: "var(--color-brown)",
              border: "1.5px solid rgba(200,150,12,0.2)",
            }}
          >
            {review.name[0]}
          </div>
          <div>
            <p
              className="font-dm-sans font-semibold text-sm leading-none"
              style={{ color: "var(--color-brown)" }}
            >
              {review.name}
            </p>
            <p
              className="font-dm-sans text-xs mt-0.5"
              style={{ color: "var(--color-grey)" }}
            >
              {review.city} · {review.date}
            </p>
          </div>
        </div>
        <StarRating rating={review.rating} />
      </div>
    </div>
  );
}

export default function Reviews() {
  const [activeIndex, setActiveIndex] = useState(0);
  const VISIBLE = 1; // 1 card at a time on mobile carousel

  const prev = () =>
    setActiveIndex((i) => (i === 0 ? REVIEWS.length - 1 : i - 1));
  const next = () =>
    setActiveIndex((i) => (i === REVIEWS.length - 1 ? 0 : i + 1));

  return (
    <section
      className="section-padding bg-warm-texture"
      id="reviews"
    >
      <div className="section-container">
        {/* ─── Header ──────────────────────────────────────────────────── */}
        <div className="text-center mb-12 lg:mb-14">
          <span className="section-eyebrow block mb-3">Loved Across India</span>
          <h2 className="section-title mb-3">What Our Customers Say</h2>
          {/* Aggregate rating */}
          <div className="flex items-center justify-center gap-3 mt-4">
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
              4.9/5
            </span>
            <span
              className="font-dm-sans text-sm"
              style={{ color: "var(--color-grey)" }}
            >
              · 100+ Happy Customers
            </span>
          </div>
        </div>

        {/* ─── Desktop Grid ─────────────────────────────────────────────── */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {REVIEWS.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {/* ─── Mobile Carousel ──────────────────────────────────────────── */}
        <div className="md:hidden">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-400"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {REVIEWS.map((review) => (
                <div key={review.id} className="w-full flex-shrink-0 px-1">
                  <ReviewCard review={review} />
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

            {/* Dot indicators */}
            <div className="flex items-center gap-1.5">
              {REVIEWS.map((_, i) => (
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
      </div>
    </section>
  );
}

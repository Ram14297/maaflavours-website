"use client";
// src/components/product/ProductReviewsSection.tsx
// Maa Flavours — Product reviews section
// Shows: star rating breakdown, individual reviews, "Write a Review" form
// Fetches from Supabase — stubbed with static data until connected

import { useState } from "react";
import { Star, ThumbsUp, ChevronDown } from "lucide-react";
import { formatDate } from "@/lib/utils";

// ─── Static seed reviews per product ────────────────────────────────────
const SEED_REVIEWS: Record<string, Review[]> = {
  "drumstick-pickle": [
    {
      id: "1",
      name: "Surekha Reddy",
      city: "Hyderabad",
      rating: 5,
      title: "Exactly like Maa made it!",
      body: "I've been searching for a drumstick pickle that tastes like my grandmother's recipe. Maa Flavours nailed it — the spice balance is perfect, the oil is fragrant, and the texture of the drumstick pieces is spot on. Already on my third pack!",
      verified: true,
      helpful: 12,
      date: "2025-01-15",
    },
    {
      id: "2",
      name: "Venkat Rao",
      city: "Bangalore",
      rating: 5,
      title: "Authentic Andhra flavour delivered to Bangalore",
      body: "Living far from Andhra, I crave this kind of home-style pickle constantly. The quality is outstanding — fresh, aromatic, no artificial taste whatsoever. Worth every rupee.",
      verified: true,
      helpful: 8,
      date: "2025-01-22",
    },
    {
      id: "3",
      name: "Priya M",
      city: "Chennai",
      rating: 4,
      title: "Really good, slightly oilier than expected",
      body: "Very authentic flavour — my husband who is from Andhra approved immediately. The only minor thing is it's slightly oilier than I expected but I think that's just the traditional style. Will reorder.",
      verified: true,
      helpful: 4,
      date: "2025-02-01",
    },
  ],
  "default": [
    {
      id: "1",
      name: "Anjali Devi",
      city: "Mumbai",
      rating: 5,
      title: "Outstanding quality!",
      body: "Pure, fresh, and incredibly flavourful. You can immediately tell this is made at home with real ingredients — not factory-produced. The packaging was secure and arrived in perfect condition.",
      verified: true,
      helpful: 9,
      date: "2025-01-18",
    },
    {
      id: "2",
      name: "Ramesh Babu",
      city: "Pune",
      rating: 5,
      title: "Best pickle I've ordered online",
      body: "Been ordering from multiple online pickle brands. Maa Flavours is hands down the best. Gifted 3 packs to relatives and they all want to know where to order more.",
      verified: true,
      helpful: 15,
      date: "2025-02-05",
    },
  ],
};

interface Review {
  id: string;
  name: string;
  city: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  helpful: number;
  date: string;
}

// ─── Star rating display ──────────────────────────────────────────────────
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

// ─── Rating bar (for breakdown) ───────────────────────────────────────────
function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span
        className="font-dm-sans text-xs w-8 text-right flex-shrink-0"
        style={{ color: "var(--color-grey)" }}
      >
        {label}⭐
      </span>
      <div
        className="flex-1 h-2 rounded-full overflow-hidden"
        style={{ background: "rgba(200,150,12,0.12)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, var(--color-gold), var(--color-gold-light))",
          }}
        />
      </div>
      <span
        className="font-dm-sans text-xs w-4 flex-shrink-0"
        style={{ color: "var(--color-grey)" }}
      >
        {count}
      </span>
    </div>
  );
}

// ─── Write Review Form ────────────────────────────────────────────────────
function WriteReviewForm({
  onClose,
  productName,
}: {
  onClose: () => void;
  productName: string;
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // TODO: POST to /api/reviews with { productSlug, rating, name, title, body }
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          background: "rgba(46,125,50,0.06)",
          border: "1px solid rgba(46,125,50,0.2)",
        }}
      >
        <div className="text-4xl mb-3">✅</div>
        <h4
          className="font-playfair font-bold text-xl mb-2"
          style={{ color: "var(--color-brown)" }}
        >
          Thank you for your review!
        </h4>
        <p
          className="font-dm-sans text-sm"
          style={{ color: "var(--color-grey)" }}
        >
          Your review will be visible after we verify it. We appreciate your feedback!
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card-ornate p-6 flex flex-col gap-5"
    >
      <h3
        className="font-playfair font-bold text-xl"
        style={{ color: "var(--color-brown)" }}
      >
        Write a Review
      </h3>
      <p
        className="font-dm-sans text-sm -mt-3"
        style={{ color: "var(--color-grey)" }}
      >
        Share your experience with {productName}
      </p>

      {/* Star rating picker */}
      <div>
        <label
          className="block font-dm-sans text-sm font-semibold mb-2"
          style={{ color: "var(--color-brown)" }}
        >
          Your Rating *
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setRating(s)}
              onMouseEnter={() => setHoverRating(s)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform duration-100 hover:scale-125"
              aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`}
            >
              <Star
                size={28}
                fill={s <= (hoverRating || rating) ? "var(--color-gold)" : "transparent"}
                strokeWidth={1.5}
                style={{
                  color: s <= (hoverRating || rating) ? "var(--color-gold)" : "rgba(200,150,12,0.3)",
                }}
              />
            </button>
          ))}
          <span
            className="ml-2 font-dm-sans text-sm"
            style={{ color: "var(--color-grey)" }}
          >
            {["", "Poor", "Fair", "Good", "Very Good", "Excellent!"][hoverRating || rating]}
          </span>
        </div>
      </div>

      {/* Name */}
      <div>
        <label
          className="block font-dm-sans text-sm font-semibold mb-1.5"
          style={{ color: "var(--color-brown)" }}
        >
          Your Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Priya from Chennai"
          required
          className="input-brand"
        />
      </div>

      {/* Title */}
      <div>
        <label
          className="block font-dm-sans text-sm font-semibold mb-1.5"
          style={{ color: "var(--color-brown)" }}
        >
          Review Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          required
          className="input-brand"
          maxLength={100}
        />
      </div>

      {/* Body */}
      <div>
        <label
          className="block font-dm-sans text-sm font-semibold mb-1.5"
          style={{ color: "var(--color-brown)" }}
        >
          Your Review *
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tell others what you liked or didn't like about this pickle..."
          required
          rows={4}
          className="input-brand resize-none"
          maxLength={1000}
          style={{ resize: "none" }}
        />
        <p
          className="font-dm-sans text-xs mt-1 text-right"
          style={{ color: "var(--color-grey)" }}
        >
          {body.length}/1000
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="btn-ghost flex-1 py-3"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !name || !title || !body}
          className="btn-primary flex-1 py-3 disabled:opacity-60"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting…
            </span>
          ) : (
            "Submit Review"
          )}
        </button>
      </div>
    </form>
  );
}

// ─── Single Review Card ───────────────────────────────────────────────────
function ReviewCard({ review }: { review: Review }) {
  const [helpful, setHelpful] = useState(review.helpful);
  const [voted, setVoted] = useState(false);

  return (
    <div
      className="py-5 border-b last:border-0"
      style={{ borderColor: "rgba(200,150,12,0.1)" }}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-playfair font-bold text-base flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, var(--color-cream-dark), var(--color-cream))",
            color: "var(--color-brown)",
            border: "1.5px solid rgba(200,150,12,0.2)",
          }}
        >
          {review.name[0]}
        </div>

        <div className="flex-1">
          {/* Name + verified */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className="font-dm-sans font-semibold text-sm"
              style={{ color: "var(--color-brown)" }}
            >
              {review.name}
            </span>
            <span
              className="font-dm-sans text-xs"
              style={{ color: "var(--color-grey)" }}
            >
              · {review.city}
            </span>
            {review.verified && (
              <span
                className="flex items-center gap-1 font-dm-sans text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(46,125,50,0.1)",
                  color: "#2E7D32",
                  border: "1px solid rgba(46,125,50,0.2)",
                }}
              >
                ✓ Verified Purchase
              </span>
            )}
          </div>

          {/* Stars + date */}
          <div className="flex items-center justify-between mb-2">
            <Stars rating={review.rating} size={14} />
            <span
              className="font-dm-sans text-xs"
              style={{ color: "var(--color-grey)" }}
            >
              {formatDate(review.date)}
            </span>
          </div>

          {/* Title */}
          <h5
            className="font-dm-sans font-semibold text-sm mb-1"
            style={{ color: "var(--color-brown)" }}
          >
            {review.title}
          </h5>

          {/* Body */}
          <p
            className="font-dm-sans text-sm leading-relaxed"
            style={{ color: "var(--color-grey)" }}
          >
            {review.body}
          </p>

          {/* Helpful */}
          <button
            onClick={() => {
              if (!voted) {
                setHelpful((h) => h + 1);
                setVoted(true);
              }
            }}
            className="mt-3 flex items-center gap-1.5 font-dm-sans text-xs transition-colors duration-200"
            style={{
              color: voted ? "var(--color-gold)" : "var(--color-grey)",
              cursor: voted ? "default" : "pointer",
            }}
            disabled={voted}
          >
            <ThumbsUp size={13} fill={voted ? "var(--color-gold)" : "none"} />
            Helpful ({helpful})
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────
export default function ProductReviewsSection({
  productSlug,
  productName,
}: {
  productSlug: string;
  productName: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const reviews = SEED_REVIEWS[productSlug] || SEED_REVIEWS["default"];
  const avgRating =
    reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

  // Rating breakdown
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const displayedReviews = showAll ? reviews : reviews.slice(0, 2);

  return (
    <section id="reviews" className="py-12">
      {/* Section heading */}
      <div className="flex items-center justify-between mb-8">
        <div>
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
            {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowForm((f) => !f)}
          className="btn-ghost py-2.5 px-5 text-sm"
        >
          ✍️ Write Review
        </button>
      </div>

      {/* Write review form */}
      {showForm && (
        <div className="mb-8">
          <WriteReviewForm
            onClose={() => setShowForm(false)}
            productName={productName}
          />
        </div>
      )}

      {/* Rating summary */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-2xl mb-8"
        style={{
          background: "var(--color-cream)",
          border: "1px solid rgba(200,150,12,0.15)",
        }}
      >
        {/* Aggregate score */}
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <span
            className="font-playfair font-bold"
            style={{ color: "var(--color-brown)", fontSize: "3.5rem", lineHeight: 1 }}
          >
            {avgRating.toFixed(1)}
          </span>
          <Stars rating={Math.round(avgRating)} size={20} />
          <span
            className="font-dm-sans text-sm"
            style={{ color: "var(--color-grey)" }}
          >
            out of 5 · {reviews.length} reviews
          </span>
        </div>

        {/* Bar breakdown */}
        <div className="flex flex-col justify-center gap-2">
          {breakdown.map(({ star, count }) => (
            <RatingBar
              key={star}
              label={String(star)}
              count={count}
              total={reviews.length}
            />
          ))}
        </div>
      </div>

      {/* Review list */}
      <div>
        {displayedReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Show more */}
      {reviews.length > 2 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-dm-sans text-sm font-semibold transition-all duration-200"
          style={{
            border: "1.5px solid rgba(200,150,12,0.2)",
            color: "var(--color-brown)",
          }}
        >
          <ChevronDown size={16} />
          Show all {reviews.length} reviews
        </button>
      )}
    </section>
  );
}

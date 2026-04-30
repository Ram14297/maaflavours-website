// src/lib/google-reviews.ts
// Server-side only — fetches Google Place reviews via Places API
// API key is never exposed to the browser

import type { Testimonial } from "@/components/reviews/TestimonialsSection";

interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  time: number; // Unix timestamp
  relative_time_description: string;
  profile_photo_url?: string;
}

interface PlacesApiResponse {
  result?: {
    reviews?: GoogleReview[];
    rating?: number;
    user_ratings_total?: number;
  };
  status: string;
}

export interface GooglePlaceStats {
  rating: number;
  totalReviews: number;
}

/**
 * Fetches up to 5 Google reviews for the Maa Flavours place.
 * Returns reviews mapped to the Testimonial interface + overall place stats.
 *
 * Cached for 24 hours via Next.js fetch cache (ISR).
 */
export async function getGoogleReviews(): Promise<{
  reviews: Testimonial[];
  stats: GooglePlaceStats | null;
}> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return { reviews: [], stats: null };
  }

  try {
    const url = new URL(
      "https://maps.googleapis.com/maps/api/place/details/json"
    );
    url.searchParams.set("place_id", placeId);
    url.searchParams.set("fields", "reviews,rating,user_ratings_total");
    url.searchParams.set("language", "en");
    url.searchParams.set("reviews_sort", "newest");
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString(), {
      next: { revalidate: 86400 }, // Cache for 24 hours (ISR)
    });

    if (!res.ok) {
      console.error("[google-reviews] HTTP error:", res.status);
      return { reviews: [], stats: null };
    }

    const data: PlacesApiResponse = await res.json();

    if (data.status !== "OK" || !data.result) {
      console.error("[google-reviews] API status:", data.status);
      return { reviews: [], stats: null };
    }

    const stats: GooglePlaceStats | null =
      data.result.rating && data.result.user_ratings_total
        ? {
            rating: data.result.rating,
            totalReviews: data.result.user_ratings_total,
          }
        : null;

    const reviews: Testimonial[] = (data.result.reviews ?? [])
      .filter((r) => r.rating >= 4 && r.text?.trim().length > 20) // Only show 4-5 star reviews with real content
      .map((r) => ({
        id: `google_${r.time}`,
        name: r.author_name,
        city: r.relative_time_description, // e.g. "2 months ago"
        rating: r.rating,
        review: r.text.trim(),
        product: null,
        source: "google",
        created_at: new Date(r.time * 1000).toISOString(),
      }));

    return { reviews, stats };
  } catch (err) {
    console.error("[google-reviews] Fetch error:", err);
    return { reviews: [], stats: null };
  }
}

// src/app/blog/page.tsx
// Maa Flavours — Blog (Coming Soon) + Customer Reviews

import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, BookOpen } from "lucide-react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import NavbarWithCart from "@/components/layout/NavbarWithCart";
import Footer from "@/components/layout/Footer";
import TestimonialsSection, { Testimonial } from "@/components/reviews/TestimonialsSection";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { getGoogleReviews } from "@/lib/google-reviews";

export const metadata: Metadata = {
  title: "Recipes & Stories | Maa Flavours",
  description:
    "Stories, recipes, and Andhra food culture — straight from the Maa Flavours kitchen in Ongole. See what our customers across India are saying.",
};

// Fetch approved testimonials from Supabase (server-side, no API key exposed)
async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("id, name, city, rating, review, product, source, created_at")
      .eq("is_approved", true)
      .order("sort_order", { ascending: true })
      .limit(12);

    if (error) throw error;
    return (data as Testimonial[]) ?? [];
  } catch {
    // Return empty array on error — section simply won't render
    return [];
  }
}

// Google review link — direct link to leave a review on Google
const GOOGLE_REVIEW_LINK =
  "https://search.google.com/local/writereview?placeid=ChIJd4w3OrEBSzpsBDJgL-Npmg";

export default async function BlogPage() {
  const [testimonials, { reviews: googleReviews }] = await Promise.all([
    getTestimonials(),
    getGoogleReviews(),
  ]);

  // Merge: Google reviews first (they're verified), then Supabase ones
  // Deduplicate by filtering Supabase google-sourced ones if we have real API data
  const hasGoogleApiReviews = googleReviews.length > 0;
  const supabaseReviews = hasGoogleApiReviews
    ? testimonials.filter((t) => t.source !== "google") // avoid duplicates
    : testimonials;

  const allReviews: Testimonial[] = [...googleReviews, ...supabaseReviews];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-warm-white)" }}>
      <AnnouncementBar />
      <NavbarWithCart />

      <main className="flex-1 flex flex-col">

        {/* ── Hero header ─────────────────────────────────────────────── */}
        <section className="section-padding" style={{ background: "var(--color-cream)" }}>
          <div className="section-container">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 font-dm-sans text-xs mb-6" style={{ color: "var(--color-grey)" }}>
              <Link href="/" className="hover:opacity-70 transition-opacity">Home</Link>
              <ChevronRight size={12} />
              <span style={{ color: "var(--color-brown)" }}>Recipes &amp; Stories</span>
            </div>

            <div className="text-center">
              <p className="font-dancing text-2xl mb-2" style={{ color: "var(--color-crimson)" }}>
                From Our Kitchen
              </p>
              <h1
                className="font-playfair font-bold leading-tight"
                style={{ color: "var(--color-brown)", fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
              >
                Recipes &amp; Stories
              </h1>
              <div
                className="h-px w-24 mx-auto mt-5"
                style={{
                  background:
                    "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)",
                }}
              />
            </div>
          </div>
        </section>

        {/* ── Coming Soon ─────────────────────────────────────────────── */}
        <section className="section-padding" style={{ background: "var(--color-warm-white)" }}>
          <div className="section-container">
            <div className="max-w-lg mx-auto text-center flex flex-col items-center gap-6">

              {/* Icon */}
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center text-5xl"
                style={{
                  background: "var(--color-cream)",
                  border: "2px dashed rgba(200,150,12,0.35)",
                }}
              >
                📖
              </div>

              <div
                className="h-px w-20"
                style={{
                  background:
                    "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)",
                }}
              />

              <div>
                <h2
                  className="font-playfair font-bold text-2xl sm:text-3xl mb-3"
                  style={{ color: "var(--color-brown)" }}
                >
                  Our Blog is Coming Soon
                </h2>
                <p
                  className="font-cormorant italic text-lg leading-relaxed"
                  style={{ color: "var(--color-grey)" }}
                >
                  Stories, pickle recipes, Andhra food culture, and the love that goes into every pack —
                  coming straight from our kitchen to yours. Stay tuned!
                </p>
              </div>

              {/* Topics preview */}
              <div className="flex flex-wrap gap-2 justify-center">
                {["Pickle Recipes", "Andhra Food Culture", "Health Benefits", "Pairing Guides", "Kitchen Stories"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-full font-dm-sans text-xs font-semibold"
                      style={{
                        background: "var(--color-cream)",
                        border: "1px solid rgba(200,150,12,0.2)",
                        color: "var(--color-brown)",
                      }}
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>

              <Link href="/products" className="btn-primary py-3.5 px-8 gap-2">
                <BookOpen size={16} />
                Explore Our Pickles
              </Link>
            </div>
          </div>
        </section>

        {/* ── Customer Reviews ─────────────────────────────────────────── */}
        {allReviews.length > 0 && (
          <TestimonialsSection
            testimonials={allReviews}
            googleReviewLink={GOOGLE_REVIEW_LINK}
          />
        )}

      </main>

      <Footer />
    </div>
  );
}

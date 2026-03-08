// src/app/blog/page.tsx
// Maa Flavours — Blog / Recipes Listing Page
// Editorial magazine-style layout
// Sections:
//   1. Hero with featured post (large card)
//   2. Category filter tabs
//   3. Post grid (3 cols desktop, 1 col mobile)
//   4. Newsletter CTA
// All post content comes from src/lib/constants/blog.ts

import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, ChevronRight, BookOpen } from "lucide-react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import NavbarWithCart from "@/components/layout/NavbarWithCart";
import Footer from "@/components/layout/Footer";
import BlogListingClient from "./BlogListingClient";
import {
  BLOG_POSTS,
  getFeaturedPosts,
  formatBlogDate,
  CATEGORY_CONFIG,
  type BlogPost,
} from "@/lib/constants/blog";

// ─── SEO ──────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Recipes & Stories — Maa Flavours | Authentic Andhra Pickle Blog",
  description:
    "Andhra pickle recipes, food culture stories, health benefits, and pairing guides from the kitchen of Maa Flavours, Ongole.",
  openGraph: {
    title: "Recipes & Stories — Maa Flavours",
    description:
      "Authentic Andhra pickle recipes, food culture, health, and pairing guides from Ongole's kitchen.",
    url: "https://maaflavours.com/blog",
    type: "website",
  },
};

// ─── Featured Post Card (large hero card) ────────────────────────────────
function FeaturedPostCard({ post }: { post: BlogPost }) {
  const cat = CATEGORY_CONFIG[post.category];
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div
        className="relative rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
        style={{
          background: "linear-gradient(135deg,#4A2C0A 0%,#6B3E12 55%,#8B4C14 100%)",
          minHeight: "clamp(280px,40vw,440px)",
        }}
      >
        {/* Texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
            backgroundSize: "10px 10px",
          }}
        />

        {/* Gold top ornament */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background:
              "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)",
          }}
        />

        {/* Large background emoji */}
        <div
          className="absolute right-6 sm:right-10 top-1/2 -translate-y-1/2 text-[8rem] sm:text-[12rem] opacity-[0.12] pointer-events-none select-none"
          style={{ filter: "blur(1px)" }}
        >
          {post.emoji}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end h-full p-6 sm:p-10 min-h-[280px] sm:min-h-[380px]">
          {/* Category badge */}
          <div
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-dm-sans text-xs font-bold mb-4 self-start"
            style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.color}33` }}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </div>

          <h2
            className="font-playfair font-bold text-white leading-tight mb-3"
            style={{ fontSize: "clamp(1.35rem, 3.5vw, 2.25rem)", maxWidth: "18ch" }}
          >
            {post.title}
          </h2>
          <p
            className="font-cormorant italic text-lg leading-snug mb-5"
            style={{ color: "rgba(255,255,255,0.65)", maxWidth: "40ch" }}
          >
            {post.excerpt}
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-playfair font-bold text-sm text-white"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                {post.author.initials}
              </div>
              <div>
                <p className="font-dm-sans font-bold text-xs text-white">{post.author.name}</p>
                <p className="font-dm-sans text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {formatBlogDate(post.publishedAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5" style={{ color: "rgba(232,184,75,0.7)" }}>
              <Clock size={12} />
              <span className="font-dm-sans text-xs">{post.readTime}</span>
            </div>
            <div
              className="flex items-center gap-1.5 font-dm-sans text-sm font-semibold ml-auto transition-all duration-200 group-hover:gap-2.5"
              style={{ color: "var(--color-gold-light)" }}
            >
              Read Story <ArrowRight size={15} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Post Card (grid item) ────────────────────────────────────────────────
export function PostCard({ post }: { post: BlogPost }) {
  const cat = CATEGORY_CONFIG[post.category];
  return (
    <Link href={`/blog/${post.slug}`} className="group flex flex-col">
      <article
        className="flex flex-col flex-1 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
        style={{
          background: "white",
          border: "1px solid rgba(200,150,12,0.12)",
          boxShadow: "0 2px 12px rgba(74,44,10,0.05)",
        }}
      >
        {/* Card image placeholder */}
        <div
          className="relative flex items-center justify-center overflow-hidden"
          style={{
            aspectRatio: "16/9",
            background: "linear-gradient(135deg,var(--color-cream) 0%,#EDE3C8 100%)",
          }}
        >
          {/* REPLACE with actual blog post image */}
          <span className="text-6xl transition-transform duration-300 group-hover:scale-110">
            {post.emoji}
          </span>

          {/* Category badge */}
          <div
            className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full font-dm-sans text-xs font-bold"
            style={{
              background: "rgba(255,255,255,0.92)",
              color: cat.color,
              border: `1px solid ${cat.color}22`,
              backdropFilter: "blur(4px)",
            }}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </div>
        </div>

        {/* Gold ornament */}
        <div
          className="h-[2px]"
          style={{
            background:
              "linear-gradient(90deg,transparent,var(--color-gold) 25%,var(--color-gold-light) 50%,var(--color-gold) 75%,transparent)",
          }}
        />

        {/* Content */}
        <div className="flex flex-col flex-1 p-5">
          <h3
            className="font-playfair font-bold text-lg leading-snug mb-2 transition-colors group-hover:text-crimson"
            style={{ color: "var(--color-brown)" }}
          >
            {post.title}
          </h3>
          <p
            className="font-cormorant italic text-base leading-snug mb-4 flex-1"
            style={{ color: "var(--color-grey)" }}
          >
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between mt-auto pt-3 border-t"
            style={{ borderColor: "rgba(200,150,12,0.08)" }}>
            <div className="flex items-center gap-1.5" style={{ color: "var(--color-grey)" }}>
              <Clock size={12} />
              <span className="font-dm-sans text-xs">{post.readTime}</span>
              <span className="mx-1 opacity-30">·</span>
              <span className="font-dm-sans text-xs">{formatBlogDate(post.publishedAt)}</span>
            </div>
            <span
              className="font-dm-sans text-xs font-bold flex items-center gap-1 transition-all duration-200 group-hover:gap-2"
              style={{ color: "var(--color-crimson)" }}
            >
              Read <ArrowRight size={11} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Server component (page) ──────────────────────────────────────────────
export default function BlogPage() {
  const featured = getFeaturedPosts();
  const mainFeatured = featured[0] || BLOG_POSTS[0];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-warm-white)" }}>
      <AnnouncementBar />
      <NavbarWithCart />

      <main className="flex-1">

        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <section className="section-padding" style={{ background: "var(--color-cream)" }}>
          <div className="section-container">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 font-dm-sans text-xs mb-6" style={{ color: "var(--color-grey)" }}>
              <Link href="/" className="hover:opacity-70 transition-opacity">Home</Link>
              <ChevronRight size={12} />
              <span style={{ color: "var(--color-brown)" }}>Recipes &amp; Stories</span>
            </div>

            {/* Heading */}
            <div className="text-center mb-10">
              <p className="font-dancing text-2xl mb-2" style={{ color: "var(--color-crimson)" }}>
                From Our Kitchen
              </p>
              <h1
                className="font-playfair font-bold leading-tight"
                style={{
                  color: "var(--color-brown)",
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
                }}
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
              <p
                className="font-cormorant italic text-xl mt-4 mx-auto"
                style={{ color: "var(--color-grey)", maxWidth: "44ch" }}
              >
                Pickle recipes, Andhra food culture, health wisdom, and the stories
                behind every jar — from our kitchen to yours.
              </p>
            </div>

            {/* Featured post */}
            <FeaturedPostCard post={mainFeatured} />
          </div>
        </section>

        {/* ══ POSTS GRID with category filter (client component) ══════ */}
        <section className="section-padding" style={{ background: "var(--color-warm-white)" }}>
          <div className="section-container">
            <BlogListingClient posts={BLOG_POSTS} />
          </div>
        </section>

        {/* ══ NEWSLETTER CTA ══════════════════════════════════════════ */}
        <section
          className="section-padding relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg,#4A2C0A 0%,#6B3E12 60%,#4A2C0A 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
              backgroundSize: "10px 10px",
            }}
          />
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background:
                "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)",
            }}
          />
          <div className="section-container relative z-10 max-w-2xl mx-auto text-center">
            <p className="font-dancing text-2xl mb-3" style={{ color: "var(--color-gold-light)" }}>
              Never miss a recipe
            </p>
            <h2
              className="font-playfair font-bold text-white leading-tight mb-4"
              style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)" }}
            >
              Pickle stories, straight to your inbox
            </h2>
            <p className="font-dm-sans text-base mb-8" style={{ color: "rgba(255,255,255,0.6)" }}>
              New recipes, cultural stories, and a ₹50 coupon for your first order.
              No spam. Just pickle love.
            </p>
            <form
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              action="/api/newsletter"
              method="POST"
            >
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-5 py-3.5 rounded-xl font-dm-sans text-base outline-none"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1.5px solid rgba(232,184,75,0.3)",
                  color: "white",
                }}
              />
              <button
                type="submit"
                className="px-7 py-3.5 rounded-xl font-dm-sans font-bold text-base text-white flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg flex-shrink-0"
                style={{ background: "var(--color-crimson)" }}
              >
                <BookOpen size={16} />Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

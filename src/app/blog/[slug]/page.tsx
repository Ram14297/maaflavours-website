// src/app/blog/[slug]/page.tsx
// Maa Flavours — Individual Blog Post Page
// Editorial magazine-style reading experience
// Renders structured ContentBlock array from blog constants
// Sections: hero, reading progress indicator, body renderer,
//           product CTA card, tags, related posts, newsletter
// Uses static generation (generateStaticParams) for all 6 posts

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, ArrowLeft, ChevronRight, ArrowRight, Star, ShoppingCart, Tag } from "lucide-react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import NavbarWithCart from "@/components/layout/NavbarWithCart";
import Footer from "@/components/layout/Footer";
import {
  BLOG_POSTS,
  getPostBySlug,
  getRelatedPosts,
  formatBlogDate,
  CATEGORY_CONFIG,
  type BlogPost,
  type ContentBlock,
} from "@/lib/constants/blog";
import { PRODUCTS } from "@/lib/constants/products";
import { formatPrice } from "@/lib/utils";
import AddToCartClient from "@/app/blog/[slug]/AddToCartClient";

// ─── Static generation ────────────────────────────────────────────────────
export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

// ─── SEO metadata ─────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post)
    return { title: "Post Not Found — Maa Flavours" };

  return {
    title: `${post.title} — Maa Flavours Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://maaflavours.com/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
  };
}

// ─── Ornament line ────────────────────────────────────────────────────────
function OrnamentLine({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-px ${className}`}
      style={{
        background:
          "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)",
      }}
    />
  );
}

// ─── Recipe Block ─────────────────────────────────────────────────────────
function RecipeCard({
  title, serves, prepTime, cookTime, ingredients, steps,
}: {
  title: string; serves: string; prepTime: string; cookTime: string;
  ingredients: string[]; steps: string[];
}) {
  return (
    <div
      className="my-10 rounded-3xl overflow-hidden"
      style={{
        border: "2px solid rgba(200,150,12,0.25)",
        boxShadow: "0 8px 32px rgba(74,44,10,0.08)",
      }}
    >
      {/* Recipe header */}
      <div
        className="px-6 sm:px-8 py-5"
        style={{
          background: "linear-gradient(135deg,#4A2C0A 0%,#6B3E12 100%)",
        }}
      >
        <div className="h-px mb-4"
          style={{ background: "linear-gradient(90deg,transparent,rgba(232,184,75,0.5) 50%,transparent)" }} />
        <p className="font-dancing text-2xl" style={{ color: "var(--color-gold-light)" }}>
          Recipe
        </p>
        <h3
          className="font-playfair font-bold text-xl sm:text-2xl text-white mt-1"
        >
          {title}
        </h3>
        <div className="flex flex-wrap gap-4 mt-3">
          {[
            { label: "Serves", value: serves, icon: "🍽️" },
            { label: "Prep Time", value: prepTime, icon: "⏱️" },
            { label: "Cook / Mature", value: cookTime, icon: "🔥" },
          ].map((m) => (
            <div key={m.label} className="flex items-center gap-1.5">
              <span className="text-base">{m.icon}</span>
              <div>
                <p className="font-dm-sans text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {m.label}
                </p>
                <p className="font-dm-sans font-bold text-sm text-white">{m.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column content */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr]">
        {/* Ingredients */}
        <div
          className="px-6 sm:px-8 py-6 border-b md:border-b-0 md:border-r"
          style={{
            background: "var(--color-cream)",
            borderColor: "rgba(200,150,12,0.12)",
          }}
        >
          <h4
            className="font-playfair font-bold text-base mb-4 flex items-center gap-2"
            style={{ color: "var(--color-brown)" }}
          >
            <span>🌿</span> Ingredients
          </h4>
          <ul className="flex flex-col gap-2.5">
            {ingredients.map((ing, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span
                  className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                  style={{ background: "var(--color-gold)" }}
                />
                <span
                  className="font-dm-sans text-sm leading-snug"
                  style={{ color: "var(--color-grey)" }}
                >
                  {ing}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div className="px-6 sm:px-8 py-6" style={{ background: "white" }}>
          <h4
            className="font-playfair font-bold text-base mb-4 flex items-center gap-2"
            style={{ color: "var(--color-brown)" }}
          >
            <span>📝</span> Steps
          </h4>
          <ol className="flex flex-col gap-4">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center font-dm-sans font-bold text-xs text-white flex-shrink-0 mt-0.5"
                  style={{ background: "var(--color-crimson)" }}
                >
                  {i + 1}
                </span>
                <p
                  className="font-dm-sans text-sm leading-relaxed"
                  style={{ color: "var(--color-grey)" }}
                >
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

// ─── Product CTA Block ────────────────────────────────────────────────────
function ProductCtaBlock({
  slug, name, emoji, tagline,
}: {
  slug: string; name: string; emoji: string; tagline: string;
}) {
  const product = PRODUCTS.find((p) => p.slug === slug);
  const price = product?.variants[0]?.price;

  return (
    <div
      className="my-10 rounded-3xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg,var(--color-cream) 0%,#EDE3C8 100%)",
        border: "1.5px solid rgba(200,150,12,0.2)",
        boxShadow: "0 4px 20px rgba(74,44,10,0.08)",
      }}
    >
      <div className="h-[2px]" style={{
        background:
          "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)",
      }} />
      <div className="flex flex-col sm:flex-row items-center gap-6 px-6 sm:px-8 py-6">
        {/* Emoji circle */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
          style={{
            background: "white",
            border: "1.5px solid rgba(200,150,12,0.2)",
            boxShadow: "0 4px 16px rgba(74,44,10,0.08)",
          }}
        >
          {emoji}
        </div>

        {/* Text */}
        <div className="flex-1 text-center sm:text-left">
          <p className="font-dancing text-xl" style={{ color: "var(--color-crimson)" }}>
            Try it yourself
          </p>
          <h4
            className="font-playfair font-bold text-xl mt-0.5"
            style={{ color: "var(--color-brown)" }}
          >
            {name}
          </h4>
          <p className="font-dm-sans text-sm mt-1" style={{ color: "var(--color-grey)" }}>
            {tagline}
          </p>
          {price && (
            <p
              className="font-playfair font-bold text-lg mt-1"
              style={{ color: "var(--color-crimson)" }}
            >
              From {formatPrice(price)}
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <Link
            href={`/products/${slug}`}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-dm-sans font-bold text-sm text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            style={{ background: "var(--color-crimson)" }}
          >
            View Pickle <ArrowRight size={15} />
          </Link>
          {product && (
            <AddToCartClient
              productSlug={product.slug}
              productName={product.name}
              variantIndex={0}
              variantLabel={product.variants[0].label}
              price={product.variants[0].price}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Body content renderer ────────────────────────────────────────────────
function BodyRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="flex flex-col gap-0">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "paragraph":
            return (
              <p
                key={i}
                className="font-dm-sans text-base sm:text-lg leading-loose mb-5"
                style={{ color: "var(--color-grey)" }}
                dangerouslySetInnerHTML={{ __html: block.text }}
              />
            );

          case "heading":
            if (block.level === 2) {
              return (
                <div key={i} className="mt-10 mb-4">
                  <h2
                    className="font-playfair font-bold text-2xl sm:text-3xl"
                    style={{ color: "var(--color-brown)" }}
                  >
                    {block.text}
                  </h2>
                  <div className="h-px w-16 mt-2" style={{ background: "var(--color-gold)", opacity: 0.5 }} />
                </div>
              );
            }
            return (
              <h3
                key={i}
                className="font-playfair font-bold text-xl mt-6 mb-3"
                style={{ color: "var(--color-brown)" }}
              >
                {block.text}
              </h3>
            );

          case "quote":
            return (
              <blockquote
                key={i}
                className="my-8 pl-6 py-1"
                style={{ borderLeft: "4px solid var(--color-gold)" }}
              >
                <p
                  className="font-cormorant italic text-xl sm:text-2xl leading-relaxed"
                  style={{ color: "var(--color-brown)" }}
                >
                  "{block.text}"
                </p>
                {block.attribution && (
                  <footer
                    className="font-dm-sans text-sm mt-3"
                    style={{ color: "var(--color-grey)" }}
                  >
                    — {block.attribution}
                  </footer>
                )}
              </blockquote>
            );

          case "tip":
            return (
              <div
                key={i}
                className="my-6 flex gap-4 p-5 rounded-2xl"
                style={{
                  background: "rgba(200,150,12,0.06)",
                  border: "1.5px solid rgba(200,150,12,0.2)",
                }}
              >
                <span className="text-2xl flex-shrink-0">{block.icon}</span>
                <div>
                  <p
                    className="font-dm-sans font-bold text-sm mb-1"
                    style={{ color: "var(--color-brown)" }}
                  >
                    {block.title}
                  </p>
                  <p className="font-dm-sans text-sm leading-relaxed" style={{ color: "var(--color-grey)" }}>
                    {block.text}
                  </p>
                </div>
              </div>
            );

          case "image":
            return (
              <div key={i} className="my-8">
                {/* REPLACE with actual blog post image using Next.js <Image> */}
                <div
                  className="w-full flex flex-col items-center justify-center gap-3 rounded-2xl overflow-hidden"
                  style={{
                    aspectRatio: "16/9",
                    background:
                      "linear-gradient(135deg,var(--color-cream) 0%,#EDE3C8 60%,#E4D5B0 100%)",
                    border: "1px solid rgba(200,150,12,0.15)",
                  }}
                >
                  <span className="text-7xl">{block.emoji}</span>
                </div>
                <p
                  className="font-dm-sans text-sm text-center mt-2 italic"
                  style={{ color: "var(--color-grey)" }}
                >
                  {block.caption}
                </p>
              </div>
            );

          case "recipe":
            return (
              <RecipeCard
                key={i}
                title={block.title}
                serves={block.serves}
                prepTime={block.prepTime}
                cookTime={block.cookTime}
                ingredients={block.ingredients}
                steps={block.steps}
              />
            );

          case "divider":
            return <OrnamentLine key={i} className="my-8" />;

          case "productCta":
            return (
              <ProductCtaBlock
                key={i}
                slug={block.slug}
                name={block.name}
                emoji={block.emoji}
                tagline={block.tagline}
              />
            );

          default:
            return null;
        }
      })}
    </div>
  );
}

// ─── Related Post Card ────────────────────────────────────────────────────
function RelatedCard({ post }: { post: BlogPost }) {
  const cat = CATEGORY_CONFIG[post.category];
  return (
    <Link href={`/blog/${post.slug}`} className="group flex flex-col">
      <article
        className="flex flex-col flex-1 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
        style={{
          background: "white",
          border: "1px solid rgba(200,150,12,0.12)",
          boxShadow: "0 2px 8px rgba(74,44,10,0.05)",
        }}
      >
        {/* Image */}
        <div
          className="flex items-center justify-center"
          style={{
            aspectRatio: "3/2",
            background: "linear-gradient(135deg,var(--color-cream),#EDE3C8)",
          }}
        >
          {/* REPLACE with actual image */}
          <span className="text-5xl transition-transform duration-300 group-hover:scale-110">
            {post.emoji}
          </span>
        </div>

        <div className="h-[2px]" style={{
          background:
            "linear-gradient(90deg,transparent,var(--color-gold) 25%,var(--color-gold-light) 50%,var(--color-gold) 75%,transparent)",
        }} />

        <div className="flex flex-col flex-1 p-4">
          <div
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-dm-sans font-bold mb-2 self-start"
            style={{ background: cat.bg, color: cat.color }}
          >
            {cat.emoji} {cat.label}
          </div>
          <h3
            className="font-playfair font-bold text-base leading-snug mb-2 group-hover:underline"
            style={{ color: "var(--color-brown)" }}
          >
            {post.title}
          </h3>
          <div className="flex items-center gap-1 mt-auto" style={{ color: "var(--color-grey)" }}>
            <Clock size={11} />
            <span className="font-dm-sans text-xs">{post.readTime}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const related = getRelatedPosts(params.slug);
  const cat = CATEGORY_CONFIG[post.category];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-warm-white)" }}>
      <AnnouncementBar />
      <NavbarWithCart />

      <main className="flex-1">

        {/* ══ HERO ════════════════════════════════════════════════════ */}
        <section
          className="relative overflow-hidden"
          style={{
            background: "linear-gradient(160deg,#3A1E08 0%,#5C3010 50%,#4A2C0A 100%)",
            paddingTop: "clamp(3rem,8vw,5rem)",
            paddingBottom: "clamp(4rem,10vw,7rem)",
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

          {/* Gold top border */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background:
                "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)",
            }}
          />

          {/* Background emoji */}
          <div
            className="absolute right-0 sm:right-8 top-1/2 -translate-y-1/2 text-[10rem] sm:text-[16rem] opacity-[0.07] select-none pointer-events-none"
            style={{ filter: "blur(2px)" }}
          >
            {post.emoji}
          </div>

          <div className="section-container relative z-10">
            {/* Breadcrumb */}
            <div
              className="flex items-center gap-2 font-dm-sans text-xs mb-6 flex-wrap"
              style={{ color: "rgba(232,184,75,0.5)" }}
            >
              <Link href="/" className="hover:opacity-80 transition-opacity">Home</Link>
              <ChevronRight size={12} />
              <Link href="/blog" className="hover:opacity-80 transition-opacity">Recipes &amp; Stories</Link>
              <ChevronRight size={12} />
              <span style={{ color: "var(--color-gold-light)", opacity: 0.8 }} className="truncate max-w-[20ch]">
                {post.title}
              </span>
            </div>

            <div className="max-w-3xl">
              {/* Category badge */}
              <div
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-dm-sans text-xs font-bold mb-5"
                style={{
                  background: cat.bg,
                  color: cat.color,
                  border: `1px solid ${cat.color}33`,
                }}
              >
                <span>{cat.emoji}</span>{cat.label}
              </div>

              <h1
                className="font-playfair font-bold text-white leading-tight mb-4"
                style={{ fontSize: "clamp(1.75rem, 5vw, 3.25rem)" }}
              >
                {post.title}
              </h1>

              <p
                className="font-cormorant italic text-lg sm:text-xl leading-relaxed mb-7"
                style={{ color: "rgba(255,255,255,0.65)", maxWidth: "50ch" }}
              >
                {post.subtitle}
              </p>

              {/* Meta row */}
              <div className="flex items-center gap-5 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-playfair font-bold text-sm text-white"
                    style={{ background: "rgba(255,255,255,0.15)" }}
                  >
                    {post.author.initials}
                  </div>
                  <div>
                    <p className="font-dm-sans font-bold text-xs text-white">{post.author.name}</p>
                    <p className="font-dm-sans text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {post.author.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3" style={{ color: "rgba(255,255,255,0.45)" }}>
                  <span className="font-dm-sans text-xs">{formatBlogDate(post.publishedAt)}</span>
                  <span>·</span>
                  <div className="flex items-center gap-1">
                    <Clock size={11} />
                    <span className="font-dm-sans text-xs">{post.readTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Wave bottom */}
          <div className="absolute bottom-0 left-0 right-0" style={{ height: "64px" }}>
            <svg viewBox="0 0 1440 64" preserveAspectRatio="none" className="w-full h-full">
              <path
                d="M0,64 L0,32 Q360,0 720,28 Q1080,56 1440,20 L1440,64 Z"
                fill="var(--color-warm-white)"
              />
            </svg>
          </div>
        </section>

        {/* ══ ARTICLE BODY ════════════════════════════════════════════ */}
        <section className="py-12 sm:py-16" style={{ background: "var(--color-warm-white)" }}>
          <div className="section-container">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 lg:gap-16 items-start">

              {/* ── Main article ─────────────────────────────────── */}
              <article>
                {/* Excerpt lead */}
                <p
                  className="font-cormorant italic text-xl sm:text-2xl leading-relaxed pb-7 mb-7"
                  style={{
                    color: "var(--color-brown)",
                    borderBottom: "1px solid rgba(200,150,12,0.12)",
                  }}
                >
                  {post.excerpt}
                </p>

                {/* Body blocks */}
                <BodyRenderer blocks={post.body} />

                {/* Tags */}
                <div
                  className="mt-12 pt-6 flex flex-wrap gap-2 items-center"
                  style={{ borderTop: "1px solid rgba(200,150,12,0.1)" }}
                >
                  <Tag size={14} style={{ color: "var(--color-grey)" }} />
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-dm-sans text-xs font-semibold px-3 py-1.5 rounded-full"
                      style={{
                        background: "var(--color-cream)",
                        color: "var(--color-brown)",
                        border: "1px solid rgba(200,150,12,0.15)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Back to blog */}
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 mt-8 font-dm-sans text-sm font-semibold transition-opacity hover:opacity-70"
                  style={{ color: "var(--color-crimson)" }}
                >
                  <ArrowLeft size={15} /> Back to all stories
                </Link>
              </article>

              {/* ── Sidebar ──────────────────────────────────────── */}
              <aside className="lg:sticky lg:top-24 flex flex-col gap-5">

                {/* Author card */}
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: "white",
                    border: "1px solid rgba(200,150,12,0.12)",
                    boxShadow: "0 2px 12px rgba(74,44,10,0.05)",
                  }}
                >
                  <div className="h-[2px]" style={{
                    background:
                      "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)",
                  }} />
                  <div className="p-5">
                    <p className="font-dm-sans font-bold text-xs uppercase tracking-widest mb-3"
                      style={{ color: "var(--color-grey)" }}>
                      Written by
                    </p>
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center font-playfair font-bold text-lg text-white"
                        style={{ background: "var(--color-brown)" }}
                      >
                        {post.author.initials}
                      </div>
                      <div>
                        <p className="font-dm-sans font-bold text-sm" style={{ color: "var(--color-brown)" }}>
                          {post.author.name}
                        </p>
                        <p className="font-dm-sans text-xs" style={{ color: "var(--color-grey)" }}>
                          {post.author.role}
                        </p>
                      </div>
                    </div>
                    <p className="font-cormorant italic text-base leading-snug" style={{ color: "var(--color-grey)" }}>
                      Stories, recipes, and the food wisdom of Andhra — from our
                      kitchen in Ongole to your table.
                    </p>
                  </div>
                </div>

                {/* Post stats */}
                <div
                  className="rounded-2xl p-5 grid grid-cols-2 gap-3"
                  style={{
                    background: "var(--color-cream)",
                    border: "1px solid rgba(200,150,12,0.12)",
                  }}
                >
                  {[
                    { icon: "📅", label: "Published", value: formatBlogDate(post.publishedAt) },
                    { icon: "⏱️", label: "Read time", value: post.readTime },
                    { icon: `${cat.emoji}`, label: "Category", value: cat.label },
                    { icon: "🌶️", label: "Andhra", value: "Always authentic" },
                  ].map((s) => (
                    <div key={s.label}>
                      <span className="text-lg">{s.icon}</span>
                      <p className="font-dm-sans text-xs mt-0.5" style={{ color: "var(--color-grey)" }}>
                        {s.label}
                      </p>
                      <p className="font-dm-sans font-bold text-xs" style={{ color: "var(--color-brown)" }}>
                        {s.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Browse pickles CTA */}
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg,#4A2C0A 0%,#6B3E12 100%)",
                    boxShadow: "0 4px 16px rgba(74,44,10,0.15)",
                  }}
                >
                  <div className="h-[2px]" style={{
                    background:
                      "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)",
                  }} />
                  <div className="p-5 text-center">
                    <span className="text-4xl">🫙</span>
                    <p className="font-dancing text-xl mt-2" style={{ color: "var(--color-gold-light)" }}>
                      Taste Andhra
                    </p>
                    <p className="font-dm-sans text-xs mt-1 mb-4" style={{ color: "rgba(255,255,255,0.55)" }}>
                      6 authentic pickles · No preservatives · Pan-India delivery
                    </p>
                    <div className="flex items-center justify-center gap-0.5 mb-4">
                      {Array(5).fill(0).map((_, i) => (
                        <Star key={i} size={13} fill="var(--color-gold)" strokeWidth={0} />
                      ))}
                      <span className="font-dm-sans text-xs ml-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                        4.9
                      </span>
                    </div>
                    <Link
                      href="/products"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-dm-sans font-bold text-sm text-white transition-all duration-200 hover:-translate-y-0.5"
                      style={{ background: "var(--color-crimson)" }}
                    >
                      <ShoppingCart size={15} />Shop All Pickles
                    </Link>
                  </div>
                </div>

                {/* Share */}
                <div
                  className="rounded-2xl p-5"
                  style={{
                    background: "white",
                    border: "1px solid rgba(200,150,12,0.12)",
                  }}
                >
                  <p className="font-dm-sans font-bold text-sm mb-3" style={{ color: "var(--color-brown)" }}>
                    Share this story
                  </p>
                  <div className="flex gap-2">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`${post.title} — Maa Flavours\nhttps://maaflavours.com/blog/${post.slug}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-dm-sans text-xs font-bold text-white transition-opacity hover:opacity-80"
                      style={{ background: "#25D366" }}
                    >
                      WhatsApp
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${post.title} by @maaflavours`)}&url=${encodeURIComponent(`https://maaflavours.com/blog/${post.slug}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-dm-sans text-xs font-bold text-white transition-opacity hover:opacity-80"
                      style={{ background: "#1DA1F2" }}
                    >
                      Twitter / X
                    </a>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ══ RELATED POSTS ═══════════════════════════════════════════ */}
        {related.length > 0 && (
          <section
            className="section-padding"
            style={{ background: "var(--color-cream)" }}
          >
            <div className="section-container">
              <div className="flex items-end justify-between gap-4 mb-8">
                <div>
                  <p className="font-dancing text-xl" style={{ color: "var(--color-crimson)" }}>
                    Keep reading
                  </p>
                  <h2
                    className="font-playfair font-bold text-2xl sm:text-3xl"
                    style={{ color: "var(--color-brown)" }}
                  >
                    You Might Also Like
                  </h2>
                </div>
                <Link
                  href="/blog"
                  className="font-dm-sans text-sm font-bold flex items-center gap-1.5 transition-opacity hover:opacity-70 flex-shrink-0"
                  style={{ color: "var(--color-crimson)" }}
                >
                  All stories <ArrowRight size={14} />
                </Link>
              </div>

              <OrnamentLine className="mb-8" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {related.map((p) => (
                  <RelatedCard key={p.slug} post={p} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══ NEWSLETTER STRIP ════════════════════════════════════════ */}
        <section
          className="py-14 sm:py-20 relative overflow-hidden"
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
          <div className="section-container relative z-10 max-w-xl mx-auto text-center">
            <p className="font-dancing text-2xl mb-2" style={{ color: "var(--color-gold-light)" }}>
              Never miss a recipe
            </p>
            <h2
              className="font-playfair font-bold text-white mb-4"
              style={{ fontSize: "clamp(1.35rem, 3.5vw, 2.25rem)" }}
            >
              Get pickle stories in your inbox
            </h2>
            <p className="font-dm-sans text-sm mb-7" style={{ color: "rgba(255,255,255,0.55)" }}>
              New recipes, pairings, and a ₹50 coupon on your first order.
            </p>
            <form
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              action="/api/newsletter"
              method="POST"
            >
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                required
                className="flex-1 px-5 py-3.5 rounded-xl font-dm-sans text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1.5px solid rgba(232,184,75,0.3)",
                  color: "white",
                }}
              />
              <button
                type="submit"
                className="px-6 py-3.5 rounded-xl font-dm-sans font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 flex-shrink-0"
                style={{ background: "var(--color-crimson)" }}
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

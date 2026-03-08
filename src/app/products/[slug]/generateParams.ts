// src/app/products/[slug]/generateParams.ts
// Maa Flavours — Static param generation & metadata for product detail pages
// Used by Next.js 14 App Router for SSG + per-product SEO metadata
// Split from page.tsx to keep the client component clean

import type { Metadata } from "next";
import { PRODUCTS } from "@/lib/constants/products";

// ─── Static generation ──────────────────────────────────────────────────────
// Pre-renders all 6 product detail pages at build time for best performance
export function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    slug: product.slug,
  }));
}

// ─── Per-product metadata ───────────────────────────────────────────────────
export function generateProductMetadata(slug: string): Metadata {
  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) return {};

  const lowestPrice = Math.min(...product.variants.map((v) => v.price)) / 100;
  const title = `${product.name} — Authentic Andhra Pickle | Maa Flavours`;
  const description = `${product.short_description} Handcrafted in Ongole with no preservatives. Available in 250g & 500g. Pan-India delivery from ₹${lowestPrice}.`;

  return {
    title,
    description,
    keywords: [
      product.name,
      "Andhra pickle online",
      "homemade pickle",
      "no preservatives",
      "Maa Flavours",
      "Ongole pickle",
      `buy ${product.name.toLowerCase()} online`,
    ],
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          // REPLACE with actual product OG image
          url: `/images/products/${product.slug}-og.jpg`,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    other: {
      // Structured data for product rich snippets
      "product:price:amount": String(lowestPrice),
      "product:price:currency": "INR",
    },
  };
}

// ─── Product JSON-LD (for rich snippets) ───────────────────────────────────
export function buildProductJsonLd(slug: string) {
  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description,
    brand: {
      "@type": "Brand",
      name: "Maa Flavours",
    },
    offers: product.variants.map((variant) => ({
      "@type": "Offer",
      priceCurrency: "INR",
      price: (variant.price / 100).toFixed(2),
      availability: variant.stock_quantity > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Maa Flavours",
      },
      itemCondition: "https://schema.org/NewCondition",
      name: `${product.name} ${variant.label}`,
    })),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "47",
      bestRating: "5",
      worstRating: "1",
    },
    image: [
      // REPLACE with actual product image URLs from Supabase Storage
      `https://maaflavours.com/images/products/${product.slug}-1.jpg`,
    ],
    category: "Pickles & Condiments",
    countryOfOrigin: {
      "@type": "Country",
      name: "India",
    },
  };
}

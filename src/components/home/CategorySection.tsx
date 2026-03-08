// src/components/home/CategorySection.tsx
// Maa Flavours — "Find Your Flavour" Category Tiles
// 3 visual tiles: Spicy Collection | Sour & Tangy | Seasonal Specials
// Earthy background, hover zoom effect

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CATEGORIES = [
  {
    slug: "spicy-collection",
    name: "Spicy Collection",
    description: "Bold, fiery pickles for those who love the heat",
    emoji: "🌶️",
    bg: "linear-gradient(135deg, #4A2C0A 0%, #6B3010 60%, #3A1E06 100%)",
    accent: "#C0272D",
    count: "3 varieties",
    href: "/products?category=spicy-collection",
  },
  {
    slug: "sour-tangy",
    name: "Sour & Tangy",
    description: "Bright, tangy flavours that wake up every meal",
    emoji: "🍋",
    bg: "linear-gradient(135deg, #2A1804 0%, #4A2C0A 50%, #6B4226 100%)",
    accent: "#C8960C",
    count: "2 varieties",
    href: "/products?category=sour-tangy",
    featured: true,
  },
  {
    slug: "seasonal-specials",
    name: "Seasonal Specials",
    description: "Limited-batch recipes made only when the season is right",
    emoji: "🌸",
    bg: "linear-gradient(135deg, #3A1E06 0%, #4A2C0A 50%, #5A3010 100%)",
    accent: "#E8B84B",
    count: "Coming soon",
    href: "/products?category=seasonal",
  },
];

export default function CategorySection() {
  return (
    <section
      className="section-padding"
      style={{ background: "var(--color-cream)" }}
    >
      <div className="section-container">
        {/* ─── Section Header ──────────────────────────────────────────── */}
        <div className="text-center mb-12 lg:mb-14">
          <span className="section-eyebrow block mb-3">Browse by Taste</span>
          <h2 className="section-title">Find Your Flavour</h2>
        </div>

        {/* ─── Category Grid ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-6">
          {CATEGORIES.map((cat, index) => (
            <Link
              key={cat.slug}
              href={cat.href}
              className="group relative block overflow-hidden rounded-2xl"
              style={{
                // Middle tile is taller on desktop
                minHeight: index === 1 ? "300px" : "260px",
              }}
            >
              {/* Background */}
              <div
                className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                style={{ background: cat.bg }}
              />

              {/* Warm texture overlay */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "repeat",
                  backgroundSize: "300px",
                }}
              />

              {/* Gold ornamental border — shows on hover */}
              <div
                className="absolute inset-0 rounded-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-0"
                style={{
                  boxShadow: `inset 0 0 0 2px ${cat.accent}`,
                }}
              />

              {/* Content */}
              <div className="relative z-10 p-7 lg:p-8 h-full flex flex-col justify-between">
                <div>
                  {/* Emoji icon */}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-5"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: `1px solid rgba(255,255,255,0.12)`,
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {cat.emoji}
                  </div>

                  <h3
                    className="font-playfair font-bold text-xl lg:text-2xl mb-2 leading-tight"
                    style={{ color: "var(--color-cream)" }}
                  >
                    {cat.name}
                  </h3>
                  <p
                    className="font-dm-sans text-sm leading-relaxed"
                    style={{ color: "rgba(245,239,224,0.65)" }}
                  >
                    {cat.description}
                  </p>
                </div>

                {/* Bottom row */}
                <div className="flex items-center justify-between mt-6">
                  <span
                    className="font-dm-sans text-xs font-semibold tracking-wide uppercase"
                    style={{ color: cat.accent }}
                  >
                    {cat.count}
                  </span>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: cat.accent,
                      boxShadow: `0 2px 10px ${cat.accent}60`,
                    }}
                  >
                    <ArrowRight size={16} color="white" />
                  </div>
                </div>
              </div>

              {/* Featured badge */}
              {cat.featured && (
                <div
                  className="absolute top-4 right-4 px-3 py-1 rounded-full font-dm-sans text-xs font-semibold"
                  style={{
                    background: "var(--color-gold)",
                    color: "var(--color-brown)",
                  }}
                >
                  Most Popular
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

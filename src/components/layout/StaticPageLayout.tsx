// src/components/layout/StaticPageLayout.tsx
// Maa Flavours — Shared layout for static/policy/info pages
// Wraps content with: AnnouncementBar, NavbarWithCart, dark-brown hero,
// gold ornament, breadcrumb, content card, Footer
// Usage: <StaticPageLayout title="..." subtitle="..." emoji="..." breadcrumb="...">
//          <your page content />
//        </StaticPageLayout>

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import NavbarWithCart from "@/components/layout/NavbarWithCart";
import Footer from "@/components/layout/Footer";

interface Props {
  title: string;
  subtitle?: string;
  emoji: string;
  breadcrumb: string;       // Label for the current page in breadcrumb
  updatedAt?: string;       // "Last updated: Month Year" — shown for policy pages
  children: React.ReactNode;
}

// ─── Ornament line ─────────────────────────────────────────────────────────
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

export { OrnamentLine };

export default function StaticPageLayout({
  title,
  subtitle,
  emoji,
  breadcrumb,
  updatedAt,
  children,
}: Props) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-warm-white)" }}>
      <AnnouncementBar />
      <NavbarWithCart />

      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden"
          style={{
            background: "linear-gradient(160deg,#3A1E08 0%,#5C3010 50%,#4A2C0A 100%)",
            paddingTop: "clamp(2.5rem,6vw,4.5rem)",
            paddingBottom: "clamp(3.5rem,8vw,6rem)",
          }}
        >
          {/* Linen texture */}
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

          {/* Background emoji watermark */}
          <div
            className="absolute right-6 sm:right-16 top-1/2 -translate-y-1/2 text-[8rem] sm:text-[12rem] opacity-[0.07] select-none pointer-events-none"
            style={{ filter: "blur(2px)" }}
          >
            {emoji}
          </div>

          <div className="section-container relative z-10">
            {/* Breadcrumb */}
            <div
              className="flex items-center gap-2 font-dm-sans text-xs mb-5 flex-wrap"
              style={{ color: "rgba(232,184,75,0.5)" }}
            >
              <Link href="/" className="hover:opacity-80 transition-opacity">Home</Link>
              <ChevronRight size={11} />
              <span style={{ color: "var(--color-gold-light)", opacity: 0.8 }}>{breadcrumb}</span>
            </div>

            {/* Emoji + title */}
            <div className="flex items-start gap-5">
              <span className="text-4xl sm:text-5xl flex-shrink-0 mt-1">{emoji}</span>
              <div>
                <h1
                  className="font-playfair font-bold text-white leading-tight"
                  style={{ fontSize: "clamp(1.75rem, 5vw, 3.25rem)" }}
                >
                  {title}
                </h1>
                {subtitle && (
                  <p
                    className="font-cormorant italic text-lg sm:text-xl mt-2"
                    style={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    {subtitle}
                  </p>
                )}
                {updatedAt && (
                  <p className="font-dm-sans text-xs mt-3" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {updatedAt}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Wave bottom */}
          <div className="absolute bottom-0 left-0 right-0" style={{ height: "56px" }}>
            <svg viewBox="0 0 1440 56" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,56 L0,28 Q360,0 720,24 Q1080,48 1440,16 L1440,56 Z" fill="var(--color-warm-white)" />
            </svg>
          </div>
        </section>

        {/* ── Content card ─────────────────────────────────────────── */}
        <section className="section-padding" style={{ background: "var(--color-warm-white)" }}>
          <div className="section-container">
            <div
              className="mx-auto rounded-3xl overflow-hidden"
              style={{
                maxWidth: "860px",
                background: "white",
                border: "1px solid rgba(200,150,12,0.12)",
                boxShadow: "0 4px 24px rgba(74,44,10,0.07)",
              }}
            >
              {/* Gold top stripe */}
              <div
                className="h-[3px]"
                style={{
                  background:
                    "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)",
                }}
              />

              <div className="px-6 sm:px-10 py-10 sm:py-14">
                {children}
              </div>

              {/* Footer of card */}
              <div
                className="px-6 sm:px-10 py-5 flex flex-wrap items-center justify-between gap-3"
                style={{
                  borderTop: "1px solid rgba(200,150,12,0.08)",
                  background: "var(--color-cream)",
                }}
              >
                <p className="font-dancing text-xl" style={{ color: "var(--color-crimson)" }}>
                  Maa Flavours
                </p>
                <div className="flex items-center gap-4 flex-wrap">
                  <Link href="/contact" className="font-dm-sans text-xs hover:underline"
                    style={{ color: "var(--color-grey)" }}>Contact Us</Link>
                  <Link href="/faq" className="font-dm-sans text-xs hover:underline"
                    style={{ color: "var(--color-grey)" }}>FAQ</Link>
                  <Link href="/products" className="font-dm-sans text-xs hover:underline"
                    style={{ color: "var(--color-crimson)" }}>Shop Pickles</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

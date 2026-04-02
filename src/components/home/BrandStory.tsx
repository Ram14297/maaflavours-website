// src/components/home/BrandStory.tsx
// Maa Flavours — Brand Story Section
// "Made the Way Maa Always Made It"
// Alternating image + text, FSSAI placeholder, warm cream background

import Link from "next/link";

export default function BrandStory() {
  return (
    <section
      className="section-padding bg-warm-texture"
      id="brand-story"
    >
      <div className="section-container">

        {/* ─── Section Header ──────────────────────────────────────────── */}
        <div className="text-center mb-14 lg:mb-16">
          <span className="section-eyebrow block mb-3">Our Heritage</span>
          <h2 className="section-title mb-4">
            Made the Way Maa<br className="hidden sm:block" /> Always Made It
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 ornament-line" />
            <span style={{ color: "var(--color-gold)", fontSize: "1.25rem" }}>✦</span>
            <div className="h-px w-16 ornament-line" />
          </div>
        </div>

        {/* ─── Alternating content blocks ──────────────────────────────── */}
        <div className="flex flex-col gap-16 lg:gap-20">

          {/* Block 1 — Image left, text right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Image placeholder — REPLACE with actual image */}
            <div className="relative order-2 lg:order-1">
              <div
                className="relative rounded-2xl overflow-hidden aspect-[4/3]"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-cream-dark) 0%, var(--color-cream) 100%)",
                  border: "2px solid rgba(200,150,12,0.15)",
                  boxShadow: "0 12px 40px rgba(74,44,10,0.1)",
                }}
              >
                {/* REPLACE with actual brand story image */}
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <span className="text-6xl">👩‍🍳</span>
                  <p
                    className="font-dancing text-xl"
                    style={{ color: "var(--color-brown)" }}
                  >
                    Maa in the Kitchen
                  </p>
                  <p
                    className="font-dm-sans text-xs"
                    style={{ color: "var(--color-grey)" }}
                  >
                    {/* REPLACE: /images/brand/maa-kitchen.jpg */}
                    Brand Story Image Here
                  </p>
                </div>

                {/* Gold frame accent */}
                <div
                  className="absolute top-3 left-3 w-12 h-12 rounded-tl-lg"
                  style={{
                    borderTop: "2px solid var(--color-gold-light)",
                    borderLeft: "2px solid var(--color-gold-light)",
                  }}
                />
                <div
                  className="absolute bottom-3 right-3 w-12 h-12 rounded-br-lg"
                  style={{
                    borderBottom: "2px solid var(--color-gold-light)",
                    borderRight: "2px solid var(--color-gold-light)",
                  }}
                />
              </div>

              {/* Floating experience badge */}
              <div
                className="absolute -bottom-5 -right-4 sm:-right-6 px-5 py-3 rounded-xl"
                style={{
                  background: "var(--color-brown)",
                  boxShadow: "0 8px 24px rgba(74,44,10,0.2)",
                }}
              >
                <p
                  className="font-dancing text-2xl font-bold leading-none"
                  style={{ color: "var(--color-gold-light)" }}
                >
                  3+ Years
                </p>
                <p
                  className="font-dm-sans text-xs mt-0.5"
                  style={{ color: "rgba(245,239,224,0.65)" }}
                >
                  of Tradition
                </p>
              </div>
            </div>

            {/* Text */}
            <div className="order-1 lg:order-2">
              <h3
                className="font-playfair font-bold text-2xl lg:text-3xl mb-4 leading-tight"
                style={{ color: "var(--color-brown)" }}
              >
                A Recipe Passed Down Through Generations
              </h3>
              <p
                className="font-dm-sans text-base leading-relaxed mb-4"
                style={{ color: "var(--color-grey)" }}
              >
                In every Andhra home, the kitchen is where the heart lives. Our pickles carry
                the same love and patience that Maa brought to every batch she made — measured
                not in grams but in generations of wisdom.
              </p>
              <p
                className="font-dm-sans text-base leading-relaxed mb-6"
                style={{ color: "var(--color-grey)" }}
              >
                No factory. No machines. No shortcuts. Every pack of Maa Flavours is made in
                small batches, hand-packed with care, and seasoned with the same spice blends
                that have flavoured Andhra kitchens for decades.
              </p>

              {/* Highlight points */}
              <ul className="flex flex-col gap-3 mb-8">
                {[
                  "Traditional Andhra recipes, unchanged",
                  "Handcrafted in small batches in Ongole",
                  "Zero artificial preservatives or chemicals",
                  "Sun-dried and slow-pickled the old way",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs mt-0.5"
                      style={{
                        background: "rgba(200, 150, 12, 0.15)",
                        color: "var(--color-gold)",
                      }}
                    >
                      ✓
                    </span>
                    <span
                      className="font-dm-sans text-sm"
                      style={{ color: "var(--color-brown)" }}
                    >
                      {point}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href="/about" className="btn-ghost inline-flex items-center gap-2">
                Read Our Full Story →
              </Link>
            </div>
          </div>

          {/* Block 2 — FSSAI + Values strip */}
          <div
            className="rounded-2xl p-8 lg:p-10"
            style={{
              background: "var(--color-cream)",
              border: "1px solid rgba(200,150,12,0.2)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Gold top border */}
            <div
              className="absolute top-0 left-0 right-0 h-[3px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--color-gold) 20%, var(--color-gold-light) 50%, var(--color-gold) 80%, transparent)",
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12 text-center">
              {/* FSSAI */}
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                  style={{
                    background: "rgba(200,150,12,0.1)",
                    border: "1.5px solid rgba(200,150,12,0.3)",
                  }}
                >
                  🏛️
                </div>
                <div>
                  <p
                    className="font-dm-sans font-semibold text-sm"
                    style={{ color: "var(--color-brown)" }}
                  >
                    FSSAI License
                  </p>
                  <p
                    className="font-dm-sans text-xs mt-1"
                    style={{ color: "var(--color-grey)" }}
                  >
                    Application In Progress —{" "}
                    <span style={{ color: "var(--color-gold)" }}>
                      Certified Soon
                    </span>
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div
                className="hidden sm:block w-px"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent, rgba(200,150,12,0.3), transparent)",
                }}
              />

              {/* No Preservatives */}
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                  style={{
                    background: "rgba(46,125,50,0.08)",
                    border: "1.5px solid rgba(46,125,50,0.25)",
                  }}
                >
                  🌿
                </div>
                <div>
                  <p
                    className="font-dm-sans font-semibold text-sm"
                    style={{ color: "var(--color-brown)" }}
                  >
                    Zero Preservatives
                  </p>
                  <p
                    className="font-dm-sans text-xs mt-1"
                    style={{ color: "var(--color-grey)" }}
                  >
                    Naturally preserved with oil & salt
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div
                className="hidden sm:block w-px"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent, rgba(200,150,12,0.3), transparent)",
                }}
              />

              {/* Handmade */}
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                  style={{
                    background: "rgba(192,39,45,0.08)",
                    border: "1.5px solid rgba(192,39,45,0.2)",
                  }}
                >
                  👐
                </div>
                <div>
                  <p
                    className="font-dm-sans font-semibold text-sm"
                    style={{ color: "var(--color-brown)" }}
                  >
                    100% Handmade
                  </p>
                  <p
                    className="font-dm-sans text-xs mt-1"
                    style={{ color: "var(--color-grey)" }}
                  >
                    Every pack made by hand in Ongole
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

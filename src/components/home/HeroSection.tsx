"use client";
// src/components/home/HeroSection.tsx
// Maa Flavours — Homepage Hero
// Full-width warm cream background with texture
// Large Playfair headline + Cormorant subtext + dual CTAs
// Right side: elegant product showcase placeholder

import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

export default function HeroSection() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      className="relative overflow-hidden bg-warm-texture min-h-[88vh] flex items-center"
      style={{ paddingTop: "4rem", paddingBottom: "4rem" }}
    >
      {/* ─── Background decorative elements ─────────────────────────────── */}
      {/* Large faint mandala-style circle — purely decorative */}
      <div
        className="absolute -right-32 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(200, 150, 12, 0.06) 0%, rgba(200, 150, 12, 0.02) 50%, transparent 70%)",
        }}
      />
      <div
        className="absolute -left-20 bottom-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(192, 39, 45, 0.04) 0%, transparent 70%)",
        }}
      />

      {/* ─── Decorative gold lines top/bottom ────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 h-px ornament-line opacity-60" />
      <div className="absolute bottom-0 left-0 right-0 h-px ornament-line opacity-60" />

      <div className="section-container w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ─── Left: Text Content ─────────────────────────────────────── */}
          <div
            className={`flex flex-col transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* Eyebrow tag */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className="h-px w-8"
                style={{ background: "var(--color-gold)" }}
              />
              <span className="section-eyebrow">
                From Ongole, With Love
              </span>
              <div
                className="h-px w-8"
                style={{ background: "var(--color-gold)" }}
              />
            </div>

            {/* Main headline */}
            <h1
              className="font-playfair font-bold mb-5 leading-tight"
              style={{
                fontSize: "clamp(2.25rem, 5vw, 3.75rem)",
                color: "var(--color-brown)",
                lineHeight: 1.12,
              }}
            >
              Taste the Love{" "}
              <span
                className="block italic"
                style={{ color: "var(--color-crimson)" }}
              >
                Maa Bottled
              </span>
              Just for You
            </h1>

            {/* Decorative script accent */}
            <p
              className="font-dancing mb-5"
              style={{
                color: "var(--color-gold)",
                fontSize: "1.35rem",
                letterSpacing: "0.02em",
              }}
            >
              "The way Maa always made it"
            </p>

            {/* Subtext */}
            <p
              className="font-dm-sans text-lg mb-8 max-w-[480px] leading-relaxed"
              style={{ color: "var(--color-grey)" }}
            >
              Authentic Andhra pickles, handcrafted with generations of tradition.
              No preservatives. No shortcuts. Just pure flavour in every jar.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-10">
              <Link
                href="/products"
                className="btn-primary inline-flex items-center gap-2.5 py-3.5 px-7 text-base"
              >
                Shop Now
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/about"
                className="btn-ghost inline-flex items-center gap-2.5 py-3.5 px-7 text-base"
              >
                Our Story
              </Link>
            </div>

            {/* Trust micro-badges */}
            <div className="flex flex-wrap items-center gap-5">
              {[
                { emoji: "🏺", text: "Homemade" },
                { emoji: "🌿", text: "No Preservatives" },
                { emoji: "✅", text: "100% Veg" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2">
                  <span className="text-base">{item.emoji}</span>
                  <span
                    className="font-dm-sans text-sm font-medium"
                    style={{ color: "var(--color-brown)" }}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Right: Product Visual ───────────────────────────────────── */}
          <div
            className={`relative flex justify-center items-center transition-all duration-700 delay-200 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* Main product display area */}
            <div className="relative w-full max-w-[480px] aspect-square">
              {/* Decorative ring */}
              <div
                className="absolute inset-4 rounded-full border-dashed opacity-20"
                style={{
                  border: "2px dashed var(--color-gold)",
                  animation: "spin-slow 20s linear infinite",
                }}
              />

              {/* Central product image placeholder */}
              {/* REPLACE with actual hero product image */}
              <div
                className="absolute inset-8 rounded-full flex items-center justify-center overflow-hidden"
                style={{
                  background:
                    "radial-gradient(circle at 40% 40%, #F5EFE0, #EDE3CE 60%, #E0D4BC)",
                  boxShadow:
                    "0 20px 60px rgba(74, 44, 10, 0.15), 0 4px 16px rgba(200, 150, 12, 0.1)",
                }}
              >
                {/* Product jar illustration placeholder */}
                <div className="text-center">
                  <div
                    className="text-7xl mb-2"
                    style={{ filter: "drop-shadow(0 4px 8px rgba(74,44,10,0.2))" }}
                  >
                    🫙
                  </div>
                  <p
                    className="font-dancing text-lg"
                    style={{ color: "var(--color-brown)" }}
                  >
                    Maa Flavours
                  </p>
                  <p
                    className="font-dm-sans text-xs mt-1"
                    style={{ color: "var(--color-grey)" }}
                  >
                    {/* REPLACE with actual product image */}
                    Product Image Here
                  </p>
                </div>
              </div>

              {/* Floating product tag — top right */}
              <div
                className="absolute top-6 right-0 px-4 py-2 rounded-full shadow-lg"
                style={{
                  background: "white",
                  boxShadow: "0 4px 16px rgba(74, 44, 10, 0.12)",
                  border: "1px solid rgba(200, 150, 12, 0.2)",
                  animation: "float 3s ease-in-out infinite",
                }}
              >
                <span
                  className="font-dm-sans text-xs font-semibold"
                  style={{ color: "var(--color-crimson)" }}
                >
                  🌶️ Authentic Andhra
                </span>
              </div>

              {/* Floating tag — bottom left */}
              <div
                className="absolute bottom-8 left-0 px-4 py-2.5 rounded-xl shadow-lg"
                style={{
                  background: "var(--color-brown)",
                  boxShadow: "0 4px 16px rgba(74, 44, 10, 0.25)",
                  animation: "float 3s ease-in-out infinite",
                  animationDelay: "1.5s",
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
                    style={{ background: "var(--color-gold)" }}
                  >
                    🌿
                  </div>
                  <div>
                    <p
                      className="font-dm-sans text-xs font-semibold leading-tight"
                      style={{ color: "var(--color-gold-light)" }}
                    >
                      No Preservatives
                    </p>
                    <p
                      className="font-dm-sans"
                      style={{ color: "rgba(245,239,224,0.6)", fontSize: "0.65rem" }}
                    >
                      Purely Homemade
                    </p>
                  </div>
                </div>
              </div>

              {/* Small pickle jars around */}
              {[
                { top: "10%", right: "12%", delay: "0s", emoji: "🌿", label: "Amla" },
                { bottom: "18%", right: "5%", delay: "0.8s", emoji: "🍋", label: "Lemon" },
                { top: "35%", left: "2%", delay: "1.2s", emoji: "🌶️", label: "Gongura" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="absolute w-12 h-12 rounded-full flex flex-col items-center justify-center"
                  style={{
                    top: item.top,
                    right: item.right,
                    bottom: item.bottom,
                    left: item.left,
                    background: "white",
                    boxShadow: "0 3px 12px rgba(74, 44, 10, 0.12)",
                    border: "1px solid rgba(200, 150, 12, 0.15)",
                    animation: `float 3s ease-in-out ${item.delay} infinite`,
                  }}
                >
                  <span className="text-base">{item.emoji}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Scroll hint ─────────────────────────────────────────────────── */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        style={{ animation: "float 2s ease-in-out infinite" }}
      >
        <span
          className="font-dm-sans text-xs font-medium tracking-widest uppercase"
          style={{ color: "var(--color-grey)" }}
        >
          Scroll
        </span>
        <ChevronDown
          size={18}
          style={{ color: "var(--color-gold)" }}
        />
      </div>
    </section>
  );
}

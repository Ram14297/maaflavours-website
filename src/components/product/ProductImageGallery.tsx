"use client";
// src/components/product/ProductImageGallery.tsx
// Maa Flavours — Product Detail Image Gallery
// Main image + thumbnail strip, keyboard nav, zoom on hover
// All images are placeholders — REPLACE with actual product images

import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface GalleryImage {
  id: string;
  url: string;    // REPLACE with actual Supabase Storage URL
  alt: string;
}

interface ProductImageGalleryProps {
  productName: string;
  productSlug: string;
  images?: GalleryImage[];
  emoji?: string; // placeholder emoji until real images added
}

// ─── Placeholder thumbnails (one per "angle") ─────────────────────────────
function buildPlaceholderImages(name: string, emoji: string): GalleryImage[] {
  return [
    { id: "1", url: "", alt: `${name} — front view` },
    { id: "2", url: "", alt: `${name} — side view` },
    { id: "3", url: "", alt: `${name} — label close-up` },
    { id: "4", url: "", alt: `${name} — in bowl` },
  ];
}

export default function ProductImageGallery({
  productName,
  productSlug,
  images,
  emoji = "🫙",
}: ProductImageGalleryProps) {
  const galleryImages = images?.length
    ? images
    : buildPlaceholderImages(productName, emoji);

  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const prev = useCallback(() => {
    setActiveIndex((i) => (i === 0 ? galleryImages.length - 1 : i - 1));
  }, [galleryImages.length]);

  const next = useCallback(() => {
    setActiveIndex((i) => (i === galleryImages.length - 1 ? 0 : i + 1));
  }, [galleryImages.length]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
    if (e.key === "Escape") setZoomed(false);
  };

  const active = galleryImages[activeIndex];

  return (
    <div className="flex flex-col gap-4">
      {/* ─── Main Image ─────────────────────────────────────────────────── */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          aspectRatio: "1 / 1",
          background:
            "linear-gradient(135deg, var(--color-cream) 0%, var(--color-cream-dark) 60%, #E0D4BC 100%)",
          border: "2px solid rgba(200,150,12,0.15)",
          boxShadow: "0 4px 32px rgba(74,44,10,0.1)",
          cursor: zoomed ? "zoom-out" : "zoom-in",
        }}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={handleMouseMove}
        onClick={() => setZoomed((z) => !z)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="img"
        aria-label={active.alt}
      >
        {/* Gold top ornament */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px] z-10"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--color-gold) 30%, var(--color-gold-light) 50%, var(--color-gold) 70%, transparent)",
          }}
        />

        {/* ─── Image placeholder — REPLACE with Next.js <Image /> ──────── */}
        {/* Replace this entire div with:
            <Image
              src={`/images/products/${productSlug}-${activeIndex + 1}.jpg`}
              alt={active.alt}
              fill
              className="object-cover"
              priority={activeIndex === 0}
            />
        */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 transition-transform duration-300"
          style={{
            transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
            transform: zoomed ? "scale(1.5)" : "scale(1)",
          }}
        >
          <span
            className="text-[5rem] lg:text-[7rem]"
            style={{
              filter: "drop-shadow(0 8px 16px rgba(74,44,10,0.2))",
            }}
          >
            {emoji}
          </span>
          <div className="text-center">
            <p
              className="font-dancing text-xl"
              style={{ color: "var(--color-brown)" }}
            >
              {productName}
            </p>
            <p
              className="font-dm-sans text-xs mt-0.5"
              style={{ color: "var(--color-grey)" }}
            >
              {/* REPLACE with actual product image */}
              View {activeIndex + 1} of {galleryImages.length}
            </p>
          </div>
        </div>

        {/* Gold corner ornaments */}
        <span className="corner-tl" />
        <span className="corner-tr" />
        <span className="corner-bl" />
        <span className="corner-br" />

        {/* Zoom hint */}
        {!zoomed && (
          <div
            className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full font-dm-sans text-xs font-medium z-10"
            style={{
              background: "rgba(74,44,10,0.7)",
              color: "rgba(245,239,224,0.9)",
              backdropFilter: "blur(4px)",
            }}
          >
            <ZoomIn size={12} />
            Zoom
          </div>
        )}

        {/* Prev / Next arrows */}
        {galleryImages.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 z-20"
              style={{
                background: "rgba(255,255,255,0.9)",
                boxShadow: "0 2px 8px rgba(74,44,10,0.15)",
                color: "var(--color-brown)",
              }}
              aria-label="Previous image"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 z-20"
              style={{
                background: "rgba(255,255,255,0.9)",
                boxShadow: "0 2px 8px rgba(74,44,10,0.15)",
                color: "var(--color-brown)",
              }}
              aria-label="Next image"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Image counter */}
        <div
          className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full font-dm-sans text-xs font-semibold z-20"
          style={{
            background: "rgba(255,255,255,0.85)",
            color: "var(--color-brown)",
            backdropFilter: "blur(4px)",
          }}
        >
          {activeIndex + 1} / {galleryImages.length}
        </div>
      </div>

      {/* ─── Thumbnail Strip ─────────────────────────────────────────────── */}
      {galleryImages.length > 1 && (
        <div className="flex gap-2.5">
          {galleryImages.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(idx)}
              className="relative flex-1 aspect-square rounded-xl overflow-hidden transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, var(--color-cream), var(--color-cream-dark))",
                border: `2px solid ${idx === activeIndex ? "var(--color-gold)" : "rgba(200,150,12,0.15)"}`,
                boxShadow: idx === activeIndex ? "0 0 0 2px rgba(200,150,12,0.2)" : "none",
                transform: idx === activeIndex ? "scale(1.04)" : "scale(1)",
              }}
              aria-label={`View image ${idx + 1}`}
              aria-current={idx === activeIndex}
            >
              {/* Thumbnail placeholder — REPLACE with actual images */}
              <div className="absolute inset-0 flex items-center justify-center text-2xl opacity-70">
                {emoji}
              </div>
              {/* Active overlay */}
              {idx === activeIndex && (
                <div
                  className="absolute inset-0 rounded-[10px]"
                  style={{ background: "rgba(200,150,12,0.08)" }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

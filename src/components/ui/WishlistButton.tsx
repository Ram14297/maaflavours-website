"use client";
// src/components/ui/WishlistButton.tsx
// Maa Flavours — Wishlist Heart Toggle Button
// Reads/writes wishlist from localStorage (key: mf_wishlist)
// Usage: <WishlistButton slug="drumstick-pickle" className="..." />
// Place on product cards and product detail pages

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";

const WISHLIST_KEY = "mf_wishlist";

function getWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]"); }
  catch { return []; }
}

function saveWishlist(slugs: string[]) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(slugs));
  // Dispatch event so wishlist page updates in real-time
  window.dispatchEvent(new Event("mf:wishlist:update"));
}

interface WishlistButtonProps {
  slug: string;
  productName?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function WishlistButton({
  slug,
  productName = "This pickle",
  size = "md",
  className = "",
}: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsWishlisted(getWishlist().includes(slug));

    // Listen for external changes (e.g., removed from wishlist page)
    const handler = () => setIsWishlisted(getWishlist().includes(slug));
    window.addEventListener("mf:wishlist:update", handler);
    return () => window.removeEventListener("mf:wishlist:update", handler);
  }, [slug]);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Don't navigate if inside a Link
    e.stopPropagation();

    const current = getWishlist();
    if (current.includes(slug)) {
      saveWishlist(current.filter((s) => s !== slug));
      setIsWishlisted(false);
      toast("Removed from wishlist", { icon: "💔", duration: 1800 });
    } else {
      saveWishlist([...current, slug]);
      setIsWishlisted(true);
      toast.success(`${productName} added to wishlist! ❤️`, { duration: 1800 });
    }
  };

  const sizeMap = {
    sm: { btn: "w-8 h-8", icon: 14 },
    md: { btn: "w-10 h-10", icon: 17 },
    lg: { btn: "w-12 h-12", icon: 20 },
  };
  const s = sizeMap[size];

  if (!mounted) {
    return (
      <div
        className={`${s.btn} rounded-full flex-shrink-0 ${className}`}
        style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(200,150,12,0.15)" }}
      />
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={isWishlisted}
      title={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
      className={`${s.btn} rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:scale-110 ${className}`}
      style={{
        background: isWishlisted ? "rgba(192,39,45,0.1)" : "rgba(255,255,255,0.92)",
        border: `1.5px solid ${isWishlisted ? "rgba(192,39,45,0.3)" : "rgba(200,150,12,0.2)"}`,
        backdropFilter: "blur(4px)",
        boxShadow: isWishlisted ? "0 2px 8px rgba(192,39,45,0.15)" : "0 1px 4px rgba(74,44,10,0.08)",
      }}
    >
      <Heart
        size={s.icon}
        fill={isWishlisted ? "var(--color-crimson)" : "transparent"}
        strokeWidth={isWishlisted ? 0 : 2}
        style={{
          color: isWishlisted ? "var(--color-crimson)" : "var(--color-grey)",
          transition: "all 0.2s ease",
        }}
      />
    </button>
  );
}

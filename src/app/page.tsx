"use client";
// src/app/page.tsx
// Maa Flavours — Homepage
// Assembles all 12 sections in order:
// 1. AnnouncementBar (in layout)
// 2. Navbar (in layout)
// 3. HeroSection
// 4. TrustBadges
// 5. FeaturedProducts
// 6. CategorySection
// 7. BrandStory
// 8. HowItWorks
// 9. RecipeInspiration
// 10. Newsletter
// 12. Footer (in layout)

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/home/HeroSection";
import TrustBadges from "@/components/home/TrustBadges";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import CategorySection from "@/components/home/CategorySection";
import BrandStory from "@/components/home/BrandStory";
import HowItWorks from "@/components/home/HowItWorks";
import RecipeInspiration from "@/components/home/RecipeInspiration";
import Newsletter from "@/components/home/Newsletter";
import Footer from "@/components/layout/Footer";

// Lazy-load OTP modal to keep initial bundle small
const OtpLoginModal = dynamic(
  () => import("@/components/auth/OtpLoginModal"),
  { ssr: false }
);

// Lazy-load cart drawer
const CartDrawer = dynamic(
  () => import("@/components/cart/CartDrawer"),
  { ssr: false }
);

export default function HomePage() {
  // ─── UI State ──────────────────────────────────────────────────────────
  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ─── Scroll Reveal ──────────────────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    const revealEls = document.querySelectorAll(".reveal");
    revealEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // ─── Handlers ──────────────────────────────────────────────────────────
  const handleCartClick = () => setCartOpen(true);
  const handleAccountClick = () => {
    if (isLoggedIn) {
      window.location.href = "/account";
    } else {
      setLoginOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setLoginOpen(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--color-warm-white)" }}
    >
      {/* ─── 1. Announcement Bar ──────────────────────────────────────── */}
      <AnnouncementBar />

      {/* ─── 2. Navigation ───────────────────────────────────────────── */}
      <Navbar
        cartCount={cartCount}
        isLoggedIn={isLoggedIn}
        onCartClick={handleCartClick}
        onAccountClick={handleAccountClick}
      />

      {/* ─── Main Content ─────────────────────────────────────────────── */}
      <main className="flex-1">

        {/* ─── 3. Hero ─────────────────────────────────────────────────── */}
        <HeroSection />

        {/* ─── 4. Trust Badges ─────────────────────────────────────────── */}
        <div className="reveal">
          <TrustBadges />
        </div>

        {/* ─── 5. Featured Products ────────────────────────────────────── */}
        <div className="reveal reveal-delay-1">
          <FeaturedProducts />
        </div>

        {/* ─── 6. Category Section ─────────────────────────────────────── */}
        <div className="reveal">
          <CategorySection />
        </div>

        {/* ─── 7. Brand Story ──────────────────────────────────────────── */}
        <div className="reveal">
          <BrandStory />
        </div>

        {/* ─── 8. How It Works ─────────────────────────────────────────── */}
        <div className="reveal">
          <HowItWorks />
        </div>

        {/* ─── 9. Recipe Inspiration ──────────────────────────────────── */}
        <div className="reveal">
          <RecipeInspiration />
        </div>

        {/* ─── 11. Newsletter ──────────────────────────────────────────── */}
        <Newsletter />

      </main>

      {/* ─── 12. Footer ──────────────────────────────────────────────────── */}
      <Footer />

      {/* ─── Overlays ────────────────────────────────────────────────────── */}

      {/* OTP Login Modal */}
      {loginOpen && (
        <OtpLoginModal
          isOpen={loginOpen}
          onClose={() => setLoginOpen(false)}
          onSuccess={handleLoginSuccess}
        />
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <CartDrawer
          onClose={() => setCartOpen(false)}
        />
      )}
    </div>
  );
}

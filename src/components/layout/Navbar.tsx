"use client";
// src/components/layout/Navbar.tsx
// Maa Flavours — Main navigation
// Transparent over hero → solid warm white on scroll
// Logo left | Nav center | Cart + Account right
// Cart badge | Account opens OTP modal if not logged in

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ShoppingBag, User, Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Static nav links ──────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Our Story", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

interface NavbarProps {
  cartCount?: number;
  isLoggedIn?: boolean;
  onCartClick?: () => void;
  onAccountClick?: () => void;
}

export default function Navbar({
  cartCount = 0,
  isLoggedIn = false,
  onCartClick,
  onAccountClick,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("/");
  const navRef = useRef<HTMLElement>(null);

  // ─── Scroll detection ─────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ─── Set active link ──────────────────────────────────────────────────
  useEffect(() => {
    setActiveLink(window.location.pathname);
  }, []);

  // ─── Close mobile menu on outside click ──────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ─── Lock body scroll when mobile menu open ───────────────────────────
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header
        ref={navRef}
        className={cn(
          "sticky top-0 left-0 right-0 z-nav transition-all duration-400",
          scrolled
            ? "bg-warm-white/98 backdrop-blur-sm"
            : "bg-transparent"
        )}
        style={{
          boxShadow: scrolled ? "0 2px 24px rgba(74, 44, 10, 0.08)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(200, 150, 12, 0.12)"
            : "1px solid transparent",
        }}
      >
        <div className="section-container">
          <div className="flex items-center justify-between h-16 md:h-[72px]">

            {/* ─── Logo ─────────────────────────────────────────────────── */}
            <Link
              href="/"
              className="flex items-center gap-2.5 flex-shrink-0 group"
              aria-label="Maa Flavours Home"
            >
              {/* Logo mark — placeholder, replace with actual SVG logo */}
              {/* REPLACE with actual logo SVG */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #C0272D, #9E1F24)",
                  boxShadow: "0 2px 8px rgba(192, 39, 45, 0.3)",
                }}
              >
                <span
                  className="font-dancing font-bold text-white"
                  style={{ fontSize: "18px" }}
                >
                  M
                </span>
              </div>
              <div className="flex flex-col leading-none">
                <span
                  className="font-playfair font-bold tracking-tight"
                  style={{
                    color: "var(--color-brown)",
                    fontSize: "1.1875rem",
                    lineHeight: 1.1,
                  }}
                >
                  Maa Flavours
                </span>
                <span
                  className="font-dancing hidden sm:block"
                  style={{
                    color: "var(--color-gold)",
                    fontSize: "0.7rem",
                    letterSpacing: "0.03em",
                  }}
                >
                  Authentic Andhra Taste
                </span>
              </div>
            </Link>

            {/* ─── Desktop Navigation ────────────────────────────────────── */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "nav-link px-3 py-2 rounded-md text-sm font-medium font-dm-sans transition-colors duration-200",
                    activeLink === link.href && "active"
                  )}
                  style={{
                    color:
                      activeLink === link.href
                        ? "var(--color-crimson)"
                        : "var(--color-brown)",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* ─── Actions (Cart + Account) ──────────────────────────────── */}
            <div className="flex items-center gap-1">
              {/* Cart Button */}
              <button
                onClick={onCartClick}
                className="relative p-2.5 rounded-lg transition-all duration-200 hover:bg-cream group"
                aria-label={`Shopping cart — ${cartCount} items`}
                style={{ color: "var(--color-brown)" }}
              >
                <ShoppingBag
                  size={22}
                  strokeWidth={1.75}
                  className="transition-transform duration-200 group-hover:scale-105"
                />
                {cartCount > 0 && (
                  <span
                    className="cart-badge"
                    style={{
                      top: "4px",
                      right: "4px",
                      minWidth: "18px",
                      height: "18px",
                    }}
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>

              {/* Account Button */}
              <button
                onClick={onAccountClick}
                className="relative p-2.5 rounded-lg transition-all duration-200 hover:bg-cream group"
                aria-label={isLoggedIn ? "My Account" : "Login"}
                style={{ color: "var(--color-brown)" }}
              >
                <User
                  size={22}
                  strokeWidth={1.75}
                  className="transition-transform duration-200 group-hover:scale-105"
                />
                {/* Online indicator when logged in */}
                {isLoggedIn && (
                  <span
                    className="absolute bottom-2 right-2 w-2 h-2 rounded-full border border-white"
                    style={{ backgroundColor: "var(--color-veg)" }}
                  />
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen((prev) => !prev)}
                className="md:hidden p-2.5 rounded-lg transition-colors duration-200 hover:bg-cream ml-1"
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
                style={{ color: "var(--color-brown)" }}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>

              {/* CTA Button — desktop only */}
              <Link
                href="/products"
                className="hidden lg:inline-flex btn-primary ml-3 py-2.5 px-5 text-sm"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>

        {/* ─── Gold ornamental bottom border ──────────────────────────────── */}
        <div
          className="h-px transition-opacity duration-400"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(200,150,12,0.4) 30%, rgba(232,184,75,0.6) 50%, rgba(200,150,12,0.4) 70%, transparent)",
            opacity: scrolled ? 1 : 0,
          }}
        />
      </header>

      {/* ─── Mobile Drawer Menu ───────────────────────────────────────────── */}
      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(74, 44, 10, 0.45)", backdropFilter: "blur(4px)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-[280px] z-50 md:hidden transition-transform duration-350",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          background: "var(--color-warm-white)",
          boxShadow: "4px 0 32px rgba(74, 44, 10, 0.15)",
        }}
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "rgba(200, 150, 12, 0.15)" }}
        >
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #C0272D, #9E1F24)" }}
            >
              <span className="font-dancing font-bold text-white text-base">M</span>
            </div>
            <span
              className="font-playfair font-bold"
              style={{ color: "var(--color-brown)", fontSize: "1.0625rem" }}
            >
              Maa Flavours
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg hover:bg-cream"
            style={{ color: "var(--color-brown)" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="px-3 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "px-4 py-3 rounded-xl font-dm-sans font-medium text-[0.9375rem] transition-colors duration-200",
                activeLink === link.href
                  ? "text-crimson bg-crimson/[0.06]"
                  : "hover:bg-cream"
              )}
              style={{ color: activeLink === link.href ? "var(--color-crimson)" : "var(--color-brown)" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Gold ornamental divider */}
        <div className="ornament-line-thick mx-5 my-1" />

        {/* Bottom actions */}
        <div className="px-4 pt-3 flex flex-col gap-3">
          <Link
            href="/products"
            onClick={() => setMobileOpen(false)}
            className="btn-primary w-full justify-center py-3"
          >
            <ShoppingBag size={18} />
            Shop All Pickles
          </Link>
          <button
            onClick={() => { setMobileOpen(false); onAccountClick?.(); }}
            className="btn-ghost w-full justify-center py-3"
          >
            <User size={18} />
            {isLoggedIn ? "My Account" : "Login"}
          </button>
        </div>

        {/* Footer note */}
        <p
          className="absolute bottom-6 left-0 right-0 text-center text-xs font-dm-sans px-5"
          style={{ color: "var(--color-grey)" }}
        >
          Authentic Andhra Pickles · Ongole
        </p>
      </div>
    </>
  );
}

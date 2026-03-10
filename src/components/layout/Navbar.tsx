"use client";
// src/components/layout/Navbar.tsx
// Maa Flavours — Main navigation
// Transparent over hero → solid warm white on scroll
// Logo left | Nav center | Cart + Account right
// Account: fetches /api/auth/me on mount → shows user initial + dropdown if logged in

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, User, Menu, X, ChevronDown, LogOut, Package, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Static nav links ──────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Home",     href: "/" },
  { label: "Products", href: "/products" },
  { label: "Blog",     href: "/blog" },
  { label: "Contact",  href: "/contact" },
];

interface AuthUser {
  id: string;
  name: string;
  mobile: string;
}

interface NavbarProps {
  cartCount?: number;
  isLoggedIn?: boolean;      // optional override (used by homepage OTP modal)
  onCartClick?: () => void;
  onAccountClick?: () => void; // optional override (used by homepage OTP modal)
}

export default function Navbar({
  cartCount = 0,
  isLoggedIn: isLoggedInProp,
  onCartClick,
  onAccountClick,
}: NavbarProps) {
  const router = useRouter();
  const [scrolled, setScrolled]         = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [activeLink, setActiveLink]     = useState("/");
  const [authUser, setAuthUser]         = useState<AuthUser | null>(null);
  const [authLoaded, setAuthLoaded]     = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const navRef     = useRef<HTMLElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // ─── Fetch auth state on mount ────────────────────────────────────────
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setAuthUser(data.user);
      })
      .catch(() => {})
      .finally(() => setAuthLoaded(true));
  }, []);

  // ─── Scroll detection ─────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ─── Set active link ──────────────────────────────────────────────────
  useEffect(() => {
    setActiveLink(window.location.pathname);
  }, []);

  // ─── Close account dropdown on outside click (navbar header scope only) ─
  // Note: mobile menu is closed via the overlay click — NOT here.
  // The drawer renders outside navRef, so a mousedown check on navRef would
  // fire before the <Link> click and swallow the navigation event.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ─── Close account dropdown on outside click ─────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
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

  // ─── Effective logged-in state ────────────────────────────────────────
  // Props override takes priority (homepage OTP modal flow)
  const isLoggedIn = isLoggedInProp ?? (authUser !== null);
  const firstName = authUser?.name?.split(" ")[0] || "";
  const initial = firstName.charAt(0).toUpperCase() || authUser?.mobile?.slice(-2) || "U";

  // ─── Logout ───────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch { /* ignore */ }
    setAuthUser(null);
    setAccountMenuOpen(false);
    router.push("/");
  };

  // ─── Account button click ─────────────────────────────────────────────
  const handleAccountClick = () => {
    if (onAccountClick) { onAccountClick(); return; }
    if (isLoggedIn) {
      setAccountMenuOpen((prev) => !prev);
    } else {
      router.push("/login");
    }
  };

  return (
    <>
      <header
        ref={navRef}
        className={cn(
          "sticky top-0 left-0 right-0 z-nav transition-all duration-400",
          scrolled ? "bg-warm-white/98 backdrop-blur-sm" : "bg-transparent"
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
              <div className="relative h-14 w-44 flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/maa-flavours-logo.png"
                  alt="Maa Flavours — Authentic Andhra Pickles"
                  fill
                  className="object-contain object-left"
                  priority
                  sizes="176px"
                />
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
                    color: activeLink === link.href
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
                    style={{ top: "4px", right: "4px", minWidth: "18px", height: "18px" }}
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>

              {/* Account Button */}
              {authLoaded && (
                <div className="relative" ref={accountRef}>
                  <button
                    onClick={handleAccountClick}
                    className="relative flex items-center gap-1.5 p-2 rounded-lg transition-all duration-200 hover:bg-cream group"
                    aria-label={isLoggedIn ? `Account — ${firstName}` : "Login"}
                    aria-expanded={accountMenuOpen}
                    style={{ color: "var(--color-brown)" }}
                  >
                    {isLoggedIn && authUser ? (
                      <>
                        {/* User initial circle */}
                        <span
                          className="w-8 h-8 rounded-full flex items-center justify-center font-dm-sans font-bold text-sm text-white flex-shrink-0"
                          style={{
                            background: "linear-gradient(135deg, var(--color-crimson), #9E1F24)",
                            boxShadow: "0 2px 8px rgba(192,39,45,0.3)",
                          }}
                        >
                          {initial}
                        </span>
                        {firstName && (
                          <span
                            className="hidden lg:block font-dm-sans text-sm font-semibold max-w-[80px] truncate"
                            style={{ color: "var(--color-brown)" }}
                          >
                            {firstName}
                          </span>
                        )}
                        <ChevronDown
                          size={14}
                          className={cn("hidden lg:block transition-transform duration-200", accountMenuOpen && "rotate-180")}
                          style={{ color: "var(--color-grey)" }}
                        />
                      </>
                    ) : (
                      <User
                        size={22}
                        strokeWidth={1.75}
                        className="transition-transform duration-200 group-hover:scale-105"
                      />
                    )}
                  </button>

                  {/* Account Dropdown */}
                  {accountMenuOpen && isLoggedIn && (
                    <div
                      className="absolute right-0 top-full mt-2 w-48 rounded-2xl overflow-hidden z-50"
                      style={{
                        background: "white",
                        border: "1px solid rgba(200,150,12,0.15)",
                        boxShadow: "0 8px 32px rgba(74,44,10,0.12)",
                      }}
                    >
                      {/* User info header */}
                      <div
                        className="px-4 py-3 border-b"
                        style={{ borderColor: "rgba(200,150,12,0.1)" }}
                      >
                        <p className="font-dm-sans font-bold text-sm truncate" style={{ color: "var(--color-brown)" }}>
                          {authUser?.name || "My Account"}
                        </p>
                        <p className="font-dm-sans text-xs truncate" style={{ color: "var(--color-grey)" }}>
                          {authUser?.mobile}
                        </p>
                      </div>

                      {/* Menu items */}
                      <div className="py-1">
                        <Link
                          href="/account"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 font-dm-sans text-sm transition-colors hover:bg-cream"
                          style={{ color: "var(--color-brown)" }}
                        >
                          <UserCircle size={16} style={{ color: "var(--color-gold)" }} />
                          My Account
                        </Link>
                        <Link
                          href="/account/orders"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 font-dm-sans text-sm transition-colors hover:bg-cream"
                          style={{ color: "var(--color-brown)" }}
                        >
                          <Package size={16} style={{ color: "var(--color-gold)" }} />
                          My Orders
                        </Link>
                        <div className="border-t my-1" style={{ borderColor: "rgba(200,150,12,0.1)" }} />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 font-dm-sans text-sm transition-colors hover:bg-crimson/5"
                          style={{ color: "var(--color-crimson)" }}
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

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
            <div className="relative h-11 w-40 flex-shrink-0">
              <Image
                src="/maa-flavours-logo.png"
                alt="Maa Flavours"
                fill
                className="object-contain object-left"
                sizes="160px"
              />
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg hover:bg-cream"
            style={{ color: "var(--color-brown)" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* User info in drawer (if logged in) */}
        {isLoggedIn && authUser && (
          <div
            className="mx-3 mt-3 px-4 py-3 rounded-xl flex items-center gap-3"
            style={{ background: "rgba(192,39,45,0.06)", border: "1px solid rgba(192,39,45,0.12)" }}
          >
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center font-dm-sans font-bold text-base text-white flex-shrink-0"
              style={{ background: "linear-gradient(135deg, var(--color-crimson), #9E1F24)" }}
            >
              {initial}
            </span>
            <div className="min-w-0">
              <p className="font-dm-sans font-bold text-sm truncate" style={{ color: "var(--color-brown)" }}>
                {authUser.name || "My Account"}
              </p>
              <p className="font-dm-sans text-xs truncate" style={{ color: "var(--color-grey)" }}>
                {authUser.mobile}
              </p>
            </div>
          </div>
        )}

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

          {isLoggedIn && authUser ? (
            <>
              <Link
                href="/account"
                onClick={() => setMobileOpen(false)}
                className="btn-ghost w-full justify-center py-3"
              >
                <UserCircle size={18} />
                My Account
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-dm-sans font-semibold text-sm transition-colors hover:bg-crimson/5"
                style={{ color: "var(--color-crimson)" }}
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => { setMobileOpen(false); onAccountClick ? onAccountClick() : router.push("/login"); }}
              className="btn-ghost w-full justify-center py-3"
            >
              <User size={18} />
              Login
            </button>
          )}
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

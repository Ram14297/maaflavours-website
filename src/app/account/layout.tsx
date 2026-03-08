"use client";
// src/app/account/layout.tsx
// Maa Flavours — Customer Account Layout
// Shared sidebar + content shell for all /account/* pages
// Sidebar: avatar, nav links — Orders, Profile, Addresses, Wishlist, Logout
// Auth guard: redirects to /login if not signed in

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Package, User, MapPin, Heart, LogOut,
  ChevronRight, ShoppingBag, Menu, X,
} from "lucide-react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import NavbarWithCart from "@/components/layout/NavbarWithCart";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import OtpLoginModal from "@/components/auth/OtpLoginModal";

const NAV_ITEMS = [
  { href: "/account/orders",    icon: Package,   label: "My Orders",    badge: null },
  { href: "/account/profile",   icon: User,      label: "Profile",      badge: null },
  { href: "/account/addresses", icon: MapPin,    label: "Addresses",    badge: null },
  { href: "/account/wishlist",  icon: Heart,     label: "Wishlist",     badge: null },
];

function AccountAvatar({ name, mobile }: { name: string; mobile: string }) {
  const initial = name?.charAt(0)?.toUpperCase() || "U";
  return (
    <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: "rgba(200,150,12,0.1)" }}>
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center font-playfair font-bold text-xl text-white flex-shrink-0"
        style={{ background: "linear-gradient(135deg, var(--color-crimson) 0%, #8B1A1A 100%)" }}
      >
        {initial}
      </div>
      <div className="min-w-0">
        <p className="font-dm-sans font-bold text-sm truncate" style={{ color: "var(--color-brown)" }}>
          {name || "Customer"}
        </p>
        <p className="font-dm-sans text-xs truncate" style={{ color: "var(--color-grey)" }}>
          {mobile}
        </p>
      </div>
    </div>
  );
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [loading, isLoggedIn, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-warm-white)" }}>
        <div className="flex flex-col items-center gap-3">
          <span className="text-4xl animate-pulse">🫙</span>
          <p className="font-dm-sans text-sm" style={{ color: "var(--color-grey)" }}>Loading account…</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) return null; // redirecting

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // ─── Sidebar content ─────────────────────────────────────────────────
  const SidebarContent = () => (
    <div
      className="flex flex-col h-full"
      style={{ background: "white", border: "1px solid rgba(200,150,12,0.12)" }}
    >
      {/* Gold ornament */}
      <div className="h-[3px]" style={{
        background: "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)",
      }} />

      {/* Avatar */}
      <AccountAvatar name={user?.name || ""} mobile={user?.mobile || ""} />

      {/* Nav links */}
      <nav className="flex flex-col p-3 gap-1 flex-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href}
              onClick={() => setMobileNavOpen(false)}
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 group"
              style={{
                background: active ? "rgba(192,39,45,0.07)" : "transparent",
                border: active ? "1px solid rgba(192,39,45,0.15)" : "1px solid transparent",
              }}
            >
              <Icon size={18} strokeWidth={1.75}
                style={{ color: active ? "var(--color-crimson)" : "var(--color-grey)", flexShrink: 0 }}
              />
              <span className="font-dm-sans font-semibold text-sm flex-1"
                style={{ color: active ? "var(--color-crimson)" : "var(--color-brown)" }}>
                {label}
              </span>
              <ChevronRight size={14}
                style={{ color: active ? "var(--color-crimson)" : "rgba(200,150,12,0.3)", flexShrink: 0 }}
              />
            </Link>
          );
        })}
      </nav>

      {/* Browse & Logout */}
      <div className="p-3 border-t flex flex-col gap-1" style={{ borderColor: "rgba(200,150,12,0.1)" }}>
        <Link href="/products"
          className="flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 hover:bg-cream"
        >
          <ShoppingBag size={18} strokeWidth={1.75} style={{ color: "var(--color-gold)" }} />
          <span className="font-dm-sans font-semibold text-sm" style={{ color: "var(--color-brown)" }}>
            Browse Pickles
          </span>
        </Link>

        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 hover:bg-red-50 w-full text-left">
          <LogOut size={18} strokeWidth={1.75} style={{ color: "var(--color-crimson)" }} />
          <span className="font-dm-sans font-semibold text-sm" style={{ color: "var(--color-crimson)" }}>
            Sign Out
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-warm-white)" }}>
      <AnnouncementBar />
      <NavbarWithCart onAccountClick={() => setLoginOpen(true)} />

      <main className="flex-1">
        <div className="section-container py-6 lg:py-10">

          {/* Mobile nav toggle */}
          <div className="lg:hidden mb-4 flex items-center justify-between">
            <h1 className="font-playfair font-bold text-xl" style={{ color: "var(--color-brown)" }}>
              My Account
            </h1>
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="p-2 rounded-xl"
              style={{ border: "1px solid rgba(200,150,12,0.2)" }}
            >
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile nav drawer */}
          {mobileNavOpen && (
            <div className="lg:hidden mb-6 rounded-2xl overflow-hidden">
              <SidebarContent />
            </div>
          )}

          {/* Desktop layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
            {/* Desktop sidebar */}
            <div className="hidden lg:block sticky top-[100px] rounded-2xl overflow-hidden">
              <SidebarContent />
            </div>

            {/* Page content */}
            <div>{children}</div>
          </div>
        </div>
      </main>

      <Footer />
      <OtpLoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}

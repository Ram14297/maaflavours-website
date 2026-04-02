// src/components/admin/AdminShell.tsx
// Maa Flavours — Admin Panel Shell
// Layout: fixed dark sidebar (240px) + main content area with top bar
// Mobile: sidebar hidden behind hamburger menu drawer
// Brand: deep brown/black sidebar, gold accents, crimson active states

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// ─── Navigation Structure ────────────────────────────────────────────────────
const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { href: "/admin/dashboard", label: "Dashboard",  icon: IconDashboard  },
      { href: "/admin/analytics", label: "Analytics",  icon: IconAnalytics  },
    ],
  },
  {
    label: "Commerce",
    items: [
      { href: "/admin/orders",    label: "Orders",     icon: IconOrders     },
      { href: "/admin/products",  label: "Products",   icon: IconProducts   },
      { href: "/admin/inventory", label: "Inventory",  icon: IconInventory  },
      { href: "/admin/coupons",   label: "Coupons",    icon: IconCoupons    },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin/customers", label: "Customers",  icon: IconCustomers  },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/admin/expenses",  label: "Expenses",   icon: IconExpenses   },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/settings",  label: "Settings",   icon: IconSettings   },
    ],
  },
];

// ─── Sidebar colours ─────────────────────────────────────────────────────────
const C = {
  bg:           "#120a04",     // Very dark brown
  bgHover:      "#1e1108",     // Slightly lighter
  bgActive:     "#2d1a0a",     // Active item bg (matches brown)
  border:       "rgba(200, 150, 12, 0.12)",
  gold:         "#C8960C",
  goldLight:    "#E8B84B",
  goldMuted:    "rgba(200, 150, 12, 0.5)",
  goldFaint:    "rgba(200, 150, 12, 0.15)",
  text:         "rgba(250, 250, 245, 0.75)",
  textHover:    "#FAFAF5",
  textActive:   "#E8B84B",
  textMuted:    "rgba(250, 250, 245, 0.35)",
  crimson:      "#C0272D",
};

// ─── Sidebar width ────────────────────────────────────────────────────────────
const SIDEBAR_W = 240;

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState("admin@maaflavours.com");
  const pathname = usePathname();
  const router   = useRouter();

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Get admin info from the JWT (best-effort — cookie is httpOnly so use API)
  useEffect(() => {
    const stored = sessionStorage.getItem("mf-admin-email");
    if (stored) setAdminEmail(stored);
  }, []);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    sessionStorage.removeItem("mf-admin-email");
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#1a0f05", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Sidebar (desktop — fixed, always visible) ── */}
      <aside
        className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 z-30"
        style={{
          width:      SIDEBAR_W,
          background: C.bg,
          borderRight: `1px solid ${C.border}`,
        }}
      >
        <SidebarContent
          pathname={pathname}
          adminEmail={adminEmail}
          onLogout={handleLogout}
        />
      </aside>

      {/* ── Mobile Overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(2px)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile Sidebar Drawer ── */}
      <aside
        className="fixed top-0 left-0 bottom-0 z-50 lg:hidden flex flex-col transition-transform duration-300"
        style={{
          width:      SIDEBAR_W,
          background: C.bg,
          borderRight: `1px solid ${C.border}`,
          transform:  mobileOpen ? "translateX(0)" : `translateX(-${SIDEBAR_W}px)`,
        }}
      >
        <SidebarContent
          pathname={pathname}
          adminEmail={adminEmail}
          onLogout={handleLogout}
          closeMobile={() => setMobileOpen(false)}
        />
      </aside>

      {/* ── Main Content Area ── */}
      <div
        className="flex-1 flex flex-col min-h-screen overflow-hidden"
        style={{ marginLeft: SIDEBAR_W, background: "#f8f4ee" }}
      >
        {/* Top Bar */}
        <TopBar
          pathname={pathname}
          onMobileMenuToggle={() => setMobileOpen(!mobileOpen)}
          onLogout={handleLogout}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR CONTENT
// ─────────────────────────────────────────────────────────────────────────────
function SidebarContent({
  pathname,
  adminEmail,
  onLogout,
  closeMobile,
}: {
  pathname:    string;
  adminEmail:  string;
  onLogout:    () => void;
  closeMobile?: () => void;
}) {
  return (
    <>
      {/* ── Logo / Brand ── */}
      <div
        className="shrink-0 px-5 py-5"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="relative shrink-0" style={{ width: 44, height: 44 }}>
            <Image
              src="/maa-flavours-logo.png"
              alt="Maa Flavours"
              fill
              className="object-contain"
              sizes="44px"
            />
          </div>
          <div>
            <p style={{ color: C.goldLight, fontSize: 14, fontWeight: 700, fontFamily: "'Playfair Display', serif", lineHeight: 1.2 }}>
              Maa Flavours
            </p>
            <p style={{ color: C.goldMuted, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Admin Panel
            </p>
          </div>
          {closeMobile && (
            <button
              onClick={closeMobile}
              className="ml-auto p-1 rounded opacity-50 hover:opacity-100 transition-opacity"
              style={{ color: C.text }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {NAV_SECTIONS.map(section => (
          <div key={section.label} className="mb-2">
            <p
              className="px-3 mb-1"
              style={{ color: C.textMuted, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}
            >
              {section.label}
            </p>
            {section.items.map(item => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all duration-150 group"
                  style={{
                    background:  isActive ? C.bgActive    : "transparent",
                    color:       isActive ? C.textActive  : C.text,
                    borderLeft:  isActive ? `2px solid ${C.gold}` : "2px solid transparent",
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = C.bgHover;
                      (e.currentTarget as HTMLElement).style.color = C.textHover;
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = C.text;
                    }
                  }}
                >
                  <item.icon
                    size={15}
                    style={{ color: isActive ? C.gold : "currentColor", opacity: isActive ? 1 : 0.7 }}
                  />
                  <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400 }}>
                    {item.label}
                  </span>
                  {/* Active indicator dot */}
                  {isActive && (
                    <div
                      className="ml-auto w-1.5 h-1.5 rounded-full"
                      style={{ background: C.gold }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Admin Profile / Logout ── */}
      <div
        className="shrink-0 p-3"
        style={{ borderTop: `1px solid ${C.border}` }}
      >
        {/* Visit store link */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg mb-2 transition-all duration-150"
          style={{ color: C.textMuted, fontSize: 12 }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.bgHover; (e.currentTarget as HTMLElement).style.color = C.text; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = C.textMuted; }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View Store
        </Link>

        {/* Admin user card */}
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
          style={{ background: C.bgHover }}
        >
          {/* Avatar */}
          <div
            className="flex items-center justify-center rounded-full shrink-0 text-xs font-bold"
            style={{ width: 32, height: 32, background: C.goldFaint, border: `1px solid ${C.border}`, color: C.gold }}
          >
            {adminEmail.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ color: C.text, fontSize: 12, fontWeight: 500 }} className="truncate">
              {adminEmail.split("@")[0]}
            </p>
            <p style={{ color: C.textMuted, fontSize: 10 }} className="truncate">
              {adminEmail}
            </p>
          </div>
          {/* Logout button */}
          <button
            onClick={onLogout}
            className="p-1.5 rounded transition-all duration-150"
            title="Logout"
            style={{ color: C.textMuted }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = C.crimson; (e.currentTarget as HTMLElement).style.background = "rgba(192,39,45,0.15)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = C.textMuted; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOP BAR
// ─────────────────────────────────────────────────────────────────────────────
function TopBar({
  pathname,
  onMobileMenuToggle,
  onLogout,
}: {
  pathname:          string;
  onMobileMenuToggle: () => void;
  onLogout:           () => void;
}) {
  const pageTitle = getPageTitle(pathname);

  return (
    <header
      className="shrink-0 flex items-center gap-4 px-6 py-4"
      style={{
        background:   "#fff",
        borderBottom: "1px solid rgba(74, 44, 10, 0.08)",
        minHeight:    64,
      }}
    >
      {/* Mobile hamburger */}
      <button
        className="lg:hidden p-2 rounded-lg transition-colors"
        onClick={onMobileMenuToggle}
        style={{ color: "#4A2C0A" }}
        onMouseEnter={e => (e.currentTarget.style.background = "#F5EFE0")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        aria-label="Toggle navigation"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Breadcrumb / Page Title */}
      <div className="flex-1 min-w-0">
        <Breadcrumb pathname={pathname} />
        <h1
          className="text-lg font-semibold leading-tight truncate"
          style={{ fontFamily: "'Playfair Display', serif", color: "#4A2C0A" }}
        >
          {pageTitle}
        </h1>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Live time */}
        <LiveClock />

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200" />

        {/* Quick link: View store */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors"
          style={{ color: "#C8960C", fontWeight: 500, fontSize: 12 }}
          onMouseEnter={e => (e.currentTarget.style.background = "#F5EFE0")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Store
        </a>

        {/* Logout button */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all"
          style={{ color: "#6B6B6B", fontSize: 12, fontWeight: 500 }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(192,39,45,0.08)"; (e.currentTarget as HTMLElement).style.color = "#C0272D"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#6B6B6B"; }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BREADCRUMB
// ─────────────────────────────────────────────────────────────────────────────
function Breadcrumb({ pathname }: { pathname: string }) {
  const parts = pathname.replace("/admin", "").split("/").filter(Boolean);
  if (parts.length === 0) return null;

  return (
    <div className="flex items-center gap-1 mb-0.5">
      <span style={{ color: "#6B6B6B", fontSize: 11 }}>Admin</span>
      {parts.map((part, i) => (
        <span key={i} className="flex items-center gap-1" style={{ color: "#6B6B6B", fontSize: 11 }}>
          <span>/</span>
          <span style={{ color: i === parts.length - 1 ? "#C8960C" : "#6B6B6B", textTransform: "capitalize" }}>
            {part.replace(/-/g, " ")}
          </span>
        </span>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE CLOCK
// ─────────────────────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    function update() {
      setTime(new Date().toLocaleTimeString("en-IN", {
        hour:   "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      }) + " IST");
    }
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <span style={{ color: "#9B9B9B", fontSize: 11, fontFamily: "'DM Sans', monospace" }}>
      {time}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE TITLE MAP
// ─────────────────────────────────────────────────────────────────────────────
function getPageTitle(pathname: string): string {
  const map: Record<string, string> = {
    "/admin/dashboard": "Dashboard",
    "/admin/analytics": "Analytics",
    "/admin/orders":    "Orders",
    "/admin/products":  "Products",
    "/admin/inventory": "Inventory",
    "/admin/customers": "Customers",
    "/admin/coupons":   "Coupons",
    "/admin/expenses":  "Expense Tracker",
    "/admin/settings":  "Settings",
  };
  // Exact match or prefix match
  const exact = map[pathname];
  if (exact) return exact;
  for (const [key, val] of Object.entries(map)) {
    if (pathname.startsWith(key + "/")) return val;
  }
  return "Admin";
}

// ─────────────────────────────────────────────────────────────────────────────
// ICON COMPONENTS (inline SVG, 15px)
// ─────────────────────────────────────────────────────────────────────────────
function IconDashboard({ size = 15, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  );
}
function IconAnalytics({ size = 15, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  );
}
function IconOrders({ size = 15, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  );
}
function IconProducts({ size = 15, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  );
}
function IconInventory({ size = 15, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
    </svg>
  );
}
function IconCoupons({ size = 15, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  );
}
function IconCustomers({ size = 15, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  );
}
function IconExpenses({ size = 15, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
    </svg>
  );
}
function IconSettings({ size = 15, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  );
}

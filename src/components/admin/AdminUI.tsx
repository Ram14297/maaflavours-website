// src/components/admin/AdminUI.tsx
// Maa Flavours — Shared Admin UI Components
// Stat cards, data tables, status badges, loading skeletons, empty states
// Used across all admin pages for consistent design

"use client";

import React, { ReactNode } from "react";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
export const A = {
  bg:          "#F8F4EE",     // Page background
  card:        "#FFFFFF",     // Card background
  border:      "rgba(74, 44, 10, 0.08)",
  brown:       "#4A2C0A",
  gold:        "#C8960C",
  goldLight:   "#E8B84B",
  crimson:     "#C0272D",
  grey:        "#6B6B6B",
  cream:       "#F5EFE0",
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE WRAPPER
// ─────────────────────────────────────────────────────────────────────────────
export function AdminPage({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`p-6 space-y-6 ${className}`} style={{ minHeight: "calc(100vh - 64px)", background: A.bg }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────────────────────
export function StatCard({
  title,
  value,
  sub,
  icon,
  trend,
  trendPositive,
  accent = A.gold,
  loading = false,
}: {
  title:          string;
  value:          string | number;
  sub?:           string;
  icon?:          ReactNode;
  trend?:         string;
  trendPositive?: boolean;
  accent?:        string;
  loading?:       boolean;
}) {
  if (loading) {
    return (
      <div className="rounded-xl p-5 animate-pulse" style={{ background: A.card, border: `1px solid ${A.border}` }}>
        <div className="h-3 w-24 rounded mb-3" style={{ background: A.cream }} />
        <div className="h-7 w-32 rounded mb-2" style={{ background: A.cream }} />
        <div className="h-3 w-20 rounded" style={{ background: A.cream }} />
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-5 transition-shadow hover:shadow-md"
      style={{
        background:  A.card,
        border:      `1px solid ${A.border}`,
        borderLeft:  `3px solid ${accent}`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p style={{ color: A.grey, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 6 }}>
            {title}
          </p>
          <p style={{ color: A.brown, fontSize: 26, fontWeight: 700, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>
            {value}
          </p>
          {(sub || trend) && (
            <div className="flex items-center gap-2 mt-2">
              {sub && (
                <span style={{ color: A.grey, fontSize: 11 }}>{sub}</span>
              )}
              {trend && (
                <span
                  className="flex items-center gap-0.5 text-xs font-medium"
                  style={{ color: trendPositive ? "#2E7D32" : A.crimson }}
                >
                  {trendPositive ? "▲" : "▼"} {trend}
                </span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div
            className="shrink-0 flex items-center justify-center rounded-lg"
            style={{ width: 40, height: 40, background: `${accent}18`, color: accent }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION CARD
// ─────────────────────────────────────────────────────────────────────────────
export function Card({
  title,
  subtitle,
  action,
  children,
  className = "",
  noPad = false,
}: {
  title?:     string;
  subtitle?:  string;
  action?:    ReactNode;
  children:   ReactNode;
  className?: string;
  noPad?:     boolean;
}) {
  return (
    <div
      className={`rounded-xl overflow-hidden ${className}`}
      style={{ background: A.card, border: `1px solid ${A.border}` }}
    >
      {(title || action) && (
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: `1px solid ${A.border}` }}
        >
          <div>
            {title && (
              <h2 style={{ color: A.brown, fontSize: 15, fontWeight: 600, fontFamily: "'Playfair Display', serif" }}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p style={{ color: A.grey, fontSize: 12, marginTop: 2 }}>{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPad ? "" : "p-5"}>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA TABLE
// ─────────────────────────────────────────────────────────────────────────────
export function Table({
  columns,
  rows,
  loading,
  emptyMessage = "No data found",
}: {
  columns:      { key: string; label: string; align?: "left" | "right" | "center"; width?: string }[];
  rows:         Record<string, ReactNode>[];
  loading?:     boolean;
  emptyMessage?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${A.border}` }}>
            {columns.map(col => (
              <th
                key={col.key}
                style={{
                  padding:    "10px 16px",
                  textAlign:  col.align || "left",
                  color:      A.grey,
                  fontSize:   11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  width:      col.width,
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${A.border}` }}>
                {columns.map(col => (
                  <td key={col.key} style={{ padding: "12px 16px" }}>
                    <div className="h-4 rounded animate-pulse" style={{ background: A.cream, width: "80%" }} />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: "48px 16px", textAlign: "center", color: A.grey, fontSize: 13 }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={i}
                style={{ borderBottom: `1px solid ${A.border}` }}
                className="transition-colors hover:bg-amber-50"
                onMouseEnter={e => (e.currentTarget.style.background = "#FDFAF4")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {columns.map(col => (
                  <td
                    key={col.key}
                    style={{
                      padding:   "12px 16px",
                      textAlign: col.align || "left",
                      color:     A.brown,
                      fontSize:  13,
                    }}
                  >
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  // Order statuses
  pending:          { bg: "#FEF9E7", color: "#B8750A", label: "Pending"           },
  confirmed:        { bg: "#E8F5E9", color: "#2E7D32", label: "Confirmed"         },
  processing:       { bg: "#E3F2FD", color: "#1565C0", label: "Processing"        },
  packed:           { bg: "#E8EAF6", color: "#3949AB", label: "Packed"            },
  shipped:          { bg: "#E0F2F1", color: "#00695C", label: "Shipped"           },
  out_for_delivery: { bg: "#E8F5E9", color: "#1B5E20", label: "Out for Delivery"  },
  delivered:        { bg: "#E8F5E9", color: "#2E7D32", label: "Delivered"         },
  cancelled:        { bg: "#FFEBEE", color: "#C62828", label: "Cancelled"         },
  refunded:         { bg: "#FFF3E0", color: "#E65100", label: "Refunded"          },
  // Payment statuses
  paid:             { bg: "#E8F5E9", color: "#2E7D32", label: "Paid"             },
  failed:           { bg: "#FFEBEE", color: "#C62828", label: "Failed"           },
  // General
  active:           { bg: "#E8F5E9", color: "#2E7D32", label: "Active"           },
  inactive:         { bg: "#F5F5F5", color: "#616161", label: "Inactive"         },
  "in-stock":       { bg: "#E8F5E9", color: "#2E7D32", label: "In Stock"         },
  "low-stock":      { bg: "#FEF9E7", color: "#B8750A", label: "Low Stock"        },
  "out-of-stock":   { bg: "#FFEBEE", color: "#C62828", label: "Out of Stock"     },
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || { bg: "#F5F5F5", color: "#616161", label: status };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ background: style.bg, color: style.color }}
    >
      {style.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BUTTON VARIANTS
// ─────────────────────────────────────────────────────────────────────────────
export function Btn({
  children,
  variant = "primary",
  size    = "md",
  loading,
  disabled,
  onClick,
  type    = "button",
  className = "",
}: {
  children:   ReactNode;
  variant?:   "primary" | "secondary" | "danger" | "ghost";
  size?:      "sm" | "md" | "lg";
  loading?:   boolean;
  disabled?:  boolean;
  onClick?:   () => void;
  type?:      "button" | "submit" | "reset";
  className?: string;
}) {
  const VARIANTS = {
    primary:   { bg: A.gold,     color: "#fff",   border: A.gold     },
    secondary: { bg: A.cream,    color: A.brown,  border: A.border   },
    danger:    { bg: A.crimson,  color: "#fff",   border: A.crimson  },
    ghost:     { bg: "transparent", color: A.grey, border: A.border  },
  };
  const SIZES = {
    sm: { px: "10px", py: "5px",  fs: 11 },
    md: { px: "14px", py: "8px",  fs: 13 },
    lg: { px: "20px", py: "11px", fs: 14 },
  };
  const v = VARIANTS[variant];
  const s = SIZES[size];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-opacity ${className}`}
      style={{
        background:  v.bg,
        color:       v.color,
        border:      `1px solid ${v.border}`,
        padding:     `${s.py} ${s.px}`,
        fontSize:    s.fs,
        opacity:     disabled ? 0.5 : 1,
        cursor:      disabled ? "not-allowed" : "pointer",
        whiteSpace:  "nowrap",
        fontFamily:  "'DM Sans', sans-serif",
      }}
    >
      {loading && (
        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      )}
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INPUT FIELD
// ─────────────────────────────────────────────────────────────────────────────
export function Input({
  label,
  error,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          className="block text-xs font-medium"
          style={{ color: A.grey, letterSpacing: "0.05em", textTransform: "uppercase" }}
        >
          {label}
        </label>
      )}
      <input
        className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
        style={{
          background:  "#fff",
          border:      error ? `1px solid ${A.crimson}` : `1px solid ${A.border}`,
          color:       A.brown,
          fontFamily:  "'DM Sans', sans-serif",
        }}
        onFocus={e => { e.target.style.border = `1px solid ${A.gold}`; e.target.style.boxShadow = `0 0 0 2px ${A.gold}22`; }}
        onBlur={e => { e.target.style.border = error ? `1px solid ${A.crimson}` : `1px solid ${A.border}`; e.target.style.boxShadow = "none"; }}
        {...props}
      />
      {error && <p style={{ color: A.crimson, fontSize: 11 }}>{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SELECT
// ─────────────────────────────────────────────────────────────────────────────
export function Select({
  label,
  error,
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-xs font-medium" style={{ color: A.grey, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          {label}
        </label>
      )}
      <select
        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
        style={{
          background: "#fff",
          border:     error ? `1px solid ${A.crimson}` : `1px solid ${A.border}`,
          color:      A.brown,
          fontFamily: "'DM Sans', sans-serif",
        }}
        {...props}
      >
        {children}
      </select>
      {error && <p style={{ color: A.crimson, fontSize: 11 }}>{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────────────────────────────────────
export function Pagination({
  page,
  pages,
  total,
  limit,
  onPage,
}: {
  page:   number;
  pages:  number;
  total:  number;
  limit:  number;
  onPage: (p: number) => void;
}) {
  if (pages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-2 py-1">
      <p style={{ color: A.grey, fontSize: 12 }}>
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-1">
        <Btn variant="ghost" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>← Prev</Btn>
        {Array.from({ length: Math.min(5, pages) }, (_, i) => {
          // Show pages around current page
          let p = i + 1;
          if (pages > 5) {
            if (page > 3)       p = page - 2 + i;
            if (page > pages - 2) p = pages - 4 + i;
          }
          return (
            <button
              key={p}
              onClick={() => onPage(p)}
              className="w-8 h-8 rounded text-xs font-medium transition-colors"
              style={{
                background: p === page ? A.gold : "transparent",
                color:      p === page ? "#fff"  : A.grey,
                border:     `1px solid ${p === page ? A.gold : A.border}`,
              }}
            >
              {p}
            </button>
          );
        })}
        <Btn variant="ghost" size="sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next →</Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?:        ReactNode;
  title:        string;
  description?: string;
  action?:      ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div className="mb-4 text-4xl opacity-30">{icon}</div>
      )}
      <p style={{ color: A.brown, fontSize: 16, fontWeight: 600, fontFamily: "'Playfair Display', serif" }}>
        {title}
      </p>
      {description && (
        <p style={{ color: A.grey, fontSize: 13, marginTop: 6, maxWidth: 320 }}>
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOADING SPINNER
// ─────────────────────────────────────────────────────────────────────────────
export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24" fill="none"
      className="animate-spin"
      style={{ color: A.gold }}
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMAT HELPERS (re-exported for use in admin pages)
// ─────────────────────────────────────────────────────────────────────────────
export function fmt₹(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// TEXTAREA
// ─────────────────────────────────────────────────────────────────────────────
export function Textarea({
  label,
  error,
  rows = 4,
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  rows?: number;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-xs font-medium" style={{ color: A.grey, letterSpacing:"0.05em", textTransform:"uppercase" }}>
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all resize-y"
        style={{ background:"#fff", border: error ? `1px solid ${A.crimson}` : `1px solid ${A.border}`, color: A.brown, fontFamily:"'DM Sans',sans-serif" }}
        onFocus={e => { e.target.style.border=`1px solid ${A.gold}`; e.target.style.boxShadow=`0 0 0 2px ${A.gold}22`; }}
        onBlur={e =>  { e.target.style.border=error?`1px solid ${A.crimson}`:`1px solid ${A.border}`; e.target.style.boxShadow="none"; }}
        {...props}
      />
      {error && <p style={{ color: A.crimson, fontSize:11 }}>{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────────────────────────────────────────
export function Modal({
  open,
  onClose,
  title,
  children,
  width = 520,
}: {
  open:    boolean;
  onClose: () => void;
  title?:  string;
  children: React.ReactNode;
  width?:  number;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background:"rgba(0,0,0,0.45)", backdropFilter:"blur(3px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative rounded-xl shadow-2xl overflow-hidden w-full"
        style={{ maxWidth: width, background:"#fff", border:`1px solid ${A.border}` }}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:`1px solid ${A.border}` }}>
            <h3 style={{ fontFamily:"'Playfair Display',serif", color:A.brown, fontSize:17, fontWeight:700 }}>{title}</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color:A.grey }}
              onMouseEnter={e=>(e.currentTarget.style.background=A.cream)}
              onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ALERT
// ─────────────────────────────────────────────────────────────────────────────
export function Alert({
  type = "info",
  children,
}: {
  type?: "success" | "error" | "warning" | "info";
  children: React.ReactNode;
}) {
  const styles = {
    success: { bg:"rgba(46,125,50,0.08)",   border:"rgba(46,125,50,0.3)",  color:"#2E7D32",  icon:"✅" },
    error:   { bg:"rgba(192,39,45,0.08)",   border:"rgba(192,39,45,0.3)", color:"#C0272D",  icon:"❌" },
    warning: { bg:"rgba(184,117,10,0.08)",  border:"rgba(184,117,10,0.3)",color:"#B8750A",  icon:"⚠️" },
    info:    { bg:"rgba(200,150,12,0.06)",  border:"rgba(200,150,12,0.25)",color:"#C8960C", icon:"ℹ️" },
  };
  const s = styles[type];
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-lg text-sm"
      style={{ background:s.bg, border:`1px solid ${s.border}`, color:s.color }}>
      <span className="shrink-0 mt-0.5">{s.icon}</span>
      <div>{children}</div>
    </div>
  );
}

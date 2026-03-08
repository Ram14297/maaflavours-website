// src/lib/utils.ts
// Maa Flavours — Shared utility functions

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ─── Class Name Utility ──────────────────────────────────────────────────
/**
 * Merge Tailwind classes safely — avoids conflicts
 * @example cn("px-4", isActive && "bg-crimson", "py-2")
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─── Price Utilities ──────────────────────────────────────────────────────

/** Convert paise to rupees display string (₹499) */
export function formatPrice(paise: number, compact = false): string {
  const rupees = paise / 100;
  if (compact && rupees >= 1000) {
    return `₹${(rupees / 1000).toFixed(1)}K`;
  }
  return `₹${rupees.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/** Convert rupees to paise */
export function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/** Calculate discount percentage */
export function discountPercent(original: number, discounted: number): number {
  return Math.round(((original - discounted) / original) * 100);
}

// ─── Mobile Number Utilities ──────────────────────────────────────────────

/** Format mobile for display: "+91 98765 43210" */
export function formatMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    const num = digits.slice(2);
    return `+91 ${num.slice(0, 5)} ${num.slice(5)}`;
  }
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return mobile;
}

/** Mask mobile for OTP screen: "+91 98765 ●●●●●" */
export function maskMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, "");
  const num = digits.length === 12 ? digits.slice(2) : digits;
  return `+91 ${num.slice(0, 5)} ${"●".repeat(5)}`;
}

/** Validate Indian mobile number */
export function isValidMobile(mobile: string): boolean {
  const digits = mobile.replace(/\D/g, "");
  const num = digits.length === 12 && digits.startsWith("91")
    ? digits.slice(2)
    : digits;
  return /^[6-9]\d{9}$/.test(num);
}

/** Normalize mobile to +91XXXXXXXXXX format */
export function normalizeMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, "");
  const num = digits.length === 12 && digits.startsWith("91")
    ? digits.slice(2)
    : digits;
  return `+91${num}`;
}

// ─── Order Utilities ──────────────────────────────────────────────────────

/** Generate order number: MF-2025-00123 */
export function generateOrderNumber(id: number): string {
  const year = new Date().getFullYear();
  return `MF-${year}-${String(id).padStart(5, "0")}`;
}

/** Get order status display info */
export function getOrderStatusConfig(status: string): {
  label: string;
  color: string;
  bgColor: string;
} {
  const config: Record<string, { label: string; color: string; bgColor: string }> = {
    pending: { label: "Pending", color: "#B8750A", bgColor: "rgba(184, 117, 10, 0.1)" },
    confirmed: { label: "Confirmed", color: "#C8960C", bgColor: "rgba(200, 150, 12, 0.1)" },
    processing: { label: "Processing", color: "#6B4226", bgColor: "rgba(107, 66, 38, 0.1)" },
    packed: { label: "Packed", color: "#4A7C59", bgColor: "rgba(74, 124, 89, 0.1)" },
    shipped: { label: "Shipped", color: "#2E7D32", bgColor: "rgba(46, 125, 50, 0.1)" },
    out_for_delivery: { label: "Out for Delivery", color: "#4A2C0A", bgColor: "rgba(74, 44, 10, 0.1)" },
    delivered: { label: "Delivered", color: "#2E7D32", bgColor: "rgba(46, 125, 50, 0.12)" },
    cancelled: { label: "Cancelled", color: "#C0272D", bgColor: "rgba(192, 39, 45, 0.1)" },
    refunded: { label: "Refunded", color: "#6B6B6B", bgColor: "rgba(107, 107, 107, 0.1)" },
  };
  return config[status] || config.pending;
}

// ─── Date Utilities ───────────────────────────────────────────────────────

/** Format date for display: "15 Jan 2025" */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Format date with time: "15 Jan 2025, 3:30 PM" */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** Relative time: "2 hours ago" */
export function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(dateString);
}

// ─── String Utilities ──────────────────────────────────────────────────────

/** Truncate text with ellipsis */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

/** Convert to title case */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Generate URL-safe slug */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Shipping Utilities ──────────────────────────────────────────────────

const FREE_SHIPPING_THRESHOLD_PAISE = 49900; // ₹499
const STANDARD_DELIVERY_PAISE = 4900;        // ₹49

/** Calculate delivery charge based on cart total */
export function calculateDeliveryCharge(cartTotalPaise: number): number {
  if (cartTotalPaise >= FREE_SHIPPING_THRESHOLD_PAISE) return 0;
  return STANDARD_DELIVERY_PAISE;
}

/** Amount needed for free shipping */
export function amountForFreeShipping(cartTotalPaise: number): number {
  const remaining = FREE_SHIPPING_THRESHOLD_PAISE - cartTotalPaise;
  return Math.max(0, remaining);
}

// ─── Spice Level Utilities ────────────────────────────────────────────────

export function getSpiceLevelConfig(level: string): {
  label: string;
  className: string;
  emoji: string;
  dotColor: string;
} {
  const config: Record<string, { label: string; className: string; emoji: string; dotColor: string }> = {
    mild: { label: "Mild", className: "badge-mild", emoji: "🌿", dotColor: "#4A7C59" },
    medium: { label: "Medium Spicy", className: "badge-medium", emoji: "🌶️", dotColor: "#B8750A" },
    spicy: { label: "Spicy", className: "badge-spicy", emoji: "🌶️🌶️", dotColor: "#C0272D" },
    "extra-hot": { label: "Extra Hot", className: "badge-extra-hot", emoji: "🔥", dotColor: "#7A1515" },
  };
  return config[level] || config.medium;
}

// ─── Pincode Validation ──────────────────────────────────────────────────

/** Validate Indian pincode */
export function isValidPincode(pincode: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pincode.trim());
}

// ─── Image Utils ──────────────────────────────────────────────────────────

/** Get Supabase storage public URL for product images */
export function getProductImageUrl(imagePath: string): string {
  if (imagePath.startsWith("http")) return imagePath;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${imagePath}`;
}

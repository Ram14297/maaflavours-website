// src/types/index.ts
// Maa Flavours — Shared TypeScript Type Definitions
// Central type registry used across all components and API routes

// ─── Product Types ────────────────────────────────────────────────────────

export type SpiceLevel = "mild" | "medium" | "spicy" | "extra-hot";

export interface ProductVariant {
  id: string;
  product_id: string;
  weight_grams: number;           // e.g. 250, 500
  label: string;                  // e.g. "250g", "500g"
  price: number;                  // in paise (₹1 = 100 paise)
  discounted_price: number | null;
  stock_quantity: number;
  sku: string;
  is_active: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;                   // e.g. "Drumstick Pickle"
  subtitle: string;               // e.g. "Medium Spicy"
  description: string;
  short_description: string;
  tag: string;                    // e.g. "Authentic Andhra Taste"
  spice_level: SpiceLevel;
  ingredients: string;
  shelf_life_days: number;
  is_vegetarian: boolean;
  is_active: boolean;
  is_featured: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  reviews?: ProductReview[];
  average_rating?: number;
  review_count?: number;
  category_id?: string;
  created_at: string;
  updated_at: string;
  // SEO
  meta_title?: string;
  meta_description?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;                    // Supabase Storage URL — REPLACE with actual image
  alt: string;
  is_primary: boolean;
  sort_order: number;
}

// ─── Category Types ───────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
}

// ─── Cart Types ───────────────────────────────────────────────────────────

export interface CartItem {
  id: string;                     // unique cart item ID
  product_id: string;
  variant_id: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;               // in paise
  discount: number;               // in paise
  delivery_charge: number;        // in paise
  total: number;                  // in paise
  coupon_code?: string;
  coupon_discount?: number;       // in paise
}

// ─── User / Auth Types ────────────────────────────────────────────────────

export interface Customer {
  id: string;
  mobile: string;                 // with +91 prefix
  name: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Aggregate
  total_orders?: number;
  total_spent?: number;
}

export interface Address {
  id: string;
  customer_id: string;
  name: string;
  mobile: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  type: "home" | "work" | "other";
  created_at: string;
}

// ─── Order Types ──────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type PaymentMethod = "razorpay_upi" | "razorpay_card" | "razorpay_netbanking" | "cod";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_label: string;          // e.g. "250g"
  quantity: number;
  unit_price: number;             // in paise at time of order
  total_price: number;            // in paise
  product_image?: string;
}

export interface Order {
  id: string;
  order_number: string;           // e.g. "MF-2025-00123"
  customer_id: string;
  customer?: Customer;
  items: OrderItem[];
  shipping_address: Address;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  subtotal: number;               // in paise
  discount: number;               // in paise
  delivery_charge: number;        // in paise
  total: number;                  // in paise
  coupon_code?: string;
  coupon_discount?: number;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  tracking_id?: string;
  courier_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  delivered_at?: string;
  // GST (for invoice)
  cgst_amount?: number;
  sgst_amount?: number;
  igst_amount?: number;
}

// ─── Review Types ─────────────────────────────────────────────────────────

export interface ProductReview {
  id: string;
  product_id: string;
  customer_id: string;
  customer_name: string;
  customer_city?: string;
  rating: number;                 // 1-5
  title?: string;
  body: string;
  is_verified_purchase: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
}

// ─── Coupon Types ─────────────────────────────────────────────────────────

export type CouponType = "flat" | "percent" | "free_shipping";

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;                  // amount (paise) or percent
  min_order_amount?: number;      // minimum cart value in paise
  max_discount_amount?: number;   // cap for percent coupons (paise)
  usage_limit?: number;
  usage_count: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}

// ─── Admin Types ──────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  role: "admin" | "super_admin";
  created_at: string;
}

export interface DashboardStats {
  revenue_today: number;
  revenue_this_week: number;
  revenue_this_month: number;
  orders_today: number;
  orders_this_week: number;
  orders_pending: number;
  total_customers: number;
  new_customers_this_week: number;
  low_stock_products: number;
}

export interface ExpenseEntry {
  id: string;
  category: "ingredients" | "packaging" | "delivery" | "marketing" | "utilities" | "other";
  description: string;
  amount: number;                 // in paise
  date: string;
  created_at: string;
}

// ─── API Response Types ───────────────────────────────────────────────────

export interface ApiResponse<T = null> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// OTP flow responses
export interface SendOtpResponse {
  success: boolean;
  message: string;
  masked_mobile?: string;         // e.g. "+91 98765 ●●●●●"
  expires_at?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  is_new_user: boolean;
  customer?: Customer;
  message: string;
}

// ─── Shipping Config ──────────────────────────────────────────────────────

export interface ShippingConfig {
  free_shipping_threshold: number;  // in paise (default: ₹499 = 49900)
  standard_delivery_charge: number; // in paise (default: ₹49 = 4900)
  cod_extra_charge: number;         // in paise (default: ₹30 = 3000)
  estimated_days_min: number;
  estimated_days_max: number;
}

// ─── Notification Preferences ────────────────────────────────────────────

export interface NotificationPreferences {
  order_confirmation_sms: boolean;
  order_shipped_sms: boolean;
  order_delivered_sms: boolean;
  low_stock_email: boolean;
  daily_report_email: boolean;
}

// ─── Price Utilities (helpers used throughout UI) ─────────────────────────

/**
 * Convert paise to rupees display string
 * @example formatPrice(49900) => "₹499"
 */
export function formatPrice(paise: number): string {
  const rupees = paise / 100;
  return `₹${rupees.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Get spice level display config
 */
export function getSpiceLevelConfig(level: SpiceLevel): {
  label: string;
  className: string;
  emoji: string;
} {
  const config = {
    mild: { label: "Mild", className: "badge-mild", emoji: "🌿" },
    medium: { label: "Medium Spicy", className: "badge-medium", emoji: "🌶️" },
    spicy: { label: "Spicy", className: "badge-spicy", emoji: "🌶️🌶️" },
    "extra-hot": { label: "Extra Hot", className: "badge-extra-hot", emoji: "🔥" },
  };
  return config[level];
}

/**
 * Format Indian mobile number for display
 * @example formatMobile("+919701452929") => "+91 97014 52929"
 */
export function formatMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    const num = digits.slice(2);
    return `+91 ${num.slice(0, 5)} ${num.slice(5)}`;
  }
  return mobile;
}

/**
 * Mask mobile number for display
 * @example maskMobile("+919701452929") => "+91 98765 ●●●●●"
 */
export function maskMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    const num = digits.slice(2);
    return `+91 ${num.slice(0, 5)} ${"●".repeat(5)}`;
  }
  return mobile;
}

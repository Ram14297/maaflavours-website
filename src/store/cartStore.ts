"use client";
// src/store/cartStore.ts
// Maa Flavours — Zustand Cart Store
// Manages cart items, quantities, coupon codes, and totals
// Persists to localStorage so cart survives page refresh
// All prices stored in paise (integer), displayed as ₹ via formatPrice()

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { PRODUCTS } from "@/lib/constants/products";
import { calculateDeliveryCharge } from "@/lib/utils";
import toast from "react-hot-toast";

// ─── Types ─────────────────────────────────────────────────────────────────
export interface CartLineItem {
  id: string;               // composite: `${productSlug}_${variantIndex}`
  productSlug: string;
  productName: string;
  productSubtitle: string;
  variantIndex: number;
  variantLabel: string;
  unitPrice: number;        // paise
  quantity: number;
  maxQuantity: number;
  emoji: string;
  imageUrl: string;         // REPLACE with Supabase Storage URL
}

export interface AppliedCoupon {
  code: string;
  type: "flat" | "percent" | "free_shipping";
  value: number;
  description: string;
}

interface CartStore {
  items: CartLineItem[];
  coupon: AppliedCoupon | null;
  isOpen: boolean;
  couponLoading: boolean;
  couponError: string;

  itemCount: () => number;
  subtotal: () => number;
  couponDiscount: () => number;
  deliveryCharge: () => number;
  total: () => number;

  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (productSlug: string, variantIndex: number, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
}

const PRODUCT_EMOJIS: Record<string, string> = {
  "drumstick-pickle": "🥢",
  "amla-pickle": "🫙",
  "pulihora-gongura": "🍃",
  "lemon-pickle": "🍋",
  "maamidi-allam": "🥭",
  "red-chilli-pickle": "🌶️",
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      isOpen: false,
      couponLoading: false,
      couponError: "",

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),

      couponDiscount: () => {
        const coupon = get().coupon;
        if (!coupon) return 0;
        const sub = get().subtotal();
        if (coupon.type === "flat") return Math.min(coupon.value * 100, sub);
        if (coupon.type === "percent") return Math.floor((sub * coupon.value) / 100);
        if (coupon.type === "free_shipping") return get().deliveryCharge();
        return 0;
      },

      deliveryCharge: () => {
        if (get().coupon?.type === "free_shipping") return 0;
        return calculateDeliveryCharge(get().subtotal());
      },

      total: () => {
        return Math.max(0, get().subtotal() - get().couponDiscount() + get().deliveryCharge());
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (productSlug, variantIndex, quantity = 1) => {
        const product = PRODUCTS.find((p) => p.slug === productSlug);
        if (!product) {
          console.error(`[CartStore] Product not found: "${productSlug}"`);
          return;
        }
        const variant = product.variants[variantIndex];
        if (!variant) {
          console.error(`[CartStore] Variant ${variantIndex} not found for "${productSlug}"`);
          return;
        }

        const id = `${productSlug}_${variantIndex}`;

        // Single atomic set — combining items + isOpen in one call avoids
        // a race between two separate set() calls with persist middleware
        set((s) => {
          const existing = s.items.find((i) => i.id === id);
          if (existing) {
            return {
              isOpen: true,
              items: s.items.map((i) =>
                i.id === id
                  ? { ...i, quantity: Math.min(i.quantity + quantity, i.maxQuantity) }
                  : i
              ),
            };
          }
          return {
            isOpen: true,
            items: [
              ...s.items,
              {
                id,
                productSlug,
                productName: product.name,
                productSubtitle: product.subtitle,
                variantIndex,
                variantLabel: variant.label,
                unitPrice: variant.price,
                quantity,
                maxQuantity: Math.min(
                  (variant as { stock_quantity?: number }).stock_quantity || 10,
                  10
                ),
                emoji: PRODUCT_EMOJIS[productSlug] || "🫙",
                imageUrl: "",
              },
            ],
          };
        });
      },

      removeItem: (itemId) => set((s) => ({ items: s.items.filter((i) => i.id !== itemId) })),

      updateQuantity: (itemId, quantity) => {
        if (quantity < 1) { get().removeItem(itemId); return; }
        set((s) => ({
          items: s.items.map((i) =>
            i.id === itemId ? { ...i, quantity: Math.min(quantity, i.maxQuantity) } : i
          ),
        }));
      },

      clearCart: () => set({ items: [], coupon: null }),

      applyCoupon: async (code) => {
        const trimmed = code.trim().toUpperCase();
        if (!trimmed) return;
        set({ couponLoading: true, couponError: "" });
        try {
          const res = await fetch("/api/coupons/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: trimmed, cartTotal: get().subtotal() }),
          });
          const data = await res.json();
          if (!data.valid) {
            set({ couponError: data.error || "Invalid coupon.", couponLoading: false });
            return;
          }
          set({ coupon: data.coupon as AppliedCoupon, couponLoading: false, couponError: "" });
          toast.success(`"${data.coupon.code}" applied — ${data.coupon.description}!`);
        } catch {
          set({ couponError: "Failed to apply coupon. Try again.", couponLoading: false });
        }
      },

      removeCoupon: () => {
        set({ coupon: null, couponError: "" });
        toast("Coupon removed", { icon: "✕" });
      },
    }),
    {
      name: "mf-cart-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items, coupon: s.coupon }),
    }
  )
);

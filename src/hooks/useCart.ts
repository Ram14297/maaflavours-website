"use client";
// src/hooks/useCart.ts
// Maa Flavours — useCart hook
// Convenience wrapper around useCartStore with pre-computed values
// Import this in product cards, detail pages, anywhere you need cart access

import { useCartStore } from "@/store/cartStore";

export function useCart() {
  const store = useCartStore();

  return {
    // Computed values (call these like values, not functions)
    itemCount: store.itemCount(),
    subtotal: store.subtotal(),
    couponDiscount: store.couponDiscount(),
    deliveryCharge: store.deliveryCharge(),
    total: store.total(),

    // State
    items: store.items,
    coupon: store.coupon,
    isOpen: store.isOpen,
    couponLoading: store.couponLoading,
    couponError: store.couponError,

    // Actions
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    applyCoupon: store.applyCoupon,
    removeCoupon: store.removeCoupon,
    openCart: store.openCart,
    closeCart: store.closeCart,
    toggleCart: store.toggleCart,
  };
}

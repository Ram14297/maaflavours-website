"use client";
// src/components/cart/CartProvider.tsx
// Maa Flavours — Cart Provider
// Wraps the app, mounts the CartDrawer globally, listens to Zustand store
// Drop inside layout.tsx: <CartProvider>{children}</CartProvider>

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useCartStore } from "@/store/cartStore";

// Lazy-load the drawer so it doesn't bloat initial JS bundle
const CartDrawer = dynamic(() => import("./CartDrawer"), {
  ssr: false,
});

export default function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, closeCart } = useCartStore();

  // Avoid hydration mismatch — don't render drawer until client mounts
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      {children}
      {mounted && isOpen && <CartDrawer onClose={closeCart} />}
    </>
  );
}

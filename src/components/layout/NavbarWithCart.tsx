"use client";
// src/components/layout/NavbarWithCart.tsx
// Maa Flavours — Self-contained Navbar connected to Zustand cart store
// Use this instead of Navbar on pages where you don't want to manually wire cart
// Reads cart count from store directly — no props needed for cart
// Still accepts onAccountClick for OTP modal; defaults to /login navigation

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "./Navbar";

interface NavbarWithCartProps {
  onAccountClick?: () => void;
  isLoggedIn?: boolean;
}

export default function NavbarWithCart({
  onAccountClick,
  isLoggedIn: isLoggedInProp,
}: NavbarWithCartProps) {
  const { itemCount, openCart } = useCartStore();
  const { isLoggedIn: authLoggedIn, loading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const count = mounted ? itemCount() : 0;

  const isLoggedIn = isLoggedInProp ?? authLoggedIn;

  // Default: navigate to /login. Pages that open an OTP modal pass their own handler.
  const handleAccountClick = onAccountClick ?? (() => router.push("/login"));

  const handleCartClick = () => {
    // Wait for auth check before deciding — prevents false redirect during hydration
    if (authLoading) return;
    if (!isLoggedIn) {
      router.push("/login?redirect=/cart");
      return;
    }
    openCart();
  };

  return (
    <Navbar
      cartCount={count}
      onCartClick={handleCartClick}
      onAccountClick={handleAccountClick}
      isLoggedIn={isLoggedIn}
    />
  );
}

"use client";
// src/components/layout/NavbarWithCart.tsx
// Maa Flavours — Self-contained Navbar connected to Zustand cart store
// Use this instead of Navbar on pages where you don't want to manually wire cart
// Reads cart count from store directly — no props needed for cart
// Still accepts onAccountClick for OTP modal; defaults to /login navigation

import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import Navbar from "./Navbar";

interface NavbarWithCartProps {
  onAccountClick?: () => void;
  isLoggedIn?: boolean;
}

export default function NavbarWithCart({
  onAccountClick,
  isLoggedIn,
}: NavbarWithCartProps) {
  const { itemCount, openCart } = useCartStore();
  const router = useRouter();
  const count = itemCount();

  // Default: navigate to /login. Pages that open an OTP modal pass their own handler.
  const handleAccountClick = onAccountClick ?? (() => router.push("/login"));

  return (
    <Navbar
      cartCount={count}
      onCartClick={openCart}
      onAccountClick={handleAccountClick}
      isLoggedIn={isLoggedIn}
    />
  );
}

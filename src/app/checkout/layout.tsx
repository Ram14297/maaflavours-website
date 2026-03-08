// src/app/checkout/layout.tsx
// Maa Flavours — Checkout Layout
// No-index meta for checkout flow (prevents cart/address pages from being indexed)

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout — Maa Flavours",
  description: "Complete your order of authentic Andhra homemade pickles. Secure checkout powered by Razorpay.",
  robots: {
    index: false,   // Don't index checkout pages
    follow: false,
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Checkout layout is minimal — no extra chrome
  return <>{children}</>;
}

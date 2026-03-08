// src/app/products/layout.tsx
// Maa Flavours — Products section layout wrapper
// Can be extended for shared state/context across the store section

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Andhra Pickles — All Varieties | Maa Flavours",
  description:
    "Shop authentic Andhra homemade pickles. Drumstick, Gongura, Lemon, Amla, Maamidi Allam, Red Chilli — handcrafted with no preservatives. Pan-India delivery. Free shipping above ₹499.",
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

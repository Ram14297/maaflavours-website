// src/app/about/layout.tsx
// Maa Flavours — About Us page metadata

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Story — Maa Flavours | Authentic Andhra Homemade Pickles",
  description:
    "Learn the story behind Maa Flavours — authentic Andhra homemade pickles crafted in Ongole with generations of tradition, no preservatives, and pure love.",
  openGraph: {
    title: "Our Story — Maa Flavours",
    description:
      "From Ongole's kitchen to your table — the story of Maa Flavours and the generations-old Andhra pickle tradition.",
    url: "https://maaflavours.com/about",
    siteName: "Maa Flavours",
    type: "website",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

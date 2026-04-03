// src/app/layout.tsx
// Maa Flavours — Root Layout
// Wraps all pages with fonts, global styles, and providers

import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { Playfair_Display, Cormorant_Garamond, DM_Sans, Dancing_Script } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import CartProvider from "@/components/cart/CartProvider";

// ─── Font Loading — Next.js Font Optimization ─────────────────────────────
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// ─── Site Metadata ─────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: "Maa Flavours — Authentic Andhra Homemade Pickles",
    template: "%s | Maa Flavours",
  },
  description:
    "Authentic Andhra homemade pickles from Ongole. Handcrafted with traditional recipes, no preservatives, no shortcuts. Shop Drumstick, Gongura, Lemon, Amla pickles — Pan-India delivery.",
  keywords: [
    "Andhra pickles",
    "homemade pickles",
    "Andhra achar",
    "gongura pickle",
    "drumstick pickle",
    "no preservatives pickle",
    "authentic Andhra food",
    "Ongole pickles",
    "traditional pickle",
    "buy pickle online",
    "maa flavours",
  ],
  authors: [{ name: "Maa Flavours", url: "https://maaflavours.com" }],
  creator: "Maa Flavours",
  publisher: "Maa Flavours",
  category: "Food & Grocery",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://maaflavours.com"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://maaflavours.com",
    siteName: "Maa Flavours",
    title: "Maa Flavours — Authentic Andhra Homemade Pickles",
    description:
      "Handcrafted Andhra pickles from Ongole. Traditional recipes, no preservatives. Pan-India delivery.",
    images: [
      {
        url: "/images/brand/og-image.jpg", // REPLACE with actual OG image
        width: 1200,
        height: 630,
        alt: "Maa Flavours — Authentic Andhra Homemade Pickles",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Maa Flavours — Authentic Andhra Homemade Pickles",
    description:
      "Handcrafted Andhra pickles from Ongole. Traditional recipes, no preservatives.",
    images: ["/images/brand/og-image.jpg"], // REPLACE with actual image
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/maa-flavours-logo.png", type: "image/png" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/maa-flavours-logo.png" },
      { url: "/icons/apple-touch-icon.png", sizes: "180x180" },
    ],
    other: [
      { rel: "mask-icon", url: "/icons/safari-pinned-tab.svg", color: "#C0272D" },
    ],
  },
  manifest: "/site.webmanifest",
  verification: {
    // google: "your-google-site-verification-code", // Add when available
  },
};

export const viewport: Viewport = {
  themeColor: "#C0272D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// ─── Root Layout Component ─────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en-IN"
      className={`
        ${playfairDisplay.variable} 
        ${cormorantGaramond.variable} 
        ${dmSans.variable} 
        ${dancingScript.variable}
      `}
    >
      <body
        className="font-dm-sans antialiased"
        style={{
          background: "var(--color-warm-white)",
          color: "var(--color-brown)",
        }}
      >
        {/* Cart Provider — mounts CartDrawer globally, driven by Zustand */}
        <CartProvider>
          {children}
        </CartProvider>

        {/* Toast Notifications — warm brand style */}
        <Toaster
          position="top-center"
          gutter={12}
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: "var(--font-dm-sans)",
              fontSize: "0.9375rem",
              fontWeight: "500",
              background: "#4A2C0A",
              color: "#FAFAF5",
              borderRadius: "10px",
              padding: "14px 18px",
              boxShadow: "0 8px 32px rgba(74, 44, 10, 0.2)",
              borderLeft: "4px solid #C8960C",
            },
            success: {
              style: {
                borderLeft: "4px solid #2E7D32",
              },
              iconTheme: {
                primary: "#2E7D32",
                secondary: "#FAFAF5",
              },
            },
            error: {
              style: {
                borderLeft: "4px solid #C0272D",
              },
              iconTheme: {
                primary: "#C0272D",
                secondary: "#FAFAF5",
              },
            },
          }}
        />

        <Analytics />
        <SpeedInsights />

        {/* Structured Data — JSON-LD for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FoodEstablishment",
              name: "Maa Flavours",
              description:
                "Authentic Andhra homemade pickles from Ongole, Andhra Pradesh. Handcrafted with traditional recipes and no preservatives.",
              url: "https://maaflavours.com",
              telephone: "+919701452929", // REPLACE with actual number
              address: {
                "@type": "PostalAddress",
                addressLocality: "Ongole",
                addressRegion: "Andhra Pradesh",
                postalCode: "523001",
                addressCountry: "IN",
              },
              servesCuisine: "Andhra",
              priceRange: "₹150–₹370",
              currenciesAccepted: "INR",
              paymentAccepted: "Cash, Credit Card, UPI",
              sameAs: [
                "https://instagram.com/maaflavours",
                "https://facebook.com/maaflavours",
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}

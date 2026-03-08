// next.config.js
// Maa Flavours — Next.js 14 Configuration

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ─── Image Optimization ─────────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1440, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ─── Security Headers ────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://cdn.razorpay.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.supabase.co https://cdn.razorpay.com",
              "connect-src 'self' https://*.supabase.co https://api.razorpay.com https://lumberjack.razorpay.com",
              "frame-src https://api.razorpay.com",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },

  // ─── Redirects ───────────────────────────────────────────────────────────
  async redirects() {
    return [
      // Redirect /shop to /products
      {
        source: "/shop",
        destination: "/products",
        permanent: true,
      },
    ];
  },

  // ─── Experimental Features ────────────────────────────────────────────────
  experimental: {
    // Server Actions
    serverActions: {
      allowedOrigins: ["maaflavours.com", "localhost:3000"],
    },
  },

  // ─── Environment ─────────────────────────────────────────────────────────
  env: {
    NEXT_PUBLIC_SITE_NAME: "Maa Flavours",
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    NEXT_PUBLIC_CURRENCY: "INR",
    NEXT_PUBLIC_CURRENCY_SYMBOL: "₹",
  },

  // ─── TypeScript ───────────────────────────────────────────────────────────
  typescript: {
    ignoreBuildErrors: false,
  },

  // ─── ESLint ───────────────────────────────────────────────────────────────
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;

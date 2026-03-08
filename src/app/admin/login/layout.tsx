// src/app/admin/login/layout.tsx
// Maa Flavours — Admin Login standalone layout
// Overrides the AdminShell so login page gets its own full-screen layout
// (no sidebar — user isn't authenticated yet)

import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title:       "Admin Login — Maa Flavours",
  description: "Maa Flavours admin portal login",
  robots:      "noindex, nofollow",
};

export const viewport: Viewport = {
  themeColor: "#1a0f05",
};

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  // Standalone layout — no AdminShell wrapper
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}

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
  // Note: <html>/<body> are provided by the root layout — do NOT add them here
  return <>{children}</>;
}

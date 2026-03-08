// src/app/admin/layout.tsx
// Maa Flavours — Admin Panel Root Layout
// Wraps all /admin/* pages (except /admin/login which has its own layout)
// Provides: dark sidebar navigation, top bar, admin context

import type { Metadata } from "next";
import type { ReactNode } from "react";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title:       { default: "Admin — Maa Flavours", template: "%s | Maa Admin" },
  description: "Maa Flavours admin panel — manage orders, products, and customers",
  robots:      "noindex, nofollow",  // Never index admin pages
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Middleware already validates the JWT — if we reach here, user is authenticated
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}

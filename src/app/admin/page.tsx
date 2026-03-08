// src/app/admin/page.tsx
// Maa Flavours — Admin root redirect
// /admin → /admin/dashboard

import { redirect } from "next/navigation";

export default function AdminRootPage() {
  redirect("/admin/dashboard");
}

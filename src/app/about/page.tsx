// src/app/about/page.tsx
// "Our Story" page removed — redirect to homepage

import { redirect } from "next/navigation";

export default function Page() {
  redirect("/");
}

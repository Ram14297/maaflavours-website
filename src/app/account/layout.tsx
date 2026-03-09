"use client";
// src/app/account/layout.tsx
// Maa Flavours — Account section layout
// Provides AnnouncementBar + NavbarWithCart + Footer wrapper
// Auth guard is handled individually by each account page/subpage

import AnnouncementBar from "@/components/layout/AnnouncementBar";
import NavbarWithCart from "@/components/layout/NavbarWithCart";
import Footer from "@/components/layout/Footer";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-warm-white)" }}>
      <AnnouncementBar />
      <NavbarWithCart />
      <main className="flex-1">
        <div className="section-container py-8 lg:py-12 max-w-3xl">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}

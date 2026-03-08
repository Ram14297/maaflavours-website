// src/app/login/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Maa Flavours",
  description: "Sign in to your Maa Flavours account with your mobile number. No password needed — fast OTP login.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

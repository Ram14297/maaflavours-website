// src/app/order-confirmation/layout.tsx
// Maa Flavours — Order Confirmation section layout
// No-index: confirmation pages are private/transactional

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmed — Maa Flavours",
  description:
    "Your authentic Andhra pickle order has been confirmed. Thank you for choosing Maa Flavours!",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrderConfirmationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

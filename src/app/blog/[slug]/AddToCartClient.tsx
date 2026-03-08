"use client";
// src/app/blog/[slug]/AddToCartClient.tsx
// Maa Flavours — Add-to-cart button used inside the blog post product CTA block
// Must be client component because it accesses Zustand cart store

import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";

interface Props {
  productSlug: string;
  productName: string;
  variantIndex: number;
  variantLabel: string;
  price: number;
}

export default function AddToCartClient({
  productSlug,
  productName,
  variantIndex,
  variantLabel,
  price,
}: Props) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = () => {
    addItem({
      productSlug,
      productName,
      variantIndex,
      variantLabel,
      price,
      quantity: 1,
    });
    toast.success(`${productName} added to cart! 🛒`, { duration: 1800 });
  };

  return (
    <button
      onClick={handleAdd}
      className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-dm-sans font-bold text-sm transition-all duration-200 hover:-translate-y-0.5"
      style={{
        border: "2px solid var(--color-brown)",
        color: "var(--color-brown)",
        background: "transparent",
      }}
    >
      <ShoppingCart size={14} />
      Add to Cart
    </button>
  );
}

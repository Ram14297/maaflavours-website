// src/app/admin/products/[productId]/page.tsx
// Maa Flavours — Edit Existing Product

"use client";
import { useParams } from "next/navigation";
import ProductForm from "../ProductForm";

export default function EditProductPage() {
  const { productId } = useParams<{ productId: string }>();
  return <ProductForm productId={productId} />;
}

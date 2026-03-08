// src/components/order/OrderItemsTable.tsx
// Maa Flavours — Order Items Table
// Displays all items in an order with image, name, variant, qty, price
// Used on: Order Confirmation, Account → Order Detail, Admin Panel

import Link from "next/link";
import { formatPrice } from "@/lib/utils";

// ─── Types matching Supabase orders.items JSON ────────────────────────────
export interface OrderLineItem {
  productSlug: string;
  productName: string;
  variantLabel: string;
  variantIndex: number;
  quantity: number;
  unitPrice: number;   // paise
  lineTotal: number;   // paise
  emoji?: string;
  // imageUrl: string; // REPLACE with Supabase Storage URL
}

// ─── Emoji fallback map ──────────────────────────────────────────────────
const PRODUCT_EMOJIS: Record<string, string> = {
  "drumstick-pickle": "🥢",
  "amla-pickle": "🫙",
  "pulihora-gongura": "🍃",
  "lemon-pickle": "🍋",
  "maamidi-allam": "🥭",
  "red-chilli-pickle": "🌶️",
};

interface OrderItemsTableProps {
  items: OrderLineItem[];
  showLinks?: boolean;
}

export default function OrderItemsTable({
  items,
  showLinks = true,
}: OrderItemsTableProps) {
  if (!items?.length) {
    return (
      <p
        className="font-dm-sans text-sm py-4 text-center"
        style={{ color: "var(--color-grey)" }}
      >
        No items in this order.
      </p>
    );
  }

  return (
    <div className="flex flex-col divide-y" style={{ divideColor: "rgba(200,150,12,0.08)" }}>
      {items.map((item, idx) => {
        const emoji = item.emoji || PRODUCT_EMOJIS[item.productSlug] || "🫙";

        const imageEl = (
          <div
            className="relative w-16 h-16 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, var(--color-cream) 0%, var(--color-cream-dark) 100%)",
              border: "1px solid rgba(200,150,12,0.15)",
            }}
          >
            {/* REPLACE with actual product image */}
            {/* <Image src={`/images/products/${item.productSlug}.jpg`} alt={item.productName} fill className="object-cover rounded-xl" /> */}
            <span>{emoji}</span>

            {/* Veg dot */}
            <span
              className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 flex items-center justify-center rounded"
              style={{ background: "white", border: "1px solid #2E7D32" }}
            >
              <span className="block w-2 h-2 rounded-full" style={{ background: "#2E7D32" }} />
            </span>

            {/* Quantity badge */}
            <span
              className="absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center font-dm-sans text-xs font-bold text-white"
              style={{ background: "var(--color-crimson)", fontSize: "0.6rem" }}
            >
              {item.quantity}
            </span>
          </div>
        );

        return (
          <div key={idx} className="flex items-center gap-4 py-4">
            {/* Image */}
            {showLinks ? (
              <Link
                href={`/products/${item.productSlug}`}
                aria-label={`View ${item.productName}`}
              >
                {imageEl}
              </Link>
            ) : (
              imageEl
            )}

            {/* Details */}
            <div className="flex-1 min-w-0">
              {showLinks ? (
                <Link href={`/products/${item.productSlug}`}>
                  <h4
                    className="font-dm-sans font-semibold text-sm hover:underline"
                    style={{ color: "var(--color-brown)" }}
                  >
                    {item.productName}
                  </h4>
                </Link>
              ) : (
                <h4
                  className="font-dm-sans font-semibold text-sm"
                  style={{ color: "var(--color-brown)" }}
                >
                  {item.productName}
                </h4>
              )}

              <p
                className="font-dm-sans text-xs mt-0.5"
                style={{ color: "var(--color-grey)" }}
              >
                {item.variantLabel} · Qty {item.quantity}
              </p>

              <p
                className="font-dm-sans text-xs mt-0.5 font-medium"
                style={{ color: "var(--color-grey)" }}
              >
                {formatPrice(item.unitPrice)} each
              </p>
            </div>

            {/* Line total */}
            <div className="text-right flex-shrink-0">
              <p
                className="font-dm-sans font-bold text-base"
                style={{ color: "var(--color-crimson)" }}
              >
                {formatPrice(item.lineTotal)}
              </p>
              {item.quantity > 1 && (
                <p
                  className="font-dm-sans text-xs"
                  style={{ color: "var(--color-grey)" }}
                >
                  {item.quantity} × {formatPrice(item.unitPrice)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

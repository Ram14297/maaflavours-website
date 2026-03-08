// src/components/order/OrderStatusBadge.tsx
// Maa Flavours — Order Status Badge
// Color-coded pill for each order status
// Used on confirmation page, account orders, admin panel

import { getOrderStatusConfig } from "@/lib/utils";

interface OrderStatusBadgeProps {
  status: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: "text-xs px-2.5 py-1",
  md: "text-sm px-3 py-1.5",
  lg: "text-base px-4 py-2",
};

const STATUS_ICONS: Record<string, string> = {
  pending:          "⏳",
  confirmed:        "✅",
  processing:       "⚙️",
  packed:           "📦",
  shipped:          "🚚",
  out_for_delivery: "🛵",
  delivered:        "🎉",
  cancelled:        "✕",
  refunded:         "↩️",
  payment_failed:   "⚠️",
};

export default function OrderStatusBadge({
  status,
  size = "md",
}: OrderStatusBadgeProps) {
  const config = getOrderStatusConfig(status);
  const icon = STATUS_ICONS[status] || "📋";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-dm-sans font-semibold ${SIZE_CLASSES[size]}`}
      style={{
        background: config.bgColor,
        color: config.color,
        border: `1px solid ${config.color}30`,
      }}
    >
      <span className="text-xs">{icon}</span>
      {config.label}
    </span>
  );
}

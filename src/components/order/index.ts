// src/components/order/index.ts
// Maa Flavours — Order components barrel export
// Import cleanly: import { DeliveryTimeline, OrderStatusBadge } from "@/components/order"

export { default as OrderStatusBadge } from "./OrderStatusBadge";
export { default as DeliveryTimeline, buildOrderTimeline } from "./DeliveryTimeline";
export { default as OrderItemsTable } from "./OrderItemsTable";
export { default as OrderPriceSummary } from "./OrderPriceSummary";
export { default as ShareOrderCard } from "./ShareOrderCard";

export type { TimelineEvent } from "./DeliveryTimeline";
export type { OrderLineItem } from "./OrderItemsTable";
export type { OrderPriceData } from "./OrderPriceSummary";

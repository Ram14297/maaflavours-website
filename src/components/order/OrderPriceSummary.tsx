import React from "react";
// src/components/order/OrderPriceSummary.tsx
// Maa Flavours — Order Price Summary breakdown
// Shows: Subtotal, Coupon Discount, Delivery, COD Charge, Total
// Used on: Order Confirmation, Account → Order Detail, Admin Panel

import { formatPrice } from "@/lib/utils";

export interface OrderPriceData {
  subtotalPaise: number;
  discountPaise: number;
  deliveryChargePaise: number;
  codChargePaise: number;
  totalPaise: number;
  couponCode?: string | null;
  paymentMethod?: string;
  paymentStatus?: string;
  razorpayPaymentId?: string | null;
}

interface OrderPriceSummaryProps {
  data: OrderPriceData;
  compact?: boolean;
}

export default function OrderPriceSummary({
  data,
  compact = false,
}: OrderPriceSummaryProps) {
  const {
    subtotalPaise,
    discountPaise,
    deliveryChargePaise,
    codChargePaise,
    totalPaise,
    couponCode,
    paymentMethod,
    paymentStatus,
    razorpayPaymentId,
  } = data;

  const isPaid = paymentStatus === "paid" || paymentMethod === "cod";
  const isCOD = paymentMethod === "cod";

  const rows = [
    {
      label: "Subtotal",
      value: formatPrice(subtotalPaise),
      show: true,
    },
    {
      label: couponCode ? `Coupon (${couponCode})` : "Discount",
      value: `−${formatPrice(discountPaise)}`,
      show: discountPaise > 0,
      green: true,
    },
    {
      label: "Delivery",
      value: deliveryChargePaise === 0 ? "🎉 Free" : formatPrice(deliveryChargePaise),
      show: true,
      green: deliveryChargePaise === 0,
    },
    {
      label: "COD Convenience Fee",
      value: `+${formatPrice(codChargePaise)}`,
      show: codChargePaise > 0,
    },
  ].filter((r) => r.show);

  return (
    <div className="flex flex-col gap-0">
      {/* Price rows */}
      <div
        className="flex flex-col divide-y"
        style={{ "--tw-divide-color": "rgba(200,150,12,0.08)" } as React.CSSProperties}
      >
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2.5">
            <span
              className="font-dm-sans text-sm"
              style={{ color: "var(--color-grey)" }}
            >
              {row.label}
            </span>
            <span
              className="font-dm-sans font-semibold text-sm"
              style={{
                color: row.green ? "#2E7D32" : "var(--color-brown)",
              }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div
        className="flex items-center justify-between py-3.5 border-t mt-1"
        style={{ borderColor: "rgba(200,150,12,0.15)" }}
      >
        <div>
          <span
            className="font-playfair font-bold text-base"
            style={{ color: "var(--color-brown)" }}
          >
            {isCOD ? "Amount to Pay at Delivery" : "Total Paid"}
          </span>
          <p
            className="font-dm-sans text-xs mt-0.5"
            style={{ color: "var(--color-grey)" }}
          >
            Inclusive of all taxes
          </p>
        </div>
        <span
          className="font-playfair font-bold text-2xl"
          style={{ color: "var(--color-crimson)" }}
        >
          {formatPrice(totalPaise)}
        </span>
      </div>

      {/* Payment confirmation */}
      {!compact && (
        <div
          className="mt-3 px-4 py-3 rounded-xl flex items-center gap-3"
          style={{
            background: isCOD
              ? "rgba(200,150,12,0.06)"
              : isPaid
              ? "rgba(46,125,50,0.07)"
              : "rgba(192,39,45,0.06)",
            border: `1px solid ${
              isCOD
                ? "rgba(200,150,12,0.2)"
                : isPaid
                ? "rgba(46,125,50,0.2)"
                : "rgba(192,39,45,0.2)"
            }`,
          }}
        >
          <span className="text-lg flex-shrink-0">
            {isCOD ? "💵" : isPaid ? "✅" : "⏳"}
          </span>
          <div>
            <p
              className="font-dm-sans font-semibold text-sm"
              style={{
                color: isCOD
                  ? "var(--color-gold)"
                  : isPaid
                  ? "#2E7D32"
                  : "var(--color-crimson)",
              }}
            >
              {isCOD
                ? "Cash on Delivery"
                : isPaid
                ? "Payment Confirmed"
                : "Payment Pending"}
            </p>
            {razorpayPaymentId && (
              <p
                className="font-dm-sans text-xs mt-0.5"
                style={{ color: "var(--color-grey)" }}
              >
                Payment ID: {razorpayPaymentId}
              </p>
            )}
            {isCOD && (
              <p
                className="font-dm-sans text-xs mt-0.5"
                style={{ color: "var(--color-grey)" }}
              >
                Keep {formatPrice(totalPaise)} ready at delivery
              </p>
            )}
          </div>
        </div>
      )}

      {/* Savings callout */}
      {discountPaise > 0 && (
        <p
          className="font-dm-sans text-xs text-center mt-3 font-semibold"
          style={{ color: "#2E7D32" }}
        >
          🎉 You saved {formatPrice(discountPaise)} on this order!
        </p>
      )}
    </div>
  );
}

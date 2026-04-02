// src/components/order/DeliveryTimeline.tsx
// Maa Flavours — Delivery Timeline Component
// Shows the full order journey: Confirmed → Processing → Packed → Shipped → Delivered
// Each step shows date if completed, "Upcoming" if not yet reached
// Used on: Order Confirmation page, My Account → Order Detail

import { CheckCircle2, Circle, Loader2 } from "lucide-react";

export interface TimelineEvent {
  status: string;
  label: string;
  description: string;
  completedAt?: string | null;
  isCurrent?: boolean;
  isCompleted?: boolean;
  isUpcoming?: boolean;
}

// ─── Build timeline from order status ─────────────────────────────────────
export function buildOrderTimeline(
  currentStatus: string,
  timestamps: Record<string, string | null> = {}
): TimelineEvent[] {
  const STATUS_ORDER = [
    "confirmed",
    "processing",
    "packed",
    "shipped",
    "out_for_delivery",
    "delivered",
  ];

  const STATUS_META: Record<string, { label: string; description: string }> = {
    confirmed: {
      label: "Order Confirmed",
      description: "Your order has been received and confirmed.",
    },
    processing: {
      label: "Being Prepared",
      description: "Our team is handpacking your authentic Andhra pickles.",
    },
    packed: {
      label: "Packed & Ready",
      description: "Packs bubble-wrapped and boxed securely for safe transit.",
    },
    shipped: {
      label: "Shipped",
      description: "Your order is on its way. Tracking details sent via SMS.",
    },
    out_for_delivery: {
      label: "Out for Delivery",
      description: "Your delivery is nearby! Keep your phone handy.",
    },
    delivered: {
      label: "Delivered 🎉",
      description: "Your pickles have arrived! Enjoy the authentic flavours.",
    },
  };

  // Handle cancelled/failed orders
  if (currentStatus === "cancelled" || currentStatus === "payment_failed") {
    return [
      {
        status: currentStatus,
        label: currentStatus === "cancelled" ? "Order Cancelled" : "Payment Failed",
        description:
          currentStatus === "cancelled"
            ? "This order has been cancelled. Refund will be processed in 5–7 business days."
            : "Payment was not successful. Please retry or contact support.",
        completedAt: new Date().toISOString(),
        isCompleted: true,
      },
    ];
  }

  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  return STATUS_ORDER.map((status, idx) => {
    const isCompleted = idx < currentIndex;
    const isCurrent = idx === currentIndex;
    const isUpcoming = idx > currentIndex;
    const meta = STATUS_META[status];

    return {
      status,
      label: meta.label,
      description: meta.description,
      completedAt: timestamps[status] || null,
      isCompleted,
      isCurrent,
      isUpcoming,
    };
  });
}

// ─── Single step ─────────────────────────────────────────────────────────
function TimelineStep({
  event,
  isLast,
}: {
  event: TimelineEvent;
  isLast: boolean;
}) {
  const { isCompleted, isCurrent, isUpcoming, completedAt } = event;

  return (
    <div className="flex gap-4">
      {/* Connector column */}
      <div className="flex flex-col items-center">
        {/* Icon */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
          style={{
            background: isCompleted
              ? "var(--color-gold)"
              : isCurrent
              ? "var(--color-crimson)"
              : "rgba(200,150,12,0.1)",
            border: isUpcoming ? "2px solid rgba(200,150,12,0.2)" : "none",
            boxShadow: isCurrent ? "0 0 0 4px rgba(192,39,45,0.12)" : "none",
          }}
        >
          {isCompleted ? (
            <CheckCircle2 size={18} color="white" strokeWidth={2.5} />
          ) : isCurrent ? (
            <Loader2 size={16} color="white" className="animate-spin" />
          ) : (
            <Circle
              size={14}
              strokeWidth={1.5}
              style={{ color: "rgba(200,150,12,0.3)" }}
            />
          )}
        </div>

        {/* Vertical line */}
        {!isLast && (
          <div
            className="w-[2px] flex-1 min-h-[24px] my-1 rounded-full"
            style={{
              background: isCompleted
                ? "linear-gradient(180deg, var(--color-gold) 0%, var(--color-gold-light) 100%)"
                : "rgba(200,150,12,0.15)",
            }}
          />
        )}
      </div>

      {/* Content */}
      <div className="pb-5 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4
            className="font-dm-sans font-bold text-sm leading-tight"
            style={{
              color: isUpcoming
                ? "var(--color-grey)"
                : isCurrent
                ? "var(--color-crimson)"
                : "var(--color-brown)",
            }}
          >
            {event.label}
          </h4>

          {/* Timestamp or status */}
          {completedAt ? (
            <span
              className="font-dm-sans text-xs flex-shrink-0"
              style={{ color: "var(--color-grey)" }}
            >
              {new Date(completedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          ) : isCurrent ? (
            <span
              className="font-dm-sans text-xs font-semibold flex-shrink-0 px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(192,39,45,0.08)",
                color: "var(--color-crimson)",
              }}
            >
              In Progress
            </span>
          ) : (
            <span
              className="font-dm-sans text-xs flex-shrink-0"
              style={{ color: "var(--color-grey)" }}
            >
              Upcoming
            </span>
          )}
        </div>

        <p
          className="font-dm-sans text-xs mt-1 leading-relaxed"
          style={{
            color: isUpcoming ? "rgba(107,107,107,0.5)" : "var(--color-grey)",
          }}
        >
          {event.description}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────
interface DeliveryTimelineProps {
  currentStatus: string;
  timestamps?: Record<string, string | null>;
}

export default function DeliveryTimeline({
  currentStatus,
  timestamps = {},
}: DeliveryTimelineProps) {
  const events = buildOrderTimeline(currentStatus, timestamps);

  return (
    <div>
      {events.map((event, idx) => (
        <TimelineStep
          key={event.status}
          event={event}
          isLast={idx === events.length - 1}
        />
      ))}
    </div>
  );
}

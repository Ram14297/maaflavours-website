// src/components/checkout/CheckoutStepper.tsx
// Maa Flavours — Checkout Step Progress Indicator
// Shows: 1. Address → 2. Payment → 3. Confirm
// Current step highlighted in crimson, completed steps in gold

import { CheckoutStep } from "@/store/checkoutStore";
import { MapPin, Lock, CheckCircle2 } from "lucide-react";

const STEPS: {
  id: CheckoutStep;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "address",
    label: "Delivery Address",
    shortLabel: "Address",
    icon: <MapPin size={16} />,
  },
  {
    id: "payment",
    label: "Payment",
    shortLabel: "Payment",
    icon: <Lock size={16} />,
  },
  {
    id: "review",
    label: "Confirm",
    shortLabel: "Confirm",
    icon: <CheckCircle2 size={16} />,
  },
];

const STEP_ORDER: CheckoutStep[] = ["address", "payment", "review"];

interface CheckoutStepperProps {
  currentStep: CheckoutStep;
}

export default function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((step, idx) => {
        const isCompleted = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const isUpcoming = idx > currentIndex;

        return (
          <div key={step.id} className="flex items-center">
            {/* Step node */}
            <div className="flex flex-col items-center gap-1.5">
              {/* Circle */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  background: isCompleted
                    ? "var(--color-gold)"
                    : isCurrent
                    ? "var(--color-crimson)"
                    : "rgba(200,150,12,0.1)",
                  border: isUpcoming
                    ? "2px solid rgba(200,150,12,0.2)"
                    : "none",
                  color: isUpcoming ? "var(--color-grey)" : "white",
                  boxShadow: isCurrent
                    ? "0 0 0 4px rgba(192,39,45,0.15)"
                    : "none",
                }}
              >
                {isCompleted ? (
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                    <path
                      d="M1 6L5.5 10.5L15 1"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  step.icon
                )}
              </div>

              {/* Label */}
              <span
                className="font-dm-sans text-xs font-medium hidden sm:block"
                style={{
                  color: isCurrent
                    ? "var(--color-crimson)"
                    : isCompleted
                    ? "var(--color-gold)"
                    : "var(--color-grey)",
                  fontWeight: isCurrent ? 700 : 500,
                }}
              >
                {step.shortLabel}
              </span>
            </div>

            {/* Connector line (not after last) */}
            {idx < STEPS.length - 1 && (
              <div
                className="h-[2px] w-16 sm:w-24 mx-2 rounded-full transition-all duration-500"
                style={{
                  background: idx < currentIndex
                    ? "linear-gradient(90deg, var(--color-gold), var(--color-gold-light))"
                    : "rgba(200,150,12,0.15)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

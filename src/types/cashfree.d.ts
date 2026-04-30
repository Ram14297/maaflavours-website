// Type declarations for @cashfreepayments/cashfree-js
// Package ships without .d.ts files — declared here to satisfy TypeScript

declare module "@cashfreepayments/cashfree-js" {
  interface CashfreeOptions {
    mode: "production" | "sandbox";
  }

  interface CheckoutOptions {
    paymentSessionId: string;
    redirectTarget?: "_self" | "_blank" | "_modal";
    returnUrl?: string;
  }

  interface CheckoutResult {
    error?: { message: string; code?: string };
    redirect?: boolean;
    paymentDetails?: { paymentMessage: string; [key: string]: any };
  }

  interface CashfreeInstance {
    checkout(options: CheckoutOptions): Promise<CheckoutResult>;
  }

  export function load(options: CashfreeOptions): Promise<CashfreeInstance>;
}

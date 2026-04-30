"use client";
// src/store/checkoutStore.ts
// Maa Flavours — Checkout state management
// Manages delivery address, payment method selection, step progression
// Separate from cartStore — checkout flow state only

import { create } from "zustand";

// ─── Types ─────────────────────────────────────────────────────────────────
export interface DeliveryAddress {
  full_name: string;
  mobile: string;         // 10 digits (no +91)
  address_line1: string;
  address_line2: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;        // 6 digits
  is_default: boolean;
}

export type PaymentMethod = "cashfree" | "phonepe_qr" | "cod";

export interface PincodeData {
  city: string;
  state: string;
  isValid: boolean;
  loading: boolean;
  error: string;
}

export type CheckoutStep = "address" | "payment" | "review";

interface CheckoutStore {
  // ─── State
  step: CheckoutStep;
  address: DeliveryAddress;
  pincodeData: PincodeData;
  paymentMethod: PaymentMethod;
  isPlacingOrder: boolean;
  orderError: string;
  savedAddresses: DeliveryAddress[];

  // ─── Actions
  setStep: (step: CheckoutStep) => void;
  updateAddress: (partial: Partial<DeliveryAddress>) => void;
  setPincodeData: (data: Partial<PincodeData>) => void;
  lookupPincode: (pincode: string) => Promise<void>;
  setPaymentMethod: (method: PaymentMethod) => void;
  setPlacingOrder: (val: boolean) => void;
  setOrderError: (msg: string) => void;
  resetCheckout: () => void;
}

const EMPTY_ADDRESS: DeliveryAddress = {
  full_name: "",
  mobile: "",
  address_line1: "",
  address_line2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  is_default: false,
};

export const useCheckoutStore = create<CheckoutStore>((set, get) => ({
  step: "address",
  address: EMPTY_ADDRESS,
  pincodeData: { city: "", state: "", isValid: false, loading: false, error: "" },
  paymentMethod: "cashfree",
  isPlacingOrder: false,
  orderError: "",
  savedAddresses: [],

  setStep: (step) => set({ step }),

  updateAddress: (partial) =>
    set((s) => ({ address: { ...s.address, ...partial } })),

  setPincodeData: (data) =>
    set((s) => ({ pincodeData: { ...s.pincodeData, ...data } })),

  // ─── Pincode lookup via our cached server endpoint ──────────────────
  // Going through /api/pincode (instead of calling api.postalpincode.in
  // directly) gives us:
  //   - server-side caching (24h fetch revalidate + in-memory map)
  //   - no per-client rate-limit risk against India Post
  //   - a single fall-back path if the upstream goes down
  lookupPincode: async (pincode) => {
    if (pincode.length !== 6) return;
    set((s) => ({ pincodeData: { ...s.pincodeData, loading: true, error: "" } }));

    try {
      const res  = await fetch(`/api/pincode?pin=${pincode}`);
      const data = await res.json();

      if (res.ok && data.city && data.state) {
        set((s) => ({
          pincodeData: {
            city:    data.city,
            state:   data.state,
            isValid: true,
            loading: false,
            error:   "",
          },
          // Auto-fill city and state into the address
          address: { ...s.address, city: data.city, state: data.state },
        }));
      } else {
        set((s) => ({
          pincodeData: {
            ...s.pincodeData,
            isValid: false,
            loading: false,
            error:   data.error || "Invalid pincode. Please check and re-enter.",
          },
        }));
      }
    } catch {
      set((s) => ({
        pincodeData: {
          ...s.pincodeData,
          isValid: false,
          loading: false,
          error:   "Could not look up this pincode. Please fill city and state manually.",
        },
      }));
    }
  },

  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setPlacingOrder: (val) => set({ isPlacingOrder: val }),
  setOrderError: (msg) => set({ orderError: msg }),

  resetCheckout: () =>
    set({
      step: "address",
      address: EMPTY_ADDRESS,
      pincodeData: { city: "", state: "", isValid: false, loading: false, error: "" },
      paymentMethod: "cashfree",
      isPlacingOrder: false,
      orderError: "",
    }),
}));

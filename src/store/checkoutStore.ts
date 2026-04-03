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
  razorpayOrderId: string;
  isPlacingOrder: boolean;
  orderError: string;
  savedAddresses: DeliveryAddress[];

  // ─── Actions
  setStep: (step: CheckoutStep) => void;
  updateAddress: (partial: Partial<DeliveryAddress>) => void;
  setPincodeData: (data: Partial<PincodeData>) => void;
  lookupPincode: (pincode: string) => Promise<void>;
  setPaymentMethod: (method: PaymentMethod) => void;
  setRazorpayOrderId: (id: string) => void;
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
  razorpayOrderId: "",
  isPlacingOrder: false,
  orderError: "",
  savedAddresses: [],

  setStep: (step) => set({ step }),

  updateAddress: (partial) =>
    set((s) => ({ address: { ...s.address, ...partial } })),

  setPincodeData: (data) =>
    set((s) => ({ pincodeData: { ...s.pincodeData, ...data } })),

  // ─── Pincode lookup via India Post API ───────────────────────────────
  lookupPincode: async (pincode) => {
    if (pincode.length !== 6) return;
    set((s) => ({ pincodeData: { ...s.pincodeData, loading: true, error: "" } }));

    try {
      // India Post open API — no API key required
      const res = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );
      const data = await res.json();

      if (
        data?.[0]?.Status === "Success" &&
        data[0].PostOffice?.length > 0
      ) {
        const post = data[0].PostOffice[0];
        const city = post.Division || post.Block || post.District;
        const state = post.State;

        set((s) => ({
          pincodeData: {
            city,
            state,
            isValid: true,
            loading: false,
            error: "",
          },
          // Auto-fill city and state into the address
          address: { ...s.address, city, state },
        }));
      } else {
        set((s) => ({
          pincodeData: {
            ...s.pincodeData,
            isValid: false,
            loading: false,
            error: "Invalid pincode. Please check and re-enter.",
          },
        }));
      }
    } catch {
      set((s) => ({
        pincodeData: {
          ...s.pincodeData,
          isValid: false,
          loading: false,
          error: "Could not look up this pincode. Please fill city and state manually.",
        },
      }));
    }
  },

  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setRazorpayOrderId: (id) => set({ razorpayOrderId: id }),
  setPlacingOrder: (val) => set({ isPlacingOrder: val }),
  setOrderError: (msg) => set({ orderError: msg }),

  resetCheckout: () =>
    set({
      step: "address",
      address: EMPTY_ADDRESS,
      pincodeData: { city: "", state: "", isValid: false, loading: false, error: "" },
      paymentMethod: "cashfree",
      razorpayOrderId: "",
      isPlacingOrder: false,
      orderError: "",
    }),
}));

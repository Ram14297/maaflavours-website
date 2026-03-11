// src/app/api/checkout/phonepe-initiate/route.ts
// Maa Flavours — Initiate PhonePe UPI Collect Payment
// POST /api/checkout/phonepe-initiate
// Body: { orderId, amount (paise), upiId, customerMobile? }
// Returns: { merchantTransactionId, initiated: true } | { error }
//
// Flow: build UPI_COLLECT payload → base64 → SHA256 checksum → POST to PhonePe
// PhonePe sends a collect request to the customer's UPI app (no redirect needed)
// Customer approves on their app → callback + status polling confirms payment

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  PHONEPE_MERCHANT_ID,
  PHONEPE_PAY_URL,
  generatePayChecksum,
} from "@/lib/phonepe";

const RequestSchema = z.object({
  orderId:        z.string().min(1),
  amount:         z.number().int().positive(),   // in paise
  upiId:          z.string().min(3),             // e.g. ram@okaxis
  customerMobile: z.string().optional(),
  customerName:   z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body   = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { orderId, amount, upiId, customerMobile } = parsed.data;

    // Validate UPI ID format (must contain @)
    if (!upiId.includes("@")) {
      return NextResponse.json({ error: "Invalid UPI ID format. Use format: name@bank (e.g. ram@okaxis)" }, { status: 400 });
    }

    // PhonePe merchantTransactionId: max 38 chars, alphanumeric + hyphens
    const merchantTransactionId = orderId.slice(0, 38);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://maaflavours.com";

    const payload = {
      merchantId:            PHONEPE_MERCHANT_ID,
      merchantTransactionId,
      merchantUserId:        `MUID${merchantTransactionId.replace(/-/g, "").slice(0, 20)}`,
      amount,                                    // paise
      callbackUrl:           `${baseUrl}/api/checkout/phonepe-callback`,
      mobileNumber:          customerMobile?.replace(/\D/g, "").slice(-10) || undefined,
      paymentInstrument: {
        type: "UPI_COLLECT",
        vpa:  upiId.trim(),                      // customer's UPI VPA
      },
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
    const checksum      = generatePayChecksum(base64Payload);

    console.log("[phonepe-initiate] UPI_COLLECT request to:", PHONEPE_PAY_URL, "vpa:", upiId, "orderId:", orderId);

    const phonePeRes = await fetch(PHONEPE_PAY_URL, {
      method: "POST",
      headers: {
        "Content-Type":   "application/json",
        "X-VERIFY":       checksum,
        "X-MERCHANT-ID":  PHONEPE_MERCHANT_ID,
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    const result = await phonePeRes.json();
    console.log("[phonepe-initiate] PhonePe response:", JSON.stringify(result));

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || "PhonePe payment initiation failed. Please check your UPI ID and try again." },
        { status: 400 }
      );
    }

    // UPI_COLLECT: no redirect URL — collect request sent to customer's UPI app
    return NextResponse.json({ merchantTransactionId, initiated: true });

  } catch (err: any) {
    console.error("[phonepe-initiate] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to initiate payment. Please try again." },
      { status: 500 }
    );
  }
}

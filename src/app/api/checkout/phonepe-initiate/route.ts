// src/app/api/checkout/phonepe-initiate/route.ts
// Maa Flavours — Initiate PhonePe Gateway Payment
// POST /api/checkout/phonepe-initiate
// Body: { orderId, amount (paise), customerMobile?, customerName? }
// Returns: { redirectUrl, merchantTransactionId } | { error }
//
// Flow: build payload → base64 → SHA256 checksum → POST to PhonePe → get redirect URL

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

    const { orderId, amount, customerMobile } = parsed.data;

    // PhonePe merchantTransactionId: max 38 chars, alphanumeric + hyphens
    // Use orderId directly (UUIDs are 36 chars — within limit)
    const merchantTransactionId = orderId.slice(0, 38);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://maaflavours.com";

    const payload = {
      merchantId:            PHONEPE_MERCHANT_ID,
      merchantTransactionId,
      merchantUserId:        `MUID${merchantTransactionId.replace(/-/g, "").slice(0, 20)}`,
      amount,                                    // paise
      redirectUrl:           `${baseUrl}/checkout/phonepe-status?orderId=${orderId}`,
      redirectMode:          "GET",
      callbackUrl:           `${baseUrl}/api/checkout/phonepe-callback`,
      mobileNumber:          customerMobile?.replace(/\D/g, "").slice(-10) || undefined,
      paymentInstrument:     { type: "PAY_PAGE" },
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
    const checksum      = generatePayChecksum(base64Payload);

    console.log("[phonepe-initiate] Calling PhonePe:", PHONEPE_PAY_URL, "orderId:", orderId);

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

    if (!result.success || !result.data?.instrumentResponse?.redirectInfo?.url) {
      return NextResponse.json(
        { error: result.message || "PhonePe payment initiation failed. Please try another method." },
        { status: 400 }
      );
    }

    const redirectUrl = result.data.instrumentResponse.redirectInfo.url;
    return NextResponse.json({ redirectUrl, merchantTransactionId });

  } catch (err: any) {
    console.error("[phonepe-initiate] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to initiate PhonePe payment." },
      { status: 500 }
    );
  }
}

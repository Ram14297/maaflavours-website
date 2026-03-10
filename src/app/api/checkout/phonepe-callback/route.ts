// src/app/api/checkout/phonepe-callback/route.ts
// Maa Flavours — PhonePe Server-to-Server Payment Callback
// POST /api/checkout/phonepe-callback
// Called by PhonePe after payment; verifies checksum and updates order status in DB.

import { NextRequest, NextResponse } from "next/server";
import { verifyCallbackChecksum } from "@/lib/phonepe";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { response: base64Response } = body;

    const xVerify = request.headers.get("X-VERIFY");

    if (!xVerify || !base64Response) {
      console.warn("[phonepe-callback] Missing X-VERIFY or response body");
      return NextResponse.json({ error: "Invalid callback" }, { status: 400 });
    }

    // ─── 1. Verify checksum ──────────────────────────────────────────────
    if (!verifyCallbackChecksum(base64Response, xVerify)) {
      console.warn("[phonepe-callback] Checksum mismatch — possible tampered request");
      return NextResponse.json({ error: "Checksum mismatch" }, { status: 401 });
    }

    // ─── 2. Decode & parse response ──────────────────────────────────────
    let decoded: any;
    try {
      decoded = JSON.parse(Buffer.from(base64Response, "base64").toString("utf-8"));
    } catch {
      return NextResponse.json({ error: "Could not decode response" }, { status: 400 });
    }

    console.log("[phonepe-callback] Decoded response:", JSON.stringify(decoded));

    const payData              = decoded?.data || decoded;
    const merchantTransactionId = payData?.merchantTransactionId as string;
    const phonePeTxnId         = payData?.transactionId as string;
    const paymentCode          = decoded?.code as string;

    const isSuccess = paymentCode === "PAYMENT_SUCCESS";

    // ─── 3. Update order in Supabase ─────────────────────────────────────
    // merchantTransactionId === orderId (set during initiate)
    if (merchantTransactionId) {
      try {
        const adminSupa = createAdminSupabaseClient();
        await adminSupa.from("orders").update({
          status:            isSuccess ? "confirmed" : "failed",
          payment_status:    isSuccess ? "paid"      : "failed",
          // Store PhonePe transaction ID in razorpay_order_id column (reused field)
          razorpay_order_id: phonePeTxnId || null,
        }).eq("id", merchantTransactionId);

        console.log(
          "[phonepe-callback] Order updated:",
          merchantTransactionId,
          isSuccess ? "→ confirmed/paid" : "→ failed"
        );
      } catch (err) {
        console.warn("[phonepe-callback] DB update failed:", err);
      }
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("[phonepe-callback] Unhandled error:", err);
    // Return 200 anyway so PhonePe doesn't keep retrying
    return NextResponse.json({ success: false, error: err.message }, { status: 200 });
  }
}

// src/app/api/checkout/webhook/route.ts
// Maa Flavours — Razorpay Webhook Handler
// Handles async payment events: payment.captured, payment.failed, order.paid
// Verifies X-Razorpay-Signature header before processing
// Called by Razorpay servers — NOT by the frontend directly

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // ─── Verify webhook signature ─────────────────────────────────────────
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const expectedSig = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSig !== signature) {
      console.warn("[webhook] Invalid Razorpay signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const supabase = createAdminSupabaseClient();

    // ─── Handle events ─────────────────────────────────────────────────────
    switch (event.event) {
      case "payment.captured": {
        const payment = event.payload.payment.entity;
        await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            status: "confirmed",
            razorpay_payment_id: payment.id,
          })
          .eq("razorpay_order_id", payment.order_id);
        break;
      }

      case "payment.failed": {
        const payment = event.payload.payment.entity;
        await supabase
          .from("orders")
          .update({
            payment_status: "failed",
            status: "payment_failed",
          })
          .eq("razorpay_order_id", payment.order_id);
        break;
      }

      case "refund.created":
      case "refund.processed": {
        const refund = event.payload.refund.entity;
        await supabase
          .from("orders")
          .update({
            payment_status: "refunded",
            status: "refunded",
          })
          .eq("razorpay_payment_id", refund.payment_id);
        break;
      }

      default:
        // Log unhandled events for debugging
        console.log("[webhook] Unhandled event:", event.event);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[webhook] Error:", err);
    // Always return 200 to Razorpay to prevent retries on our errors
    return NextResponse.json({ received: true, note: "Processing error logged" });
  }
}

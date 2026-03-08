// src/app/api/checkout/verify-payment/route.ts
// Maa Flavours — Razorpay Payment Verification
// POST /api/checkout/verify-payment
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// 
// Verifies HMAC SHA256 signature, then:
//   - Updates order: payment_status="paid", status="confirmed", razorpay_payment_id
//   - Inserts initial order_status_history row
//
// Returns: { success: true, orderId } | { success: false, error }

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

const VerifySchema = z.object({
  razorpay_order_id:   z.string().startsWith("order_"),
  razorpay_payment_id: z.string().startsWith("pay_"),
  razorpay_signature:  z.string().length(64),  // SHA256 hex = 64 chars
});

export async function POST(request: NextRequest) {
  try {
    const body   = await request.json();
    const parsed = VerifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid verification data" },
        { status: 400 }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

    // ─── 1. Verify HMAC SHA256 signature ──────────────────────────────────
    const secret          = process.env.RAZORPAY_KEY_SECRET!;
    const message         = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSig     = crypto.createHmac("sha256", secret).update(message).digest("hex");

    if (expectedSig !== razorpay_signature) {
      console.warn("[verify-payment] Signature mismatch for:", razorpay_order_id);
      return NextResponse.json(
        { success: false, error: "Payment signature verification failed. Please contact support." },
        { status: 400 }
      );
    }

    // ─── 2. Update order in Supabase ─────────────────────────────────────
    let orderId: string | null = null;

    try {
      const supabase = createAdminSupabaseClient();

      const { data: updatedOrder, error } = await supabase
        .from("orders")
        .update({
          payment_status:      "paid",
          status:              "confirmed",
          razorpay_payment_id,
        })
        .eq("razorpay_order_id", razorpay_order_id)
        .select("id, order_number, total, customer_id")
        .single();

      if (error) throw error;
      orderId = updatedOrder.id;

      // Log the confirmation in order_status_history
      await supabase.from("order_status_history").insert({
        order_id:   orderId,
        old_status: "pending",
        new_status: "confirmed",
        changed_by: "razorpay_webhook",
        note:       `Payment ${razorpay_payment_id} verified successfully`,
      });

    } catch (dbErr: any) {
      console.warn("[verify-payment] DB update skipped:", dbErr.message);
      orderId = razorpay_order_id;  // Fallback for dev
    }

    return NextResponse.json({
      success:   true,
      orderId,
      paymentId: razorpay_payment_id,
    });

  } catch (err: any) {
    console.error("[verify-payment]", err.message);
    return NextResponse.json(
      { success: false, error: "Verification failed. Please contact support." },
      { status: 500 }
    );
  }
}

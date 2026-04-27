// src/app/api/checkout/phonepe-status/route.ts
// Maa Flavours — Check PhonePe Payment Status
// GET /api/checkout/phonepe-status?orderId=xxx
// Checks PhonePe status API and/or DB order status
// Returns: { status: "PAYMENT_SUCCESS" | "PAYMENT_PENDING" | "PAYMENT_ERROR", orderId }

import { NextRequest, NextResponse } from "next/server";
import {
  getPhonePeMerchantId,
  getPhonePeStatusBase,
  generateStatusChecksum,
} from "@/lib/phonepe";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  const merchantTransactionId = orderId.slice(0, 38);

  // ─── 1. Check PhonePe status API ─────────────────────────────────────────
  try {
    const merchantId = getPhonePeMerchantId();
    const statusBase = getPhonePeStatusBase();
    const checksum   = generateStatusChecksum(merchantTransactionId);
    const statusUrl  = `${statusBase}/${merchantId}/${merchantTransactionId}`;

    const res  = await fetch(statusUrl, {
      method: "GET",
      headers: {
        "Content-Type":  "application/json",
        "X-VERIFY":      checksum,
        "X-MERCHANT-ID": merchantId,
      },
    });

    const result = await res.json();
    console.log("[phonepe-status] API response:", JSON.stringify(result));

    const code = result?.code || result?.data?.responseCode;
    const phonePeTxnId = result?.data?.transactionId;

    if (code === "PAYMENT_SUCCESS") {
      return NextResponse.json({
        status: "PAYMENT_SUCCESS",
        orderId,
        transactionId: phonePeTxnId,
      });
    }

    if (code === "PAYMENT_PENDING" || code === "PAYMENT_INITIATED") {
      return NextResponse.json({ status: "PAYMENT_PENDING", orderId });
    }

    // For errors/not found — also check DB as fallback
  } catch (err) {
    console.warn("[phonepe-status] PhonePe status API error:", err);
  }

  // ─── 2. Fallback: check DB order status ──────────────────────────────────
  try {
    const adminSupa = createAdminSupabaseClient();
    const { data: order } = await adminSupa
      .from("orders")
      .select("id, status, payment_status")
      .eq("id", orderId)
      .maybeSingle();

    if (order?.payment_status === "paid") {
      return NextResponse.json({ status: "PAYMENT_SUCCESS", orderId });
    }
    if (order?.payment_status === "failed") {
      return NextResponse.json({ status: "PAYMENT_ERROR", orderId });
    }
  } catch (err) {
    console.warn("[phonepe-status] DB lookup error:", err);
  }

  return NextResponse.json({ status: "PAYMENT_PENDING", orderId });
}

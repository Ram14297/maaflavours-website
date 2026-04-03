// src/app/api/checkout/cashfree-webhook/route.ts
// Maa Flavours — Cashfree Payment Webhook (Server-to-Server)
// POST /api/checkout/cashfree-webhook
// Cashfree calls this URL after every payment event to confirm status.
// Docs: https://docs.cashfree.com/docs/payment-gateway-webhooks

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

// Cashfree sends a signature header we can verify for security
// (optional but recommended in production)
const CF_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const data = JSON.parse(body);

    console.log("[cashfree-webhook] Received:", JSON.stringify(data));

    // ─── Extract key fields from Cashfree webhook payload ────────────────
    // Cashfree webhook structure (v2023-08-01):
    // { type: "PAYMENT_SUCCESS_WEBHOOK" | "PAYMENT_FAILED_WEBHOOK" | ...,
    //   data: { order: { order_id, order_amount }, payment: { cf_payment_id, payment_status, ... } } }

    const eventType     = data?.type || "";
    const cfOrderId     = data?.data?.order?.order_id || "";         // e.g. MF_<uuid>
    const paymentStatus = data?.data?.payment?.payment_status || ""; // PENDING | SUCCESS | FAILED | USER_DROPPED
    const cfPaymentId   = data?.data?.payment?.cf_payment_id || "";

    if (!cfOrderId) {
      console.warn("[cashfree-webhook] Missing order_id in payload");
      return NextResponse.json({ ok: true }); // Always 200 to Cashfree
    }

    // Extract our Supabase order UUID from cf_order_id (MF_<uuid_no_dashes>)
    // We cannot reverse the UUID from just the truncated form, so we query by cf_order_id
    const adminSupa = createAdminSupabaseClient();

    // Find order by cashfree_order_id column, or by matching pattern in metadata
    // We store the raw UUID as the orderId; cf_order_id = MF_ + uuid.replace(/-/g,"").slice(0,40)
    // Best approach: store cf_order_id in the orders table on creation (we'll add it here via update)

    // ─── Map Cashfree status → our order/payment status ──────────────────
    let orderStatus: string | null   = null;
    let paymentStatusDb: string | null = null;

    if (eventType === "PAYMENT_SUCCESS_WEBHOOK" || paymentStatus === "SUCCESS") {
      orderStatus    = "confirmed";
      paymentStatusDb = "paid";
    } else if (eventType === "PAYMENT_FAILED_WEBHOOK" || paymentStatus === "FAILED") {
      orderStatus    = "pending";
      paymentStatusDb = "failed";
    } else if (paymentStatus === "USER_DROPPED") {
      orderStatus    = "pending";
      paymentStatusDb = "failed";
    }

    if (orderStatus) {
      // Try to find the order. cashfree_order_id column might not exist yet —
      // we'll search orders table. The cfOrderId is `MF_` + first 40 chars of uuid (no dashes).
      // We stored the order UUID in the return_url as orderId param — but we can also
      // try updating by a generated match.

      // Strategy: query orders where cashfree_order_id = cfOrderId (best)
      // or where the generated cf_id matches (fallback)
      const { data: orders, error: findErr } = await adminSupa
        .from("orders")
        .select("id, status, payment_status")
        .or(`cashfree_order_id.eq.${cfOrderId},payment_method.eq.cashfree`)
        .limit(50);

      if (!findErr && orders) {
        // Find the exact one by regenerating cf_order_id
        const matchedOrder = orders.find(o => {
          const generatedCfId = `MF_${o.id.replace(/-/g, "").substring(0, 40)}`;
          return generatedCfId === cfOrderId;
        });

        if (matchedOrder) {
          const { error: updateErr } = await adminSupa
            .from("orders")
            .update({
              status:           orderStatus,
              payment_status:   paymentStatusDb,
              cashfree_payment_id: cfPaymentId || null,
              updated_at:       new Date().toISOString(),
            })
            .eq("id", matchedOrder.id);

          if (updateErr) {
            console.error("[cashfree-webhook] Update failed:", updateErr.message);
          } else {
            console.log(`[cashfree-webhook] Order ${matchedOrder.id} → ${orderStatus} / ${paymentStatusDb}`);
          }
        } else {
          console.warn("[cashfree-webhook] No matching order found for cf_order_id:", cfOrderId);
        }
      }
    }

    // Always return 200 OK to Cashfree — retries happen if we return non-2xx
    return NextResponse.json({ ok: true, received: true });

  } catch (err: any) {
    console.error("[cashfree-webhook] Error:", err.message);
    // Still return 200 to prevent Cashfree from retrying indefinitely
    return NextResponse.json({ ok: true, error: err.message });
  }
}

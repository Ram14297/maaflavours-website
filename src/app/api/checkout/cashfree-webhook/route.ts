// src/app/api/checkout/cashfree-webhook/route.ts
// Maa Flavours — Cashfree Payment Webhook (Server-to-Server)
// POST /api/checkout/cashfree-webhook
// Cashfree calls this URL after every payment event to confirm status.
// Docs: https://docs.cashfree.com/docs/payment-gateway-webhooks

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

// Cashfree sends a signature header we can verify for security
// (optional but recommended in production)

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
      // First try direct lookup by cashfree_order_id (stored during cashfree-create)
      const { data: directMatch } = await adminSupa
        .from("orders")
        .select("id, status, payment_status")
        .eq("cashfree_order_id", cfOrderId)
        .maybeSingle();

      // Fallback: scan recent cashfree orders and match by regenerating the cf_order_id
      let matchedOrder = directMatch;
      if (!matchedOrder) {
        const { data: orders, error: findErr } = await adminSupa
          .from("orders")
          .select("id, status, payment_status")
          .eq("payment_method", "cashfree")
          .order("created_at", { ascending: false })
          .limit(100);

        if (!findErr && orders) {
          matchedOrder = orders.find(o => {
            const generatedCfId = `MF_${o.id.replace(/-/g, "").substring(0, 40)}`;
            return generatedCfId === cfOrderId;
          }) || null;
        }
      }

      if (matchedOrder) {
        const { error: updateErr } = await adminSupa
          .from("orders")
          .update({
            status:              orderStatus,
            payment_status:      paymentStatusDb,
            cashfree_payment_id: cfPaymentId || null,
            updated_at:          new Date().toISOString(),
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

    // Always return 200 OK to Cashfree — retries happen if we return non-2xx
    return NextResponse.json({ ok: true, received: true });

  } catch (err: any) {
    console.error("[cashfree-webhook] Error:", err.message);
    // Still return 200 to prevent Cashfree from retrying indefinitely
    return NextResponse.json({ ok: true, error: err.message });
  }
}

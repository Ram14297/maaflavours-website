// src/app/api/checkout/cashfree-webhook/route.ts
// Maa Flavours — Cashfree Payment Webhook (Server-to-Server)
// POST /api/checkout/cashfree-webhook
// Cashfree calls this URL after every payment event to confirm status.
// Docs: https://docs.cashfree.com/docs/payment-gateway-webhooks

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { notifyCustomerSMS, msgOrderConfirmed, shortOrderId } from "@/lib/notify-customer";

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

          // On successful payment: deduct stock + notify admin + notify customer
          if (orderStatus === "confirmed") {
            await decrementOrderStock(adminSupa, matchedOrder.id).catch(() => {});
            await notifyAdmin(adminSupa, matchedOrder.id, cfPaymentId, "cashfree").catch(() => {});
            await notifyCustomerOnPayment(adminSupa, matchedOrder.id).catch(() => {});
          }
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

// ─── Stock decrement ───────────────────────────────────────────────────────────
async function decrementOrderStock(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  orderId: string
) {
  const { data: items } = await supabase
    .from("order_items")
    .select("variant_id, quantity")
    .eq("order_id", orderId);

  for (const item of items || []) {
    if (!item.variant_id) continue;
    try {
      const { data: v } = await supabase
        .from("product_variants")
        .select("stock_quantity")
        .eq("id", item.variant_id)
        .single();
      if (v && typeof v.stock_quantity === "number") {
        await supabase
          .from("product_variants")
          .update({ stock_quantity: Math.max(0, v.stock_quantity - item.quantity) })
          .eq("id", item.variant_id);
      }
    } catch { /* non-fatal per variant */ }
  }
}

// ─── Customer notification on payment success ──────────────────────────────────
async function notifyCustomerOnPayment(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  orderId: string
) {
  const { data: order } = await supabase
    .from("orders")
    .select("total, shipping_address, payment_method")
    .eq("id", orderId)
    .single();

  if (!order?.shipping_address) return;

  const addr    = order.shipping_address as any;
  const mobile  = addr.mobile || addr.phone || "";
  const name    = addr.full_name || addr.name || "Customer";
  const totalRs = Math.round((order.total ?? 0) / 100);

  if (!mobile) return;

  await notifyCustomerSMS(
    mobile,
    msgOrderConfirmed(name, shortOrderId(orderId), totalRs, order.payment_method)
  );
}

// ─── Admin notification ────────────────────────────────────────────────────────
async function notifyAdmin(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  orderId: string,
  cfPaymentId: string,
  method: string
) {
  const message = `✅ Payment confirmed via ${method.toUpperCase()} (${cfPaymentId}). Order: ${orderId}`;

  try {
    await supabase.from("admin_notifications").insert({
      type: "order_paid", message,
      data: { order_id: orderId, cf_payment_id: cfPaymentId, method },
      is_read: false,
    });
  } catch { /* table may not exist yet */ }

  const waNumber = process.env.ADMIN_WHATSAPP_NUMBER;
  const waKey    = process.env.CALLMEBOT_API_KEY;
  if (waNumber && waKey) {
    try {
      await fetch(
        `https://api.callmebot.com/whatsapp.php?phone=${waNumber}&text=${encodeURIComponent(message)}&apikey=${waKey}`,
        { method: "GET" }
      );
    } catch { /* non-fatal */ }
  }
}

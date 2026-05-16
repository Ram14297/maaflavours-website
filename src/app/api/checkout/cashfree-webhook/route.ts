// src/app/api/checkout/cashfree-webhook/route.ts
// Maa Flavours — Cashfree Payment Webhook (Server-to-Server)
// POST /api/checkout/cashfree-webhook
// Cashfree calls this URL after every payment event to confirm status.
// Docs: https://docs.cashfree.com/docs/payment-gateway-webhooks
//
// SECURITY: We verify the HMAC-SHA256 signature on every request using
// CASHFREE_WEBHOOK_SECRET. Without verification, anyone could POST a fake
// success and mark any order as paid. The signature scheme is documented at
//   https://www.cashfree.com/docs/payments/online/webhooks/configuration#signature-verification
//   signature = base64(hmacSha256(timestamp + rawBody, secret))

import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { notifyCustomerSMS, msgOrderConfirmed, shortOrderId } from "@/lib/notify-customer";
import { sendOrderConfirmedEmail } from "@/lib/email";

function verifyCashfreeSignature(
  rawBody: string,
  timestamp: string | null,
  signature: string | null
): boolean {
  const secret = process.env.CASHFREE_WEBHOOK_SECRET;
  if (!secret) {
    // Refuse to process webhooks if the secret isn't configured. This is
    // safer than silently accepting unsigned requests.
    console.error("[cashfree-webhook] CASHFREE_WEBHOOK_SECRET is not set");
    return false;
  }
  if (!timestamp || !signature) return false;

  const expected = createHmac("sha256", secret)
    .update(timestamp + rawBody)
    .digest("base64");

  // timingSafeEqual requires equal-length buffers
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    // ─── Verify signature BEFORE parsing/trusting any field ─────────────
    const sig = request.headers.get("x-webhook-signature");
    const ts  = request.headers.get("x-webhook-timestamp");
    if (!verifyCashfreeSignature(body, ts, sig)) {
      console.warn("[cashfree-webhook] Signature verification failed");
      // Return 401 — Cashfree will not retry on 4xx, but this is a security
      // event, not a transient failure. (For transient DB errors below we
      // return 5xx so Cashfree retries.)
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const data = JSON.parse(body);

    console.log("[cashfree-webhook] Received:", JSON.stringify(data));

    // ─── Extract key fields from Cashfree webhook payload ────────────────
    // Cashfree webhook structure (v2023-08-01):
    // { type: "PAYMENT_SUCCESS_WEBHOOK" | "PAYMENT_FAILED_WEBHOOK" | ...,
    //   data: { order: { order_id, order_amount }, payment: { cf_payment_id, payment_status, ... } } }

    const eventType     = data?.type || "";
    const cfOrderId     = data?.data?.order?.order_id || "";         // e.g. MF_<uuid>
    const cfOrderAmount = Number(data?.data?.order?.order_amount ?? 0); // INR (string from CF)
    const paymentStatus = data?.data?.payment?.payment_status || ""; // PENDING | SUCCESS | FAILED | USER_DROPPED
    const cfPaymentId   = data?.data?.payment?.cf_payment_id || "";

    if (!cfOrderId) {
      console.warn("[cashfree-webhook] Missing order_id in payload");
      return NextResponse.json({ ok: true }); // Acknowledge — nothing to do
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
        .select("id, status, payment_status, total")
        .eq("cashfree_order_id", cfOrderId)
        .maybeSingle();

      // Fallback: scan recent cashfree orders and match by regenerating the cf_order_id
      let matchedOrder = directMatch;
      if (!matchedOrder) {
        const { data: orders, error: findErr } = await adminSupa
          .from("orders")
          .select("id, status, payment_status, total")
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
        // ── Amount-tampering guard ────────────────────────────────────
        // Only trust SUCCESS if Cashfree's order_amount equals our stored
        // total (within 1 paise tolerance). Otherwise we'd let an attacker
        // pay ₹1 for a ₹500 order.
        if (orderStatus === "confirmed" && cfOrderAmount > 0) {
          const expectedRupees = (matchedOrder.total ?? 0) / 100;
          if (Math.abs(cfOrderAmount - expectedRupees) > 0.01) {
            console.error(
              `[cashfree-webhook] Amount mismatch for order ${matchedOrder.id}: ` +
              `paid ₹${cfOrderAmount} vs expected ₹${expectedRupees}`
            );
            // Mark as failed so the customer knows; do NOT confirm the order.
            await adminSupa.from("orders").update({
              status:         "pending",
              payment_status: "failed",
              updated_at:     new Date().toISOString(),
            }).eq("id", matchedOrder.id);
            return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
          }
        }

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
          // Transient DB error — return 5xx so Cashfree retries.
          console.error("[cashfree-webhook] Update failed:", updateErr.message);
          return NextResponse.json({ error: "DB update failed" }, { status: 500 });
        }

        console.log(`[cashfree-webhook] Order ${matchedOrder.id} → ${orderStatus} / ${paymentStatusDb}`);

        // On successful payment: deduct stock + notify admin + notify customer
        if (orderStatus === "confirmed") {
          await decrementOrderStock(adminSupa, matchedOrder.id).catch(() => {});
          await notifyAdmin(adminSupa, matchedOrder.id, cfPaymentId, "cashfree").catch(() => {});
          await notifyCustomerOnPayment(adminSupa, matchedOrder.id).catch(() => {});
        }
      } else {
        console.warn("[cashfree-webhook] No matching order found for cf_order_id:", cfOrderId);
      }
    }

    return NextResponse.json({ ok: true, received: true });

  } catch (err: any) {
    console.error("[cashfree-webhook] Error:", err.message);
    // Genuine processing failure — let Cashfree retry.
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── Stock decrement ───────────────────────────────────────────────────────────
// Uses an atomic SQL UPDATE via the decrement_variant_stock RPC (see
// supabase/migrations/005_atomic_stock_decrement.sql). Without this, two
// concurrent webhook deliveries (or webhook + manual COD confirm) for the
// same SKU could read the same starting stock and oversell.
async function decrementOrderStock(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  orderId: string
) {
  const { data: items } = await supabase
    .from("order_items")
    .select("variant_id, quantity")
    .eq("order_id", orderId);

  for (const item of items || []) {
    if (!item.variant_id || item.quantity < 1) continue;
    try {
      await supabase.rpc("decrement_variant_stock", {
        p_variant_id: item.variant_id,
        p_quantity:   item.quantity,
      });
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
    .select("total, shipping_address, payment_method, customer_email, order_number")
    .eq("id", orderId)
    .single();

  if (!order?.shipping_address) return;

  const addr    = order.shipping_address as any;
  const mobile  = addr.mobile || addr.phone || "";
  const name    = addr.full_name || addr.name || "Customer";
  const totalRs = Math.round((order.total ?? 0) / 100);

  if (mobile) {
    await notifyCustomerSMS(
      mobile,
      msgOrderConfirmed(name, shortOrderId(orderId), totalRs, order.payment_method)
    );
  }

  // ── Email notification ────────────────────────────────────────────────────
  const email = order.customer_email || addr.email || "";
  if (email) {
    const { data: items } = await supabase
      .from("order_items")
      .select("product_name, variant_label, quantity, total_price")
      .eq("order_id", orderId);

    const addrLine = [addr.address_line1, addr.city, addr.state].filter(Boolean).join(", ");
    await sendOrderConfirmedEmail({
      to:          email,
      name,
      orderNumber: order.order_number || shortOrderId(orderId),
      orderId,
      items:       (items || []).map(i => ({
        product_name:  i.product_name,
        variant_label: i.variant_label,
        quantity:      i.quantity,
        total_price:   i.total_price,
      })),
      total:   order.total,
      method:  order.payment_method,
      address: addrLine,
    }).catch(() => {});
  }
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

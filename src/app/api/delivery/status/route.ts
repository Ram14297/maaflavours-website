// src/app/api/shiprocket/webhook/route.ts
// Maa Flavours — Shiprocket Status Webhook
//
// Shiprocket fires a POST to this URL whenever a shipment status changes.
// We map the Shiprocket status → our internal order status, update Supabase,
// and automatically notify the customer via SMS + email.
//
// Register this URL in Shiprocket:
//   Settings → API → Webhooks → Add Webhook
//   URL: https://maaflavours.com/api/shiprocket/webhook
//
// Shiprocket status → our order status mapping:
//   PICKED UP            → packed
//   IN TRANSIT           → shipped
//   OUT FOR DELIVERY     → out_for_delivery
//   DELIVERED            → delivered
//   (everything else)    → no change (logged but ignored)

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import {
  notifyCustomerSMS,
  shortOrderId,
  msgOrderPacked,
  msgOrderShipped,
  msgOrderOutForDelivery,
  msgOrderDelivered,
} from "@/lib/notify-customer";
import {
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
} from "@/lib/email";

export const dynamic = "force-dynamic";

// ─── Shiprocket status → our DB status ───────────────────────────────────────
const STATUS_MAP: Record<string, string> = {
  "PICKED UP":         "packed",
  "IN TRANSIT":        "shipped",
  "OUT FOR DELIVERY":  "out_for_delivery",
  "DELIVERED":         "delivered",
};

// Statuses that should NOT downgrade an order (e.g. don't mark delivered→shipped)
const STATUS_RANK: Record<string, number> = {
  pending:          0,
  confirmed:        1,
  processing:       2,
  packed:           3,
  shipped:          4,
  out_for_delivery: 5,
  delivered:        6,
  cancelled:        99,
  refunded:        100,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const awb             = body.awb            || body.AWB            || "";
    const srStatus        = (body.current_status || body.status || "").toUpperCase().trim();
    const srOrderId       = String(body.order_id    || "");
    const shipmentId      = String(body.shipment_id || "");
    const courierName     = body.courier_name   || body.courier   || "";

    console.log(`[shiprocket-webhook] status="${srStatus}" awb="${awb}" sr_order_id="${srOrderId}"`);

    // Ignore statuses we don't act on
    const newStatus = STATUS_MAP[srStatus];
    if (!newStatus) {
      console.log(`[shiprocket-webhook] Ignoring status: ${srStatus}`);
      return NextResponse.json({ ok: true, ignored: true, reason: `No mapping for: ${srStatus}` });
    }

    const supabase = createAdminSupabaseClient();

    // ── Find our order by AWB code or Shiprocket order ID ─────────────────────
    let order: any = null;

    // Try AWB first (most reliable)
    if (awb) {
      const { data } = await supabase
        .from("orders")
        .select("id, status, order_number, customer_id, shipping_address, courier_name, tracking_id")
        .eq("tracking_id", awb)
        .maybeSingle();
      order = data;
    }

    // Also save AWB back to DB if we find the order by other means
    // (AWB gets assigned in Shiprocket after courier selection — not at order creation)

    // Fallback: try Shiprocket shipment ID
    if (!order && shipmentId) {
      const { data } = await supabase
        .from("orders")
        .select("id, status, order_number, customer_id, shipping_address, courier_name, tracking_id")
        .eq("shiprocket_shipment_id", shipmentId)
        .maybeSingle();
      order = data;
      // Save AWB to DB now that we found the order
      if (data && awb) {
        await supabase.from("orders").update({
          tracking_id:  awb,
          courier_name: courierName || data.courier_name || "",
        }).eq("id", data.id);
        order.tracking_id = awb;
      }
    }

    // Fallback: try Shiprocket order ID
    if (!order && srOrderId) {
      const { data } = await supabase
        .from("orders")
        .select("id, status, order_number, customer_id, shipping_address, courier_name, tracking_id")
        .eq("shiprocket_order_id", srOrderId)
        .maybeSingle();
      order = data;
      // Save AWB to DB
      if (data && awb) {
        await supabase.from("orders").update({
          tracking_id:  awb,
          courier_name: courierName || data.courier_name || "",
        }).eq("id", data.id);
        order.tracking_id = awb;
      }
    }

    if (!order) {
      console.warn(`[shiprocket-webhook] Order not found — awb="${awb}" sr_order_id="${srOrderId}"`);
      return NextResponse.json({ ok: true, ignored: true, reason: "Order not found" });
    }

    // ── Don't downgrade status ────────────────────────────────────────────────
    const currentRank = STATUS_RANK[order.status] ?? 0;
    const newRank     = STATUS_RANK[newStatus]     ?? 0;

    if (newRank <= currentRank) {
      console.log(`[shiprocket-webhook] Skipping — current="${order.status}" (${currentRank}) >= new="${newStatus}" (${newRank})`);
      return NextResponse.json({ ok: true, ignored: true, reason: "Status would be a downgrade" });
    }

    // ── Build DB update ───────────────────────────────────────────────────────
    const updates: Record<string, any> = {
      status:     newStatus,
      updated_at: new Date().toISOString(),
    };

    if (newStatus === "shipped" || newStatus === "out_for_delivery") {
      updates.dispatched_at = updates.dispatched_at || new Date().toISOString();
    }
    if (newStatus === "delivered") {
      updates.delivered_at = new Date().toISOString();
    }
    if (courierName && !order.courier_name) {
      updates.courier_name = courierName;
    }

    await supabase.from("orders").update(updates).eq("id", order.id);

    // ── Log to status history ─────────────────────────────────────────────────
    await supabase.from("order_status_history").insert({
      order_id:   order.id,
      status:     newStatus,
      note:       `Auto-updated from Shiprocket: ${srStatus}${awb ? ` (AWB: ${awb})` : ""}`,
      created_at: new Date().toISOString(),
    });

    console.log(`[shiprocket-webhook] Updated order ${order.order_number} → ${newStatus}`);

    // ── Notify customer ───────────────────────────────────────────────────────
    const addr      = order.shipping_address as any;
    const name      = addr?.full_name || addr?.name || "Customer";
    const mobile    = addr?.mobile    || addr?.phone || "";
    const shortId   = shortOrderId(order.id);
    const trackId   = order.tracking_id || awb || "";
    const courier   = order.courier_name || courierName || "Courier";
    const orderNum  = order.order_number || shortId;

    // Fetch customer email for email notifications
    let customerEmail = "";
    if (order.customer_id) {
      const { data: customer } = await supabase
        .from("customers")
        .select("email")
        .eq("id", order.customer_id)
        .maybeSingle();
      customerEmail = customer?.email || "";
    }

    // SMS
    if (mobile) {
      let smsMsg = "";
      if (newStatus === "packed")           smsMsg = msgOrderPacked(name, shortId);
      if (newStatus === "shipped")          smsMsg = msgOrderShipped(name, shortId, courier, trackId);
      if (newStatus === "out_for_delivery") smsMsg = msgOrderOutForDelivery(name, shortId);
      if (newStatus === "delivered")        smsMsg = msgOrderDelivered(name, shortId);

      if (smsMsg) {
        await notifyCustomerSMS(mobile, smsMsg).catch(e =>
          console.error("[shiprocket-webhook] SMS error:", e.message)
        );
      }
    }

    // Email (shipped + delivered only)
    if (customerEmail) {
      if (newStatus === "shipped") {
        await sendOrderShippedEmail({
          to:          customerEmail,
          name,
          orderNumber: orderNum,
          orderId:     order.id,
          courier,
          trackingId:  trackId,
        }).catch(e => console.error("[shiprocket-webhook] Email error:", e.message));
      }

      if (newStatus === "delivered") {
        await sendOrderDeliveredEmail({
          to:          customerEmail,
          name,
          orderNumber: orderNum,
          orderId:     order.id,
        }).catch(e => console.error("[shiprocket-webhook] Email error:", e.message));
      }
    }

    return NextResponse.json({
      ok:       true,
      orderId:  order.id,
      from:     order.status,
      to:       newStatus,
    });

  } catch (err: any) {
    console.error("[shiprocket-webhook] Error:", err.message);
    // Always return 200 to Shiprocket — otherwise it retries forever
    return NextResponse.json({ ok: false, error: err.message });
  }
}

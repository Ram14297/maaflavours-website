// src/app/api/orders/[orderId]/cancel/route.ts
// Maa Flavours — Customer Order Cancellation
// POST /api/orders/[orderId]/cancel
// Rules:
//   • Order must belong to this customer (mf_session cookie)
//   • Status must be 'pending' or 'confirmed'
//   • DB triggers auto-restore stock on cancellation

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { notifyCustomerSMS, msgOrderCancelled, shortOrderId } from "@/lib/notify-customer";
import { verifyCustomerSession } from "@/lib/customer-auth";
import { isAllowedOrigin } from "@/lib/origin-check";

const CANCELLABLE_STATUSES = ["pending", "confirmed"];

export async function POST(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params;
  if (!orderId) {
    return NextResponse.json({ error: "Order ID required" }, { status: 400 });
  }

  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ── Require a verified customer session ──────────────────────────────
  // Previously the ownership check was only run when a cookie was present,
  // so anyone with an order ID could cancel any order.
  const session = await verifyCustomerSession(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const supabase = createAdminSupabaseClient();

    // ── Fetch order ───────────────────────────────────────────────────────
    const { data: order, error } = await supabase
      .from("orders")
      .select("id, status, payment_method, payment_status, customer_id, created_at, total, shipping_address")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Strict ownership — same 404 to avoid leaking existence
    if (order.customer_id !== session.userId) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // ── Check status ──────────────────────────────────────────────────────
    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      const msg =
        order.status === "cancelled"
          ? "This order is already cancelled."
          : order.status === "shipped" || order.status === "out_for_delivery"
          ? "Your order has already been shipped and cannot be cancelled. Please contact us on WhatsApp."
          : "This order cannot be cancelled at this stage. Please contact us on WhatsApp.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // ── Cancel the order ──────────────────────────────────────────────────
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status:       "cancelled",
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) throw updateError;

    // ── Attribute the trigger row to this customer ────────────────────────
    // The DB trigger (trg_log_order_status) fires on the status UPDATE above
    // and inserts a row with changed_by='system'. We update it with proper
    // attribution — avoids duplicate rows in the timeline.
    const { data: cancelTriggerRow } = await supabase
      .from("order_status_history")
      .select("id")
      .eq("order_id", orderId)
      .eq("new_status", "cancelled")
      .eq("changed_by", "system")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (cancelTriggerRow?.id) {
      await supabase
        .from("order_status_history")
        .update({ changed_by: `customer:${session.userId}`, note: "Cancelled by customer via website" })
        .eq("id", cancelTriggerRow.id);
    } else {
      await supabase.from("order_status_history").insert({
        order_id:   orderId,
        new_status: "cancelled",
        changed_by: `customer:${session.userId}`,
        note:       "Cancelled by customer via website",
      });
    }

    // ── Determine refund message ──────────────────────────────────────────
    const isPrepaid =
      order.payment_method !== "cod" && order.payment_status === "paid";

    const refundNote = isPrepaid
      ? `Your refund of ₹${(order.total / 100).toLocaleString("en-IN")} will be processed within 2–3 working days to your original payment method.`
      : null;

    // ── Notify customer via SMS ────────────────────────────────────────────
    const addr    = order.shipping_address as any;
    const mobile  = addr?.mobile || addr?.phone || "";
    const name    = addr?.full_name || addr?.name || "Customer";
    if (mobile) {
      await notifyCustomerSMS(
        mobile,
        msgOrderCancelled(name, shortOrderId(orderId), isPrepaid, Math.round((order.total ?? 0) / 100))
      ).catch(() => {});
    }

    return NextResponse.json({
      success:    true,
      refundNote,
      isPrepaid,
    });

  } catch (err: any) {
    console.error("[orders/cancel]", err.message);
    return NextResponse.json({ error: "Failed to cancel order. Please try again." }, { status: 500 });
  }
}

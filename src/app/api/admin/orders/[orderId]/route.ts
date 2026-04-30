// src/app/api/admin/orders/[orderId]/route.ts
// Maa Flavours — Admin Single Order API
// GET   /api/admin/orders/[orderId]  — full order detail with items
// PATCH /api/admin/orders/[orderId]  — update status, tracking, internal notes
//   Body: { status?, trackingId?, courierName?, trackingUrl?, internalNotes? }

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  notifyCustomerSMS, shortOrderId,
  msgOrderPacked, msgOrderShipped,
  msgOrderOutForDelivery, msgOrderDelivered, msgOrderCancelled,
} from "@/lib/notify-customer";

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const supabase = createAdminSupabaseClient();

    const { data: order, error } = await supabase
      .from("orders_summary")
      .select("*")
      .eq("id", params.orderId)
      .single();

    if (error || !order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const { data: items } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", params.orderId);

    const { data: statusHistory } = await supabase
      .from("order_status_history")
      .select("*")
      .eq("order_id", params.orderId)
      .order("created_at", { ascending: true });

    return NextResponse.json({ order, items: items || [], statusHistory: statusHistory || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const body = await req.json();
    const supabase = createAdminSupabaseClient();

    const updates: Record<string, any> = {};

    if (body.status)        updates.status        = body.status;
    if (body.trackingId)    updates.tracking_id   = body.trackingId;
    if (body.courierName)   updates.courier_name  = body.courierName;
    if (body.trackingUrl)   updates.tracking_url  = body.trackingUrl;
    if (body.internalNotes !== undefined) updates.internal_notes = body.internalNotes;

    // Auto-set timestamps
    if (body.status === "shipped")   updates.dispatched_at = new Date().toISOString();
    if (body.status === "delivered") updates.delivered_at  = new Date().toISOString();

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    const { data: updated, error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", params.orderId)
      .select()
      .single();

    if (error) throw error;

    // If status changed, add to history with admin attribution
    if (body.status) {
      await supabase.from("order_status_history").insert({
        order_id:   params.orderId,
        new_status: body.status,
        changed_by: `admin:${admin.email}`,
        note:       body.note || null,
      });

      // ── Notify customer via SMS on every status change ─────────────────
      await notifyCustomerOnStatusChange(
        supabase,
        params.orderId,
        body.status,
        body.trackingId   || updated?.tracking_id   || "",
        body.courierName  || updated?.courier_name  || "",
      ).catch(() => {});
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── Customer SMS on status change ────────────────────────────────────────────
async function notifyCustomerOnStatusChange(
  supabase:   ReturnType<typeof createAdminSupabaseClient>,
  orderId:    string,
  newStatus:  string,
  trackingId: string,
  courier:    string,
) {
  const { data: order } = await supabase
    .from("orders")
    .select("shipping_address, payment_method, payment_status, total")
    .eq("id", orderId)
    .single();

  if (!order?.shipping_address) return;

  const addr     = order.shipping_address as any;
  const mobile   = addr.mobile || addr.phone || "";
  const name     = addr.full_name || addr.name || "Customer";
  const sid      = shortOrderId(orderId);
  const totalRs  = Math.round((order.total ?? 0) / 100);
  const isPrepaid = order.payment_method !== "cod" && order.payment_status === "paid";

  if (!mobile) return;

  let message: string | null = null;

  switch (newStatus) {
    case "packed":
      message = msgOrderPacked(name, sid);
      break;
    case "shipped":
      message = msgOrderShipped(name, sid, courier || "Courier", trackingId || "—");
      break;
    case "out_for_delivery":
      message = msgOrderOutForDelivery(name, sid);
      break;
    case "delivered":
      message = msgOrderDelivered(name, sid);
      break;
    case "cancelled":
      message = msgOrderCancelled(name, sid, isPrepaid, totalRs);
      break;
    default:
      return; // No SMS for pending/confirmed — already sent on order placement
  }

  if (message) await notifyCustomerSMS(mobile, message);
}

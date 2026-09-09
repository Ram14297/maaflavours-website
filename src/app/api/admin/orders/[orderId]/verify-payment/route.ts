// src/app/api/admin/orders/[orderId]/verify-payment/route.ts
// Maa Flavours — Admin manually verifies a PhonePe QR "self-reported" payment
// POST /api/admin/orders/[orderId]/verify-payment
//
// PhonePe QR orders are created with status/payment_status "pending" — the
// customer's UPI ID is unverified self-reported text (see create-order.ts).
// Admin must confirm the money actually arrived (checked in their own
// PhonePe/bank app) before tapping this. Only then do we: mark
// confirmed/paid, deduct stock, push to Shiprocket, and send the customer
// their real "Order Confirmed" SMS + email.

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-auth";
import { notifyCustomerSMS, msgOrderConfirmed, shortOrderId } from "@/lib/notify-customer";
import { sendOrderConfirmedEmail } from "@/lib/email";
import { pushOrderToShiprocket } from "@/lib/shiprocket";

export async function POST(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const supabase = createAdminSupabaseClient();
    const { orderId } = params;

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, order_number, payment_method, payment_status, status, shipping_address, total, customer_email")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.payment_method !== "phonepe_qr") {
      return NextResponse.json({ error: "This action is only for PhonePe QR orders" }, { status: 400 });
    }
    if (order.payment_status === "paid") {
      return NextResponse.json({ success: true, alreadyVerified: true, order });
    }

    // ── Mark confirmed + paid ─────────────────────────────────────────────
    const { data: updated, error: updateErr } = await supabase
      .from("orders")
      .update({ status: "confirmed", payment_status: "paid" })
      .eq("id", orderId)
      .select()
      .single();
    if (updateErr) throw updateErr;

    // ── Log status history (attribute to this admin) ───────────────────────
    try {
      await supabase.from("order_status_history").insert({
        order_id:   orderId,
        new_status: "confirmed",
        changed_by: `admin:${admin.email}`,
        note:       "PhonePe QR payment manually verified by admin",
      });
    } catch { /* non-fatal */ }

    // ── Deduct stock (same atomic RPC used for COD/Cashfree) ───────────────
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

    // ── Push to Shiprocket (non-fatal — fire and forget) ───────────────────
    pushOrderToShiprocket(orderId).catch(() => {});

    // ── Notify customer: SMS + Email ────────────────────────────────────────
    const addr = (order.shipping_address || {}) as any;
    if (addr.mobile) {
      await notifyCustomerSMS(
        addr.mobile,
        msgOrderConfirmed(
          addr.full_name || addr.name || "Customer",
          shortOrderId(orderId),
          Math.round((order.total ?? 0) / 100),
          "phonepe_qr"
        )
      ).catch(() => {});
    }

    const email = order.customer_email || addr.email || "";
    if (email) {
      const { data: orderItemsFull } = await supabase
        .from("order_items")
        .select("product_name, variant_label, quantity, total_price")
        .eq("order_id", orderId);
      const addrLine = [addr.address_line1, addr.address_line2, addr.landmark, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ");
      await sendOrderConfirmedEmail({
        to:          email,
        name:        addr.full_name || addr.name || "Customer",
        orderNumber: order.order_number || shortOrderId(orderId),
        orderId,
        items:       (orderItemsFull || []).map(i => ({
          product_name:  i.product_name,
          variant_label: i.variant_label,
          quantity:      i.quantity,
          total_price:   i.total_price,
        })),
        total:   order.total,
        method:  "phonepe_qr",
        address: addrLine,
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    console.error("[verify-payment] Error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to verify payment" }, { status: 500 });
  }
}

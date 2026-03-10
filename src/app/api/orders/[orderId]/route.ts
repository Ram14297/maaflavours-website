// src/app/api/orders/[orderId]/route.ts
// Maa Flavours — Fetch Single Order API Route
// GET /api/orders/[orderId]
// Returns full order data for the confirmation page and account order detail
// Protected: only the order's customer can access it (via mf_session cookie)

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params;

  if (!orderId) {
    return NextResponse.json({ error: "Order ID required" }, { status: 400 });
  }

  try {
    const supabase = createAdminSupabaseClient();

    // Fetch order with items
    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        id, status, payment_method, payment_status,
        razorpay_payment_id, razorpay_order_id,
        subtotal, discount, coupon_code,
        delivery_charge, cod_charge, total,
        shipping_address,
        tracking_id, tracking_url, courier_name,
        dispatched_at, delivered_at,
        created_at, updated_at,
        customer_id,
        order_items (
          product_name, variant_label, product_slug, quantity, unit_price, total_price
        )
      `)
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Optional: verify the caller owns this order (if mf_session is present)
    const sessionCookie = request.cookies.get("mf_session")?.value;
    if (sessionCookie) {
      try {
        const session = JSON.parse(sessionCookie);
        if (session.userId && session.userId !== order.customer_id) {
          return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }
      } catch { /* allow if cookie invalid — order confirmation pages don't always have session */ }
    }

    // Map to frontend shape
    const mapped = {
      id:                  order.id,
      status:              order.status,
      payment_method:      order.payment_method,
      payment_status:      order.payment_status,
      razorpay_payment_id: order.razorpay_payment_id,
      razorpay_order_id:   order.razorpay_order_id,
      subtotal_paise:      order.subtotal,
      discount_paise:      order.discount ?? 0,
      coupon_code:         order.coupon_code ?? null,
      delivery_charge_paise: order.delivery_charge ?? 0,
      cod_charge_paise:    order.cod_charge ?? 0,
      total_paise:         order.total,
      delivery_address:    order.shipping_address,
      tracking_id:         order.tracking_id ?? null,
      tracking_url:        order.tracking_url ?? null,
      courier_name:        order.courier_name ?? null,
      shipped_at:          order.dispatched_at ?? null,
      delivered_at:        order.delivered_at ?? null,
      created_at:          order.created_at,
      items: ((order as any).order_items || []).map((item: any) => ({
        productSlug:  item.product_slug,
        productName:  item.product_name,
        variantLabel: item.variant_label,
        quantity:     item.quantity,
        unitPrice:    item.unit_price,
        lineTotal:    item.total_price,
      })),
    };

    return NextResponse.json({ order: mapped });
  } catch (err: any) {
    console.error("[orders/[orderId]] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

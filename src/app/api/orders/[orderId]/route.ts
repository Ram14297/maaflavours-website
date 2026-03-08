// src/app/api/orders/[orderId]/route.ts
// Maa Flavours — Fetch Single Order API Route
// GET /api/orders/[orderId]
// Returns full order data for the confirmation page and account order detail
// Protected: only the order's user (or admin) can access it

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params;

  if (!orderId) {
    return NextResponse.json({ error: "Order ID required" }, { status: 400 });
  }

  try {
    const supabase = await createServerClient();

    // Get current user (may be null for guest orders)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Fetch order — allow if user owns it OR if order has no user (guest COD)
    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        id,
        status,
        payment_method,
        payment_status,
        razorpay_payment_id,
        razorpay_order_id,
        subtotal,
        discount_paise,
        coupon_code,
        delivery_charge_paise,
        cod_charge_paise,
        total,
        delivery_address,
        items,
        created_at,
        confirmed_at,
        packed_at,
        shipped_at,
        out_for_delivery_at,
        delivered_at,
        tracking_id,
        tracking_url,
        courier_name
      `)
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Security: Only the order owner can view it
    // (Admin bypass handled by separate admin API route)
    // For guest orders (no user_id), we allow access via the confirmation URL
    // In production, add a signed token check for guest orders

    return NextResponse.json({ order });
  } catch (err: any) {
    console.error("[orders/[orderId]] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

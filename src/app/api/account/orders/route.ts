// src/app/api/account/orders/route.ts
// Maa Flavours — Fetch Current User's Orders
// GET /api/account/orders
// Reads mf_session cookie to auth user, then returns orders with items

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("mf_session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    let session: any;
    try {
      session = JSON.parse(sessionCookie);
    } catch {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!session.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const customerId = session.userId;
    const supabase = createAdminSupabaseClient();

    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        id, status, payment_method, payment_status,
        total, coupon_code, tracking_id, courier_name, created_at,
        order_items (
          product_name, variant_label, product_slug, quantity, total_price
        )
      `)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    // Map DB columns to frontend shape (total → total_paise, nested items)
    const mapped = (orders || []).map((o: any) => ({
      id:             o.id,
      status:         o.status,
      payment_method: o.payment_method,
      payment_status: o.payment_status,
      total_paise:    o.total,
      coupon_code:    o.coupon_code ?? null,
      tracking_id:    o.tracking_id ?? null,
      courier_name:   o.courier_name ?? null,
      created_at:     o.created_at,
      items: (o.order_items || []).map((item: any) => ({
        productName:  item.product_name,
        productSlug:  item.product_slug,
        variantLabel: item.variant_label,
        quantity:     item.quantity,
        lineTotal:    item.total_price,
      })),
    }));

    return NextResponse.json({ orders: mapped });
  } catch (err: any) {
    console.error("[account/orders]", err);
    return NextResponse.json({ orders: [] });
  }
}

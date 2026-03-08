// src/app/api/admin/customers/[customerId]/route.ts
// Maa Flavours — Admin Customer Detail API
// GET  /api/admin/customers/[customerId]
//      Returns: customer, orders (all), addresses, product_preferences, monthly_spend
// PATCH /api/admin/customers/[customerId]
//      Update customer: { name, email, is_active, note }

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { customerId: string } }
) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const sp   = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10));
  const limit = 10;
  const from  = (page - 1) * limit;
  const to    = from + limit - 1;

  try {
    const supabase = createAdminSupabaseClient();

    const [{ data: customer, error }, ordersRes, { data: addresses }] = await Promise.all([
      supabase.from("customers").select("*").eq("id", params.customerId).single(),
      supabase.from("orders")
        .select("id, order_number, total, subtotal, delivery_charge, status, payment_method, payment_status, tracking_id, courier_name, created_at, shipping_address", { count: "exact" })
        .eq("customer_id", params.customerId)
        .order("created_at", { ascending: false })
        .range(from, to),
      supabase.from("customer_addresses")
        .select("*")
        .eq("customer_id", params.customerId)
        .order("is_default", { ascending: false }),
    ]);

    if (error || !customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    const orders    = ordersRes.data    || [];
    const orderCount= ordersRes.count   || 0;
    const orderPages= Math.ceil(orderCount / limit);

    // Fetch order items for product preferences (recent 50 orders)
    const { data: allOrders } = await supabase
      .from("orders")
      .select("id")
      .eq("customer_id", params.customerId)
      .limit(50);

    const orderIds = (allOrders || []).map((o: any) => o.id);
    let productPref: any[] = [];
    if (orderIds.length > 0) {
      const { data: items } = await supabase
        .from("order_items")
        .select("product_name, variant_label, quantity, total_price")
        .in("order_id", orderIds);

      // Aggregate by product
      const prodMap: Record<string, any> = {};
      for (const item of items || []) {
        const key = item.product_name;
        if (!prodMap[key]) prodMap[key] = { product_name: key, times_ordered: 0, total_qty: 0, total_spent: 0 };
        prodMap[key].times_ordered += 1;
        prodMap[key].total_qty    += item.quantity;
        prodMap[key].total_spent  += item.total_price;
      }
      productPref = Object.values(prodMap).sort((a, b) => b.times_ordered - a.times_ordered).slice(0, 6);
    }

    // Monthly spend (last 12 months)
    const { data: monthlyRaw } = await supabase
      .from("orders")
      .select("total, created_at")
      .eq("customer_id", params.customerId)
      .not("status", "in", "(cancelled,refunded)")
      .gte("created_at", new Date(Date.now() - 365 * 86400 * 1000).toISOString());

    const monthlyMap: Record<string, number> = {};
    for (const o of monthlyRaw || []) {
      const key = o.created_at.slice(0, 7); // YYYY-MM
      monthlyMap[key] = (monthlyMap[key] || 0) + o.total;
    }

    return NextResponse.json({
      customer,
      orders,
      orderCount,
      orderPages,
      orderPage: page,
      addresses:        addresses   || [],
      productPreferences: productPref,
      monthlySpend:     monthlyMap,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { customerId: string } }
) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const body      = await req.json();
    const supabase  = createAdminSupabaseClient();
    const patch: any = {};

    if (body.name      !== undefined) patch.name       = body.name;
    if (body.email     !== undefined) patch.email      = body.email;
    if (body.is_active !== undefined) patch.is_active  = body.is_active;

    const { data, error } = await supabase
      .from("customers")
      .update(patch)
      .eq("id", params.customerId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ customer: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// src/app/api/admin/orders/route.ts
// Maa Flavours — Admin Orders List API
// GET /api/admin/orders?page=1&limit=20&status=pending&search=MAA-&payment=cod
// Returns paginated order list from orders_summary view

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin, getPagination } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const sp      = req.nextUrl.searchParams;
  const status  = sp.get("status");
  const payment = sp.get("payment");
  const search  = sp.get("search");
  const { page, limit, from, to } = getPagination(sp);

  try {
    const supabase = createAdminSupabaseClient();

    let query = supabase
      .from("orders_summary")
      .select(
        "id, order_number, customer_name, customer_mobile, total, status, payment_status, payment_method, coupon_code, created_at, dispatched_at, tracking_id, courier_name, item_count",
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    if (status)  query = query.eq("status", status);
    if (payment) query = query.eq("payment_method", payment);
    if (search)  query = query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_mobile.ilike.%${search}%`);

    const { data, count, error } = await query.range(from, to);
    if (error) throw error;

    return NextResponse.json({
      orders: data || [],
      total:  count || 0,
      page,
      limit,
      pages:  Math.ceil((count || 0) / limit),
    });
  } catch (err: any) {
    console.error("[admin/orders GET]", err.message);
    return NextResponse.json({ orders: [], total: 0, page, limit, pages: 0 });
  }
}

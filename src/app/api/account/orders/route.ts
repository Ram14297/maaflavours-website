// src/app/api/account/orders/route.ts
// Maa Flavours — Fetch Current User's Orders
// GET /api/account/orders
// Returns paginated list of orders for the authenticated user

import { NextResponse } from "next/server";
import { createServerClient, createAdminSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, order_number, status, payment_status, payment_method, total, subtotal, created_at, tracking_id, courier_name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ orders: orders || [] });
  } catch (err: any) {
    // In dev without Supabase — return empty array
    console.error("[account/orders]", err);
    return NextResponse.json({ orders: [] });
  }
}

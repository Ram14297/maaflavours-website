// src/app/api/admin/prep-summary/route.ts
// Maa Flavours — Daily Prep Summary API
// GET /api/admin/prep-summary
// Aggregates order_items across confirmed + processing + packed orders
// Returns: per-product totals (name, variant, qty, order count)

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-auth";

export interface PrepItem {
  product_name:  string;
  variant_label: string;
  total_qty:     number;
  order_count:   number;
  order_numbers: string[];
}

const PREP_STATUSES = ["confirmed", "processing", "packed"];

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const supabase = createAdminSupabaseClient();

    // Fetch all order IDs in prep statuses
    const { data: orders, error: oErr } = await supabase
      .from("orders")
      .select("id, order_number")
      .in("status", PREP_STATUSES);

    if (oErr) throw oErr;
    if (!orders?.length) return NextResponse.json({ items: [], order_count: 0, generated_at: new Date().toISOString() });

    const orderIds = orders.map((o) => o.id);

    // Fetch all line items for these orders
    const { data: items, error: iErr } = await supabase
      .from("order_items")
      .select("order_id, product_name, variant_label, quantity")
      .in("order_id", orderIds);

    if (iErr) throw iErr;

    // Build lookup: orderId → order_number
    const orderNumMap: Record<string, string> = {};
    for (const o of orders) orderNumMap[o.id] = o.order_number;

    // Aggregate by product_name + variant_label
    const agg: Record<string, PrepItem> = {};
    for (const item of items || []) {
      const key = `${item.product_name}|||${item.variant_label}`;
      if (!agg[key]) {
        agg[key] = {
          product_name:  item.product_name,
          variant_label: item.variant_label,
          total_qty:     0,
          order_count:   0,
          order_numbers: [],
        };
      }
      agg[key].total_qty   += item.quantity;
      agg[key].order_count += 1;
      const orderNum = orderNumMap[item.order_id];
      if (orderNum && !agg[key].order_numbers.includes(orderNum)) {
        agg[key].order_numbers.push(orderNum);
      }
    }

    const prepList = Object.values(agg).sort((a, b) =>
      a.product_name.localeCompare(b.product_name) || a.variant_label.localeCompare(b.variant_label)
    );

    return NextResponse.json({
      items:        prepList,
      order_count:  orders.length,
      generated_at: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

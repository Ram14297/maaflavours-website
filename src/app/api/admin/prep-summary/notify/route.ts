// src/app/api/admin/prep-summary/notify/route.ts
// Maa Flavours — Manual "Send WhatsApp" trigger from admin prep page
// POST /api/admin/prep-summary/notify

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-auth";
import { notifyCustomerSMS } from "@/lib/notify-customer";

const OWNER_MOBILE = process.env.OWNER_MOBILE || "9701452929";
const PREP_STATUSES = ["confirmed", "processing", "packed"];

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const supabase = createAdminSupabaseClient();

    const { data: orders } = await supabase
      .from("orders")
      .select("id, order_number")
      .in("status", PREP_STATUSES);

    if (!orders?.length) {
      await notifyCustomerSMS(OWNER_MOBILE, `🫙 Maa Flavours — No pending prep right now. All caught up! ✅`);
      return NextResponse.json({ sent: true, items: 0 });
    }

    const orderIds = orders.map((o) => o.id);

    const { data: items } = await supabase
      .from("order_items")
      .select("product_name, variant_label, quantity")
      .in("order_id", orderIds);

    const agg: Record<string, number> = {};
    for (const item of items || []) {
      const key = `${item.product_name} ${item.variant_label}`;
      agg[key] = (agg[key] || 0) + item.quantity;
    }

    const lines = Object.entries(agg)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, qty]) => `• ${name} — ${qty} jar${qty > 1 ? "s" : ""}`)
      .join("\n");

    const totalJars = Object.values(agg).reduce((s, n) => s + n, 0);

    const message =
      `🫙 Maa Flavours — Prep List\n\n` +
      `${lines}\n\n` +
      `Total: ${totalJars} jar${totalJars > 1 ? "s" : ""} to prepare\n` +
      `Orders: ${orders.length}\n\n` +
      `maaflavours.com/admin/prep`;

    await notifyCustomerSMS(OWNER_MOBILE, message);

    return NextResponse.json({ sent: true, items: totalJars });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

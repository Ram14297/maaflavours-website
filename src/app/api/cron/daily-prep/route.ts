// src/app/api/cron/daily-prep/route.ts
// Maa Flavours — Daily 8 AM Prep Notification (Vercel Cron)
// Runs at 2:30 AM UTC = 8:00 AM IST every day
// Fetches prep summary and sends WhatsApp SMS to owner

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { notifyCustomerSMS } from "@/lib/notify-customer";

const OWNER_MOBILE = process.env.OWNER_MOBILE || "9701452929";
const PREP_STATUSES = ["confirmed", "processing", "packed"];

export async function GET(req: NextRequest) {
  // Verify Vercel cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const supabase = createAdminSupabaseClient();

    const { data: orders } = await supabase
      .from("orders")
      .select("id, order_number")
      .in("status", PREP_STATUSES);

    if (!orders?.length) {
      await notifyCustomerSMS(OWNER_MOBILE, `🫙 Maa Flavours — Good morning!\n\nNo pending prep for today. All caught up! ✅`);
      return NextResponse.json({ sent: true, items: 0 });
    }

    const orderIds = orders.map((o) => o.id);

    const { data: items } = await supabase
      .from("order_items")
      .select("product_name, variant_label, quantity")
      .in("order_id", orderIds);

    // Aggregate
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
      `🫙 Maa Flavours — Today's Prep List\n\n` +
      `${lines}\n\n` +
      `Total: ${totalJars} jar${totalJars > 1 ? "s" : ""} to prepare\n` +
      `Pending orders: ${orders.length}\n\n` +
      `View details: maaflavours.com/admin/prep`;

    await notifyCustomerSMS(OWNER_MOBILE, message);

    return NextResponse.json({ sent: true, items: totalJars, orders: orders.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

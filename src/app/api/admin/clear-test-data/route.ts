// src/app/api/admin/clear-test-data/route.ts
// Maa Flavours — Danger Zone: clear all test orders
// POST /api/admin/clear-test-data
// Deletes all orders + order_items from the database.
// Protected by admin JWT. Irreversible — only use during testing phase.

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const supabase = createAdminSupabaseClient();

    // Delete in FK-safe order: items → status history → orders
    const { error: itemsErr } = await supabase
      .from("order_items")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // match all rows

    if (itemsErr) throw itemsErr;

    // Try to delete status history if the table exists (non-fatal if it doesn't)
    await supabase
      .from("order_status_history")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000")
      .then(() => {});

    const { error: ordersErr, count } = await supabase
      .from("orders")
      .delete({ count: "exact" })
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (ordersErr) throw ordersErr;

    return NextResponse.json({ success: true, deleted: count ?? 0 });
  } catch (err: any) {
    console.error("[clear-test-data]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

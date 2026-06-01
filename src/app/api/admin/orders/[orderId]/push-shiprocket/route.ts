// src/app/api/admin/orders/[orderId]/push-shiprocket/route.ts
// Admin endpoint — manually push a single order to Shiprocket
// Used for orders placed before the auto-integration was live,
// or for any order where the initial push failed.

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin }              from "@/lib/admin-auth";
import { pushOrderToShiprocket }     from "@/lib/shiprocket";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { orderId } = params;

  try {
    // Check if already pushed
    const supabase = createAdminSupabaseClient();
    const { data: order } = await supabase
      .from("orders")
      .select("shiprocket_order_id, order_number")
      .eq("id", orderId)
      .single();

    if (order?.shiprocket_order_id) {
      return NextResponse.json({
        ok:      true,
        already: true,
        message: `Already in Shiprocket (ID: ${order.shiprocket_order_id})`,
      });
    }

    await pushOrderToShiprocket(orderId);

    // Fetch updated Shiprocket IDs
    const { data: updated } = await supabase
      .from("orders")
      .select("shiprocket_order_id, shiprocket_shipment_id, tracking_id, courier_name")
      .eq("id", orderId)
      .single();

    return NextResponse.json({
      ok:                   true,
      shiprocket_order_id:  updated?.shiprocket_order_id  || null,
      shiprocket_shipment_id: updated?.shiprocket_shipment_id || null,
      tracking_id:          updated?.tracking_id          || null,
    });

  } catch (err: any) {
    console.error("[push-shiprocket]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// src/app/api/admin/orders/[orderId]/route.ts
// Maa Flavours — Admin Single Order API
// GET   /api/admin/orders/[orderId]  — full order detail with items
// PATCH /api/admin/orders/[orderId]  — update status, tracking, internal notes
//   Body: { status?, trackingId?, courierName?, trackingUrl?, internalNotes? }

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const supabase = createAdminSupabaseClient();

    const { data: order, error } = await supabase
      .from("orders_summary")
      .select("*")
      .eq("id", params.orderId)
      .single();

    if (error || !order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const { data: items } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", params.orderId);

    const { data: statusHistory } = await supabase
      .from("order_status_history")
      .select("*")
      .eq("order_id", params.orderId)
      .order("created_at", { ascending: true });

    return NextResponse.json({ order, items: items || [], statusHistory: statusHistory || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const body = await req.json();
    const supabase = createAdminSupabaseClient();

    const updates: Record<string, any> = {};

    if (body.status)        updates.status        = body.status;
    if (body.trackingId)    updates.tracking_id   = body.trackingId;
    if (body.courierName)   updates.courier_name  = body.courierName;
    if (body.trackingUrl)   updates.tracking_url  = body.trackingUrl;
    if (body.internalNotes !== undefined) updates.internal_notes = body.internalNotes;

    // Auto-set timestamps
    if (body.status === "shipped")   updates.dispatched_at = new Date().toISOString();
    if (body.status === "delivered") updates.delivered_at  = new Date().toISOString();

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    const { data: updated, error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", params.orderId)
      .select()
      .single();

    if (error) throw error;

    // If status changed, add to history with admin attribution
    if (body.status) {
      await supabase.from("order_status_history").insert({
        order_id:   params.orderId,
        new_status: body.status,
        changed_by: `admin:${admin.email}`,
        note:       body.note || null,
      });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

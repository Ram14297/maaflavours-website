// src/app/api/admin/coupons/[couponId]/route.ts
// Maa Flavours — Admin Single Coupon Update/Delete
// PUT    /api/admin/coupons/[couponId]  — update coupon
// DELETE /api/admin/coupons/[couponId]  — deactivate coupon

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: { couponId: string } }
) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const body    = await req.json();
    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("coupons")
      .update({
        description:         body.description         ?? undefined,
        value:               body.value               ?? undefined,
        min_order_amount:    body.minOrderAmount       ?? undefined,
        max_discount_amount: body.maxDiscountAmount    ?? undefined,
        usage_limit:         body.usageLimit           ?? undefined,
        is_active:           body.isActive             ?? undefined,
        expires_at:          body.expiresAt            ?? undefined,
      })
      .eq("id", params.couponId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, coupon: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { couponId: string } }
) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const supabase = createAdminSupabaseClient();
    // Hard delete — confirmed by admin via modal; past order records retain coupon_code text
    const { error } = await supabase
      .from("coupons")
      .delete()
      .eq("id", params.couponId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// src/app/api/admin/expenses/[expenseId]/route.ts
// PATCH /api/admin/expenses/[expenseId]  — edit expense
// DELETE /api/admin/expenses/[expenseId] — delete expense

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { expenseId: string } }
) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const body     = await req.json();
    const supabase = createAdminSupabaseClient();
    const patch: any = {};

    if (body.category    !== undefined) patch.category     = body.category;
    if (body.description !== undefined) patch.description  = body.description.trim();
    if (body.amount      !== undefined) patch.amount       = Number(body.amount);
    if (body.expenseDate !== undefined) patch.expense_date = body.expenseDate;
    if (body.notes       !== undefined) patch.notes        = body.notes?.trim() || null;

    const { data, error } = await supabase
      .from("expenses")
      .update(patch)
      .eq("id", params.expenseId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, expense: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { expenseId: string } }
) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from("expenses").delete().eq("id", params.expenseId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

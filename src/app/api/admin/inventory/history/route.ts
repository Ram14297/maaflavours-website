// src/app/api/admin/inventory/history/route.ts
// Maa Flavours — Stock Adjustment History
// GET /api/admin/inventory/history?variantId=&limit=50&page=1

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient }  from "@/lib/supabase/server";
import { requireAdmin, getPagination } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const sp        = req.nextUrl.searchParams;
  const variantId = sp.get("variantId");
  const { page, limit, from, to } = getPagination(sp);

  try {
    const supabase = createAdminSupabaseClient();

    let query = supabase
      .from("stock_adjustments")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (variantId) query = query.eq("variant_id", variantId);

    const { data, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      history: data || [],
      total:   count || 0,
      page,
      pages:   Math.ceil((count || 0) / limit),
    });
  } catch (err: any) {
    return NextResponse.json({ history: [], total: 0, page: 1, pages: 0 });
  }
}

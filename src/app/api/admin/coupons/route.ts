// src/app/api/admin/coupons/route.ts
// Maa Flavours Admin Coupons API
// GET  /api/admin/coupons?active=true|false&search=
// POST /api/admin/coupons

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin, getPagination } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const sp     = req.nextUrl.searchParams;
  const active = sp.get("active");
  const search = sp.get("search") || "";
  const { page, limit, from, to } = getPagination(sp);

  try {
    const supabase = createAdminSupabaseClient();

    let query = supabase
      .from("coupons")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (active === "true")  query = query.eq("is_active", true);
    if (active === "false") query = query.eq("is_active", false);
    if (search) query = query.ilike("code", "%" + search + "%");

    const { data, count, error } = await query.range(from, to);
    if (error) throw error;

    const { data: allCoupons } = await supabase
      .from("coupons")
      .select("id, code, usage_count, is_active, expires_at");

    const all = allCoupons || [];
    const now = new Date();
    const sorted = [...all].sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0));

    const summary = {
      total:        all.length,
      active:       all.filter(c => c.is_active && (!c.expires_at || new Date(c.expires_at) > now)).length,
      expired:      all.filter(c => c.expires_at && new Date(c.expires_at) <= now).length,
      totalUses:    all.reduce((s, c) => s + (c.usage_count || 0), 0),
      topPerformer: sorted[0]?.code || null,
      topUses:      sorted[0]?.usage_count || 0,
    };

    return NextResponse.json({
      coupons: data || [],
      total:   count || 0,
      page, limit,
      pages:   Math.ceil((count || 0) / limit),
      summary,
    });
  } catch (err: any) {
    console.error("[admin/coupons GET]", err.message);
    return NextResponse.json({ coupons: [], total: 0, page: 1, limit: 20, pages: 0, summary: {} });
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const body     = await req.json();
    const supabase = createAdminSupabaseClient();

    if (!body.code || !body.type) {
      return NextResponse.json({ error: "Code and type are required" }, { status: 400 });
    }
    if (body.type !== "free_shipping" && (!body.value || Number(body.value) <= 0)) {
      return NextResponse.json({ error: "A positive discount value is required" }, { status: 400 });
    }
    if (body.type === "percent" && Number(body.value) > 100) {
      return NextResponse.json({ error: "Percentage discount cannot exceed 100%" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("coupons")
      .insert({
        code:                body.code.toUpperCase().replace(/\s+/g, ""),
        description:         body.description ? body.description.trim() : null,
        type:                body.type,
        value:               Number(body.value) || 0,
        min_order_amount:    body.minOrderAmount    || null,
        max_discount_amount: body.maxDiscountAmount || null,
        usage_limit:         body.usageLimit        || null,
        valid_from:          body.validFrom         || new Date().toISOString(),
        expires_at:          body.expiresAt         || null,
        is_active:           body.isActive          ?? true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
      throw error;
    }
    return NextResponse.json({ success: true, coupon: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

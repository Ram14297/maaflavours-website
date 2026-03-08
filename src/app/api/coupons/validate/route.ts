// src/app/api/coupons/validate/route.ts
// Maa Flavours — Coupon Validation API Route
// POST /api/coupons/validate
// Body: { code: string, cartTotal: number (paise) }
// Returns: { valid: true, coupon } | { valid: false, error: string }
// Column names match schema.sql: type, value, min_order_amount, max_discount_amount, usage_limit, usage_count

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

const STANDARD_SHIPPING = 6000; // ₹60 in paise

const STATIC_COUPONS = [
  { code: "WELCOME50",  description: "₹50 off your first order",         type: "flat"          as const, value: 5000,  min_order_amount: 29900, max_discount_amount: null,  is_active: true },
  { code: "MAASPECIAL", description: "10% off orders above ₹599",        type: "percent"       as const, value: 10,    min_order_amount: 59900, max_discount_amount: 15000, is_active: true },
  { code: "FREESHIP",   description: "Free shipping on any order",        type: "free_shipping" as const, value: 1,     min_order_amount: null,  max_discount_amount: null,  is_active: true },
  { code: "FESTIVE15",  description: "15% off — Festival special",        type: "percent"       as const, value: 15,    min_order_amount: 39900, max_discount_amount: 20000, is_active: false },
];

export async function POST(request: NextRequest) {
  try {
    const { code, cartTotal } = await request.json();
    if (!code)       return NextResponse.json({ valid: false, error: "Please enter a coupon code" }, { status: 400 });
    if (!cartTotal)  return NextResponse.json({ valid: false, error: "Invalid cart total" }, { status: 400 });
    const upperCode = code.toUpperCase().trim();

    let coupon: (typeof STATIC_COUPONS)[0] | null = null;
    let fromDatabase = false;

    try {
      const supabase = createAdminSupabaseClient();
      const { data, error } = await supabase.from("coupons")
        .select("code,description,type,value,min_order_amount,max_discount_amount,usage_limit,usage_count,is_active,valid_from,expires_at")
        .eq("code", upperCode).single();

      if (!error && data) {
        fromDatabase = true;
        if (!data.is_active) return NextResponse.json({ valid: false, error: "This coupon is no longer active" });
        const now = new Date();
        if (new Date(data.valid_from) > now) return NextResponse.json({ valid: false, error: "This coupon is not yet valid" });
        if (data.expires_at && new Date(data.expires_at) < now) return NextResponse.json({ valid: false, error: "This coupon has expired" });
        if (data.usage_limit !== null && data.usage_count >= data.usage_limit) return NextResponse.json({ valid: false, error: "This coupon has reached its usage limit" });
        if (data.min_order_amount && cartTotal < data.min_order_amount) return NextResponse.json({ valid: false, error: `Minimum order ₹${Math.ceil(data.min_order_amount/100)} required` });
        coupon = { code: data.code, description: data.description||"", type: data.type, value: data.value, min_order_amount: data.min_order_amount, max_discount_amount: data.max_discount_amount, is_active: true };
      }
    } catch {}

    if (!coupon) {
      const sc = STATIC_COUPONS.find(c => c.code === upperCode);
      if (!sc) return NextResponse.json({ valid: false, error: "Invalid coupon code" });
      if (!sc.is_active) return NextResponse.json({ valid: false, error: "This coupon is no longer active" });
      if (sc.min_order_amount && cartTotal < sc.min_order_amount) return NextResponse.json({ valid: false, error: `Minimum order ₹${Math.ceil(sc.min_order_amount/100)} required` });
      coupon = sc;
    }

    let discountAmount = 0;
    if (coupon.type === "flat")          discountAmount = Math.min(coupon.value, cartTotal);
    else if (coupon.type === "percent")  { discountAmount = Math.floor((cartTotal * coupon.value) / 100); if (coupon.max_discount_amount) discountAmount = Math.min(discountAmount, coupon.max_discount_amount); }
    else if (coupon.type === "free_shipping") discountAmount = cartTotal >= 49900 ? 0 : STANDARD_SHIPPING;

    return NextResponse.json({ valid: true, coupon: { code: coupon.code, description: coupon.description, type: coupon.type, value: coupon.value, discountAmount }, source: fromDatabase ? "database" : "static" });
  } catch (err: any) {
    return NextResponse.json({ valid: false, error: "Could not validate coupon. Try again." }, { status: 500 });
  }
}

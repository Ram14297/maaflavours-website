// src/app/api/account/addresses/route.ts
// Maa Flavours — Saved Addresses API
// GET  — list all addresses for current user
// POST — create a new address

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

function getSession(request: NextRequest) {
  const cookie = request.cookies.get("mf_session")?.value;
  if (!cookie) return null;
  try {
    const s = JSON.parse(cookie);
    if (!s.userId) return null;
    return s;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = getSession(request);
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const supabase = createAdminSupabaseClient();
    const { data } = await supabase
      .from("customer_addresses")
      .select("*")
      .eq("customer_id", session.userId)
      .order("is_default", { ascending: false });

    // Map DB `name` column → `full_name` for frontend consistency
    const mapped = (data || []).map((a: any) => ({ ...a, full_name: a.name }));
    return NextResponse.json({ addresses: mapped });
  } catch {
    return NextResponse.json({ addresses: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = getSession(request);
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await request.json();
    const { full_name, mobile, address_line1, address_line2, landmark, city, state, pincode } = body;

    if (!full_name || !mobile || !address_line1 || !city || !state || !pincode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    // If this is the first address, make it default
    const { count } = await supabase
      .from("customer_addresses")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", session.userId);

    const { data, error } = await supabase
      .from("customer_addresses")
      .insert({
        customer_id:   session.userId,
        name:          full_name,
        mobile,
        address_line1,
        address_line2: address_line2 || null,
        landmark:      landmark || null,
        city,
        state,
        pincode,
        is_default:    count === 0,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ address: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save address" }, { status: 500 });
  }
}

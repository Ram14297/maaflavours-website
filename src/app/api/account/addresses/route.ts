// src/app/api/account/addresses/route.ts
// Maa Flavours — Saved Addresses API
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { data } = await supabase
      .from("customer_addresses")
      .select("*")
      .eq("customer_id", user.id)
      .order("is_default", { ascending: false });

    return NextResponse.json({ addresses: data || [] });
  } catch { return NextResponse.json({ addresses: [] }); }
}

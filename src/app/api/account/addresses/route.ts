// src/app/api/account/addresses/route.ts
// Maa Flavours — Saved Addresses API
// Reads mf_session cookie for auth (custom auth, not Supabase session)

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("mf_session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    let session: any;
    try {
      session = JSON.parse(sessionCookie);
    } catch {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!session.userId || session.isNewUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const supabase = createAdminSupabaseClient();
    const { data } = await supabase
      .from("customer_addresses")
      .select("*")
      .eq("customer_id", session.userId)
      .order("is_default", { ascending: false });

    return NextResponse.json({ addresses: data || [] });
  } catch {
    return NextResponse.json({ addresses: [] });
  }
}

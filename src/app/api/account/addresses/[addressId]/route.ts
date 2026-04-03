// src/app/api/account/addresses/[addressId]/route.ts
// Maa Flavours — Single Address CRUD
// PUT    /api/account/addresses/[addressId]  → update address fields
// PATCH  /api/account/addresses/[addressId]  → set as default
// DELETE /api/account/addresses/[addressId]  → delete address

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

export async function PUT(
  req: NextRequest,
  { params }: { params: { addressId: string } }
) {
  try {
    const session = getSession(req);
    if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const body = await req.json();
    const admin = createAdminSupabaseClient();

    const { data, error } = await admin
      .from("customer_addresses")
      .update({
        name:          body.full_name,
        mobile:        body.mobile,
        address_line1: body.address_line1,
        address_line2: body.address_line2 || null,
        landmark:      body.landmark      || null,
        city:          body.city,
        state:         body.state,
        pincode:       body.pincode,
      })
      .eq("id", params.addressId)
      .eq("customer_id", session.userId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ address: { ...data, full_name: data.name } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { addressId: string } }
) {
  try {
    const session = getSession(req);
    if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const admin = createAdminSupabaseClient();

    // Unset all defaults for this customer, then set the chosen one
    await admin
      .from("customer_addresses")
      .update({ is_default: false })
      .eq("customer_id", session.userId);

    await admin
      .from("customer_addresses")
      .update({ is_default: true })
      .eq("id", params.addressId)
      .eq("customer_id", session.userId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { addressId: string } }
) {
  try {
    const session = getSession(req);
    if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const admin = createAdminSupabaseClient();
    const { error } = await admin
      .from("customer_addresses")
      .delete()
      .eq("id", params.addressId)
      .eq("customer_id", session.userId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

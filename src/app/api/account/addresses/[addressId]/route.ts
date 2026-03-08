// src/app/api/account/addresses/[addressId]/route.ts
// Maa Flavours — Single Address CRUD
// PUT    /api/account/addresses/[addressId]  → update address fields
// DELETE /api/account/addresses/[addressId]  → delete address

import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createAdminSupabaseClient } from "@/lib/supabase/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { addressId: string } }
) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const body = await req.json();
    const admin = createAdminSupabaseClient();

    // If setting as default, unset all others first
    if (body.is_default === true) {
      await admin
        .from("customer_addresses")
        .update({ is_default: false })
        .eq("customer_id", user.id);
    }

    const { data, error } = await admin
      .from("customer_addresses")
      .update({
        name:          body.name,
        mobile:        body.mobile,
        address_line1: body.address_line1,
        address_line2: body.address_line2 || null,
        landmark:      body.landmark      || null,
        city:          body.city,
        state:         body.state,
        pincode:       body.pincode,
        address_type:  body.address_type  || "home",
        is_default:    body.is_default    ?? false,
      })
      .eq("id", params.addressId)
      .eq("customer_id", user.id)  // Security: ensure customer owns this address
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ address: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { addressId: string } }
) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const admin = createAdminSupabaseClient();
    const { error } = await admin
      .from("customer_addresses")
      .delete()
      .eq("id", params.addressId)
      .eq("customer_id", user.id);  // Security: can only delete own addresses

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

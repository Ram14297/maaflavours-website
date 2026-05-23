// src/app/api/restock-notify/route.ts
// Maa Flavours — Restock Notification Registration
// POST /api/restock-notify
// Body: { productSlug, productName, email }
// Saves the customer's email so they get notified when the product is back in stock.
// Uses upsert — duplicate registrations (same email + slug) are silently ignored.

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { z } from "zod";

const Schema = z.object({
  productSlug: z.string().min(1).max(120),
  productName: z.string().min(1).max(120),
  email:       z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { productSlug, productName, email } = parsed.data;
    const supabase = createAdminSupabaseClient();

    // Upsert — if already registered, update created_at so they don't get
    // duplicate emails, but don't error out.
    const { error } = await supabase
      .from("restock_notifications")
      .upsert(
        { product_slug: productSlug, product_name: productName, email: email.toLowerCase().trim(), notified_at: null },
        { onConflict: "product_slug,email", ignoreDuplicates: true }
      );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[restock-notify]", err.message);
    return NextResponse.json({ error: "Could not save. Please try again." }, { status: 500 });
  }
}

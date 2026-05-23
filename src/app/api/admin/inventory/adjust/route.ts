// src/app/api/admin/inventory/adjust/route.ts
// Maa Flavours — Single Stock Adjustment API
// POST /api/admin/inventory/adjust
// Body: { variantId, type, qty, note }
// Types: received | manual_add | manual_remove | manual_set | damaged | returned | correction

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient }  from "@/lib/supabase/server";
import { requireAdmin }               from "@/lib/admin-auth";
import { sendRestockEmail }           from "@/lib/email";

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const { variantId, type, qty, note } = await req.json();
    if (!variantId || !type || qty === undefined) {
      return NextResponse.json({ error: "variantId, type, and qty required" }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    // Get current stock
    const { data: variant, error: fetchErr } = await supabase
      .from("product_variants")
      .select("id, stock_quantity, label, products(name)")
      .eq("id", variantId)
      .single();

    if (fetchErr || !variant) return NextResponse.json({ error: "Variant not found" }, { status: 404 });

    const qtyBefore = variant.stock_quantity;
    let   qtyAfter: number;
    let   qtyChange: number;

    if (type === "manual_set") {
      qtyAfter  = Math.max(0, Number(qty));
      qtyChange = qtyAfter - qtyBefore;
    } else {
      // positive types: received, manual_add, returned
      // negative types: manual_remove, damaged, sold, correction (can be +/-)
      const delta = ["manual_remove","damaged"].includes(type) ? -Math.abs(Number(qty)) : Number(qty);
      qtyAfter    = Math.max(0, qtyBefore + delta);
      qtyChange   = qtyAfter - qtyBefore;
    }

    // Update variant stock
    await supabase
      .from("product_variants")
      .update({ stock_quantity: qtyAfter })
      .eq("id", variantId);

    // Log adjustment
    await supabase.from("stock_adjustments").insert({
      variant_id:      variantId,
      product_name:    (variant.products as any)?.name || "",
      variant_label:   variant.label,
      adjustment_type: type,
      qty_before:      qtyBefore,
      qty_change:      qtyChange,
      qty_after:       qtyAfter,
      note:            note || null,
      created_by:      admin.email || "admin",
    });

    // ── Restock notifications ──────────────────────────────────────────────
    // If stock just went from 0 → positive, email everyone who asked to be notified.
    if (qtyBefore === 0 && qtyAfter > 0) {
      const productName = (variant.products as any)?.name || "";

      // Look up the product slug
      const { data: productRow } = await supabase
        .from("products")
        .select("slug")
        .eq("name", productName)
        .maybeSingle();

      if (productRow?.slug) {
        const { data: pending } = await supabase
          .from("restock_notifications")
          .select("id, email")
          .eq("product_slug", productRow.slug)
          .is("notified_at", null);

        for (const row of pending || []) {
          try {
            await sendRestockEmail({ to: row.email, productName, productSlug: productRow.slug });
            await supabase.from("restock_notifications")
              .update({ notified_at: new Date().toISOString() })
              .eq("id", row.id);
          } catch { /* non-fatal per recipient */ }
        }

        if ((pending || []).length > 0) {
          console.log(`[inventory/adjust] Sent restock emails to ${pending!.length} customer(s) for ${productName}`);
        }
      }
    }

    return NextResponse.json({ success: true, qtyBefore, qtyAfter, qtyChange });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

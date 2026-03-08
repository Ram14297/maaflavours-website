// src/app/api/admin/inventory/route.ts
// Maa Flavours — Admin Inventory API (Full Build)
// GET   /api/admin/inventory?filter=all|low|out&format=csv
//       Returns all variants with stock, grouped by product
//       ?format=csv  → download CSV file
//
// PATCH /api/admin/inventory
//       Bulk update: { updates: [{ variantId, stockQuantity, lowStockThreshold }] }
//       Each update writes a stock_adjustment record for the history log
//
// POST  /api/admin/inventory/adjust
//       Single adjustment: { variantId, type, qty, note }
//       Types: received | manual_add | manual_remove | manual_set | damaged | returned | correction

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient }  from "@/lib/supabase/server";
import { requireAdmin }               from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const sp     = req.nextUrl.searchParams;
  const filter = sp.get("filter") || "all";   // all | low | out
  const format = sp.get("format") || "json";  // json | csv

  try {
    const supabase = createAdminSupabaseClient();

    // Fetch all active product variants with product info
    const { data, error } = await supabase
      .from("product_variants")
      .select(`
        id, product_id, label, sku, weight_grams,
        price, stock_quantity, low_stock_threshold, is_active,
        products!inner(id, name, slug, spice_level, is_active)
      `)
      .order("stock_quantity", { ascending: true }); // most critical (low) first

    if (error) throw error;

    // Enrich
    const enriched = (data || []).map((v: any) => ({
      id:                 v.id,
      product_id:         v.product_id,
      label:              v.label,
      sku:                v.sku,
      weight_grams:       v.weight_grams,
      price:              v.price,
      stock_quantity:     v.stock_quantity,
      low_stock_threshold:v.low_stock_threshold,
      is_active:          v.is_active,
      product_name:       v.products?.name       || "Unknown",
      product_slug:       v.products?.slug       || "",
      product_spice:      v.products?.spice_level || "medium",
      product_image:      v.products?.primary_image_url || null,
      product_active:     v.products?.is_active  ?? true,
      status:
        v.stock_quantity === 0 ? "out_of_stock" :
        v.stock_quantity <= v.low_stock_threshold ? "low_stock" : "in_stock",
    }));

    // Apply filter
    const filtered =
      filter === "low" ? enriched.filter(v => v.status === "low_stock") :
      filter === "out" ? enriched.filter(v => v.status === "out_of_stock") :
      filter === "critical" ? enriched.filter(v => v.status !== "in_stock") :
      enriched;

    // Summary
    const summary = {
      total:      enriched.length,
      inStock:    enriched.filter(v => v.status === "in_stock").length,
      lowStock:   enriched.filter(v => v.status === "low_stock").length,
      outOfStock: enriched.filter(v => v.status === "out_of_stock").length,
      totalUnits: enriched.reduce((s, v) => s + v.stock_quantity, 0),
    };

    // CSV export
    if (format === "csv") {
      const header = "SKU,Product,Variant,Weight (g),Price (₹),Stock Qty,Low Stock Alert,Status";
      const rows   = filtered.map(v => {
        const priceRupees = (v.price / 100).toFixed(2);
        const status      = v.status === "out_of_stock" ? "Out of Stock" : v.status === "low_stock" ? "Low Stock" : "In Stock";
        return `"${v.sku}","${v.product_name}","${v.label}",${v.weight_grams},${priceRupees},${v.stock_quantity},${v.low_stock_threshold},"${status}"`;
      });
      const csv = [header, ...rows].join("\n");
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="maa-flavours-inventory-${new Date().toISOString().slice(0,10)}.csv"`,
        },
      });
    }

    // Group by product for the grouped view
    const grouped: Record<string, { product: any; variants: typeof enriched }> = {};
    for (const v of filtered) {
      if (!grouped[v.product_id]) {
        grouped[v.product_id] = {
          product: {
            id:     v.product_id,
            name:   v.product_name,
            slug:   v.product_slug,
            spice:  v.product_spice,
            image:  v.product_image,
            active: v.product_active,
          },
          variants: [],
        };
      }
      grouped[v.product_id].variants.push(v);
    }

    return NextResponse.json({
      variants: filtered,
      grouped:  Object.values(grouped),
      summary,
    });
  } catch (err: any) {
    console.error("[admin/inventory GET]", err.message);
    return NextResponse.json({ variants: [], grouped: [], summary: {} });
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const { updates } = await req.json();
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: "updates array required" }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    for (const u of updates) {
      if (!u.variantId) continue;

      // Get current qty first (for history log)
      const { data: current } = await supabase
        .from("product_variants")
        .select("stock_quantity, low_stock_threshold, label, products(name)")
        .eq("id", u.variantId)
        .single();

      const qtyBefore = current?.stock_quantity ?? 0;
      const qtyAfter  = Number(u.stockQuantity ?? qtyBefore);

      // Update variant
      const patch: Record<string, number> = {};
      if (u.stockQuantity       !== undefined) patch.stock_quantity       = qtyAfter;
      if (u.lowStockThreshold   !== undefined) patch.low_stock_threshold  = Number(u.lowStockThreshold);
      if (Object.keys(patch).length === 0) continue;

      await supabase.from("product_variants").update(patch).eq("id", u.variantId);

      // Record stock adjustment
      if (u.stockQuantity !== undefined && qtyBefore !== qtyAfter) {
        const qtyChange = qtyAfter - qtyBefore;
        await supabase.from("stock_adjustments").insert({
          variant_id:      u.variantId,
          product_name:    (current?.products as any)?.name || "",
          variant_label:   current?.label || "",
          adjustment_type: qtyChange > 0 ? "manual_add" : "manual_remove",
          qty_before:      qtyBefore,
          qty_change:      qtyChange,
          qty_after:       qtyAfter,
          note:            u.note || "Bulk stock update from inventory panel",
          created_by:      admin.email || "admin",
        });
      }
    }

    return NextResponse.json({ success: true, updated: updates.length });
  } catch (err: any) {
    console.error("[admin/inventory PATCH]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

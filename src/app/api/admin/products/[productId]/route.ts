// src/app/api/admin/products/[productId]/route.ts
// Maa Flavours — Admin Single Product CRUD
// GET    /api/admin/products/[productId]  — full product detail with variants + images
// PUT    /api/admin/products/[productId]  — update product + variants
// DELETE /api/admin/products/[productId]  — soft delete (set is_active = false)

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const supabase = createAdminSupabaseClient();

    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", params.productId)
      .single();

    if (error || !product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const [{ data: variants }, { data: images }] = await Promise.all([
      supabase.from("product_variants").select("*").eq("product_id", params.productId).order("weight_grams"),
      supabase.from("product_images").select("*").eq("product_id", params.productId).order("sort_order"),
    ]);

    return NextResponse.json({ product, variants: variants || [], images: images || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const body = await req.json();
    const supabase = createAdminSupabaseClient();
    const { variants, images, ...productData } = body;

    // Update product
    const { data: product, error } = await supabase
      .from("products")
      .update({
        name:              productData.name,
        subtitle:          productData.subtitle,
        tag:               productData.tag,
        spice_level:       productData.spice_level,
        short_description: productData.short_description,
        description:       productData.description,
        ingredients:       productData.ingredients,
        shelf_life_days:   productData.shelf_life_days,
        is_active:         productData.is_active,
        is_featured:       productData.is_featured,
        category_id:       productData.category_id || null,
        meta_title:        productData.meta_title   || null,
        meta_description:  productData.meta_description || null,
      })
      .eq("id", params.productId)
      .select()
      .single();

    if (error) throw error;

    // Update variants (upsert by SKU)
    if (variants && variants.length > 0) {
      for (const v of variants) {
        if (v.id) {
          // Existing variant — update
          await supabase.from("product_variants").update({
            price:               v.price,
            discounted_price:    v.discounted_price || null,
            stock_quantity:      v.stock_quantity,
            low_stock_threshold: v.low_stock_threshold || 10,
            is_active:           v.is_active ?? true,
          }).eq("id", v.id);
        } else {
          // New variant — insert
          await supabase.from("product_variants").insert({
            product_id:          params.productId,
            weight_grams:        v.weight_grams,
            label:               v.label,
            sku:                 v.sku,
            price:               v.price,
            discounted_price:    v.discounted_price || null,
            stock_quantity:      v.stock_quantity || 0,
            low_stock_threshold: v.low_stock_threshold || 10,
          });
        }
      }
    }

    // ── Upsert images ────────────────────────────────────────────────────
    if (images && Array.isArray(images)) {
      // Delete removed images (those no longer in the submitted list)
      const submittedIds = images.filter((img: any) => img.id).map((img: any) => img.id);
      if (submittedIds.length > 0) {
        await supabase
          .from("product_images")
          .delete()
          .eq("product_id", params.productId)
          .not("id", "in", `(${submittedIds.join(",")})`);
      } else {
        // No existing IDs submitted — delete all old images for this product
        await supabase.from("product_images").delete().eq("product_id", params.productId);
      }

      // Upsert each image
      for (const img of images) {
        if (img.id && !img.id.startsWith("temp-")) {
          // Existing image — update sort_order and is_primary
          await supabase
            .from("product_images")
            .update({ sort_order: img.sort_order, is_primary: img.is_primary })
            .eq("id", img.id);
        } else {
          // New image — insert
          await supabase.from("product_images").insert({
            product_id: params.productId,
            image_url:  img.image_url,
            sort_order: img.sort_order,
            is_primary: img.is_primary,
            alt_text:   img.alt_text || null,
          });
        }
      }
    }

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const supabase = createAdminSupabaseClient();

    // Soft delete: set is_active = false (never hard-delete — preserve order history)
    const { error } = await supabase
      .from("products")
      .update({ is_active: false })
      .eq("id", params.productId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

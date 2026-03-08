// src/app/api/admin/products/route.ts
// Maa Flavours — Admin Products List + Create
// GET  /api/admin/products?page=1&limit=20&search=&active=true
// POST /api/admin/products  — create new product

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin, getPagination } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const sp     = req.nextUrl.searchParams;
  const search = sp.get("search");
  const active = sp.get("active");
  const { page, limit, from, to } = getPagination(sp);

  try {
    const supabase = createAdminSupabaseClient();

    let query = supabase
      .from("products_with_details")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (active !== null && active !== "") query = query.eq("is_active", active === "true");
    if (search) query = query.ilike("name", `%${search}%`);

    const { data, count, error } = await query.range(from, to);
    if (error) throw error;

    // Also fetch all variants for each product
    const productIds = (data || []).map(p => p.id);
    const { data: variants } = productIds.length
      ? await supabase.from("product_variants").select("*").in("product_id", productIds)
      : { data: [] };

    // Attach variants to products
    const productsWithVariants = (data || []).map(p => ({
      ...p,
      variants: (variants || []).filter(v => v.product_id === p.id),
    }));

    return NextResponse.json({
      products: productsWithVariants,
      total:    count || 0,
      page,
      limit,
      pages:    Math.ceil((count || 0) / limit),
    });
  } catch (err: any) {
    console.error("[admin/products GET]", err.message);
    return NextResponse.json({ products: [], total: 0, page, limit, pages: 0 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const body    = await req.json();
    const supabase = createAdminSupabaseClient();

    const { variants, images, ...productData } = body;

    // Create product
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        slug:              productData.slug,
        name:              productData.name,
        subtitle:          productData.subtitle         || "",
        tag:               productData.tag              || "",
        spice_level:       productData.spice_level      || "medium",
        short_description: productData.short_description || "",
        description:       productData.description      || "",
        ingredients:       productData.ingredients      || "",
        shelf_life_days:   productData.shelf_life_days  || 90,
        is_vegetarian:     productData.is_vegetarian    ?? true,
        is_active:         productData.is_active        ?? true,
        is_featured:       productData.is_featured      ?? false,
        category_id:       productData.category_id      || null,
        meta_title:        productData.meta_title        || null,
        meta_description:  productData.meta_description  || null,
      })
      .select()
      .single();

    if (productError) throw productError;

    // Create variants
    if (variants && variants.length > 0) {
      const { error: variantError } = await supabase.from("product_variants").insert(
        variants.map((v: any) => ({
          product_id:          product.id,
          weight_grams:        v.weight_grams,
          label:               v.label,
          sku:                 v.sku,
          price:               v.price,    // in paise
          discounted_price:    v.discounted_price || null,
          stock_quantity:      v.stock_quantity   || 0,
          low_stock_threshold: v.low_stock_threshold || 10,
          is_active:           v.is_active ?? true,
        }))
      );
      if (variantError) throw variantError;
    }

    // Insert product images
    if (images && images.length > 0) {
      await supabase.from("product_images").insert(
        images.map((img: any, i: number) => ({
          product_id: product.id,
          image_url:  img.image_url,
          sort_order: img.sort_order ?? i,
          is_primary: img.is_primary ?? (i === 0),
          alt_text:   img.alt_text || null,
        }))
      );
    }

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (err: any) {
    console.error("[admin/products POST]", err.message);
    return NextResponse.json({ error: err.message || "Failed to create product" }, { status: 500 });
  }
}

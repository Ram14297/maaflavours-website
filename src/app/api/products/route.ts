// src/app/api/products/route.ts
// Maa Flavours — Public Products API
// GET /api/products
// Query params:
//   ?category=spicy|sour-tangy|seasonal
//   ?spice=mild|medium|spicy|extra-hot
//   ?sort=price-asc|price-desc|name|newest|featured
//   ?search=drumstick
//   ?page=1&limit=12
//   ?featured=true
// Returns: { products: ProductWithDetails[], total: number, page, limit }

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { PRODUCTS } from "@/lib/constants/products";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const category = sp.get("category");
    const spice    = sp.get("spice");
    const sort     = sp.get("sort") || "featured";
    const search   = sp.get("search")?.toLowerCase();
    const featured = sp.get("featured") === "true";
    const page     = Math.max(1, parseInt(sp.get("page")  || "1"));
    const limit    = Math.min(50, parseInt(sp.get("limit") || "12"));
    const from     = (page - 1) * limit;

    try {
      // ── Supabase path ─────────────────────────────────────────────
      const supabase = createAdminSupabaseClient();
      let query = supabase
        .from("products_with_details")
        .select("*", { count: "exact" })
        .eq("is_active", true);

      if (featured) query = query.eq("is_featured", true);
      if (spice)    query = query.eq("spice_level", spice);
      if (search)   query = query.ilike("name", `%${search}%`);

      if (category) {
        // Join via categories table
        const { data: cat } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", category)
          .single();
        if (cat) query = query.eq("category_id", cat.id);
      }

      // Sorting
      switch (sort) {
        case "price-asc":  query = query.order("min_effective_price", { ascending: true });  break;
        case "price-desc": query = query.order("min_effective_price", { ascending: false }); break;
        case "name":       query = query.order("name",       { ascending: true });  break;
        case "newest":     query = query.order("created_at", { ascending: false }); break;
        case "rating":     query = query.order("average_rating", { ascending: false }); break;
        default:           query = query.order("is_featured", { ascending: false }).order("name"); break;
      }

      const { data, count, error } = await query.range(from, from + limit - 1);
      if (error) throw error;

      // Fetch live variant prices for returned products
      const productIds = (data || []).map((p: any) => p.id);
      let variantsMap: Record<string, any[]> = {};
      if (productIds.length > 0) {
        const { data: variantsData } = await supabase
          .from("product_variants")
          .select("id, product_id, label, weight_grams, price, discounted_price, stock_quantity")
          .in("product_id", productIds)
          .eq("is_active", true)
          .order("weight_grams");
        for (const v of variantsData || []) {
          if (!variantsMap[v.product_id]) variantsMap[v.product_id] = [];
          variantsMap[v.product_id].push(v);
        }
      }

      const productsWithVariants = (data || []).map((p: any) => ({
        ...p,
        variants: variantsMap[p.id] || [],
      }));

      return NextResponse.json({
        products: productsWithVariants,
        total:    count || 0,
        page,
        limit,
        pages: Math.ceil((count || 0) / limit),
      });
    } catch {
      // ── Static fallback (Supabase not configured) ──────────────────
      let products = PRODUCTS.filter(p => {
        if (spice   && p.spice_level !== spice) return false;
        if (featured && !p.is_featured)         return false;
        if (search  && !p.name.toLowerCase().includes(search)) return false;
        return true;
      });

      // Sort
      if (sort === "price-asc")  products.sort((a, b) => a.variants[0].price - b.variants[0].price);
      if (sort === "price-desc") products.sort((a, b) => b.variants[0].price - a.variants[0].price);
      if (sort === "name")       products.sort((a, b) => a.name.localeCompare(b.name));

      const total   = products.length;
      const sliced  = products.slice(from, from + limit);

      // Map to shape expected by frontend
      const shaped = sliced.map(p => ({
        ...p,
        id:                 p.slug,
        is_active:          true,
        is_vegetarian:      true,
        average_rating:     4.8,
        review_count:       12,
        primary_image_url:  null,  // REPLACE with actual product image
        min_price:          p.variants[0].price,
        max_price:          p.variants[p.variants.length - 1].price,
        min_effective_price: p.variants[0].price,
        total_stock:        50,
        is_out_of_stock:    false,
        has_low_stock:      false,
        category_id:        null,
        created_at:         new Date().toISOString(),
        updated_at:         new Date().toISOString(),
      }));

      return NextResponse.json({ products: shaped, total, page, limit, pages: Math.ceil(total / limit) });
    }
  } catch (err: any) {
    console.error("[GET /api/products]", err.message);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

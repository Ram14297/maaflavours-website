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

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { PRODUCTS } from "@/lib/constants/products";
import { getOriginalPrice } from "@/lib/constants/launch-offer";

export async function GET(req: NextRequest) {
  noStore();
  try {
    const sp = req.nextUrl.searchParams;
    const category = sp.get("category");
    const type     = sp.get("type");   // 'pickle' | 'powder' | null
    const spice    = sp.get("spice");
    const sort     = sp.get("sort") || "featured";
    const search   = sp.get("search")?.toLowerCase();
    const featured = sp.get("featured") === "true";
    const page     = Math.max(1, parseInt(sp.get("page")  || "1"));
    const limit    = Math.min(50, parseInt(sp.get("limit") || "12"));
    const from     = (page - 1) * limit;

    try {
      // ── Supabase path — query products table directly (no view dependency) ──
      const supabase = createAdminSupabaseClient();

      let query = supabase
        .from("products")
        .select("*, product_images(url, alt, is_primary)", { count: "exact" })
        .eq("is_active", true);

      if (featured) query = query.eq("is_featured", true);
      if (type)     query = query.eq("product_type", type);
      if (spice)    query = query.eq("spice_level", spice);
      if (search)   query = query.ilike("name", `%${search}%`);

      if (category) {
        const { data: cat } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", category)
          .single();
        if (cat) query = query.eq("category_id", cat.id);
      }

      // Sorting
      switch (sort) {
        case "name":    query = query.order("name",       { ascending: true });  break;
        case "newest":  query = query.order("created_at", { ascending: false }); break;
        default:        query = query.order("is_featured", { ascending: false }).order("name"); break;
      }

      const { data: products, count, error } = await query.range(from, from + limit - 1);
      if (error) throw error;

      // Fetch active variants for returned products
      const productIds = (products || []).map((p: any) => p.id);
      let variantsMap: Record<string, any[]> = {};
      if (productIds.length > 0) {
        const { data: variantsData } = await supabase
          .from("product_variants")
          .select("id, product_id, label, weight_grams, price, discounted_price, stock_quantity, low_stock_threshold")
          .in("product_id", productIds)
          .eq("is_active", true)
          .order("weight_grams");
        for (const v of variantsData || []) {
          if (!variantsMap[v.product_id]) variantsMap[v.product_id] = [];
          variantsMap[v.product_id].push(v);
        }
        // Inject launch offer original prices
        for (const pid of Object.keys(variantsMap)) {
          const slug = (products || []).find((p: any) => p.id === pid)?.slug ?? "";
          variantsMap[pid] = variantsMap[pid].map((v: any) => ({
            ...v,
            compare_at_price: getOriginalPrice(slug, v.label) ?? null,
          }));
        }
      }

      // Shape products — compute price/stock fields inline
      const shaped = (products || []).map((p: any) => {
        const variants = variantsMap[p.id] || [];
        const prices   = variants.map((v: any) => v.discounted_price ?? v.price);
        const stocks   = variants.map((v: any) => v.stock_quantity ?? 0);
        const primaryImg = (p.product_images || []).find((i: any) => i.is_primary) || p.product_images?.[0];

        const minPrice = prices.length ? Math.min(...prices) : 0;
        const maxPrice = prices.length ? Math.max(...prices) : 0;
        const totalStock = stocks.reduce((a: number, b: number) => a + b, 0);
        const hasLowStock = variants.some((v: any) => v.stock_quantity > 0 && v.stock_quantity <= (v.low_stock_threshold ?? 5));
        const isOutOfStock = totalStock === 0;

        return {
          ...p,
          product_images:      undefined, // remove nested array from output
          primary_image_url:   primaryImg?.url  ?? null,
          primary_image_alt:   primaryImg?.alt  ?? null,
          variants,
          min_price:           minPrice,
          max_price:           maxPrice,
          min_effective_price: minPrice,
          total_stock:         totalStock,
          has_low_stock:       hasLowStock,
          is_out_of_stock:     isOutOfStock,
        };
      });

      // Client-side price sort (after variant merge)
      if (sort === "price-asc")  shaped.sort((a: any, b: any) => a.min_effective_price - b.min_effective_price);
      if (sort === "price-desc") shaped.sort((a: any, b: any) => b.min_effective_price - a.min_effective_price);

      return NextResponse.json({
        products: shaped,
        total:    count || 0,
        page,
        limit,
        pages: Math.ceil((count || 0) / limit),
      });

    } catch (supabaseErr: any) {
      console.error("[GET /api/products] Supabase error — falling back to static:", supabaseErr?.message);

      // ── Static fallback (Supabase not reachable) ──────────────────────────
      if (type === "powder") {
        return NextResponse.json({ products: [], total: 0, page, limit, pages: 0 });
      }
      let products = PRODUCTS.filter(p => {
        if (spice    && p.spice_level !== spice) return false;
        if (featured && !p.is_featured)          return false;
        if (search   && !p.name.toLowerCase().includes(search)) return false;
        return true;
      });

      if (sort === "price-asc")  products.sort((a, b) => a.variants[0].price - b.variants[0].price);
      if (sort === "price-desc") products.sort((a, b) => b.variants[0].price - a.variants[0].price);
      if (sort === "name")       products.sort((a, b) => a.name.localeCompare(b.name));

      const total  = products.length;
      const sliced = products.slice(from, from + limit);

      const shaped = sliced.map(p => ({
        ...p,
        id:                  p.slug,
        is_active:           true,
        is_vegetarian:       true,
        average_rating:      4.8,
        review_count:        12,
        primary_image_url:   null,
        min_price:           p.variants[0].price,
        max_price:           p.variants[p.variants.length - 1].price,
        min_effective_price: p.variants[0].price,
        total_stock:         50,
        is_out_of_stock:     false,
        has_low_stock:       false,
        category_id:         null,
        created_at:          new Date().toISOString(),
        updated_at:          new Date().toISOString(),
      }));

      return NextResponse.json({ products: shaped, total, page, limit, pages: Math.ceil(total / limit) });
    }
  } catch (err: any) {
    console.error("[GET /api/products]", err.message);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

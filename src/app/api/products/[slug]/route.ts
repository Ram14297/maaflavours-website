// src/app/api/products/[slug]/route.ts
// Maa Flavours — Single Product Detail API
// GET /api/products/[slug]
// Returns: { product, variants, images, related }

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { PRODUCTS } from "@/lib/constants/products";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  try {
    const supabase = createAdminSupabaseClient();

    // Fetch product
    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !product) throw new Error("not_found");

    // Fetch variants
    const { data: variants } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", product.id)
      .eq("is_active", true)
      .order("weight_grams");

    // Fetch images
    const { data: images } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", product.id)
      .order("sort_order");

    // Fetch approved reviews (latest 10)
    const { data: reviews } = await supabase
      .from("product_reviews")
      .select("id, rating, title, body, customer_name, customer_city, is_verified_purchase, is_featured, created_at")
      .eq("product_id", product.id)
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(10);

    // Fetch related products (same category, limit 4)
    const { data: related } = await supabase
      .from("products_with_details")
      .select("id, slug, name, spice_level, tag, primary_image_url, min_price, min_effective_price")
      .eq("is_active", true)
      .eq("category_id", product.category_id)
      .neq("id", product.id)
      .limit(4);

    return NextResponse.json({
      product,
      variants:   variants   || [],
      images:     images     || [],
      reviews:    reviews    || [],
      related:    related    || [],
    });

  } catch (err: any) {
    if (err.message === "not_found") {
      // ── Static fallback ──────────────────────────────────────────
      const staticProduct = PRODUCTS.find(p => p.slug === slug);
      if (!staticProduct) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      return NextResponse.json({
        product: {
          id:                staticProduct.slug,
          slug:              staticProduct.slug,
          name:              staticProduct.name,
          subtitle:          staticProduct.subtitle,
          tag:               staticProduct.tag,
          spice_level:       staticProduct.spice_level,
          short_description: staticProduct.short_description,
          description:       staticProduct.description,
          ingredients:       staticProduct.ingredients,
          shelf_life_days:   staticProduct.shelf_life_days,
          is_vegetarian:     true,
          is_active:         true,
          is_featured:       staticProduct.is_featured,
          average_rating:    4.8,
          review_count:      12,
        },
        variants: staticProduct.variants.map((v, i) => ({
          id:              `${staticProduct.slug}-${i}`,
          product_id:      staticProduct.slug,
          weight_grams:    v.weight_grams,
          label:           v.label,
          sku:             `MF-${staticProduct.slug.toUpperCase()}-${v.weight_grams}`,
          price:           v.price,
          discounted_price: null,
          stock_quantity:  50,
          is_active:       true,
        })),
        images: [],   // REPLACE with actual product images
        reviews: MOCK_REVIEWS.filter(r => r.product_slug === slug || MOCK_REVIEWS.indexOf(r) < 3),
        related: PRODUCTS
          .filter(p => p.slug !== slug)
          .slice(0, 4)
          .map(p => ({
            id: p.slug, slug: p.slug, name: p.name,
            spice_level: p.spice_level, tag: p.tag,
            primary_image_url: null,  // REPLACE
            min_price: p.variants[0].price,
            min_effective_price: p.variants[0].price,
          })),
      });
    }

    console.error("[GET /api/products/[slug]]", err.message);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

// ─── Mock reviews for static fallback ────────────────────────────────────
const MOCK_REVIEWS = [
  {
    id: "r1", rating: 5, title: "Exactly like homemade!",
    body: "The drumstick pickle takes me back to my grandmother's kitchen. Perfectly spiced, the oil is rich and flavourful. Ordered again already.",
    customer_name: "Priya Reddy", customer_city: "Hyderabad",
    is_verified_purchase: true, is_featured: true,
    product_slug: "drumstick-pickle",
    created_at: "2025-06-15T10:00:00Z",
  },
  {
    id: "r2", rating: 5, title: "Best gongura I've had outside Andhra",
    body: "I've been searching for authentic gongura since I moved to Bangalore. Maa Flavours is the real deal — tangy, spicy, perfectly made.",
    customer_name: "Venkat Rao", customer_city: "Bangalore",
    is_verified_purchase: true, is_featured: true,
    product_slug: "pulihora-gongura",
    created_at: "2025-06-20T10:00:00Z",
  },
  {
    id: "r3", rating: 4, title: "Great quality, fast delivery",
    body: "The amla pickle is fresh and well-made. Not too oily, spice level is just right. Will definitely order more.",
    customer_name: "Anitha Kumar", customer_city: "Chennai",
    is_verified_purchase: true, is_featured: false,
    product_slug: "amla-pickle",
    created_at: "2025-07-01T10:00:00Z",
  },
];

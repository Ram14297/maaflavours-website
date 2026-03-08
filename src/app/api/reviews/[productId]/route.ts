// src/app/api/reviews/[productId]/route.ts
// Maa Flavours — Product Reviews API
// GET /api/reviews/[productId]?page=1&limit=10&sort=newest|helpful
//   Returns paginated approved reviews for a product
// POST /api/reviews/[productId]
//   Body: { rating, title?, body, orderId? }
//   Submits a new review (requires auth)

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient, createServerClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  const { productId } = params;
  const sp    = req.nextUrl.searchParams;
  const page  = Math.max(1, parseInt(sp.get("page")  || "1"));
  const limit = Math.min(20, parseInt(sp.get("limit") || "10"));
  const sort  = sp.get("sort") || "newest";
  const from  = (page - 1) * limit;

  try {
    const supabase = createAdminSupabaseClient();

    // Resolve productId — could be a UUID or a slug
    let resolvedId = productId;
    if (!productId.includes("-00")) {
      // Looks like a slug, not a UUID
      const { data: p } = await supabase
        .from("products")
        .select("id")
        .eq("slug", productId)
        .single();
      if (p) resolvedId = p.id;
    }

    let query = supabase
      .from("product_reviews")
      .select(
        "id, rating, title, body, customer_name, customer_city, is_verified_purchase, helpful_count, created_at",
        { count: "exact" }
      )
      .eq("product_id", resolvedId)
      .eq("is_approved", true);

    if (sort === "helpful") {
      query = query.order("helpful_count", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, count, error } = await query.range(from, from + limit - 1);
    if (error) throw error;

    // Compute rating distribution
    const { data: dist } = await supabase
      .from("product_reviews")
      .select("rating")
      .eq("product_id", resolvedId)
      .eq("is_approved", true);

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    (dist || []).forEach(r => { distribution[r.rating] = (distribution[r.rating] || 0) + 1; });

    return NextResponse.json({
      reviews:      data || [],
      total:        count || 0,
      page,
      limit,
      distribution,
    });
  } catch (err: any) {
    // Return empty on any error (reviews are not critical for page load)
    return NextResponse.json({ reviews: [], total: 0, page, limit, distribution: {} });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;
    const body = await req.json();
    const { rating, title, body: reviewBody, orderId } = body;

    // Validate
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }
    if (!reviewBody || reviewBody.trim().length < 10) {
      return NextResponse.json({ error: "Review must be at least 10 characters" }, { status: 400 });
    }

    // Require auth
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Login required to submit a review" }, { status: 401 });
    }

    // Get customer details
    const adminClient = createAdminSupabaseClient();
    const { data: customer } = await adminClient
      .from("customers")
      .select("name, email")
      .eq("id", user.id)
      .single();

    // Resolve product UUID from slug if needed
    let resolvedProductId = productId;
    if (!productId.includes("-00")) {
      const { data: p } = await adminClient
        .from("products").select("id").eq("slug", productId).single();
      if (p) resolvedProductId = p.id;
    }

    // Check if already reviewed
    const { data: existing } = await adminClient
      .from("product_reviews")
      .select("id")
      .eq("customer_id", user.id)
      .eq("product_id", resolvedProductId)
      .single();

    if (existing) {
      return NextResponse.json({ error: "You have already reviewed this product" }, { status: 409 });
    }

    // Check if verified purchase (order with this product in delivered status)
    let isVerified = false;
    if (orderId) {
      const { data: order } = await adminClient
        .from("orders")
        .select("id, status")
        .eq("id", orderId)
        .eq("customer_id", user.id)
        .eq("status", "delivered")
        .single();
      isVerified = !!order;
    }

    const { data: review, error } = await adminClient
      .from("product_reviews")
      .insert({
        product_id:           resolvedProductId,
        customer_id:          user.id,
        order_id:             orderId || null,
        rating:               Number(rating),
        title:                title?.trim() || null,
        body:                 reviewBody.trim(),
        customer_name:        customer?.name || "Customer",
        customer_city:        null,
        is_verified_purchase: isVerified,
        is_approved:          false,  // Admin must approve before showing
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Review submitted! It will appear after approval.",
      review,
    }, { status: 201 });

  } catch (err: any) {
    console.error("[POST /api/reviews]", err.message);
    return NextResponse.json({ error: err.message || "Failed to submit review" }, { status: 500 });
  }
}

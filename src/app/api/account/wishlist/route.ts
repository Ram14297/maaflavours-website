// src/app/api/account/wishlist/route.ts
// Maa Flavours — Wishlist API
// Wishlist is stored server-side in Supabase customer settings JSONB.
// Reads the signed mf_session cookie — does NOT use Supabase auth (we don't
// run a Supabase auth session for our OTP-based flow).
//
// GET  /api/account/wishlist             → returns saved product slugs
// POST /api/account/wishlist             → { slug } — add to wishlist
// DELETE /api/account/wishlist?slug=xxx  → remove from wishlist

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { verifyCustomerSession } from "@/lib/customer-auth";
import { isAllowedOrigin } from "@/lib/origin-check";

// Helper: get wishlist from customer settings
async function getWishlistSlugs(customerId: string): Promise<string[]> {
  const admin = createAdminSupabaseClient();
  const { data } = await admin
    .from("settings")
    .select("value")
    .eq("key", `wishlist:${customerId}`)
    .single();
  const raw = data?.value;
  // Stored value can be a JSON string or an array — normalise both
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

// Helper: save wishlist to customer settings
async function saveWishlistSlugs(customerId: string, slugs: string[]): Promise<void> {
  const admin = createAdminSupabaseClient();
  await admin.from("settings").upsert({
    key: `wishlist:${customerId}`,
    value: JSON.stringify(slugs),
    description: "Customer wishlist product slugs",
  }, { onConflict: "key" });
}

export async function GET(req: NextRequest) {
  try {
    const session = await verifyCustomerSession(req);
    if (!session) return NextResponse.json({ slugs: [] });
    const slugs = await getWishlistSlugs(session.userId);
    return NextResponse.json({ slugs });
  } catch {
    return NextResponse.json({ slugs: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAllowedOrigin(req)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const session = await verifyCustomerSession(req);
    if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });

    const { slug } = await req.json();
    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "Product slug required" }, { status: 400 });
    }

    const slugs = await getWishlistSlugs(session.userId);
    if (!slugs.includes(slug)) {
      slugs.push(slug);
      await saveWishlistSlugs(session.userId, slugs);
    }

    return NextResponse.json({ slugs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!isAllowedOrigin(req)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const session = await verifyCustomerSession(req);
    if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });

    const slug = req.nextUrl.searchParams.get("slug");
    if (!slug) return NextResponse.json({ error: "Slug required" }, { status: 400 });

    const slugs = await getWishlistSlugs(session.userId);
    const updated = slugs.filter(s => s !== slug);
    await saveWishlistSlugs(session.userId, updated);

    return NextResponse.json({ slugs: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

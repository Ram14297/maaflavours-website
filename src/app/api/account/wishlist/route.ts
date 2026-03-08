// src/app/api/account/wishlist/route.ts
// Maa Flavours — Wishlist API
// Wishlist is stored server-side in Supabase customer settings JSONB
// Falls back to client-side localStorage for non-authenticated users
//
// GET  /api/account/wishlist             → returns saved product slugs
// POST /api/account/wishlist             → { slug } — add to wishlist
// DELETE /api/account/wishlist?slug=xxx  → remove from wishlist

import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createAdminSupabaseClient } from "@/lib/supabase/server";

// Helper: get wishlist from customer settings
async function getWishlistSlugs(customerId: string): Promise<string[]> {
  const admin = createAdminSupabaseClient();
  const { data } = await admin
    .from("settings")
    .select("value")
    .eq("key", `wishlist:${customerId}`)
    .single();
  return (data?.value as string[]) || [];
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
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ slugs: [] });

    const slugs = await getWishlistSlugs(user.id);
    return NextResponse.json({ slugs });
  } catch {
    return NextResponse.json({ slugs: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

    const { slug } = await req.json();
    if (!slug) return NextResponse.json({ error: "Product slug required" }, { status: 400 });

    const slugs = await getWishlistSlugs(user.id);
    if (!slugs.includes(slug)) {
      slugs.push(slug);
      await saveWishlistSlugs(user.id, slugs);
    }

    return NextResponse.json({ slugs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

    const slug = req.nextUrl.searchParams.get("slug");
    if (!slug) return NextResponse.json({ error: "Slug required" }, { status: 400 });

    const slugs = await getWishlistSlugs(user.id);
    const updated = slugs.filter(s => s !== slug);
    await saveWishlistSlugs(user.id, updated);

    return NextResponse.json({ slugs: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

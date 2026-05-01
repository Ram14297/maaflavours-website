// src/app/api/admin/hero-images/route.ts
// Manage which specific images appear in the homepage hero slideshow.
// Stored in the settings table as key="hero_images".
//
// GET  /api/admin/hero-images           — list current hero images (public-safe, no admin required)
// POST /api/admin/hero-images           — add an image { url, name }
// DELETE /api/admin/hero-images?url=... — remove an image by URL

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-auth";

const SETTINGS_KEY = "hero_images";

async function getHeroImages(supabase: ReturnType<typeof createAdminSupabaseClient>) {
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", SETTINGS_KEY)
    .single();
  return (data?.value?.images as { url: string; name: string }[]) || [];
}

// GET — no auth required (used by public HeroSection)
export async function GET() {
  try {
    const supabase = createAdminSupabaseClient();
    const images   = await getHeroImages(supabase);
    return NextResponse.json({ images });
  } catch (err: any) {
    return NextResponse.json({ images: [] });
  }
}

// POST { url, name } — add image to hero slideshow
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const { url, name } = await req.json();
    if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

    const supabase = createAdminSupabaseClient();
    const current  = await getHeroImages(supabase);

    // Avoid duplicates
    if (!current.some(img => img.url === url)) {
      current.push({ url, name: name || "" });
    }

    await supabase.from("settings").upsert(
      { key: SETTINGS_KEY, value: { images: current } },
      { onConflict: "key" }
    );

    return NextResponse.json({ images: current });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE ?url=... — remove image from hero slideshow
export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const url      = req.nextUrl.searchParams.get("url");
    if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

    const supabase = createAdminSupabaseClient();
    const current  = await getHeroImages(supabase);
    const updated  = current.filter(img => img.url !== url);

    await supabase.from("settings").upsert(
      { key: SETTINGS_KEY, value: { images: updated } },
      { onConflict: "key" }
    );

    return NextResponse.json({ images: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

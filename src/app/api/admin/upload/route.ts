// src/app/api/admin/upload/route.ts
// Maa Flavours — Admin Image Upload API
//
// POST /api/admin/upload   (JSON body)
//   { bucket, path }  →  { signedUrl, publicUrl, path }
//   Returns a short-lived signed upload URL.
//   The client uploads the file *directly* to Supabase Storage (no Vercel body limit).
//
// DELETE /api/admin/upload?path=xxx&bucket=yyy — remove an uploaded image

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-auth";

const ALLOWED_BUCKETS = ["product-images", "blog-images", "admin-uploads"];

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const body   = await req.json();
    const bucket = (body.bucket as string) || "product-images";
    const path   = body.path   as string | undefined;

    if (!path)   return NextResponse.json({ error: "path is required" }, { status: 400 });
    if (!ALLOWED_BUCKETS.includes(bucket))
      return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });

    const supabase = createAdminSupabaseClient();

    // Create a signed upload URL — file goes browser → Supabase directly,
    // never passes through Vercel so there is no function body-size cap.
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path, { upsert: true });

    if (error) throw error;

    // Compute the final public URL the caller needs after upload completes
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token:     data.token,
      path:      data.path,
      publicUrl,
    });

  } catch (err: any) {
    console.error("[admin/upload] signed-url error:", err.message);
    return NextResponse.json({ error: err.message || "Could not create upload URL" }, { status: 500 });
  }
}

// DELETE /api/admin/upload?path=xxx&bucket=yyy
export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const path   = req.nextUrl.searchParams.get("path");
  const bucket = req.nextUrl.searchParams.get("bucket") || "product-images";

  if (!path) return NextResponse.json({ error: "path required" }, { status: 400 });
  if (!ALLOWED_BUCKETS.includes(bucket))
    return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });

  try {
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

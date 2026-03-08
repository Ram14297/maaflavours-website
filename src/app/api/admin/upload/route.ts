// src/app/api/admin/upload/route.ts
// Maa Flavours — Admin Image Upload API
// POST /api/admin/upload
// Content-Type: multipart/form-data
// Fields:
//   - file: image file (JPEG/PNG/WebP, max 5MB)
//   - bucket: "product-images" | "blog-images"
//   - path: e.g. "products/drumstick-pickle/main.jpg"
// Returns: { url: string } — public Supabase Storage URL
// Protected: admin JWT required

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-auth";

const ALLOWED_TYPES   = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES  = 5 * 1024 * 1024;  // 5 MB

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file     = formData.get("file") as File | null;
    const bucket   = (formData.get("bucket") as string) || "product-images";
    const path     = formData.get("path") as string | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG and WebP images are allowed" }, { status: 400 });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "File size must be under 5 MB" }, { status: 400 });
    }

    // Validate bucket
    const allowedBuckets = ["product-images", "blog-images", "admin-uploads"];
    if (!allowedBuckets.includes(bucket)) {
      return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
    }

    // Build storage path: products/drumstick-pickle/1720000000000-main.jpg
    const ext      = file.type === "image/webp" ? "webp" : file.type === "image/png" ? "png" : "jpg";
    const filename = path || `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    const buffer   = await file.arrayBuffer();
    const supabase = createAdminSupabaseClient();

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, Buffer.from(buffer), {
        contentType:  file.type,
        cacheControl: "3600",
        upsert:       true,  // Overwrite if same path
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filename);

    return NextResponse.json({ url: publicUrl, path: filename, bucket });

  } catch (err: any) {
    console.error("[admin/upload]", err.message);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}

// DELETE /api/admin/upload?path=xxx&bucket=yyy — delete an uploaded image
export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const path   = req.nextUrl.searchParams.get("path");
  const bucket = req.nextUrl.searchParams.get("bucket") || "product-images";

  if (!path) return NextResponse.json({ error: "path required" }, { status: 400 });

  try {
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// src/app/api/settings/public/route.ts
// Public endpoint — returns non-sensitive business + social settings
// Used by Footer and other client components that need dynamic contact info

import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", ["business", "social"]);

    if (error) throw error;

    const result: Record<string, unknown> = {};
    for (const row of (data || [])) {
      result[row.key] = row.value;
    }

    return NextResponse.json(result, {
      headers: {
        // Cache 5 min on CDN, serve stale for 1 min while revalidating
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch {
    // Return empty object — Footer will fall back to SITE constants
    return NextResponse.json({});
  }
}

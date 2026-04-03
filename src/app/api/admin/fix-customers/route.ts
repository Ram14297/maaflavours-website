// TEMPORARY — one-time migration route. DELETE AFTER USE.
// POST /api/admin/fix-customers
// 1. Makes customers.mobile nullable (was NOT NULL, breaks email-auth signup)
// 2. Inserts missing customer rows for email-auth users

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  // Guard with admin token
  const token = request.cookies.get("mf-admin-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminSupabaseClient();
  const results: string[] = [];

  // ── 1. Make mobile nullable via raw SQL ──────────────────────────────
  const { error: alterErr } = await supabase.rpc("exec_sql" as any, {
    sql: "ALTER TABLE customers ALTER COLUMN mobile DROP NOT NULL;",
  });
  if (alterErr) {
    // Try direct approach if rpc not available
    results.push(`ALTER warning: ${alterErr.message}`);
  } else {
    results.push("ALTER TABLE: mobile is now nullable ✓");
  }

  // ── 2. Insert missing customer rows for known email-auth users ────────
  const missing = [
    { id: "281f01fe-e12d-4257-9841-c819bf9ba7b7", email: "raghuram14297@gmail.com",            name: "Ram" },
    { id: "5808b8a8-7f02-4028-ade3-7c9bbf5994e8", email: "raghuram.manchikalapati@gmail.com",  name: "" },
    { id: "30d9185b-1dd6-4f41-bad7-1b75adf7355b", email: "test@test.com",                      name: "" },
  ];

  for (const user of missing) {
    const { data: existing } = await supabase
      .from("customers")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (existing) {
      results.push(`${user.email}: already exists, skipping`);
      continue;
    }

    const { error } = await supabase.from("customers").insert({
      id:     user.id,
      email:  user.email,
      name:   user.name,
      mobile: null,
    });

    if (error) {
      results.push(`${user.email}: INSERT FAILED — ${error.message}`);
    } else {
      results.push(`${user.email}: inserted ✓`);
    }
  }

  return NextResponse.json({ results });
}

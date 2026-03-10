// src/app/api/auth/update-profile/route.ts
// Maa Flavours — Update New User Profile
// POST /api/auth/update-profile
// Called after OTP verification for new users to save name + email
// Body: { name: string, email?: string, mobile: string }
//
// Strategy: try UPDATE existing row → if no row found, INSERT using userId from session cookie
// IMPORTANT: Even if DB fails, return 200 and store name in cookie — never block login

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

const RequestSchema = z.object({
  mobile: z.string().regex(/^\+91[6-9]\d{9}$/),
  name: z.string().min(2).max(80).trim(),
  email: z.string().email().optional().or(z.literal("")),
});

const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export async function POST(request: NextRequest) {
  // ── Call cookies() at the TOP before any async work ──────────────────────
  const cookieStore = cookies();

  console.log("[update-profile] Request received");

  const body = await request.json().catch(() => ({}));
  const parsed = RequestSchema.safeParse(body);

  if (!parsed.success) {
    console.log("[update-profile] Validation failed:", parsed.error.issues);
    return NextResponse.json(
      { error: "Please provide a valid name (at least 2 characters)." },
      { status: 400 }
    );
  }

  const { mobile, name, email } = parsed.data;

  // ── Get userId from session cookie (set by verify-otp) ────────────────
  let userId: string | null = null;
  let existingSession: any = null;
  try {
    const sessionCookieVal = request.cookies.get("mf_session")?.value;
    console.log("[update-profile] mf_session cookie present:", !!sessionCookieVal);
    if (sessionCookieVal) {
      existingSession = JSON.parse(sessionCookieVal);
      userId = existingSession.userId || null;
      console.log("[update-profile] userId from cookie:", userId);
    }
  } catch { /* ignore */ }

  // ── Try to update/insert customer in DB ───────────────────────────────
  try {
    const supabase = createAdminSupabaseClient();

    // Step 1: Try UPDATE the existing row
    const { data: updated, error: updateError } = await supabase
      .from("customers")
      .update({
        name,
        email: email || null,
        updated_at: new Date().toISOString(),
      })
      .eq("mobile", mobile)
      .select("id");

    if (updateError) {
      console.error("[update-profile] UPDATE error:", JSON.stringify(updateError));
    }

    const rowsUpdated = updated?.length ?? 0;
    console.log("[update-profile] Rows updated:", rowsUpdated);

    // Step 2: If no existing row, INSERT using userId from session cookie
    if (rowsUpdated === 0 && userId) {
      console.log("[update-profile] No existing row — inserting:", { mobile, userId });

      const { error: insertError } = await supabase
        .from("customers")
        .insert({
          id: userId,
          mobile,
          name,
          email: email || null,
        });

      if (insertError) {
        console.error("[update-profile] INSERT error:", JSON.stringify(insertError));

        if (insertError.code === "23505") {
          // Duplicate key — row exists now, retry update
          await supabase
            .from("customers")
            .update({ name, email: email || null, updated_at: new Date().toISOString() })
            .eq("mobile", mobile);
          console.log("[update-profile] Resolved duplicate key via retry update");
        }
      } else {
        console.log("[update-profile] Insert succeeded");
      }
    }

    if (rowsUpdated === 0 && !userId) {
      console.warn("[update-profile] No userId in session and no existing row — profile saved to cookie only");
    }

  } catch (err: any) {
    console.error("[update-profile] DB error (non-fatal, proceeding):", err?.message || err);
  }

  // ── Re-set mf_session cookie with updated name ────────────────────────
  console.log("[update-profile] Updating mf_session cookie with name:", name);

  const updatedSession = {
    ...(existingSession || {}),
    userId:    userId || existingSession?.userId || "",
    mobile:    existingSession?.mobile || mobile,
    name,
    isNewUser: false,
    exp:       Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };

  // Use cookieStore (from next/headers, called at top) — most reliable in Next.js 14
  cookieStore.set("mf_session", JSON.stringify(updatedSession), {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   SESSION_MAX_AGE,
    path:     "/",
  });

  console.log("[update-profile] Cookie updated. Returning success.");

  return NextResponse.json({ success: true, name });
}

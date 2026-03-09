// src/app/api/auth/update-profile/route.ts
// Maa Flavours — Update New User Profile
// POST /api/auth/update-profile
// Called after OTP verification for new users to save name + email
// Body: { name: string, email?: string, mobile: string }
//
// Strategy: try UPDATE existing row → if no row found, INSERT using userId from session cookie
// IMPORTANT: Even if DB fails, return 200 and store name in cookie — never block login

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

const RequestSchema = z.object({
  mobile: z.string().regex(/^\+91[6-9]\d{9}$/),
  name: z.string().min(2).max(80).trim(),
  email: z.string().email().optional().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const parsed = RequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide a valid name (at least 2 characters)." },
      { status: 400 }
    );
  }

  const { mobile, name, email } = parsed.data;

  // ── Always build a success response — don't block login on DB failure ──
  const buildSuccessResponse = () => {
    const resp = NextResponse.json({ success: true, name });
    const existingSession = request.cookies.get("mf_session")?.value;
    if (existingSession) {
      try {
        const session = JSON.parse(existingSession);
        session.name = name;
        session.isNewUser = false;
        resp.cookies.set("mf_session", JSON.stringify(session), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
        });
      } catch { /* non-fatal */ }
    }
    return resp;
  };

  // ── Get userId from session cookie (set by verify-otp) ────────────────
  let userId: string | null = null;
  try {
    const sessionCookie = request.cookies.get("mf_session")?.value;
    if (sessionCookie) {
      userId = JSON.parse(sessionCookie).userId || null;
    }
  } catch { /* ignore */ }

  // ── Try to update/insert customer in DB ───────────────────────────────
  try {
    // Use admin client to bypass RLS policies
    const supabase = createAdminSupabaseClient();

    // Step 1: Try UPDATE the existing row (safest — no schema surprises)
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

    // Step 2: If no existing row, INSERT using userId from session cookie
    if (rowsUpdated === 0 && userId) {
      console.log("[update-profile] No existing row found, inserting new customer:", { mobile, userId });

      const { error: insertError } = await supabase
        .from("customers")
        .insert({
          id: userId,
          mobile,
          name,
          email: email || null,
        });

      if (insertError) {
        // Might conflict if row was created between our check and insert — try update again
        console.error("[update-profile] INSERT error:", JSON.stringify(insertError));

        if (insertError.code === "23505") {
          // Duplicate key — row exists now, retry update
          await supabase
            .from("customers")
            .update({ name, email: email || null, updated_at: new Date().toISOString() })
            .eq("mobile", mobile);
        }
      }
    }

    if (rowsUpdated === 0 && !userId) {
      console.warn("[update-profile] No userId in session and no existing row — profile saved to cookie only");
    }

  } catch (err: any) {
    // Log but never throw — login must succeed even if profile save fails
    console.error("[update-profile] DB error (non-fatal, proceeding):", err?.message || err);
  }

  return buildSuccessResponse();
}

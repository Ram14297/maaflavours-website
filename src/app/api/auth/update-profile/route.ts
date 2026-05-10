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
import {
  verifyCustomerSession,
  signCustomerSession,
  setCustomerSessionCookie,
} from "@/lib/customer-auth";
import { isAllowedOrigin } from "@/lib/origin-check";

const RequestSchema = z.object({
  email: z.string().email().optional().or(z.literal("")),
  name: z.string().min(2).max(80).trim(),
  mobile: z.string().regex(/^\+91[6-9]\d{9}$/).optional().nullable().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  console.log("[update-profile] Request received");

  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = RequestSchema.safeParse(body);

  if (!parsed.success) {
    console.log("[update-profile] Validation failed:", parsed.error.issues);
    return NextResponse.json(
      { error: "Please provide a valid name (at least 2 characters)." },
      { status: 400 }
    );
  }

  const { email, name, mobile } = parsed.data;

  // ── Get userId from signed session cookie (set by verify-otp) ─────────
  const existingSession = await verifyCustomerSession(request);
  if (!existingSession) {
    return NextResponse.json(
      { error: "Session expired. Please log in again." },
      { status: 401 }
    );
  }
  const userId = existingSession.userId;
  console.log("[update-profile] userId from cookie:", userId);

  // ── Try to update/insert customer in DB ───────────────────────────────
  try {
    const supabase = createAdminSupabaseClient();

    // Check if mobile is already used by a different account
    if (mobile) {
      const { data: existing } = await supabase
        .from("customers")
        .select("id")
        .eq("mobile", mobile)
        .neq("id", userId!)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          { error: "This phone number is already registered. Please use a different number." },
          { status: 409 }
        );
      }
    }

    // Step 1: Try UPDATE the existing row by userId
    // Only update mobile if a real value is provided (don't overwrite real mobile with placeholder)
    const updatePayload: Record<string, any> = {
      name,
      updated_at: new Date().toISOString(),
    };
    if (mobile) {
      updatePayload.mobile = mobile; // real mobile provided — update it
    }

    const { data: updated, error: updateError } = await supabase
      .from("customers")
      .update(updatePayload)
      .eq("id", userId!)
      .select("id");

    if (updateError) {
      console.error("[update-profile] UPDATE error:", JSON.stringify(updateError));
    }

    const rowsUpdated = updated?.length ?? 0;
    console.log("[update-profile] Rows updated:", rowsUpdated);

    // Step 2: If no existing row, INSERT using userId from session cookie
    if (rowsUpdated === 0 && userId) {
      console.log("[update-profile] No existing row — inserting:", { email, userId });

      // Use placeholder mobile if none provided (in case mobile NOT NULL constraint exists)
      const mobileForInsert = mobile || `_ph_${userId.replace(/-/g, "").substring(0, 16)}`;

      const { error: insertError } = await supabase
        .from("customers")
        .insert({
          id: userId,
          ...(email ? { email } : {}),
          name,
          mobile: mobileForInsert,
        });

      if (insertError) {
        console.error("[update-profile] INSERT error:", JSON.stringify(insertError));

        if (insertError.code === "23505") {
          // Duplicate key — row exists now, retry update
          await supabase
            .from("customers")
            .update({ name, mobile: mobile || null, updated_at: new Date().toISOString() })
            .eq("id", userId);
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

  // ── Re-issue signed mf_session cookie with updated name ──────────────
  console.log("[update-profile] Updating mf_session cookie with name:", name);

  const newToken = await signCustomerSession({
    userId,
    email:     existingSession.email || email || null,
    mobile:    mobile || existingSession.mobile || null,
    name,
    isNewUser: false,
  });

  const response = NextResponse.json({ success: true, name });
  setCustomerSessionCookie(response, newToken);

  console.log("[update-profile] Cookie set on response. Returning success.");

  return response;
}

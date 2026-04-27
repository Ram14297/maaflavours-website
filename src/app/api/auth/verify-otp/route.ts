// src/app/api/auth/verify-otp/route.ts
// Maa Flavours — Verify Email OTP + Create Session Cookie
// POST /api/auth/verify-otp
// Body: { email: string, otp: string }
// On success: upserts customer row, sets 30-day httpOnly mf_session cookie
// Returns: { success, isNewUser, user } | { error }

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient, createAdminSupabaseClient } from "@/lib/supabase/server";
import { signCustomerSession, setCustomerSessionCookie } from "@/lib/customer-auth";
import { isAllowedOrigin } from "@/lib/origin-check";

const RequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().regex(/^\d{6,8}$/, "OTP must be 6 or 8 digits"),
});

export async function POST(request: NextRequest) {
  console.log("[verify-otp] Request received");

  try {
    if (!isAllowedOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid OTP or email." },
        { status: 400 }
      );
    }

    const { email, otp } = parsed.data;

    // ─── 1. Verify OTP with Supabase ──────────────────────────────────────
    const supabase = createServerClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (error || !data.user) {
      console.log("[verify-otp] OTP verification failed:", error?.message);
      const isExpired = error?.message?.toLowerCase().includes("expired");
      return NextResponse.json(
        {
          error: isExpired
            ? "OTP has expired. Please request a new one."
            : "Incorrect OTP. Please check and try again.",
        },
        { status: 400 }
      );
    }

    const authUserId = data.user.id;
    console.log("[verify-otp] OTP verified for user:", authUserId);

    // ─── 2. Get or create customer row in Supabase ────────────────────────
    const adminSupa = createAdminSupabaseClient();

    const { data: existingCustomer, error: lookupErr } = await adminSupa
      .from("customers")
      .select("id, name, email, mobile")
      .eq("id", authUserId)
      .maybeSingle();

    if (lookupErr) {
      console.warn("[verify-otp] Customer lookup error:", lookupErr.message);
    }

    const isNewUser = !existingCustomer || !existingCustomer.name;

    // Note: customer row creation is deferred to update-profile (which handles
    // mobile correctly). Do not insert here — mobile NOT NULL would fail for
    // email-auth users who haven't provided a mobile yet.

    // ─── 3. Set signed session cookie (JWT — NOT raw JSON) ────────────────
    const token = await signCustomerSession({
      userId: authUserId,
      email,
      name: existingCustomer?.name || "",
      mobile: existingCustomer?.mobile || null,
      isNewUser,
    });

    const response = NextResponse.json({
      success: true,
      isNewUser,
      user: {
        id: authUserId,
        email,
        name: existingCustomer?.name || "",
        mobile: existingCustomer?.mobile || null,
      },
    });

    setCustomerSessionCookie(response, token);

    console.log("[verify-otp] Session cookie set. isNewUser:", isNewUser);
    return response;

  } catch (err: any) {
    console.error("[verify-otp] Unhandled error:", err);
    return NextResponse.json(
      { error: err.message || "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}

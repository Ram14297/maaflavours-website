// src/app/api/auth/verify-otp/route.ts
// Maa Flavours — Verify Email OTP + Create Session Cookie
// POST /api/auth/verify-otp
// Body: { email: string, otp: string }
// On success: upserts customer row, sets 30-day httpOnly mf_session cookie
// Returns: { success, isNewUser, user } | { error }

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient, createAdminSupabaseClient } from "@/lib/supabase/server";

const RequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
});

const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

export async function POST(request: NextRequest) {
  console.log("[verify-otp] Request received");

  try {
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
      const isExpired = error?.message?.toLowerCase().includes("expired") ||
                        error?.message?.toLowerCase().includes("invalid");
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

    if (!existingCustomer) {
      const { error: insertErr } = await adminSupa.from("customers").insert({
        id: authUserId,
        email,
        name: "",
        mobile: null,
        created_at: new Date().toISOString(),
      });
      if (insertErr) {
        console.warn("[verify-otp] Insert customer error:", insertErr.message);
      } else {
        console.log("[verify-otp] New customer created:", authUserId);
      }
    }

    // ─── 3. Set session cookie ─────────────────────────────────────────────
    const sessionPayload = JSON.stringify({
      userId: authUserId,
      email,
      name: existingCustomer?.name || "",
      isNewUser,
      exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
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

    response.cookies.set("mf_session", sessionPayload, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

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

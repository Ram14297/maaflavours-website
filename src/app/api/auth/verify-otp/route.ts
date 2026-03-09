// src/app/api/auth/verify-otp/route.ts
// Maa Flavours — Verify OTP + Create Session Cookie
// POST /api/auth/verify-otp
// Body: { mobile: string (10 digits), otp: string }
// On success: upserts customer row, sets 30-day httpOnly mf_session cookie
// Returns: { success, isNewUser, user } | { error }

import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { z } from "zod";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

const RequestSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/),
  otp: z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
});

const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid OTP or mobile number." },
        { status: 400 }
      );
    }

    const { mobile, otp } = parsed.data;
    const fullMobile = `+91${mobile}`;

    // ─── 1. Verify OTP with Twilio ────────────────────────────────────────
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken  = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    const isDevMode = !accountSid || !authToken || !serviceSid;

    if (isDevMode) {
      console.warn("[verify-otp] Dev mode — Twilio not configured, accepting any 6-digit OTP");
    } else {
      const client = twilio(accountSid, authToken);
      const verification = await client.verify.v2
        .services(serviceSid)
        .verificationChecks.create({ to: fullMobile, code: otp });

      if (verification.status !== "approved") {
        return NextResponse.json(
          {
            error: verification.status === "expired"
              ? "OTP has expired. Please request a new one."
              : "Incorrect OTP. Please check and try again.",
            status: verification.status,
          },
          { status: 400 }
        );
      }
    }

    // ─── 2. Get or create customer row in Supabase ────────────────────────
    // Always use admin client to bypass RLS
    const supabase = createAdminSupabaseClient();

    // Check if customer already exists
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id, name, email, mobile")
      .eq("mobile", fullMobile)
      .maybeSingle();

    const isNewUser = !existingCustomer || !existingCustomer.name;
    let customerId: string;

    if (existingCustomer) {
      // Existing customer — use their real UUID
      customerId = existingCustomer.id;
      console.log("[verify-otp] Existing customer found:", customerId);
    } else {
      // New customer — try Supabase admin to create auth user (gets real UUID)
      let authUserId: string | null = null;

      try {
        // Try admin API for a real Supabase-linked UUID
        const { data: listData } = await supabase.auth.admin.listUsers({
          page: 1, perPage: 1000,
        });
        const existingAuthUser = listData?.users?.find(
          (u) => u.phone === fullMobile
        );

        if (existingAuthUser) {
          authUserId = existingAuthUser.id;
        } else {
          const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
            phone: fullMobile,
            phone_confirm: true,
            user_metadata: { mobile: fullMobile },
          });
          if (!createErr && newUser?.user) {
            authUserId = newUser.user.id;
          }
        }
      } catch (adminErr) {
        console.warn("[verify-otp] Supabase admin API unavailable:", adminErr);
      }

      // If admin API failed, generate a proper UUID (not a temp string)
      if (!authUserId) {
        authUserId = crypto.randomUUID();
        console.log("[verify-otp] Using generated UUID (admin API unavailable):", authUserId);
      }

      customerId = authUserId;

      // Insert the new customer row
      const { error: insertErr } = await supabase.from("customers").insert({
        id: customerId,
        mobile: fullMobile,
        name: "",   // Will be filled by update-profile step
        email: null,
        created_at: new Date().toISOString(),
      });

      if (insertErr) {
        // Row might have been created between our check and insert — try to get it
        console.error("[verify-otp] Insert failed:", insertErr.message);
        const { data: retryCustomer } = await supabase
          .from("customers")
          .select("id")
          .eq("mobile", fullMobile)
          .maybeSingle();
        if (retryCustomer) {
          customerId = retryCustomer.id;
        }
      }
    }

    // ─── 3. Update OTP session status ─────────────────────────────────────
    try {
      await supabase
        .from("otp_sessions")
        .update({ status: "verified" })
        .eq("mobile", fullMobile)
        .eq("status", "sent");
    } catch { /* non-fatal */ }

    // ─── 4. Build session cookie ──────────────────────────────────────────
    const sessionPayload = JSON.stringify({
      userId:    customerId,           // Always a real UUID now
      mobile:    fullMobile,
      name:      existingCustomer?.name || "",
      isNewUser,
      exp:       Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
    });

    const response = NextResponse.json({
      success: true,
      isNewUser,
      user: {
        id:     customerId,
        mobile: fullMobile,
        name:   existingCustomer?.name || "",
        email:  existingCustomer?.email || null,
      },
    });

    response.cookies.set("mf_session", sessionPayload, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   SESSION_MAX_AGE,  // 30 days
      path:     "/",
    });

    return response;
  } catch (err: any) {
    console.error("[verify-otp] Error:", err);
    return NextResponse.json(
      { error: err.message || "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}

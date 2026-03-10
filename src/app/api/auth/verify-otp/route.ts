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
  console.log("[verify-otp] Request received");

  try {
    const body = await request.json();
    console.log("[verify-otp] Body parsed, mobile:", body?.mobile);

    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      console.log("[verify-otp] Validation failed:", parsed.error.issues);
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
      console.log("[verify-otp] Verifying OTP with Twilio for:", fullMobile);
      const client = twilio(accountSid, authToken);
      const verification = await client.verify.v2
        .services(serviceSid)
        .verificationChecks.create({ to: fullMobile, code: otp });

      console.log("[verify-otp] Twilio verification status:", verification.status);

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
    console.log("[verify-otp] Looking up customer in DB for:", fullMobile);
    const supabase = createAdminSupabaseClient();

    const { data: existingCustomer, error: lookupErr } = await supabase
      .from("customers")
      .select("id, name, email, mobile")
      .eq("mobile", fullMobile)
      .maybeSingle();

    if (lookupErr) {
      console.error("[verify-otp] Customer lookup error:", lookupErr.message);
    } else {
      console.log("[verify-otp] Customer lookup result:", existingCustomer ? `found id=${existingCustomer.id}` : "not found");
    }

    const isNewUser = !existingCustomer || !existingCustomer.name;
    let customerId: string;

    if (existingCustomer) {
      customerId = existingCustomer.id;
      console.log("[verify-otp] Using existing customer:", customerId);
    } else {
      let authUserId: string | null = null;

      try {
        console.log("[verify-otp] Trying Supabase admin API to create auth user");
        const { data: listData } = await supabase.auth.admin.listUsers({
          page: 1, perPage: 1000,
        });
        const existingAuthUser = listData?.users?.find(
          (u) => u.phone === fullMobile
        );

        if (existingAuthUser) {
          authUserId = existingAuthUser.id;
          console.log("[verify-otp] Found existing auth user:", authUserId);
        } else {
          const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
            phone: fullMobile,
            phone_confirm: true,
            user_metadata: { mobile: fullMobile },
          });
          if (createErr) {
            console.warn("[verify-otp] createUser error:", createErr.message);
          } else if (newUser?.user) {
            authUserId = newUser.user.id;
            console.log("[verify-otp] Created new auth user:", authUserId);
          }
        }
      } catch (adminErr) {
        console.warn("[verify-otp] Supabase admin API unavailable:", adminErr);
      }

      if (!authUserId) {
        authUserId = crypto.randomUUID();
        console.log("[verify-otp] Using generated UUID:", authUserId);
      }

      customerId = authUserId;

      console.log("[verify-otp] Inserting new customer row:", { customerId, fullMobile });
      const { error: insertErr } = await supabase.from("customers").insert({
        id: customerId,
        mobile: fullMobile,
        name: "",
        email: null,
        created_at: new Date().toISOString(),
      });

      if (insertErr) {
        console.error("[verify-otp] Insert failed:", insertErr.message, insertErr.code);
        const { data: retryCustomer } = await supabase
          .from("customers")
          .select("id")
          .eq("mobile", fullMobile)
          .maybeSingle();
        if (retryCustomer) {
          customerId = retryCustomer.id;
          console.log("[verify-otp] Recovered customer id on retry:", customerId);
        }
      } else {
        console.log("[verify-otp] Customer inserted successfully");
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

    // ─── 4. Set session cookie via next/headers ───────────────────────────
    const sessionPayload = JSON.stringify({
      userId:    customerId,
      mobile:    fullMobile,
      name:      existingCustomer?.name || "",
      isNewUser,
      exp:       Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
    });

    console.log("[verify-otp] Setting mf_session cookie for userId:", customerId);

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

    // Set cookie directly on the response object — reliable in Next.js 14 Route Handlers
    response.cookies.set("mf_session", sessionPayload, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   SESSION_MAX_AGE,
      path:     "/",
    });

    console.log("[verify-otp] Cookie set on response. isNewUser:", isNewUser);

    return response;
  } catch (err: any) {
    console.error("[verify-otp] Unhandled error:", err);
    return NextResponse.json(
      { error: err.message || "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}

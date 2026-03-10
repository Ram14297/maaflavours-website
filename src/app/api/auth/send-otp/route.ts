// src/app/api/auth/send-otp/route.ts
// Maa Flavours — Send OTP via Twilio Verify API
// POST /api/auth/send-otp
// Body: { mobile: string }  (10-digit Indian number, no +91)
// Rate limiting: max 3 OTPs per mobile per hour via Supabase otp_sessions table
// Returns: { success: true, maskedMobile } | { error: string }

import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";

// ─── Request schema ──────────────────────────────────────────────────────────
const RequestSchema = z.object({
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number"),
});

// ─── Mask mobile for display ─────────────────────────────────────────────────
function maskMobile(mobile: string): string {
  return `+91 ${mobile.slice(0, 5)} ${"●".repeat(5)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }

    const { mobile } = parsed.data;
    const fullMobile = `+91${mobile}`;

    // ─── 1. Rate limiting check via Supabase ──────────────────────────────
    try {
      const supabase = await createServerClient();
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      const { count } = await supabase
        .from("otp_sessions")
        .select("id", { count: "exact" })
        .eq("mobile", fullMobile)
        .gte("created_at", oneHourAgo);

      if ((count || 0) >= 3) {
        return NextResponse.json(
          {
            error:
              "Too many OTP requests. Please wait 1 hour before trying again.",
            rateLimited: true,
          },
          { status: 429 }
        );
      }

      // Log this OTP request for rate limiting
      await supabase.from("otp_sessions").insert({
        mobile: fullMobile,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10min
        status: "sent",
      });
    } catch {
      // Supabase not configured yet — skip rate limiting in dev
    }

    // ─── 2. Send OTP via Twilio Verify ───────────────────────────────────
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    // Dev mode: only when Twilio creds are missing
    if (!accountSid || !serviceSid) {
      console.warn(
        "[send-otp] Twilio credentials not configured. Simulating OTP send in dev mode."
      );
      return NextResponse.json({
        success: true,
        maskedMobile: maskMobile(mobile),
      });
    }

    const client = twilio(accountSid, authToken);

    await client.verify.v2.services(serviceSid).verifications.create({
      to: fullMobile,
      channel: "sms",
      customMessage:
        `Your Maa Flavours verification code is {{code}}. ` +
        `Valid for 10 minutes. Do not share with anyone.`,
    });

    return NextResponse.json({
      success: true,
      maskedMobile: maskMobile(mobile),
    });
  } catch (err: any) {
    console.error("[send-otp] Error:", err);

    // Twilio-specific errors
    if (err?.code === 60200) {
      return NextResponse.json(
        { error: "Invalid phone number. Please check and try again." },
        { status: 400 }
      );
    }
    if (err?.code === 60203) {
      return NextResponse.json(
        {
          error: "Max OTP attempts exceeded for this number. Try after 10 minutes.",
          rateLimited: true,
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}

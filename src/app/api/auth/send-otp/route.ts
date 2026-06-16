// src/app/api/auth/send-otp/route.ts
// Maa Flavours — Send OTP via Fast2SMS (mobile-first auth)
// POST /api/auth/send-otp
// Body: { mobile: string }  — 10-digit Indian number (without +91)
// Returns: { success: true, maskedMobile } | { error: string }

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createHash } from "crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { notifyCustomerSMS } from "@/lib/notify-customer";
import { isAllowedOrigin } from "@/lib/origin-check";

const RequestSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Invalid mobile number"),
});

function maskMobile(mobile: string): string {
  return mobile.slice(0, 2) + "***" + mobile.slice(-4);
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOtp(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    if (!isAllowedOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Enter a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }

    const mobile = `+91${parsed.data.mobile}`;
    const supabase = createAdminSupabaseClient();

    // Clean up expired OTPs to keep the table tidy
    await supabase
      .from("otp_sessions")
      .delete()
      .lt("expires_at", new Date().toISOString());

    // Rate limit: max 3 OTP sends per mobile per 10-minute window
    const { count } = await supabase
      .from("otp_sessions")
      .select("id", { count: "exact", head: true })
      .eq("mobile", mobile)
      .gt("expires_at", new Date().toISOString());

    if ((count ?? 0) >= 3) {
      return NextResponse.json(
        { error: "Too many OTP requests. Please wait a few minutes and try again." },
        { status: 429 }
      );
    }

    // Generate OTP, hash it, store in DB
    const otp = generateOtp();
    const { error: insertError } = await supabase
      .from("otp_sessions")
      .insert({ mobile, otp_hash: hashOtp(otp) });

    if (insertError) {
      console.error("[send-otp] Insert error:", insertError.message);
      return NextResponse.json(
        { error: "Failed to send OTP. Please try again." },
        { status: 500 }
      );
    }

    // Send via Fast2SMS (non-fatal if it fails — notifyCustomerSMS never throws)
    await notifyCustomerSMS(
      mobile,
      `Your Maa Flavours login OTP is: ${otp}\nValid for 10 minutes. Do not share.`
    );

    return NextResponse.json({
      success: true,
      maskedMobile: maskMobile(parsed.data.mobile),
    });
  } catch (err: any) {
    console.error("[send-otp] Error:", err);
    return NextResponse.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}

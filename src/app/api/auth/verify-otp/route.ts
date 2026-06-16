// src/app/api/auth/verify-otp/route.ts
// Maa Flavours — Verify Mobile OTP + Create Session Cookie
// POST /api/auth/verify-otp
// Body: { mobile: string, otp: string }
// On success: sets 30-day httpOnly mf_session cookie
// Returns: { success, isNewUser, user } | { error }

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createHash, randomUUID } from "crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { signCustomerSession, setCustomerSessionCookie } from "@/lib/customer-auth";
import { isAllowedOrigin } from "@/lib/origin-check";

const RequestSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Invalid mobile number"),
  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
});

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
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const { mobile: mobileRaw, otp } = parsed.data;
    const mobile = `+91${mobileRaw}`;
    const supabase = createAdminSupabaseClient();

    // Find the latest valid, unverified OTP session for this mobile
    const { data: session, error: sessionErr } = await supabase
      .from("otp_sessions")
      .select("id, otp_hash, attempt_count")
      .eq("mobile", mobile)
      .eq("is_verified", false)
      .gt("expires_at", new Date().toISOString())
      .lt("attempt_count", 5)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sessionErr || !session) {
      return NextResponse.json(
        { error: "OTP has expired or is no longer valid. Please request a new one." },
        { status: 400 }
      );
    }

    // Verify hash
    if (session.otp_hash !== hashOtp(otp)) {
      await supabase
        .from("otp_sessions")
        .update({ attempt_count: session.attempt_count + 1 })
        .eq("id", session.id);

      const remaining = 4 - session.attempt_count;
      return NextResponse.json(
        { error: `Incorrect OTP. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.` },
        { status: 400 }
      );
    }

    // Mark session as verified
    await supabase
      .from("otp_sessions")
      .update({ is_verified: true })
      .eq("id", session.id);

    // Look up existing customer by mobile
    const { data: customer } = await supabase
      .from("customers")
      .select("id, name, email, mobile")
      .eq("mobile", mobile)
      .maybeSingle();

    const isNewUser = !customer || !customer.name;
    const userId = customer?.id ?? randomUUID();

    const token = await signCustomerSession({
      userId,
      mobile,
      email: customer?.email || null,
      name: customer?.name || "",
      isNewUser,
    });

    const response = NextResponse.json({
      success: true,
      isNewUser,
      user: {
        id: userId,
        mobile,
        name: customer?.name || "",
        email: customer?.email || null,
      },
    });

    setCustomerSessionCookie(response, token);
    return response;

  } catch (err: any) {
    console.error("[verify-otp] Error:", err);
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}

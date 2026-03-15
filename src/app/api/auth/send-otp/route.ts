// src/app/api/auth/send-otp/route.ts
// Maa Flavours — Send OTP via Supabase Email Auth (free)
// POST /api/auth/send-otp
// Body: { email: string }
// Returns: { success: true, maskedEmail } | { error: string }

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";

const RequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  const masked = local.slice(0, 2) + "***";
  return `${masked}@${domain}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const supabase = createServerClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    if (error) {
      console.error("[send-otp] Supabase error:", error.message, error.status);
      // Rate limit: Supabase allows ~3 OTP emails per hour per address
      if (error.message?.toLowerCase().includes("rate") || error.status === 429) {
        return NextResponse.json(
          { error: "Too many OTP requests. Please wait a few minutes and try again." },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: `Failed to send OTP: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      maskedEmail: maskEmail(email),
    });
  } catch (err: any) {
    console.error("[send-otp] Error:", err);
    return NextResponse.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}

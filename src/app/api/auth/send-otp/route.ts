// src/app/api/auth/send-otp/route.ts
// Maa Flavours — Send Email OTP via Resend (no Supabase auth dependency)
// POST /api/auth/send-otp
// Body: { email: string }
// Returns: { success: true, maskedEmail } | { error: string }
//
// NOTE: otp_sessions.mobile column stores the email identifier (TEXT is generic)

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createHash } from "crypto";
import { Resend } from "resend";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { isAllowedOrigin } from "@/lib/origin-check";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Maa Flavours <orders@maaflavours.com>";

const RequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  return local.slice(0, 2) + "***@" + domain;
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOtp(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

function otpEmailHtml(otp: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#FAFAF5;font-family:'Lato',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(74,44,10,0.08);">
          <!-- Header -->
          <tr>
            <td align="center" style="background:#4A2C0A;padding:28px 24px 20px;">
              <p style="margin:0;font-family:Georgia,serif;font-size:28px;color:#E8B84B;letter-spacing:1px;">Maa Flavours</p>
              <p style="margin:6px 0 0;font-size:11px;color:#C8960C;letter-spacing:2px;text-transform:uppercase;">Authentic Andhra Pickles</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 32px;">
              <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#4A2C0A;">Your Login OTP</p>
              <p style="margin:0 0 28px;font-size:15px;color:#6B7280;">Use this 6-digit code to sign in:</p>
              <!-- OTP box -->
              <div style="background:#FAFAF5;border:2px solid #E8B84B;border-radius:10px;text-align:center;padding:24px 16px;margin-bottom:28px;">
                <span style="font-family:'Courier New',Courier,monospace;font-size:42px;font-weight:700;letter-spacing:8px;color:#4A2C0A;">${otp}</span>
              </div>
              <p style="margin:0 0 8px;font-size:13px;color:#6B7280;">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
              <p style="margin:0;font-size:13px;color:#9CA3AF;">If you didn't request this, you can safely ignore this email.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#F9F5EF;padding:16px 40px;border-top:1px solid #F3EAD8;">
              <p style="margin:0;font-size:12px;color:#9CA3AF;text-align:center;">— Maa Flavours Team &nbsp;|&nbsp; maaflavours.com</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
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
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const supabase = createAdminSupabaseClient();

    // Clean up expired OTPs
    await supabase
      .from("otp_sessions")
      .delete()
      .lt("expires_at", new Date().toISOString());

    // Rate limit: max 3 OTP sends per email per 10-minute window
    const { count } = await supabase
      .from("otp_sessions")
      .select("id", { count: "exact", head: true })
      .eq("mobile", email)  // mobile col stores the identifier (email here)
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
      .insert({ mobile: email, otp_hash: hashOtp(otp) });

    if (insertError) {
      console.error("[send-otp] Insert error:", insertError.message);
      return NextResponse.json(
        { error: "Failed to send OTP. Please try again." },
        { status: 500 }
      );
    }

    // Send via Resend
    const { error: emailError } = await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Your Maa Flavours OTP Code",
      html: otpEmailHtml(otp),
    });

    if (emailError) {
      console.error("[send-otp] Resend error:", emailError);
      // Clean up the DB row so user can retry
      await supabase.from("otp_sessions").delete().eq("mobile", email).eq("otp_hash", hashOtp(otp));
      return NextResponse.json(
        { error: "Failed to send OTP email. Please try again." },
        { status: 500 }
      );
    }

    console.log("[send-otp] OTP sent to:", maskEmail(email));

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

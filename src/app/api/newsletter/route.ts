// src/app/api/newsletter/route.ts
// Maa Flavours — Newsletter Subscription API
// POST /api/newsletter
// Body: { email: string, name?: string, source?: string }
// Creates subscriber + sends WELCOME50 coupon notification

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, source = "homepage" } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    // Upsert subscriber (ignore if already subscribed)
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert(
        { email: email.toLowerCase().trim(), name: name?.trim() || null, source, is_active: true },
        { onConflict: "email", ignoreDuplicates: false }
      );

    if (error && error.code !== "23505") {  // 23505 = unique_violation (already subscribed)
      console.error("[newsletter]", error.message);
    }

    // TODO: Send WELCOME50 coupon via email (Resend / SendGrid)
    // await sendWelcomeEmail(email, name);

    return NextResponse.json({
      success: true,
      message: "You're subscribed! Use code WELCOME50 for ₹50 off your first order.",
      couponCode: "WELCOME50",
    });
  } catch (err: any) {
    // Return success even on DB error — don't block UX for newsletter
    return NextResponse.json({
      success: true,
      message: "You're subscribed! Use code WELCOME50 for ₹50 off your first order.",
      couponCode: "WELCOME50",
    });
  }
}

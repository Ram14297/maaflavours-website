// src/app/api/auth/update-profile/route.ts
// Maa Flavours — Update New User Profile (name + optional email)
// POST /api/auth/update-profile
// Called after OTP verification for new users, and from account settings page.
// Body: { name: string, email?: string }
// Mobile comes from the signed session cookie — never trusted from body.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import {
  verifyCustomerSession,
  signCustomerSession,
  setCustomerSessionCookie,
} from "@/lib/customer-auth";
import { isAllowedOrigin } from "@/lib/origin-check";

const RequestSchema = z.object({
  name: z.string().min(2).max(80).trim(),
  email: z.string().email("Please enter a valid email address."),
});

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = RequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide a valid name (at least 2 characters)." },
      { status: 400 }
    );
  }

  const { name, email } = parsed.data;

  const existingSession = await verifyCustomerSession(request);
  if (!existingSession) {
    return NextResponse.json(
      { error: "Session expired. Please log in again." },
      { status: 401 }
    );
  }

  const { userId, mobile } = existingSession;

  try {
    const supabase = createAdminSupabaseClient();

    const updatePayload: Record<string, any> = {
      name,
      updated_at: new Date().toISOString(),
      ...(email ? { email } : {}),
    };

    const { data: updated } = await supabase
      .from("customers")
      .update(updatePayload)
      .eq("id", userId!)
      .select("id");

    // No existing row — insert using userId + mobile from session
    if (!updated?.length && userId && mobile) {
      await supabase.from("customers").insert({
        id: userId,
        mobile,
        name,
        ...(email ? { email } : {}),
      });
    }
  } catch (err: any) {
    console.error("[update-profile] DB error (non-fatal):", err?.message);
  }

  const newToken = await signCustomerSession({
    userId,
    mobile,
    email: email || existingSession.email || null,
    name,
    isNewUser: false,
  });

  const response = NextResponse.json({ success: true, name });
  setCustomerSessionCookie(response, newToken);
  return response;
}

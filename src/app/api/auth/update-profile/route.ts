// src/app/api/auth/update-profile/route.ts
// Maa Flavours — Update New User Profile
// POST /api/auth/update-profile
// Called after OTP verification for new users to save name + email
// Body: { name: string, email?: string, mobile: string }

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";

const RequestSchema = z.object({
  mobile: z.string().regex(/^\+91[6-9]\d{9}$/),
  name: z.string().min(2).max(80).trim(),
  email: z.string().email().optional().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please provide a valid name." },
        { status: 400 }
      );
    }

    const { mobile, name, email } = parsed.data;

    const supabase = await createServerClient();

    // Upsert the customer record — handles both new signups and existing users
    const { error } = await supabase
      .from("customers")
      .upsert(
        {
          mobile,
          name: name,
          email: email || null,
          is_new_user: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "mobile" }
      );

    if (error) {
      throw new Error("Failed to update profile");
    }

    // Also update Supabase auth user metadata
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.auth.updateUser({
          data: { name: name, email },
        });
      }
    } catch { /* non-fatal — auth user metadata update */ }

    // Update session cookie
    const sessionResponse = NextResponse.json({ success: true, name });
    const existingSession = request.cookies.get("mf_session")?.value;
    if (existingSession) {
      try {
        const session = JSON.parse(existingSession);
        session.name = name;
        session.isNewUser = false;
        sessionResponse.cookies.set("mf_session", JSON.stringify(session), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
        });
      } catch { /* non-fatal */ }
    }

    return sessionResponse;
  } catch (err: any) {
    console.error("[update-profile] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save profile. Please try again." },
      { status: 500 }
    );
  }
}

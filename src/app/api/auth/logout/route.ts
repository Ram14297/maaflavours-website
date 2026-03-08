// src/app/api/auth/logout/route.ts
// Maa Flavours — Logout
// POST /api/auth/logout
// Clears session cookie + signs out Supabase session

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createServerClient();
    await supabase.auth.signOut();
  } catch { /* non-fatal */ }

  const response = NextResponse.json({ success: true });

  // Clear session cookie
  response.cookies.set("mf_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}

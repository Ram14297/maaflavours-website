// src/app/api/auth/me/route.ts
// Maa Flavours — Get current logged-in user from session cookie
// GET /api/auth/me
// Reads mf_session cookie, returns user info or { user: null }

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("mf_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ user: null });
    }

    const session = JSON.parse(sessionCookie);

    // Check expiry
    if (session.exp && session.exp < Math.floor(Date.now() / 1000)) {
      return NextResponse.json({ user: null });
    }

    if (!session.userId || session.isNewUser) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: session.userId,
        mobile: session.mobile || "",
        name: session.name || "",
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}

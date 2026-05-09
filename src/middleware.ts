// src/middleware.ts
// Maa Flavours — Next.js Edge Middleware
// Handles:
//   1. Admin route protection — validates mf-admin-token JWT (jose)
//   2. Supabase session refresh for customer routes
//   3. Customer route protection — requires Supabase session

import { createServerClient } from "@supabase/ssr";
import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_COOKIE = "mf-admin-token";
const CUSTOMER_COOKIE = "mf_session";

function getAdminSecret(): Uint8Array {
  const s = process.env.ADMIN_JWT_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ADMIN_JWT_SECRET must be set in production");
    }
    return new TextEncoder().encode("dev-only-admin-secret-change-me");
  }
  return new TextEncoder().encode(s);
}

function getCustomerSecret(): Uint8Array {
  const s = process.env.MF_SESSION_SECRET || process.env.ADMIN_JWT_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("MF_SESSION_SECRET must be set in production");
    }
    return new TextEncoder().encode("dev-only-mf-session-secret-change-me");
  }
  return new TextEncoder().encode(s);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request: { headers: request.headers } });

  // ── 1. Admin Route Protection ──────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login" || pathname === "/admin/login/";

    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    let isValidToken = false;

    if (token) {
      try {
        await jwtVerify(token, getAdminSecret(), {
          issuer: "maaflavours.com", audience: "admin",
        });
        isValidToken = true;
      } catch { /* invalid/expired */ }
    }

    if (isLoginPage) {
      // Already logged in → go to dashboard
      if (isValidToken) return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      return response;
    }

    // Protected admin page
    if (!isValidToken) {
      const res = NextResponse.redirect(new URL("/admin/login", request.url));
      if (token) res.cookies.set(ADMIN_COOKIE, "", { maxAge: 0, path: "/" });
      return res;
    }

    return response;
  }

  // ── 2. Supabase Session Refresh ────────────────────────────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value; },
        set(name: string, value: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // ── 3. Protected Customer Routes ──────────────────────────────────────
  // NOTE: We use a SIGNED custom mf_session JWT cookie for auth — NOT Supabase
  // session. Supabase session will always be null for our OTP-based flow.
  // phonepe-status is a post-payment redirect landing page — no auth needed.
  const PROTECTED = ["/account", "/checkout"];
  if (PROTECTED.some(r => pathname.startsWith(r)) && pathname !== "/checkout/phonepe-status") {
    let isAuthenticated = false;
    let sess: any = null;
    const mfSessionVal = request.cookies.get(CUSTOMER_COOKIE)?.value;
    if (mfSessionVal) {
      try {
        const verified = await jwtVerify(mfSessionVal, getCustomerSecret(), {
          issuer: "maaflavours.com",
          audience: "customer",
        });
        sess = verified.payload;
      } catch { /* invalid/expired/forged */ }
    }
    // A valid signed JWT with a userId is sufficient for authentication.
    // Do NOT block on isNewUser or name — that creates a redirect loop where
    // new users who just completed OTP can never reach /checkout or /account.
    // Profile completion is handled gracefully within those pages, not here.
    if (sess?.userId) {
      isAuthenticated = true;
    }
    if (!isAuthenticated) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      const res = NextResponse.redirect(url);
      // Clear any stale cookie (including legacy unsigned-JSON variants)
      if (mfSessionVal) {
        res.cookies.set(CUSTOMER_COOKIE, "", { maxAge: 0, path: "/" });
      }
      return res;
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2)).*)",
  ],
};

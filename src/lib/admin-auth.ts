// src/lib/admin-auth.ts
// Maa Flavours — Admin authentication helper
// Used by all /api/admin/* routes to verify the admin session JWT
// Admin login uses email + bcrypt password (NOT Supabase OTP)
// JWT is signed with ADMIN_JWT_SECRET, stored in httpOnly cookie "mf-admin-token"

import { NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";

const ADMIN_COOKIE = "mf-admin-token";
const JWT_EXPIRY  = "24h";

// ─── Get JWT secret as Uint8Array ─────────────────────────────────────────
function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET || process.env.ADMIN_PASSWORD_HASH || "maa-admin-dev-secret-change-in-prod";
  return new TextEncoder().encode(secret);
}

// ─── Sign admin JWT ────────────────────────────────────────────────────────
export async function signAdminToken(payload: {
  email: string;
  role: string;
  adminId: string;
}): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .setIssuer("maaflavours.com")
    .setAudience("admin")
    .sign(getSecret());
}

// ─── Verify admin JWT from request ────────────────────────────────────────
export type AdminPayload = {
  email: string;
  role: "admin" | "super_admin";
  adminId: string;
};

export async function verifyAdminToken(
  req: NextRequest
): Promise<AdminPayload | null> {
  const token =
    req.cookies.get(ADMIN_COOKIE)?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer:   "maaflavours.com",
      audience: "admin",
    });
    return payload as unknown as AdminPayload;
  } catch {
    return null;
  }
}

// ─── Require admin auth — returns 401 if not authenticated ───────────────
export async function requireAdmin(req: NextRequest): Promise<AdminPayload | null> {
  return verifyAdminToken(req);
}

// ─── Cookie config for admin token ────────────────────────────────────────
export const ADMIN_COOKIE_NAME = ADMIN_COOKIE;
export const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path:     "/",
  maxAge:   60 * 60 * 24,  // 24 hours
};

// ─── Format rupees from paise ─────────────────────────────────────────────
export function formatRupees(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

// ─── Pagination helper ────────────────────────────────────────────────────
export function getPagination(searchParams: URLSearchParams) {
  const page  = Math.max(1, parseInt(searchParams.get("page")  || "1", 10));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "20", 10));
  const from  = (page - 1) * limit;
  const to    = from + limit - 1;
  return { page, limit, from, to };
}

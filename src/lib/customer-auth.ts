// src/lib/customer-auth.ts
// Maa Flavours — Customer session helper
// Replaces the previous unsigned JSON `mf_session` cookie with a signed JWT.
//
// SECURITY: the old cookie format was raw JSON parsed with JSON.parse(),
// which let any visitor forge a cookie like
//   mf_session={"userId":"<victim>","name":"x","exp":9999999999}
// and impersonate any customer. Switching to a signed JWT closes that.
//
// All readers MUST go through verifyCustomerSession() — never JSON.parse the
// cookie directly.

import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";

export const CUSTOMER_COOKIE = "mf_session";
export const CUSTOMER_SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export type CustomerSession = {
  userId: string;
  email?: string | null;
  mobile?: string | null;
  name?: string;
  isNewUser?: boolean;
};

function getSecret(): Uint8Array {
  const s = process.env.MF_SESSION_SECRET || process.env.ADMIN_JWT_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "MF_SESSION_SECRET (or ADMIN_JWT_SECRET) must be set in production"
      );
    }
    return new TextEncoder().encode("dev-only-mf-session-secret-change-me");
  }
  return new TextEncoder().encode(s);
}

export async function signCustomerSession(payload: CustomerSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${CUSTOMER_SESSION_MAX_AGE}s`)
    .setIssuer("maaflavours.com")
    .setAudience("customer")
    .sign(getSecret());
}

export async function verifyCustomerSession(
  req: NextRequest | { cookies: { get: (n: string) => { value: string } | undefined } }
): Promise<CustomerSession | null> {
  const token = req.cookies.get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: "maaflavours.com",
      audience: "customer",
    });
    if (!payload.userId || typeof payload.userId !== "string") return null;
    return {
      userId:    payload.userId as string,
      email:     (payload.email as string)  || null,
      mobile:    (payload.mobile as string) || null,
      name:      (payload.name as string)   || "",
      isNewUser: Boolean(payload.isNewUser),
    };
  } catch {
    return null;
  }
}

export function setCustomerSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    path:     "/",
    maxAge:   CUSTOMER_SESSION_MAX_AGE,
  });
}

export function clearCustomerSessionCookie(res: NextResponse) {
  res.cookies.set(CUSTOMER_COOKIE, "", {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    path:     "/",
    maxAge:   0,
  });
}

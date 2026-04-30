// src/lib/origin-check.ts
// Maa Flavours — Origin/Referer allow-list check
//
// Defence-in-depth against CSRF on cookie-authenticated routes.
//
// Why this matters:
//   Our auth cookies are SameSite=lax, which protects against most cross-
//   site fetches but DOES allow credentials on top-level GET navigations
//   and on simple POSTs (form-encoded, no preflight). For cookie-protected
//   mutating routes that's still a CSRF surface — adding an Origin (or
//   Referer fall-back) allow-list closes it.
//
// Webhooks (Cashfree, PhonePe) come from third-party servers with no
// Origin header; they protect themselves via signature verification, so
// they should NOT use this helper.

import type { NextRequest } from "next/server";

const PROD_ALLOWED_HOSTS = new Set([
  "maaflavours.com",
  "www.maaflavours.com",
]);

function isAllowedHost(host: string): boolean {
  if (PROD_ALLOWED_HOSTS.has(host)) return true;
  if (process.env.NODE_ENV !== "production") {
    if (host === "localhost" || host.startsWith("localhost:")) return true;
    if (host === "127.0.0.1" || host.startsWith("127.0.0.1:")) return true;
    if (host.endsWith(".vercel.app")) return true;  // preview deployments
  }
  // Additional hosts via env var (comma-separated), e.g. for custom previews
  const extra = process.env.ALLOWED_ORIGINS;
  if (extra) {
    for (const h of extra.split(",").map(s => s.trim()).filter(Boolean)) {
      if (host === h) return true;
    }
  }
  return false;
}

/**
 * Returns true if the request's Origin (or Referer fall-back) host is in
 * the allow-list. Same-origin requests sometimes omit Origin — for those
 * we fall back to Referer; if both are absent we default to "allow" so
 * server-to-server callers (e.g. health checks) keep working. Use this
 * only for routes where you have other auth (cookie session); never as
 * a stand-alone authentication check.
 */
export function isAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (origin) {
    try {
      return isAllowedHost(new URL(origin).host);
    } catch {
      return false;
    }
  }
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      return isAllowedHost(new URL(referer).host);
    } catch {
      return false;
    }
  }
  // No Origin or Referer — likely server-to-server (curl, monitoring).
  // Allow; the route's own auth is the real check.
  return true;
}

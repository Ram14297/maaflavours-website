// src/app/api/cashfree-sdk/route.ts
// Maa Flavours — Cashfree JS SDK Proxy
// GET /api/cashfree-sdk
// Fetches sdk.cashfree.com/js/v3/cashfree.js from Vercel's servers
// and serves it to the browser, bypassing any CDN connectivity issues.

import { NextResponse } from "next/server";

const SDK_URL = "https://sdk.cashfree.com/js/v3/cashfree.js";

export async function GET() {
  try {
    const res = await fetch(SDK_URL, {
      // Cache for 1 hour on the CDN, re-validate in background
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return new NextResponse(`// Cashfree SDK unavailable (upstream ${res.status})`, {
        status: 502,
        headers: { "Content-Type": "application/javascript" },
      });
    }

    const js = await res.text();

    return new NextResponse(js, {
      status: 200,
      headers: {
        "Content-Type":  "application/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err: any) {
    return new NextResponse(`// Cashfree SDK proxy error: ${err.message}`, {
      status: 502,
      headers: { "Content-Type": "application/javascript" },
    });
  }
}

// src/app/api/admin/fix-customers/route.ts
// Maa Flavours — DEPRECATED one-time migration endpoint
//
// This route was a one-shot migration (drop NOT NULL on customers.mobile +
// backfill missing rows for hardcoded user IDs). It is now removed:
//   * The auth check was a presence check on the cookie value (NOT a JWT
//     verify), letting any caller execute it.
//   * It executed raw SQL (`exec_sql` rpc) — extremely dangerous if the
//     above auth could be bypassed.
//   * It hardcoded real user UUIDs and emails (PII in source).
//
// Returns 410 Gone so any old client knows the route is retired.

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "This migration endpoint has been retired." },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json(
    { error: "This migration endpoint has been retired." },
    { status: 410 }
  );
}

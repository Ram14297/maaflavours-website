#!/usr/bin/env node
// scripts/audit-smoke-test.mjs
// Maa Flavours — End-to-end smoke test for the security audit fixes.
//
// Run from the repo root:
//   node scripts/audit-smoke-test.mjs
//
// Reads env vars from .env.local (so secrets stay out of source).
// Exercises every Critical/High/Medium fix against the live deployment.
// SAFE: it never creates a real order, never charges anything.

import { readFileSync } from "node:fs";
import { createHmac } from "node:crypto";
import { SignJWT } from "jose";

// ─── Load .env.local ─────────────────────────────────────────────────────────
const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const env = Object.fromEntries(
  envFile
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      const k = l.slice(0, i);
      let v = l.slice(i + 1);
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      return [k, v];
    })
);

const SITE = "https://maaflavours.com";
const ADMIN_SECRET = env.ADMIN_JWT_SECRET;
const SESSION_SECRET = env.MF_SESSION_SECRET;
const CF_SECRET = env.CASHFREE_SECRET_KEY;

if (!ADMIN_SECRET || !SESSION_SECRET || !CF_SECRET) {
  console.error("Missing secrets in .env.local — abort");
  process.exit(1);
}

// ─── Pretty test runner ─────────────────────────────────────────────────────
let passed = 0, failed = 0;
async function test(name, fn) {
  process.stdout.write(`▸ ${name}  `);
  try {
    const r = await fn();
    console.log(`\x1b[32m✓\x1b[0m ${r ?? ""}`);
    passed++;
  } catch (e) {
    console.log(`\x1b[31m✗\x1b[0m  ${e.message}`);
    failed++;
  }
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }

// ─── Helpers ────────────────────────────────────────────────────────────────
async function signCustomerJWT(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .setIssuer("maaflavours.com")
    .setAudience("customer")
    .sign(new TextEncoder().encode(SESSION_SECRET));
}

function signCashfreeWebhook(rawBody, timestamp) {
  return createHmac("sha256", CF_SECRET).update(timestamp + rawBody).digest("base64");
}

// ═══════════════════════════════════════════════════════════════════════════
// THE TESTS
// ═══════════════════════════════════════════════════════════════════════════

console.log(`\nMaa Flavours — production smoke tests against ${SITE}\n`);

// ───────────────────────────────── PUBLIC ───────────────────────────────────
await test("homepage 200", async () => {
  const r = await fetch(SITE);
  assert(r.status === 200, `got ${r.status}`);
});

await test("public products API works", async () => {
  const r = await fetch(`${SITE}/api/products?limit=2`);
  assert(r.status === 200, `got ${r.status}`);
  const j = await r.json();
  assert(Array.isArray(j.products), "no products array");
  return `${j.products.length} products returned`;
});

// ───────────── C1: signed cookie (was forgeable JSON) ────────────
await test("C1: forged JSON cookie is rejected (was the original bug)", async () => {
  const r = await fetch(`${SITE}/api/auth/me`, {
    headers: { Cookie: 'mf_session={"userId":"00000000-0000-0000-0000-000000000000","name":"Forged","exp":9999999999}' },
  });
  const j = await r.json();
  assert(j.user === null, `forged cookie was ACCEPTED — j=${JSON.stringify(j)}`);
});

await test("C1: properly signed cookie is accepted", async () => {
  const tok = await signCustomerJWT({
    userId: "11111111-1111-1111-1111-111111111111",
    email: "smoketest@example.com",
    name: "Smoke Test",
  });
  const r = await fetch(`${SITE}/api/auth/me`, { headers: { Cookie: `mf_session=${tok}` } });
  const j = await r.json();
  // The user UUID doesn't exist in DB so customer lookup misses, but the
  // cookie data IS used as fallback (the route's "no DB record" branch).
  assert(r.status === 200, `got ${r.status}`);
  assert(j.user !== null, `signed cookie was rejected — j=${JSON.stringify(j)}`);
  return `auth.me returned user=${j.user?.name}`;
});

await test("C1: cookie signed with WRONG secret is rejected", async () => {
  const wrongTok = await new SignJWT({ userId: "11111111-1111-1111-1111-111111111111" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .setIssuer("maaflavours.com")
    .setAudience("customer")
    .sign(new TextEncoder().encode("wrong-secret-attacker-doesnt-have-real-one"));
  const r = await fetch(`${SITE}/api/auth/me`, { headers: { Cookie: `mf_session=${wrongTok}` } });
  const j = await r.json();
  assert(j.user === null, `wrong-secret cookie was ACCEPTED — j=${JSON.stringify(j)}`);
});

// ───────────── C6/C7: order IDOR ────────────
await test("C6: /api/orders/[id] without auth returns 401 (was leaking orders)", async () => {
  const r = await fetch(`${SITE}/api/orders/00000000-0000-0000-0000-000000000000`);
  assert(r.status === 401, `expected 401, got ${r.status}`);
});

await test("C7: /api/orders/[id]/cancel without auth returns 401", async () => {
  const r = await fetch(`${SITE}/api/orders/00000000-0000-0000-0000-000000000000/cancel`, {
    method: "POST",
    headers: { Origin: SITE },
  });
  assert(r.status === 401, `expected 401, got ${r.status}`);
});

// ───────────── C5: fix-customers retired ────────────
await test("C5: admin/fix-customers returns 410 Gone", async () => {
  const r = await fetch(`${SITE}/api/admin/fix-customers`, {
    method: "POST",
    headers: { Cookie: "mf-admin-token=anything" },
  });
  assert(r.status === 410, `expected 410, got ${r.status}`);
});

// ───────────── C2: webhook signature ────────────
await test("C2: cashfree-webhook with no signature → 401", async () => {
  const r = await fetch(`${SITE}/api/checkout/cashfree-webhook`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "PAYMENT_SUCCESS_WEBHOOK" }),
  });
  assert(r.status === 401, `expected 401, got ${r.status}`);
});

await test("C2: cashfree-webhook with WRONG signature → 401", async () => {
  const body = JSON.stringify({ type: "PAYMENT_SUCCESS_WEBHOOK" });
  const ts = String(Math.floor(Date.now() / 1000));
  const r = await fetch(`${SITE}/api/checkout/cashfree-webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-webhook-timestamp": ts,
      "x-webhook-signature": "this-is-not-a-valid-signature",
    },
    body,
  });
  assert(r.status === 401, `expected 401, got ${r.status}`);
});

await test("C2: cashfree-webhook with VALID signature for unknown order → 200 (no-op)", async () => {
  const body = JSON.stringify({
    type: "PAYMENT_SUCCESS_WEBHOOK",
    data: {
      order: { order_id: "MF_smoketestnonexistent00000000000000000000", order_amount: "100.00" },
      payment: { payment_status: "SUCCESS", cf_payment_id: "smoke-test-payment" },
    },
  });
  const ts = String(Math.floor(Date.now() / 1000));
  const sig = signCashfreeWebhook(body, ts);
  const r = await fetch(`${SITE}/api/checkout/cashfree-webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-webhook-timestamp": ts,
      "x-webhook-signature": sig,
    },
    body,
  });
  assert(r.status === 200, `expected 200, got ${r.status}`);
  const j = await r.json();
  assert(j.ok === true, `expected ok:true, got ${JSON.stringify(j)}`);
  return "signature accepted, no matching order so safely no-op";
});

// ───────────── H12: cashfree-create needs auth ────────────
await test("H12: /api/checkout/cashfree-create without auth → 401", async () => {
  const r = await fetch(`${SITE}/api/checkout/cashfree-create`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: SITE },
    body: JSON.stringify({ mfOrderId: "test", customerName: "x", customerPhone: "9999999999" }),
  });
  assert(r.status === 401, `expected 401, got ${r.status}`);
});

// ───────────── H9: wishlist now reads mf_session ────────────
await test("H9: wishlist GET returns 200 (was always failing before)", async () => {
  const tok = await signCustomerJWT({
    userId: "22222222-2222-2222-2222-222222222222",
    name: "Wishlist Test",
  });
  const r = await fetch(`${SITE}/api/account/wishlist`, { headers: { Cookie: `mf_session=${tok}` } });
  assert(r.status === 200, `expected 200, got ${r.status}`);
  const j = await r.json();
  assert(Array.isArray(j.slugs), "no slugs array");
  return `slugs=[${j.slugs.length}]`;
});

// ───────────── M22/M25: origin check ────────────
await test("M22: /api/pincode with malicious Origin → 403", async () => {
  const r = await fetch(`${SITE}/api/pincode?pin=523001`, {
    headers: { Origin: "https://evil.example.com" },
  });
  assert(r.status === 403, `expected 403, got ${r.status}`);
});

await test("M22: /api/pincode with our Origin → 200", async () => {
  const r = await fetch(`${SITE}/api/pincode?pin=523001`, { headers: { Origin: SITE } });
  assert(r.status === 200, `expected 200, got ${r.status}`);
});

await test("M25: /api/auth/send-otp from evil Origin → 403", async () => {
  const r = await fetch(`${SITE}/api/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://evil.example.com" },
    body: JSON.stringify({ email: "test@test.com" }),
  });
  assert(r.status === 403, `expected 403, got ${r.status}`);
});

await test("M25: /api/contact from evil Origin → 403", async () => {
  const r = await fetch(`${SITE}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://evil.example.com" },
    body: JSON.stringify({ name: "x", mobile: "9999999999", topic: "x", message: "xxx" }),
  });
  assert(r.status === 403, `expected 403, got ${r.status}`);
});

await test("M25: /api/coupons/validate from evil Origin → 403", async () => {
  const r = await fetch(`${SITE}/api/coupons/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://evil.example.com" },
    body: JSON.stringify({ code: "WELCOME50", cartTotal: 50000 }),
  });
  assert(r.status === 403, `expected 403, got ${r.status}`);
});

// ───────────── Public coupon validate (with proper origin) ────────────
await test("coupons/validate with proper Origin works", async () => {
  const r = await fetch(`${SITE}/api/coupons/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: SITE },
    body: JSON.stringify({ code: "WELCOME50", cartTotal: 50000 }),
  });
  assert(r.status === 200, `expected 200, got ${r.status}`);
  const j = await r.json();
  return `valid=${j.valid}, discount=${j.coupon?.discountAmount ?? 0}`;
});

// ─── Summary ──────────────────────────────────────────────────────────────
console.log(`\n${"═".repeat(70)}`);
console.log(`Result: \x1b[32m${passed} passed\x1b[0m, ${failed > 0 ? `\x1b[31m${failed} failed\x1b[0m` : `${failed} failed`}`);
console.log(`${"═".repeat(70)}\n`);
process.exit(failed > 0 ? 1 : 0);

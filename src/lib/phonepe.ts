// src/lib/phonepe.ts
// Maa Flavours — PhonePe Payment Gateway config & crypto helpers
//
// ─── UAT Sandbox credentials (default) ─────────────────────────────────────
// To switch to production, set these env vars in Vercel:
//   PHONEPE_MERCHANT_ID       → your live Merchant ID
//   PHONEPE_SALT_KEY          → your live Salt Key
//   PHONEPE_SALT_INDEX        → your live Salt Index (usually "1")
//   PHONEPE_PAY_URL           → https://api.phonepe.com/apis/hermes/pg/v1/pay
//   PHONEPE_STATUS_BASE_URL   → https://api.phonepe.com/apis/hermes/pg/v1/status
// ────────────────────────────────────────────────────────────────────────────
//
// SECURITY: in production we refuse to fall back to the public sandbox
// credentials. The check runs lazily at request time (NOT at module load)
// because Next.js evaluates this module during `next build` to "collect
// page data" — env vars from the deployment may not be present then.

import { createHash } from "crypto";

function envOrThrow(name: string, devFallback: string): string {
  const v = process.env[name];
  if (v) return v;
  if (process.env.NODE_ENV === "production") {
    throw new Error(`${name} must be set in production`);
  }
  return devFallback;
}

// ─── Lazy getters (call at request time, not import time) ──────────────────
export function getPhonePeMerchantId(): string {
  return envOrThrow("PHONEPE_MERCHANT_ID", "PGTESTPAYUAT86");
}
export function getPhonePeSaltKey(): string {
  return envOrThrow("PHONEPE_SALT_KEY", "96434309-7796-489d-8924-ab56988a6076");
}
export function getPhonePeSaltIndex(): string {
  return envOrThrow("PHONEPE_SALT_INDEX", "1");
}
export function getPhonePePayUrl(): string {
  return envOrThrow("PHONEPE_PAY_URL",
    "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay");
}
export function getPhonePeStatusBase(): string {
  return envOrThrow("PHONEPE_STATUS_BASE_URL",
    "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status");
}

// ─── Checksum for /pg/v1/pay ─────────────────────────────────────────────────
// SHA256(base64Payload + "/pg/v1/pay" + saltKey) + "###" + saltIndex
export function generatePayChecksum(base64Payload: string): string {
  const saltKey = getPhonePeSaltKey();
  const idx     = getPhonePeSaltIndex();
  const hash    = createHash("sha256")
    .update(base64Payload + "/pg/v1/pay" + saltKey)
    .digest("hex");
  return `${hash}###${idx}`;
}

// ─── Checksum for /pg/v1/status ──────────────────────────────────────────────
// SHA256("/pg/v1/status/" + merchantId + "/" + txnId + saltKey) + "###" + saltIndex
export function generateStatusChecksum(merchantTransactionId: string): string {
  const merchant = getPhonePeMerchantId();
  const saltKey  = getPhonePeSaltKey();
  const idx      = getPhonePeSaltIndex();
  const hash     = createHash("sha256")
    .update(`/pg/v1/status/${merchant}/${merchantTransactionId}${saltKey}`)
    .digest("hex");
  return `${hash}###${idx}`;
}

// ─── Verify server-to-server callback ────────────────────────────────────────
// PhonePe sends header X-VERIFY: SHA256(base64response + saltKey) + "###" + saltIndex
export function verifyCallbackChecksum(base64Response: string, xVerify: string): boolean {
  const saltKey = getPhonePeSaltKey();
  const idx     = getPhonePeSaltIndex();
  const hash    = createHash("sha256")
    .update(base64Response + saltKey)
    .digest("hex");
  return `${hash}###${idx}` === xVerify;
}

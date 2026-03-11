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

import { createHash } from "crypto";

export const PHONEPE_MERCHANT_ID    = process.env.PHONEPE_MERCHANT_ID     || "PGTESTPAYUAT86";
export const PHONEPE_SALT_KEY       = process.env.PHONEPE_SALT_KEY        || "96434309-7796-489d-8924-ab56988a6076";
export const PHONEPE_SALT_INDEX     = process.env.PHONEPE_SALT_INDEX      || "1";
export const PHONEPE_PAY_URL        = process.env.PHONEPE_PAY_URL         || "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
export const PHONEPE_STATUS_BASE    = process.env.PHONEPE_STATUS_BASE_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status";

// ─── Checksum for /pg/v1/pay ─────────────────────────────────────────────────
// SHA256(base64Payload + "/pg/v1/pay" + saltKey) + "###" + saltIndex
export function generatePayChecksum(base64Payload: string): string {
  const hash = createHash("sha256")
    .update(base64Payload + "/pg/v1/pay" + PHONEPE_SALT_KEY)
    .digest("hex");
  return `${hash}###${PHONEPE_SALT_INDEX}`;
}

// ─── Checksum for /pg/v1/status ──────────────────────────────────────────────
// SHA256("/pg/v1/status/" + merchantId + "/" + txnId + saltKey) + "###" + saltIndex
export function generateStatusChecksum(merchantTransactionId: string): string {
  const hash = createHash("sha256")
    .update(`/pg/v1/status/${PHONEPE_MERCHANT_ID}/${merchantTransactionId}${PHONEPE_SALT_KEY}`)
    .digest("hex");
  return `${hash}###${PHONEPE_SALT_INDEX}`;
}

// ─── Verify server-to-server callback ────────────────────────────────────────
// PhonePe sends header X-VERIFY: SHA256(base64response + saltKey) + "###" + saltIndex
export function verifyCallbackChecksum(base64Response: string, xVerify: string): boolean {
  const hash = createHash("sha256")
    .update(base64Response + PHONEPE_SALT_KEY)
    .digest("hex");
  return `${hash}###${PHONEPE_SALT_INDEX}` === xVerify;
}

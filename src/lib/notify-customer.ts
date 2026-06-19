// src/lib/notify-customer.ts
// Maa Flavours — Customer SMS Notifications via Fast2SMS
//
// Sends transactional SMS to the customer's mobile on every order event.
// Uses Fast2SMS Quick SMS route — works immediately, no DLT needed.
//
// Setup:
//   1. Sign up at https://www.fast2sms.com
//   2. Go to Dashboard → Dev API → copy your API key
//   3. Add to Vercel env vars: FAST2SMS_API_KEY=your_key_here
//
// If FAST2SMS_API_KEY is not set, all calls are silently skipped (non-fatal).
//
// TODO: Upgrade to WhatsApp Business API when Facebook Business verification
//       is complete. Requires dedicated number + Meta approval (2–3 days).

// ─── Core SMS sender ──────────────────────────────────────────────────────────

export async function notifyCustomerSMS(
  mobile: string,
  message: string
): Promise<void> {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) return; // Gracefully skip if not configured

  // Normalize — Fast2SMS needs plain 10-digit number (no +91 or spaces)
  const normalized = mobile.replace(/^\+?91/, "").replace(/\D/g, "").slice(-10);
  if (normalized.length !== 10) return;

  try {
    const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        "authorization": apiKey,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        route:   "q",   // Quick SMS — no DLT registration needed
        message,
        numbers: normalized,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!data?.return) {
      console.error("[Fast2SMS] SMS failed:", JSON.stringify(data), "| mobile:", normalized);
    }
  } catch (err: any) {
    console.error("[Fast2SMS] Fetch error:", err?.message);
  }
}

// ─── Short order ID for SMS (readable, not full UUID) ────────────────────────

export function shortOrderId(orderId: string): string {
  return orderId.replace(/-/g, "").substring(0, 8).toUpperCase();
}

// ─── Message templates ───────────────────────────────────────────────────────

export function msgOrderConfirmed(
  name:     string,
  shortId:  string,
  totalRs:  number,
  method:   string
): string {
  const firstName = name.split(" ")[0];
  if (method === "cod") {
    return `Hi ${firstName}! Your Maa Flavours order #${shortId} is placed successfully. Total: Rs.${totalRs} (Pay on delivery). Delivery in 3-7 business days. Track at maaflavours.com/account/orders. Help: +91 97014 52929`;
  }
  return `Hi ${firstName}! Payment confirmed. Your Maa Flavours order #${shortId} is placed. Total: Rs.${totalRs}. Delivery in 3-7 business days. Track at maaflavours.com/account/orders. Help: +91 97014 52929`;
}

export function msgOrderPacked(name: string, shortId: string): string {
  const firstName = name.split(" ")[0];
  return `Hi ${firstName}! Your Maa Flavours order #${shortId} is packed and ready to ship. We'll update you once it's dispatched!`;
}

export function msgOrderShipped(
  name:       string,
  shortId:    string,
  courier:    string,
  trackingId: string
): string {
  const firstName = name.split(" ")[0];
  return `Hi ${firstName}! Your Maa Flavours order #${shortId} is on its way. Courier: ${courier}. Track here: https://shiprocket.co/tracking/${trackingId}`;
}

export function msgOrderOutForDelivery(name: string, shortId: string): string {
  const firstName = name.split(" ")[0];
  return `Hi ${firstName}! Great news! Your Maa Flavours order #${shortId} is out for delivery today. Keep your phone handy!`;
}

export function msgOrderDelivered(name: string, shortId: string): string {
  const firstName = name.split(" ")[0];
  return `Hi ${firstName}! Your Maa Flavours order #${shortId} has been delivered. Hope you enjoy the pickles! Share your love: instagram.com/maaflavours`;
}

export function msgOrderCancelled(
  name:       string,
  shortId:    string,
  isPrepaid:  boolean,
  totalRs:    number
): string {
  const firstName = name.split(" ")[0];
  if (isPrepaid) {
    return `Hi ${firstName}, your Maa Flavours order #${shortId} has been cancelled. Your refund of Rs.${totalRs} will be processed in 2-3 working days. Questions? +91 97014 52929`;
  }
  return `Hi ${firstName}, your Maa Flavours order #${shortId} has been cancelled. No payment was charged. Questions? +91 97014 52929`;
}

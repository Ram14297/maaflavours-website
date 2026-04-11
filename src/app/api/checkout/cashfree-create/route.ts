// src/app/api/checkout/cashfree-create/route.ts
// Maa Flavours — Create Cashfree Payment Session
// POST /api/checkout/cashfree-create
// Called after DB order is created — returns paymentSessionId + paymentLink

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

const CF_API_VERSION = "2023-08-01";

export async function POST(request: NextRequest) {
  // Read env vars per-request so changes take effect without server restart
  const CF_APP_ID     = process.env.CASHFREE_APP_ID!;
  const CF_SECRET_KEY = process.env.CASHFREE_SECRET_KEY!;
  const CF_ENV        = process.env.CASHFREE_ENV || "sandbox";
  const CF_BASE_URL   = CF_ENV === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

  try {
    const {
      mfOrderId,
      amount,
      customerName,
      customerPhone,
      customerEmail,
      customerId,
    } = await request.json();

    if (!mfOrderId || !amount || !customerName || !customerPhone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Cashfree order_id: max 50 chars, alphanumeric + _ + -
    const cfOrderId = `MF_${mfOrderId.replace(/-/g, "").substring(0, 40)}`;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://maaflavours.com";

    const payload = {
      order_id:       cfOrderId,
      order_amount:   (amount / 100).toFixed(2),
      order_currency: "INR",
      customer_details: {
        customer_id:    `C${(customerId || mfOrderId).replace(/-/g, "").substring(0, 40)}`,
        customer_name:  customerName.substring(0, 100),
        customer_phone: customerPhone.replace(/\D/g, "").slice(-10),
        customer_email: customerEmail || "customer@maaflavours.com",
      },
      order_meta: {
        return_url:   `${siteUrl}/checkout/confirmation?orderId=${mfOrderId}&method=cashfree`,
        notify_url:   `${siteUrl}/api/checkout/cashfree-webhook`,
      },
      order_note: `Maa Flavours order ${mfOrderId}`,
    };

    console.log("[cashfree-create] env:", CF_ENV, "| order:", cfOrderId, "| amount:", payload.order_amount);

    const res = await fetch(`${CF_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "x-api-version":   CF_API_VERSION,
        "x-client-id":     CF_APP_ID,
        "x-client-secret": CF_SECRET_KEY,
        "Content-Type":    "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("[cashfree-create] response:", JSON.stringify(data));

    if (!res.ok || !data.payment_session_id) {
      return NextResponse.json(
        { error: data.message || "Failed to create payment session" },
        { status: 400 }
      );
    }

    // Use Cashfree's own payment_link from the API response (most reliable format)
    // Fallback to constructing it manually if not present
    const paymentLink = data.payment_link ||
      (CF_ENV === "production"
        ? `https://payments.cashfree.com/order/#session_id=${data.payment_session_id}`
        : `https://sandbox.cashfree.com/order/#session_id=${data.payment_session_id}`);

    // Store cashfree_order_id back in the orders table for webhook matching
    if (mfOrderId && !mfOrderId.startsWith("DEV-")) {
      try {
        const adminSupa = createAdminSupabaseClient();
        await adminSupa.from("orders")
          .update({ cashfree_order_id: cfOrderId })
          .eq("id", mfOrderId);
      } catch { /* non-fatal */ }
    }

    return NextResponse.json({
      paymentSessionId: data.payment_session_id,
      cfOrderId:        data.order_id,
      cfEnv:            CF_ENV,
      paymentLink,
    });

  } catch (err: any) {
    console.error("[cashfree-create] error:", err.message);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

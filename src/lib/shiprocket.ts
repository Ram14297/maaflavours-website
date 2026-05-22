// src/lib/shiprocket.ts
// Maa Flavours — Shiprocket API Integration
// Auto-pushes confirmed orders to Shiprocket so no manual entry is needed.
//
// Env vars required (set in Vercel → Settings → Environment Variables):
//   SHIPROCKET_EMAIL    — API user email (Settings → API Users in Shiprocket)
//   SHIPROCKET_PASSWORD — API user password
//
// Flow:
//   1. POST /auth/login          → get 24-hour token
//   2. POST /orders/create/adhoc → create order, get shiprocket_order_id
//   3. Save shiprocket_order_id + awb_code back to Supabase orders table

import { createAdminSupabaseClient } from "@/lib/supabase/server";

const SHIPROCKET_API   = "https://apiv2.shiprocket.in/v1/external";
const PICKUP_LOCATION  = "Home"; // Must match your pickup location name in Shiprocket

// ─── Auth ─────────────────────────────────────────────────────────────────────
async function getToken(): Promise<string> {
  const email    = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error("SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD not configured");
  }

  const res = await fetch(`${SHIPROCKET_API}/auth/login`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Shiprocket auth failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  if (!data.token) throw new Error("Shiprocket auth: no token in response");
  return data.token;
}

// ─── Weight estimation ────────────────────────────────────────────────────────
// Estimates package weight from variant labels (e.g. "250g", "500g").
// Adds ~100g per item for pouch + packaging material.
// Minimum chargeable weight is 0.5 kg.
function estimateWeightKg(
  items: { variantLabel: string; quantity: number }[]
): number {
  let totalGrams = 0;

  for (const item of items) {
    const match       = item.variantLabel.match(/(\d+)\s*g/i);
    const productGrams  = match ? parseInt(match[1]) : 300; // default 300g if unknown
    const packagingGrams = 100;                              // pouch + box padding
    totalGrams += (productGrams + packagingGrams) * item.quantity;
  }

  const kg = totalGrams / 1000;
  return Math.max(0.5, Math.round(kg * 10) / 10); // round to 1 decimal, min 0.5 kg
}

// ─── Push confirmed order to Shiprocket ──────────────────────────────────────
// Called after order is confirmed (COD, PhonePe QR, or Cashfree webhook).
// Non-fatal — a Shiprocket failure never blocks the customer-facing response.
// Saves shiprocket_order_id + awb_code (tracking_id) back to Supabase.
export async function pushOrderToShiprocket(orderId: string): Promise<void> {
  try {
    const supabase = createAdminSupabaseClient();

    // ── Fetch full order details ──────────────────────────────────────────
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, created_at, total, payment_method, shipping_address, shiprocket_order_id")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      console.error("[shiprocket] Could not fetch order:", orderId, orderErr?.message);
      return;
    }

    // Skip if already pushed
    if (order.shiprocket_order_id) {
      console.log("[shiprocket] Already pushed, skipping:", orderId);
      return;
    }

    const { data: items, error: itemsErr } = await supabase
      .from("order_items")
      .select("product_name, variant_label, product_slug, quantity, unit_price")
      .eq("order_id", orderId);

    if (itemsErr || !items?.length) {
      console.error("[shiprocket] Could not fetch order items:", orderId, itemsErr?.message);
      return;
    }

    const addr = order.shipping_address as any;
    if (!addr) {
      console.error("[shiprocket] No shipping address for order:", orderId);
      return;
    }

    // ── Build Shiprocket payload ─────────────────────────────────────────
    const nameParts = (addr.full_name || addr.name || "Customer").trim().split(" ");
    const firstName = nameParts[0];
    const lastName  = nameParts.slice(1).join(" ") || ".";

    const addressStr = [
      addr.address_line1,
      addr.address_line2,
      addr.landmark,
    ].filter(Boolean).join(", ");

    const weight = estimateWeightKg(
      items.map(i => ({ variantLabel: i.variant_label, quantity: i.quantity }))
    );

    // Shiprocket COD vs Prepaid
    const isCOD          = order.payment_method === "cod";
    const paymentMethodSR = isCOD ? "COD" : "Prepaid";

    // Shiprocket expects "YYYY-MM-DD HH:MM" format
    const orderDate = new Date(order.created_at)
      .toISOString()
      .replace("T", " ")
      .substring(0, 16);

    const payload = {
      order_id:               orderId,          // our UUID — unique in Shiprocket
      order_date:             orderDate,
      pickup_location:        PICKUP_LOCATION,

      billing_customer_name:  firstName,
      billing_last_name:      lastName,
      billing_address:        addressStr,
      billing_city:           addr.city,
      billing_pincode:        addr.pincode,
      billing_state:          addr.state,
      billing_country:        "India",
      billing_email:          "",               // optional
      billing_phone:          addr.mobile || addr.phone || "",

      shipping_is_billing:    true,

      order_items: items.map(item => ({
        name:          `${item.product_name} ${item.variant_label}`,
        sku:           `${item.product_slug}-${item.variant_label.replace(/\s+/g, "").toLowerCase()}`,
        units:         item.quantity,
        selling_price: Math.round(item.unit_price / 100),  // paise → rupees
      })),

      payment_method: paymentMethodSR,
      sub_total:      Math.round(order.total / 100),  // paise → rupees

      // Default package dimensions — user updates weight in Shiprocket before shipping
      length:  20,
      breadth: 15,
      height:  10,
      weight,
    };

    // ── POST to Shiprocket ───────────────────────────────────────────────
    const token = await getToken();

    const res = await fetch(`${SHIPROCKET_API}/orders/create/adhoc`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("[shiprocket] Order creation failed:", JSON.stringify(data));
      return;
    }

    console.log(`[shiprocket] Order created for ${orderId}:`, JSON.stringify(data));

    // ── Save Shiprocket IDs back to Supabase ─────────────────────────────
    await supabase
      .from("orders")
      .update({
        shiprocket_order_id:   data.order_id    ?? null,
        shiprocket_shipment_id: data.shipment_id ?? null,
        tracking_id:           data.awb_code    ?? null,
        courier_name:          data.courier_name ?? null,
        updated_at:            new Date().toISOString(),
      })
      .eq("id", orderId);

  } catch (err: any) {
    // Always non-fatal — order is safe in Supabase even if Shiprocket is down
    console.error("[shiprocket] pushOrderToShiprocket error:", err.message);
  }
}

#!/usr/bin/env node
// scripts/fix-phonepe-pending-orders.mjs
// One-time migration: find all PhonePe QR orders with payment_status=pending
// and mark them as confirmed/paid (they were paid — admin verified and delivered).
//
// Usage:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/fix-phonepe-pending-orders.mjs
//   -- or --
//   source .env.local && node scripts/fix-phonepe-pending-orders.mjs

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("❌  Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  // Find all PhonePe QR orders that are still pending
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, status, payment_status, total, created_at, shipping_address")
    .eq("payment_method", "phonepe_qr")
    .eq("payment_status", "pending")
    .order("created_at", { ascending: true });

  if (error) { console.error("❌  Query failed:", error.message); process.exit(1); }
  if (!orders?.length) { console.log("✅  No stale PhonePe QR orders found — nothing to fix."); return; }

  console.log(`Found ${orders.length} stale PhonePe QR order(s):\n`);
  for (const o of orders) {
    const name = o.shipping_address?.full_name || o.shipping_address?.name || "—";
    console.log(`  ${o.id.slice(-8).toUpperCase()}  ₹${(o.total/100).toFixed(0)}  status=${o.status}  customer=${name}  date=${o.created_at?.slice(0,10)}`);
  }

  console.log("\nUpdating payment_status → paid, status → confirmed (if currently pending)...");

  for (const o of orders) {
    const patch = { payment_status: "paid", updated_at: new Date().toISOString() };
    // Only upgrade status if it's still pending (don't downgrade delivered/shipped)
    if (o.status === "pending") patch.status = "confirmed";

    const { error: updateErr } = await supabase.from("orders").update(patch).eq("id", o.id);
    if (updateErr) {
      console.error(`  ❌  ${o.id} — ${updateErr.message}`);
    } else {
      console.log(`  ✅  ${o.id.slice(-8).toUpperCase()} — payment_status=paid${patch.status ? ", status=confirmed" : " (status kept as-is)"}`);
    }
  }

  console.log("\nDone. All stale PhonePe QR orders corrected.");
}

main().catch(e => { console.error(e); process.exit(1); });

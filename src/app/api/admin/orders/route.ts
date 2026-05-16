// src/app/api/admin/orders/route.ts
// Maa Flavours — Admin Orders List + Manual Order Creation API
// GET  /api/admin/orders?page=1&limit=20&status=pending&search=MAA-&payment=cod
//      Returns paginated order list from orders_summary view
// POST /api/admin/orders
//      Create a manual order (WhatsApp / cash / phone / walk-in)

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin, getPagination } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const sp      = req.nextUrl.searchParams;
  const status  = sp.get("status");
  const payment = sp.get("payment");
  const search  = sp.get("search");
  const { page, limit, from, to } = getPagination(sp);

  try {
    const supabase = createAdminSupabaseClient();

    let query = supabase
      .from("orders_summary")
      .select(
        "id, order_number, customer_name, customer_mobile, total, status, payment_status, payment_method, coupon_code, created_at, dispatched_at, tracking_id, courier_name, item_count",
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    } else {
      // By default hide ghost/abandoned payment orders (status=pending means
      // the customer started Cashfree checkout but never completed payment).
      // COD and PhonePe QR orders jump straight to 'confirmed', so 'pending'
      // always means an unfinished online payment — not a real order to act on.
      // Admin can still see them by explicitly selecting status=pending filter.
      query = query.neq("status", "pending");
    }
    if (payment) query = query.eq("payment_method", payment);
    if (search) {
      // Strip PostgREST-significant chars to prevent the user-supplied
      // string from breaking out of the ilike pattern and adding extra
      // OR clauses (commas, parens, asterisks).
      const safe = search.replace(/[,()%*]/g, "").trim();
      if (safe) {
        query = query.or(
          `order_number.ilike.%${safe}%,customer_name.ilike.%${safe}%,customer_mobile.ilike.%${safe}%`
        );
      }
    }

    const { data, count, error } = await query.range(from, to);
    if (error) throw error;

    return NextResponse.json({
      orders: data || [],
      total:  count || 0,
      page,
      limit,
      pages:  Math.ceil((count || 0) / limit),
    });
  } catch (err: any) {
    console.error("[admin/orders GET]", err.message);
    return NextResponse.json({ orders: [], total: 0, page, limit, pages: 0 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST — Create a manual order from WhatsApp / cash / walk-in
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const body = await req.json();
    const { customer, address, items, payment_method, payment_status,
            source, delivery_charge, discount, notes, order_type } = body;

    // ── Basic validation ───────────────────────────────────────────────────
    if (!customer?.name || customer.name.trim().length < 2)
      return NextResponse.json({ error: "Customer name required" }, { status: 400 });
    if (!customer?.mobile || !/^[6-9]\d{9}$/.test(customer.mobile))
      return NextResponse.json({ error: "Valid 10-digit mobile required" }, { status: 400 });
    if (!Array.isArray(items) || items.length === 0)
      return NextResponse.json({ error: "At least one product item is required" }, { status: 400 });

    const supabase = createAdminSupabaseClient();

    // ── Find or create customer ────────────────────────────────────────────
    let customerId: string;
    const { data: existingCust } = await supabase
      .from("customers")
      .select("id")
      .eq("mobile", customer.mobile)
      .maybeSingle();

    if (existingCust) {
      customerId = existingCust.id;
      // Update name / email if provided
      const upd: Record<string, string> = {};
      if (customer.name)  upd.name  = customer.name.trim();
      if (customer.email) upd.email = customer.email.trim();
      if (Object.keys(upd).length) await supabase.from("customers").update(upd).eq("id", customerId);
    } else {
      const newId = crypto.randomUUID();
      const { data: newCust, error: insertErr } = await supabase
        .from("customers")
        .insert({
          id:     newId,
          mobile: customer.mobile,
          name:   customer.name.trim(),
          email:  customer.email?.trim() || null,
        })
        .select("id")
        .single();
      customerId = newCust?.id || newId;
      if (insertErr) console.warn("[admin/orders POST] customer insert:", insertErr.message);
    }

    // ── Calculate totals ───────────────────────────────────────────────────
    const subtotal         = items.reduce((s: number, i: any) => s + (i.unit_price * i.quantity), 0);
    const discountAmount   = Math.max(0, discount || 0);
    const deliveryAmount   = order_type === "pickup" ? 0 : Math.max(0, delivery_charge || 0);
    const total            = Math.max(0, subtotal - discountAmount + deliveryAmount);

    // ── Build shipping address snapshot ────────────────────────────────────
    const shippingAddress = order_type === "pickup"
      ? { name: customer.name.trim(), mobile: customer.mobile, note: "Pickup / In-person" }
      : {
          full_name:     address?.full_name || customer.name.trim(),
          name:          address?.full_name || customer.name.trim(),
          mobile:        customer.mobile,
          address_line1: address?.address_line1 || "",
          address_line2: address?.address_line2 || "",
          landmark:      address?.landmark      || "",
          city:          address?.city          || "",
          state:         address?.state         || "",
          pincode:       address?.pincode       || "",
        };

    // ── Create order ───────────────────────────────────────────────────────
    const internalNote = `Manual order — source: ${source || "admin"}. Created by ${admin.email}.${notes ? " Note: " + notes : ""}`;

    const { data: newOrder, error: orderErr } = await supabase
      .from("orders")
      .insert({
        customer_id:      customerId,
        shipping_address: shippingAddress,
        status:           "confirmed",       // Always confirmed — real money
        payment_status:   payment_status || "paid",
        payment_method:   payment_method || "cash",
        subtotal,
        discount:         discountAmount,
        coupon_discount:  0,
        delivery_charge:  deliveryAmount,
        cod_charge:       0,
        total,
        internal_notes:   internalNote,
        customer_notes:   notes || null,
      })
      .select("id, order_number")
      .single();

    if (orderErr || !newOrder) {
      console.error("[admin/orders POST] order insert:", orderErr?.message);
      return NextResponse.json({ error: orderErr?.message || "Failed to create order" }, { status: 500 });
    }

    const orderId     = newOrder.id;
    const orderNumber = newOrder.order_number || orderId;

    // ── Create order_items ─────────────────────────────────────────────────
    const itemRows = items.map((item: any) => ({
      order_id:      orderId,
      product_id:    item.product_id    || null,
      variant_id:    item.variant_id    || null,
      product_name:  item.product_name,
      variant_label: item.variant_label,
      product_slug:  item.product_slug  || "",
      quantity:      item.quantity,
      unit_price:    item.unit_price,
      total_price:   item.unit_price * item.quantity,
    }));

    const { error: itemErr } = await supabase.from("order_items").insert(itemRows);
    if (itemErr) console.warn("[admin/orders POST] items insert:", itemErr.message);

    // ── Log in order status history ────────────────────────────────────────
    try {
      await supabase.from("order_status_history").insert({
        order_id:   orderId,
        new_status: "confirmed",
        changed_by: `admin:${admin.email}`,
        note:       `Manual order created — ${source || "admin"} — ${payment_method || "cash"}`,
      });
    } catch { /* non-fatal */ }

    // ── Deduct stock for each variant ──────────────────────────────────────
    for (const item of items) {
      if (!item.variant_id) continue;
      try {
        await supabase.rpc("decrement_variant_stock", {
          p_variant_id: item.variant_id,
          p_quantity:   item.quantity,
        });
      } catch { /* non-fatal per variant */ }
    }

    return NextResponse.json({ success: true, orderId, orderNumber });

  } catch (err: any) {
    console.error("[admin/orders POST]", err.message);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}

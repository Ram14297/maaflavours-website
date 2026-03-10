// src/app/api/checkout/create-order/route.ts
// Maa Flavours — Create Order API Route
// POST /api/checkout/create-order
//
// Flow:
//   1. Validate cart items against server-side prices (prevents price tampering)
//   2. Validate & apply coupon (DB then static fallback)
//   3. Calculate final total (subtotal - coupon + delivery + COD charge)
//   4. Create order row in Supabase (schema-accurate column names)
//   5. Create order_items rows
//   6. Create Razorpay order (skip for COD)
//   7. Store razorpay_order_id back in orders row
//
// Schema reference: supabase/schema.sql
//   orders: customer_id, shipping_address, subtotal, discount, coupon_discount,
//           delivery_charge, cod_charge, total, payment_method, coupon_code,
//           razorpay_order_id, cgst_amount, sgst_amount, igst_amount
//   order_items: order_id, product_id, variant_id, product_name, variant_label,
//                product_slug, quantity, unit_price, total_price
//
// Returns: { razorpayOrderId, orderId, amount, currency, key } | { orderId, paymentMethod, total }

import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { z } from "zod";
import { PRODUCTS } from "@/lib/constants/products";
import { createServerClient, createAdminSupabaseClient } from "@/lib/supabase/server";

// ─── Razorpay client (lazy — initialized inside handler so env vars are available at runtime) ──
function getRazorpay() {
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

// ─── Validation schemas ──────────────────────────────────────────────────────
const CartItemSchema = z.object({
  productSlug:  z.string().min(1),
  variantIndex: z.number().int().min(0).max(1),  // 0 = 250g, 1 = 500g
  quantity:     z.number().int().min(1).max(20),
});

const AddressSchema = z.object({
  name:          z.string().min(2).max(80),
  mobile:        z.string().regex(/^[6-9]\d{9}$/),
  address_line1: z.string().min(5).max(120),
  address_line2: z.string().max(120).optional().default(""),
  landmark:      z.string().max(80).optional().default(""),
  pincode:       z.string().regex(/^\d{6}$/),
  city:          z.string().min(2).max(60),
  state:         z.string().min(2).max(60),
});

const RequestSchema = z.object({
  items:           z.array(CartItemSchema).min(1).max(20),
  couponCode:      z.string().optional(),
  deliveryAddress: AddressSchema,
  paymentMethod:   z.enum(["razorpay_upi", "razorpay_card", "razorpay_netbanking", "cod", "phonepe"]),
  customerNotes:   z.string().max(500).optional(),
});

// ─── Business rules (paise) ──────────────────────────────────────────────────
const FREE_SHIPPING_THRESHOLD = 49900;  // ₹499
const STANDARD_SHIPPING       = 6000;   // ₹60
const COD_CHARGE              = 3000;   // ₹30

// GST rates for pickles (HSN 2001, 12%)
const CGST_RATE  = 6;   // percent
const SGST_RATE  = 6;   // percent
const IGST_RATE  = 12;  // percent — for inter-state

// ─── Map payment method display name to DB enum ──────────────────────────────
function mapPaymentMethodLabel(pm: string): string {
  const map: Record<string, string> = {
    razorpay_upi:        "UPI",
    razorpay_card:       "Card",
    razorpay_netbanking: "Net Banking",
    cod:                 "Cash on Delivery",
    phonepe:             "PhonePe",
  };
  return map[pm] || pm;
}

export async function POST(request: NextRequest) {
  try {
    const body   = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid order data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { items, couponCode, deliveryAddress, paymentMethod, customerNotes } = parsed.data;

    // ─── 1. Validate items against server catalog & calculate subtotal ─────
    let subtotal = 0;
    const validatedItems: {
      productSlug: string;
      productName: string;
      variantLabel: string;
      productId:   string | null;   // Supabase UUID or null in dev
      variantId:   string | null;
      quantity:    number;
      unitPrice:   number;          // paise
      totalPrice:  number;          // paise
    }[] = [];

    for (const item of items) {
      const product = PRODUCTS.find(p => p.slug === item.productSlug);
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productSlug}` }, { status: 400 });
      }
      const variant = product.variants[item.variantIndex];
      if (!variant) {
        return NextResponse.json({ error: `Invalid variant for ${item.productSlug}` }, { status: 400 });
      }

      const unitPrice  = variant.price;  // Always use server price (security)
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      validatedItems.push({
        productSlug:  item.productSlug,
        productName:  product.name,
        variantLabel: variant.label,
        productId:    null,  // Resolved below from Supabase
        variantId:    null,
        quantity:     item.quantity,
        unitPrice,
        totalPrice,
      });
    }

    // ─── 1b. Resolve Supabase product/variant UUIDs ───────────────────────
    try {
      const adminSupa = createAdminSupabaseClient();
      for (const item of validatedItems) {
        const { data: product } = await adminSupa.from("products")
          .select("id").eq("slug", item.productSlug).single();
        if (product) {
          item.productId = product.id;
          const { data: variant } = await adminSupa.from("product_variants")
            .select("id").eq("product_id", product.id)
            .eq("label", item.variantLabel).single();
          if (variant) item.variantId = variant.id;
        }
      }
    } catch { /* non-fatal — proceed with nulls in dev */ }

    // ─── 2. Validate coupon ───────────────────────────────────────────────
    type AppliedCoupon = {
      code: string;
      type: "flat" | "percent" | "free_shipping";
      value: number;
    } | null;

    let appliedCoupon: AppliedCoupon = null;

    if (couponCode) {
      const upperCode = couponCode.toUpperCase().trim();

      // Try DB first
      try {
        const adminSupa = createAdminSupabaseClient();
        const { data: dbCoupon } = await adminSupa.from("coupons")
          .select("code, type, value, min_order_amount, max_discount_amount, usage_limit, usage_count, expires_at, valid_from")
          .eq("code", upperCode)
          .eq("is_active", true)
          .single();

        if (dbCoupon) {
          const now = new Date();
          const validFrom   = new Date(dbCoupon.valid_from);
          const expiresAt   = dbCoupon.expires_at ? new Date(dbCoupon.expires_at) : null;
          const usageLimitHit = dbCoupon.usage_limit !== null && dbCoupon.usage_count >= dbCoupon.usage_limit;
          const minOK = !dbCoupon.min_order_amount || subtotal >= dbCoupon.min_order_amount;

          if (validFrom <= now && (!expiresAt || expiresAt > now) && !usageLimitHit && minOK) {
            appliedCoupon = { code: dbCoupon.code, type: dbCoupon.type, value: dbCoupon.value };
          }
        }
      } catch { /* DB not configured — try static */ }

      // Static fallback
      if (!appliedCoupon) {
        const STATIC_COUPONS: AppliedCoupon[] = [
          { code: "WELCOME50",  type: "flat",         value: 5000  },
          { code: "MAASPECIAL", type: "percent",       value: 10    },
          { code: "FREESHIP",   type: "free_shipping", value: 0     },
        ];
        appliedCoupon = STATIC_COUPONS.find(c => c?.code === upperCode) || null;
        if (appliedCoupon) {
          const mins: Record<string, number> = { WELCOME50: 29900, MAASPECIAL: 59900 };
          if (mins[upperCode] && subtotal < mins[upperCode]) appliedCoupon = null;
        }
      }
    }

    // ─── 3. Calculate final totals ────────────────────────────────────────
    let couponDiscount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.type === "flat")         couponDiscount = Math.min(appliedCoupon.value, subtotal);
      if (appliedCoupon.type === "percent")      couponDiscount = Math.floor((subtotal * appliedCoupon.value) / 100);
      if (appliedCoupon.type === "free_shipping") couponDiscount = 0;  // Handled below
    }

    const isFreeShipping = appliedCoupon?.type === "free_shipping" || subtotal >= FREE_SHIPPING_THRESHOLD;
    const deliveryCharge = isFreeShipping ? 0 : STANDARD_SHIPPING;
    const codCharge      = paymentMethod === "cod" ? COD_CHARGE : 0;
    const total          = Math.max(0, subtotal - couponDiscount + deliveryCharge + codCharge);

    // GST breakdown (12% included in price — back-calculate)
    // Determine if intra-state (Andhra Pradesh) or inter-state
    const isIntraState = deliveryAddress.state.toLowerCase().includes("andhra") ||
                         deliveryAddress.state.toLowerCase().includes("ap");
    const taxableBase  = Math.round((subtotal - couponDiscount) / 1.12);
    const gstTotal     = (subtotal - couponDiscount) - taxableBase;
    const cgstAmount   = isIntraState ? Math.round(gstTotal / 2) : 0;
    const sgstAmount   = isIntraState ? Math.round(gstTotal / 2) : 0;
    const igstAmount   = isIntraState ? 0 : gstTotal;

    // ─── 4. Authenticate customer ─────────────────────────────────────────
    let customerId: string | null = null;
    try {
      const supabase = await createServerClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) customerId = user.id;
    } catch { /* Not logged in — guest checkout not supported, but don't block */ }

    if (!customerId) {
      // In production, require login before checkout
      // In dev, generate a placeholder
      customerId = `guest-${Date.now()}`;
    }

    // ─── 5. Insert order into Supabase ───────────────────────────────────
    let supabaseOrderId: string | null = null;
    try {
      const adminSupa = createAdminSupabaseClient();

      // Ensure customer row exists (create if missing)
      const { data: existingCustomer } = await adminSupa
        .from("customers").select("id").eq("id", customerId).single();

      if (!existingCustomer && !customerId.startsWith("guest-")) {
        await adminSupa.from("customers").upsert({
          id:     customerId,
          mobile: deliveryAddress.mobile,
          name:   deliveryAddress.name,
        }, { onConflict: "id", ignoreDuplicates: true });
      }

      // Create order row (schema column names)
      const { data: newOrder, error: orderError } = await adminSupa
        .from("orders")
        .insert({
          customer_id:      customerId.startsWith("guest-") ? null : customerId,
          shipping_address: deliveryAddress,        // JSONB snapshot
          status:           "pending",
          payment_status:   "pending",
          payment_method:   paymentMethod,          // razorpay_upi | razorpay_card | razorpay_netbanking | cod
          subtotal,
          discount:         0,                      // Product-level discounts (future)
          coupon_discount:  couponDiscount,
          delivery_charge:  deliveryCharge,
          cod_charge:       codCharge,
          total,
          coupon_code:      appliedCoupon?.code || null,
          cgst_rate:        isIntraState ? CGST_RATE  : 0,
          sgst_rate:        isIntraState ? SGST_RATE  : 0,
          igst_rate:        isIntraState ? 0 : IGST_RATE,
          cgst_amount:      cgstAmount,
          sgst_amount:      sgstAmount,
          igst_amount:      igstAmount,
          customer_notes:   customerNotes || null,
        })
        .select("id")
        .single();

      if (orderError) throw orderError;
      supabaseOrderId = newOrder.id;

      // Create order_items rows
      if (supabaseOrderId && validatedItems[0].productId) {
        await adminSupa.from("order_items").insert(
          validatedItems.map(item => ({
            order_id:      supabaseOrderId,
            product_id:    item.productId,
            variant_id:    item.variantId,
            product_name:  item.productName,
            variant_label: item.variantLabel,
            product_slug:  item.productSlug,
            product_image: null,  // REPLACE with actual image URL from product_images table
            quantity:      item.quantity,
            unit_price:    item.unitPrice,
            total_price:   item.totalPrice,
          }))
        );
      }

    } catch (dbErr: any) {
      // DB not configured — use timestamp ID for dev
      console.warn("[create-order] DB save skipped:", dbErr.message);
      supabaseOrderId = `DEV-${Date.now()}`;
    }

    // ─── 6. COD order — return immediately ───────────────────────────────
    if (paymentMethod === "cod") {
      // Mark COD order as confirmed immediately
      if (supabaseOrderId && !supabaseOrderId.startsWith("DEV-")) {
        try {
          const adminSupa = createAdminSupabaseClient();
          await adminSupa.from("orders").update({ status: "confirmed" }).eq("id", supabaseOrderId);
        } catch { /* non-fatal */ }
      }

      return NextResponse.json({
        orderId:       supabaseOrderId,
        paymentMethod: "cod",
        total,
        subtotal,
        couponDiscount,
        deliveryCharge,
        codCharge,
        orderNumber:   supabaseOrderId,  // Will be replaced by trigger-generated number
      });
    }

    // ─── 7a. PhonePe order — return orderId for client to call phonepe-initiate ─
    if (paymentMethod === "phonepe") {
      return NextResponse.json({
        orderId:       supabaseOrderId,
        paymentMethod: "phonepe",
        total,
        subtotal,
        couponDiscount,
        deliveryCharge,
        // Client should POST to /api/checkout/phonepe-initiate with { orderId, amount: total }
      });
    }

    // ─── 7. Create Razorpay order ─────────────────────────────────────────
    const rzpOrder = await getRazorpay().orders.create({
      amount:   total,                                // Already in paise
      currency: "INR",
      receipt:  (supabaseOrderId || `mf-${Date.now()}`).slice(0, 40),
      notes: {
        mf_order_id:     supabaseOrderId || "",
        customer_name:   deliveryAddress.name,
        customer_mobile: deliveryAddress.mobile,
        city:            deliveryAddress.city,
        state:           deliveryAddress.state,
      },
    });

    // Store razorpay_order_id back in Supabase
    if (supabaseOrderId && !supabaseOrderId.startsWith("DEV-")) {
      try {
        const adminSupa = createAdminSupabaseClient();
        await adminSupa.from("orders")
          .update({ razorpay_order_id: rzpOrder.id })
          .eq("id", supabaseOrderId);
      } catch { /* non-fatal */ }
    }

    return NextResponse.json({
      razorpayOrderId: rzpOrder.id,
      orderId:         supabaseOrderId,
      amount:          total,
      currency:        "INR",
      key:             process.env.RAZORPAY_KEY_ID,
      // Pre-fill customer details for Razorpay modal
      prefill: {
        name:    deliveryAddress.name,
        contact: `+91${deliveryAddress.mobile}`,
      },
    });

  } catch (err: any) {
    console.error("[create-order]", err.message);
    return NextResponse.json(
      { error: err.message || "Failed to create order. Please try again." },
      { status: 500 }
    );
  }
}

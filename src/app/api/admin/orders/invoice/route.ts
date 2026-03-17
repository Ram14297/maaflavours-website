// src/app/api/admin/orders/invoice/route.ts
// Maa Flavours — GST Invoice Data API
// GET /api/admin/orders/invoice?orderId=xxx
// Returns structured invoice data for PDF generation
// The admin panel uses this with jsPDF or react-pdf to render/download the invoice
// Protected: requires admin JWT cookie

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-auth";

// GST details for Maa Flavours (Andhra Pradesh)
const SELLER = {
  name:       "Maa Flavours",
  address:    "Ongole, Andhra Pradesh — 523001",
  state:      "Andhra Pradesh",
  stateCode:  "37",  // AP state code
  pan:        "PENDING",  // Update when available
  gstin:      "PENDING",  // Update when GSTIN is issued
  fssai:      "Application In Progress",
  email:      "maaflavours74@gmail.com",
  phone:      "+91 98765 43210",
};

const HSN_CODE = "2001";  // Pickles and chutneys

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const orderId = req.nextUrl.searchParams.get("orderId");
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });

  try {
    const supabase = createAdminSupabaseClient();

    const { data: order, error } = await supabase
      .from("orders_summary")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error || !order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const { data: items } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);

    const addr       = order.shipping_address as any;
    const isIntrastate = addr?.state?.toLowerCase().includes("andhra");

    // Build invoice line items with GST breakdown
    const lineItems = (items || []).map((item: any) => {
      const taxableValue = Math.round(item.total_price / 1.12);  // Remove 12% GST
      const totalGst     = item.total_price - taxableValue;

      return {
        description:   item.product_name,
        hsn:           HSN_CODE,
        quantity:      item.quantity,
        unit:          "Jar",
        variantLabel:  item.variant_label,
        unitPrice:     Math.round(item.unit_price / 1.12),  // Taxable unit price (ex-GST)
        taxableValue,
        cgst:          isIntrastate ? Math.round(totalGst / 2) : 0,
        sgst:          isIntrastate ? Math.round(totalGst / 2) : 0,
        igst:          isIntrastate ? 0 : totalGst,
        total:         item.total_price,
      };
    });

    const subtotalTaxable  = lineItems.reduce((a, i) => a + i.taxableValue, 0);
    const totalCgst        = lineItems.reduce((a, i) => a + i.cgst, 0);
    const totalSgst        = lineItems.reduce((a, i) => a + i.sgst, 0);
    const totalIgst        = lineItems.reduce((a, i) => a + i.igst, 0);
    const deliveryChargeEx = order.delivery_charge > 0 ? Math.round(order.delivery_charge / 1.18) : 0;
    const grandTotal       = order.total;

    const invoice = {
      invoiceNumber:    `INV-${order.order_number}`,
      invoiceDate:      new Date(order.created_at).toLocaleDateString("en-IN"),
      orderNumber:      order.order_number,
      orderDate:        new Date(order.created_at).toLocaleDateString("en-IN"),

      seller: SELLER,

      buyer: {
        name:         addr?.name    || order.customer_name || "Customer",
        address:      [addr?.address_line1, addr?.address_line2, addr?.landmark].filter(Boolean).join(", "),
        city:         addr?.city    || "",
        state:        addr?.state   || "",
        pincode:      addr?.pincode || "",
        mobile:       addr?.mobile  || order.customer_mobile || "",
        email:        order.customer_email || "",
        gstin:        null,  // Customer GSTIN (B2B) — null for B2C
      },

      lineItems,

      totals: {
        subtotalTaxable,
        totalCgst,
        totalSgst,
        totalIgst,
        couponDiscount: order.coupon_discount || 0,
        deliveryCharge: order.delivery_charge || 0,
        codCharge:      order.cod_charge      || 0,
        grandTotal,
        amountInWords: paise2Words(grandTotal),
      },

      supplyType:     isIntrastate ? "Intra-State (AP to AP)" : "Inter-State",
      taxScheme:      isIntrastate ? "CGST + SGST @ 6% each" : "IGST @ 12%",
      hsnCode:        HSN_CODE,
      notes:          [
        "Homemade product. Made in small batches with no artificial preservatives.",
        "FSSAI License: Application In Progress.",
        "For complaints/queries: maaflavours74@gmail.com | +91 98765 43210",
      ],
    };

    return NextResponse.json(invoice);

  } catch (err: any) {
    console.error("[admin/invoice]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── Convert paise to Indian words ───────────────────────────────────────────
function paise2Words(paise: number): string {
  const rupees = Math.floor(paise / 100);
  const ps     = paise % 100;
  const words  = rupees2Words(rupees);
  return `${words} Rupees${ps > 0 ? ` and ${ps} Paise` : ""} Only`;
}

function rupees2Words(n: number): string {
  const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
                "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
                "Seventeen", "Eighteen", "Nineteen"];
  const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if (n === 0) return "Zero";
  if (n < 20)  return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "");
  if (n < 1000) return ONES[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + rupees2Words(n % 100) : "");

  const scales = [
    [10000000, "Crore"], [100000, "Lakh"], [1000, "Thousand"],
  ] as const;
  for (const [div, name] of scales) {
    if (n >= div) {
      return rupees2Words(Math.floor(n / div)) + " " + name + (n % div ? " " + rupees2Words(n % div) : "");
    }
  }
  return "";
}

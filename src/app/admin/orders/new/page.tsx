// src/app/admin/orders/new/page.tsx
// Maa Flavours — Manual Order Entry
// Create orders from WhatsApp / phone / cash / walk-in customers.
// Counts in revenue, deducts stock, appears in prep list — identical to website orders.

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AdminPage, Card, Btn, Input, Select, A, fmtRupee,
} from "@/components/admin/AdminUI";

// ─── Zone-based shipping (same logic as create-order route) ───────────────────
const ZONE1 = ["andhra pradesh", "ap", "telangana", "ts"];
const ZONE2 = ["karnataka", "tamil nadu", "kerala", "goa", "puducherry", "pondicherry"];
const FREE_THRESHOLD = 89900; // ₹899 in paise

function calcDelivery(state: string, subtotal: number): number {
  if (subtotal >= FREE_THRESHOLD) return 0;
  const s = state.toLowerCase().trim();
  if (ZONE1.some(z => s.includes(z))) return 8900;
  if (ZONE2.some(z => s.includes(z))) return 14900;
  if (!state.trim()) return 0;
  return 18900;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Variant = {
  id:           string;
  label:        string;
  price:        number;  // paise
  weight_grams: number;
};

type Product = {
  id:       string;
  name:     string;
  slug:     string;
  variants: Variant[];
};

type OrderRow = {
  uid:          string;   // local key for React
  product_id:   string;
  variant_id:   string;
  product_name: string;
  variant_label:string;
  product_slug: string;
  unit_price:   number;  // paise
  quantity:     number;
};

const ORDER_SOURCES = [
  { value: "whatsapp",   label: "📱 WhatsApp" },
  { value: "phone",      label: "📞 Phone Call" },
  { value: "instagram",  label: "📸 Instagram DM" },
  { value: "facebook",   label: "👥 Facebook" },
  { value: "walk_in",    label: "🚶 Walk-in" },
  { value: "other",      label: "➕ Other" },
];

const PAYMENT_METHODS = [
  { value: "cash",          label: "💵 Cash" },
  { value: "upi",           label: "📲 UPI (GPay / PhonePe / Paytm)" },
  { value: "whatsapp_pay",  label: "💚 WhatsApp Pay" },
  { value: "cod",           label: "🚚 Cash on Delivery" },
  { value: "bank_transfer", label: "🏦 Bank Transfer" },
];

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Delhi","Jammu & Kashmir","Ladakh","Puducherry","Chandigarh","Other",
];

let rowCounter = 0;
function newUid() { return `row-${++rowCounter}`; }

// ─────────────────────────────────────────────────────────────────────────────
export default function NewOrderPage() {
  const router = useRouter();

  // ── Products data ──
  const [products,     setProducts]     = useState<Product[]>([]);
  const [loadingProds, setLoadingProds] = useState(true);

  // ── Order rows ──
  const [rows, setRows] = useState<OrderRow[]>([
    { uid: newUid(), product_id:"", variant_id:"", product_name:"", variant_label:"", product_slug:"", unit_price:0, quantity:1 },
  ]);

  // ── Customer ──
  const [custName,   setCustName]   = useState("");
  const [custMobile, setCustMobile] = useState("");
  const [custEmail,  setCustEmail]  = useState("");

  // ── Order type ──
  const [orderType, setOrderType] = useState<"delivery"|"pickup">("delivery");

  // ── Address ──
  const [addr1,    setAddr1]    = useState("");
  const [addr2,    setAddr2]    = useState("");
  const [landmark, setLandmark] = useState("");
  const [city,     setCity]     = useState("");
  const [state,    setState]    = useState("Andhra Pradesh");
  const [pincode,  setPincode]  = useState("");

  // ── Order meta ──
  const [source,        setSource]        = useState("whatsapp");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentStatus, setPaymentStatus] = useState<"paid"|"pending">("paid");
  const [notes,         setNotes]         = useState("");

  // ── Totals (editable delivery + discount) ──
  const [deliveryOverride, setDeliveryOverride] = useState<number | null>(null);
  const [discountRs,       setDiscountRs]       = useState(0);  // rupees

  // ── Submit state ──
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  // ── Fetch products ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/admin/products?limit=100&active=true")
      .then(r => r.json())
      .then(d => {
        const prods: Product[] = (d.products || []).map((p: any) => ({
          id:       p.id,
          name:     p.name,
          slug:     p.slug,
          variants: (p.variants || []).map((v: any) => ({
            id:           v.id,
            label:        v.label,
            price:        v.discounted_price ?? v.price,
            weight_grams: v.weight_grams,
          })).filter((v: Variant) => v.id),
        })).filter((p: Product) => p.variants.length > 0);
        setProducts(prods);
      })
      .catch(() => {})
      .finally(() => setLoadingProds(false));
  }, []);

  // ── Calculated totals ──────────────────────────────────────────────────────
  const subtotalPaise = rows.reduce((s, r) => s + r.unit_price * r.quantity, 0);
  const autoDelivery  = orderType === "pickup" ? 0 : calcDelivery(state, subtotalPaise);
  const deliveryPaise = orderType === "pickup" ? 0 : (deliveryOverride !== null ? deliveryOverride * 100 : autoDelivery);
  const discountPaise = discountRs * 100;
  const totalPaise    = Math.max(0, subtotalPaise - discountPaise + deliveryPaise);

  // ── Auto-update delivery when state or subtotal changes ───────────────────
  useEffect(() => {
    setDeliveryOverride(null); // reset override when state changes
  }, [state, orderType]);

  // ── Row helpers ────────────────────────────────────────────────────────────
  function addRow() {
    setRows(r => [...r, { uid: newUid(), product_id:"", variant_id:"", product_name:"", variant_label:"", product_slug:"", unit_price:0, quantity:1 }]);
  }

  function removeRow(uid: string) {
    setRows(r => r.filter(x => x.uid !== uid));
  }

  function setRowProduct(uid: string, productId: string) {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    const v = prod.variants[0];
    setRows(r => r.map(x => x.uid !== uid ? x : {
      ...x,
      product_id:    prod.id,
      product_name:  prod.name,
      product_slug:  prod.slug,
      variant_id:    v?.id    || "",
      variant_label: v?.label || "",
      unit_price:    v?.price || 0,
    }));
  }

  function setRowVariant(uid: string, variantId: string) {
    const row  = rows.find(r => r.uid === uid);
    const prod = products.find(p => p.id === row?.product_id);
    const v    = prod?.variants.find(v => v.id === variantId);
    if (!v) return;
    setRows(r => r.map(x => x.uid !== uid ? x : {
      ...x,
      variant_id:    v.id,
      variant_label: v.label,
      unit_price:    v.price,
    }));
  }

  function setRowQty(uid: string, qty: number) {
    setRows(r => r.map(x => x.uid !== uid ? x : { ...x, quantity: Math.max(1, qty) }));
  }

  // ── Validation ─────────────────────────────────────────────────────────────
  function validate(): string | null {
    if (!custName.trim() || custName.trim().length < 2) return "Customer name is required (min 2 chars)";
    if (!/^[6-9]\d{9}$/.test(custMobile)) return "Enter a valid 10-digit mobile number";
    if (rows.every(r => !r.product_id)) return "Add at least one product";
    if (rows.some(r => r.product_id && !r.variant_id)) return "Select a size for every product";
    if (orderType === "delivery") {
      if (!addr1.trim())   return "Address Line 1 is required for delivery";
      if (!city.trim())    return "City is required";
      if (!state.trim())   return "State is required";
      if (!/^\d{6}$/.test(pincode)) return "Enter a valid 6-digit pincode";
    }
    return null;
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    const validErr = validate();
    if (validErr) { setError(validErr); return; }
    setError("");
    setSubmitting(true);

    const validRows = rows.filter(r => r.product_id && r.variant_id);

    const body = {
      customer: { name: custName.trim(), mobile: custMobile, email: custEmail.trim() || undefined },
      address: orderType === "delivery" ? {
        full_name:    custName.trim(),
        mobile:       custMobile,
        address_line1: addr1.trim(),
        address_line2: addr2.trim() || undefined,
        landmark:     landmark.trim() || undefined,
        city:         city.trim(),
        state:        state,
        pincode:      pincode,
      } : null,
      order_type:     orderType,
      items:          validRows.map(r => ({
        product_id:    r.product_id,
        variant_id:    r.variant_id,
        product_name:  r.product_name,
        variant_label: r.variant_label,
        product_slug:  r.product_slug,
        quantity:      r.quantity,
        unit_price:    r.unit_price,
      })),
      payment_method:  paymentMethod,
      payment_status:  paymentStatus,
      source,
      delivery_charge: deliveryPaise,
      discount:        discountPaise,
      notes:           notes.trim() || undefined,
    };

    try {
      const res  = await fetch("/api/admin/orders", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Failed to create order"); setSubmitting(false); return; }
      router.push(`/admin/orders/${data.orderId}`);
    } catch (e: any) {
      setError(e.message || "Network error");
      setSubmitting(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <AdminPage>
      {/* ── Back + Title ── */}
      <div className="flex items-center gap-3">
        <Link href="/admin/orders">
          <Btn variant="ghost" size="sm">← Back</Btn>
        </Link>
        <div>
          <h1 className="font-playfair font-bold text-xl" style={{ color: A.brown }}>New Manual Order</h1>
          <p className="font-dm-sans text-sm" style={{ color: A.grey }}>WhatsApp · Phone · Cash · Walk-in</p>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl font-dm-sans text-sm font-semibold" style={{ background:"rgba(192,39,45,0.08)", border:"1px solid rgba(192,39,45,0.25)", color:"#C0272D" }}>
          ⚠️ {error}
        </div>
      )}

      <div className="grid xl:grid-cols-3 gap-6">

        {/* ── Left column: Products + Customer + Address ── */}
        <div className="xl:col-span-2 space-y-6">

          {/* Products */}
          <Card title="Products Ordered" subtitle="Add every item the customer ordered">
            <div className="space-y-3">
              {loadingProds ? (
                <div className="py-6 text-center font-dm-sans text-sm" style={{ color: A.grey }}>Loading products…</div>
              ) : (
                <>
                  {rows.map((row, idx) => (
                    <ProductRow
                      key={row.uid}
                      row={row}
                      products={products}
                      onProductChange={pid => setRowProduct(row.uid, pid)}
                      onVariantChange={vid => setRowVariant(row.uid, vid)}
                      onQtyChange={qty => setRowQty(row.uid, qty)}
                      onRemove={rows.length > 1 ? () => removeRow(row.uid) : undefined}
                      index={idx}
                    />
                  ))}
                  <button
                    onClick={addRow}
                    className="w-full py-2.5 rounded-xl font-dm-sans text-sm font-semibold transition-all"
                    style={{ background: A.cream, border:`1.5px dashed rgba(200,150,12,0.4)`, color: A.gold }}
                  >
                    + Add Another Product
                  </button>
                </>
              )}
            </div>
          </Card>

          {/* Customer */}
          <Card title="Customer Details">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Full Name *"
                  placeholder="Customer's full name"
                  value={custName}
                  onChange={e => setCustName(e.target.value)}
                />
              </div>
              <Input
                label="Mobile Number *"
                placeholder="10-digit mobile"
                value={custMobile}
                onChange={e => setCustMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              />
              <Input
                label="Email (optional)"
                placeholder="for order receipt"
                value={custEmail}
                onChange={e => setCustEmail(e.target.value)}
              />
            </div>
          </Card>

          {/* Order type + Address */}
          <Card title="Delivery or Pickup?">
            {/* Toggle */}
            <div className="flex gap-3 mb-4">
              {(["delivery", "pickup"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setOrderType(t)}
                  className="flex-1 py-2.5 rounded-xl font-dm-sans text-sm font-semibold transition-all"
                  style={{
                    background: orderType === t ? A.brown    : A.cream,
                    color:      orderType === t ? "#fff"      : A.grey,
                    border:     `1px solid ${orderType === t ? A.brown : A.border}`,
                  }}
                >
                  {t === "delivery" ? "🚚 Delivery" : "🏪 Pickup / In-person"}
                </button>
              ))}
            </div>

            {orderType === "delivery" && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Address Line 1 *"
                    placeholder="House / Flat / Street"
                    value={addr1}
                    onChange={e => setAddr1(e.target.value)}
                  />
                </div>
                <Input
                  label="Address Line 2"
                  placeholder="Colony / Area"
                  value={addr2}
                  onChange={e => setAddr2(e.target.value)}
                />
                <Input
                  label="Landmark"
                  placeholder="Near…"
                  value={landmark}
                  onChange={e => setLandmark(e.target.value)}
                />
                <Input
                  label="City *"
                  placeholder="City / Town"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                />
                <div>
                  <label className="block font-dm-sans text-xs font-semibold mb-1.5" style={{ color: A.brown }}>State *</label>
                  <select
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg font-dm-sans text-sm outline-none"
                    style={{ border:`1px solid ${A.border}`, background:"#fff", color:A.brown }}
                  >
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <Input
                  label="Pincode *"
                  placeholder="6-digit pincode"
                  value={pincode}
                  onChange={e => setPincode(e.target.value.replace(/\D/g, "").slice(0,6))}
                />
              </div>
            )}

            {orderType === "pickup" && (
              <div
                className="px-4 py-3 rounded-lg font-dm-sans text-sm"
                style={{ background:"rgba(200,150,12,0.07)", border:"1px solid rgba(200,150,12,0.2)", color:A.brown }}
              >
                🏪 No delivery charge. Customer picks up in person.
              </div>
            )}
          </Card>
        </div>

        {/* ── Right column: Payment + Totals ── */}
        <div className="space-y-6">

          {/* Order source */}
          <Card title="Order Source">
            <div className="grid grid-cols-2 gap-2">
              {ORDER_SOURCES.map(s => (
                <button
                  key={s.value}
                  onClick={() => setSource(s.value)}
                  className="px-2 py-2.5 rounded-xl font-dm-sans text-xs font-semibold text-center transition-all"
                  style={{
                    background: source === s.value ? A.brown    : A.cream,
                    color:      source === s.value ? "#fff"      : A.grey,
                    border:     `1px solid ${source === s.value ? A.brown : A.border}`,
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Payment */}
          <Card title="Payment">
            <div className="space-y-3">
              <div>
                <label className="block font-dm-sans text-xs font-semibold mb-1.5" style={{ color: A.brown }}>Payment Method</label>
                <div className="space-y-1.5">
                  {PAYMENT_METHODS.map(m => (
                    <label
                      key={m.value}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all"
                      style={{ background: paymentMethod === m.value ? "rgba(200,150,12,0.08)" : "transparent", border:`1px solid ${paymentMethod === m.value ? "rgba(200,150,12,0.3)" : "transparent"}` }}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value={m.value}
                        checked={paymentMethod === m.value}
                        onChange={() => setPaymentMethod(m.value)}
                        style={{ accentColor: A.gold }}
                      />
                      <span className="font-dm-sans text-sm" style={{ color: A.brown }}>{m.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-dm-sans text-xs font-semibold mb-1.5" style={{ color: A.brown }}>Payment Status</label>
                <div className="flex gap-2">
                  {([
                    { v:"paid",    label:"✅ Paid",        bg:"rgba(46,125,50,0.1)",  color:"#2E7D32", border:"rgba(46,125,50,0.3)"  },
                    { v:"pending", label:"⏳ COD / Pending", bg:"rgba(200,150,12,0.1)", color:"#B8750A", border:"rgba(200,150,12,0.3)" },
                  ] as const).map(o => (
                    <button
                      key={o.v}
                      onClick={() => setPaymentStatus(o.v)}
                      className="flex-1 py-2 rounded-lg font-dm-sans text-xs font-semibold transition-all"
                      style={{
                        background: paymentStatus === o.v ? o.bg      : A.cream,
                        color:      paymentStatus === o.v ? o.color   : A.grey,
                        border:     `1px solid ${paymentStatus === o.v ? o.border : A.border}`,
                      }}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Totals */}
          <Card title="Order Total">
            <div className="space-y-3">

              {/* Subtotal */}
              <div className="flex justify-between font-dm-sans text-sm">
                <span style={{ color: A.grey }}>Subtotal ({rows.filter(r=>r.product_id).length} item{rows.filter(r=>r.product_id).length !== 1?"s":""})</span>
                <span style={{ color: A.brown, fontWeight:600 }}>{fmtRupee(subtotalPaise)}</span>
              </div>

              {/* Delivery */}
              {orderType === "delivery" && (
                <div className="flex items-center justify-between font-dm-sans text-sm gap-3">
                  <span style={{ color: A.grey }}>Delivery charge</span>
                  <div className="flex items-center gap-1">
                    <span style={{ color: A.grey, fontSize:11 }}>₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={deliveryOverride !== null ? deliveryOverride : Math.round(autoDelivery / 100)}
                      onChange={e => setDeliveryOverride(Math.max(0, Number(e.target.value)))}
                      className="w-20 text-right px-2 py-1 rounded-lg font-dm-sans text-sm outline-none"
                      style={{ border:`1px solid ${A.border}`, color:A.brown }}
                    />
                  </div>
                </div>
              )}

              {/* Discount */}
              <div className="flex items-center justify-between font-dm-sans text-sm gap-3">
                <span style={{ color: A.grey }}>Discount (₹)</span>
                <div className="flex items-center gap-1">
                  <span style={{ color: A.grey, fontSize:11 }}>₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={discountRs || ""}
                    placeholder="0"
                    onChange={e => setDiscountRs(Math.max(0, Number(e.target.value)))}
                    className="w-20 text-right px-2 py-1 rounded-lg font-dm-sans text-sm outline-none"
                    style={{ border:`1px solid ${A.border}`, color:A.brown }}
                  />
                </div>
              </div>

              <div className="border-t pt-3" style={{ borderColor: A.border }}>
                <div className="flex justify-between font-dm-sans font-bold text-base">
                  <span style={{ color: A.brown }}>Total</span>
                  <span style={{ color: A.gold, fontSize:20 }}>{fmtRupee(totalPaise)}</span>
                </div>
                <p className="font-dm-sans text-xs mt-0.5" style={{ color: A.grey }}>
                  {paymentStatus === "paid" ? "✅ Payment received" : "⏳ Collect payment on delivery"}
                </p>
              </div>
            </div>
          </Card>

          {/* Notes */}
          <Card title="Notes (optional)">
            <textarea
              rows={3}
              placeholder="Any special instructions, WhatsApp message summary, etc."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg font-dm-sans text-sm outline-none resize-none"
              style={{ border:`1px solid ${A.border}`, color:A.brown }}
            />
          </Card>

          {/* Submit */}
          <Btn
            variant="primary"
            className="w-full py-4 text-base"
            loading={submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Creating Order…" : `✅ Create Order · ${fmtRupee(totalPaise)}`}
          </Btn>

          <p className="font-dm-sans text-xs text-center" style={{ color: A.grey }}>
            Order will be confirmed immediately and appear in the Orders list, Prep list, and revenue reports.
          </p>
        </div>
      </div>
    </AdminPage>
  );
}

// ─── Product Row Component ─────────────────────────────────────────────────────
function ProductRow({
  row,
  products,
  onProductChange,
  onVariantChange,
  onQtyChange,
  onRemove,
  index,
}: {
  row:             OrderRow;
  products:        Product[];
  onProductChange: (id: string) => void;
  onVariantChange: (id: string) => void;
  onQtyChange:     (qty: number) => void;
  onRemove?:       () => void;
  index:           number;
}) {
  const prod = products.find(p => p.id === row.product_id);

  return (
    <div
      className="p-3 rounded-xl"
      style={{ background: A.cream, border:`1px solid ${A.border}` }}
    >
      <div className="flex items-start gap-2">
        <span className="font-dm-sans text-xs font-bold mt-3 w-5 text-center shrink-0" style={{ color: A.grey }}>
          {index + 1}
        </span>
        <div className="flex-1 grid sm:grid-cols-3 gap-2">
          {/* Product select */}
          <div className="sm:col-span-2">
            <label className="block font-dm-sans text-xs font-semibold mb-1" style={{ color: A.brown }}>Product</label>
            <select
              value={row.product_id}
              onChange={e => onProductChange(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg font-dm-sans text-sm outline-none"
              style={{ border:`1px solid rgba(200,150,12,0.3)`, background:"#fff", color:A.brown }}
            >
              <option value="">— Select product —</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Variant select */}
          <div>
            <label className="block font-dm-sans text-xs font-semibold mb-1" style={{ color: A.brown }}>Size</label>
            <select
              value={row.variant_id}
              onChange={e => onVariantChange(e.target.value)}
              disabled={!prod}
              className="w-full px-2.5 py-2 rounded-lg font-dm-sans text-sm outline-none"
              style={{ border:`1px solid rgba(200,150,12,0.3)`, background:prod?"#fff":"#f5f5f5", color:A.brown, opacity: prod?1:0.5 }}
            >
              {(prod?.variants || []).map(v => (
                <option key={v.id} value={v.id}>{v.label} — ₹{(v.price/100).toFixed(0)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Remove button */}
        {onRemove && (
          <button
            onClick={onRemove}
            className="mt-6 p-1.5 rounded-lg transition-all"
            style={{ color:"#C0272D", background:"rgba(192,39,45,0.07)" }}
            title="Remove row"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>

      {/* Qty + Price row */}
      {row.product_id && (
        <div className="flex items-center gap-3 mt-2 pl-7">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onQtyChange(row.quantity - 1)}
              className="w-7 h-7 rounded-lg font-bold text-base flex items-center justify-center"
              style={{ background:"#fff", border:`1px solid ${A.border}`, color:A.brown }}
            >−</button>
            <span className="w-8 text-center font-dm-sans font-bold text-sm" style={{ color:A.brown }}>{row.quantity}</span>
            <button
              onClick={() => onQtyChange(row.quantity + 1)}
              className="w-7 h-7 rounded-lg font-bold text-base flex items-center justify-center"
              style={{ background:"#fff", border:`1px solid ${A.border}`, color:A.brown }}
            >+</button>
          </div>
          <span className="font-dm-sans text-xs" style={{ color:A.grey }}>
            × ₹{(row.unit_price/100).toFixed(0)} =
          </span>
          <span className="font-dm-sans font-bold text-sm" style={{ color:A.gold }}>
            ₹{(row.unit_price * row.quantity / 100).toFixed(0)}
          </span>
        </div>
      )}
    </div>
  );
}

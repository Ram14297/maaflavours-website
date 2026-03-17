// src/app/admin/orders/[orderId]/page.tsx
// Maa Flavours — Admin Order Detail (Full Build)
// Features:
//   • Full order info: items table, pricing breakdown, GST summary
//   • Status update with courier + tracking + note
//   • Customer & delivery address card
//   • Payment info card
//   • Animated status timeline with icons
//   • Printable GST invoice overlay
//   • WhatsApp dispatch message generator

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AdminPage, Card, Table, StatusBadge, Btn, Select, Input,
  Alert, Modal, fmtRupee, fmtDate, fmtDateTime, A, Spinner,
} from "@/components/admin/AdminUI";

// ─── Status flow with icons ───────────────────────────────────────────────────
const STATUS_FLOW = [
  { key:"pending",          icon:"🕐", label:"Order Placed"      },
  { key:"confirmed",        icon:"✅", label:"Confirmed"          },
  { key:"processing",       icon:"👩‍🍳", label:"Processing"        },
  { key:"packed",           icon:"📦", label:"Packed"             },
  { key:"shipped",          icon:"🚚", label:"Shipped"            },
  { key:"out_for_delivery", icon:"🛵", label:"Out for Delivery"   },
  { key:"delivered",        icon:"🎉", label:"Delivered"          },
];
const TERMINAL = ["cancelled","refunded"];

const STATUS_OPTIONS = [
  "pending","confirmed","processing","packed",
  "shipped","out_for_delivery","delivered","cancelled","refunded",
];

const COURIER_PARTNERS = [
  "", "DTDC", "Delhivery", "Blue Dart", "Ecom Express",
  "XpressBees", "Shadowfax", "India Post", "Other",
];

// ─────────────────────────────────────────────────────────────────────────────
export default function OrderDetailPage() {
  const { orderId }    = useParams<{ orderId: string }>();
  const searchParams   = useSearchParams();
  const router         = useRouter();
  const printRef       = useRef<HTMLDivElement>(null);

  const [data,         setData]         = useState<any>(null);
  const [loading,      setLoading]      = useState(true);
  const [updating,     setUpdating]     = useState(false);
  const [newStatus,    setNewStatus]    = useState("");
  const [trackId,      setTrackId]      = useState("");
  const [courier,      setCourier]      = useState("");
  const [trackUrl,     setTrackUrl]     = useState("");
  const [note,         setNote]         = useState("");
  const [error,        setError]        = useState("");
  const [success,      setSuccess]      = useState("");
  const [showInvoice,  setShowInvoice]  = useState(false);
  const [invoiceData,  setInvoiceData]  = useState<any>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [waMessage,    setWaMessage]    = useState("");
  const [showWa,       setShowWa]       = useState(false);
  const [copied,       setCopied]       = useState(false);

  const loadOrder = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/orders/${orderId}`);
      const d = await r.json();
      setData(d);
      setNewStatus(d.order?.status || "pending");
      setTrackId(d.order?.tracking_id || "");
      setCourier(d.order?.courier_name || "");
      setTrackUrl(d.order?.tracking_url || "");
    } catch {}
    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    loadOrder();
    // If ?invoice=1 in URL, auto-open invoice
    if (searchParams.get("invoice") === "1") {
      setTimeout(() => openInvoice(), 2000);
    }
  }, [orderId]);

  async function updateOrder() {
    setUpdating(true); setError(""); setSuccess("");
    const body: any = { status: newStatus, note };
    if (trackId)  body.trackingId  = trackId;
    if (courier)  body.courierName = courier;
    if (trackUrl) body.trackingUrl = trackUrl;
    const r = await fetch(`/api/admin/orders/${orderId}`, {
      method:"PATCH", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body),
    });
    const d = await r.json();
    if (!r.ok) {
      setError(d.error || "Update failed");
    } else {
      setSuccess(`Order status updated to "${newStatus.replace(/_/g," ")}"`);
      setData((prev: any) => ({ ...prev, order: { ...prev.order, ...d.order } }));
      // Auto-generate WhatsApp message for dispatch statuses
      if (newStatus === "shipped" || newStatus === "out_for_delivery") {
        generateWhatsApp(d.order || data?.order, newStatus);
      }
    }
    setUpdating(false);
  }

  async function openInvoice() {
    setInvoiceLoading(true); setShowInvoice(true);
    try {
      const r = await fetch(`/api/admin/orders/invoice?orderId=${orderId}`);
      const d = await r.json();
      setInvoiceData(d);
    } catch {
      setInvoiceData(null);
    }
    setInvoiceLoading(false);
  }

  function printInvoice() {
    if (!printRef.current) return;
    const html    = printRef.current.innerHTML;
    const w       = window.open("", "_blank", "width=900,height=700");
    if (!w) return;
    w.document.write(`
      <!DOCTYPE html><html><head>
        <title>Invoice — ${data?.order?.order_number}</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          * { box-sizing:border-box; margin:0; padding:0; }
          body { font-family:'DM Sans',sans-serif; font-size:12px; color:#1a1a1a; background:#fff; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head><body>${html}</body></html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 500);
  }

  function generateWhatsApp(order: any, newSt: string) {
    const addr    = order?.shipping_address || {};
    const track   = trackId || order?.tracking_id;
    const courierName = courier || order?.courier_name;
    let msg = "";

    if (newSt === "shipped") {
      msg = `🫙 *Maa Flavours — Your Order is on its Way!*\n\nNamaste ${addr.name || ""},\n\nYour order *${data?.order?.order_number}* has been dispatched!\n\n*Order Total:* ₹${(order.total/100).toLocaleString("en-IN")}\n`;
      if (courierName) msg += `*Courier:* ${courierName}\n`;
      if (track)       msg += `*Tracking ID:* ${track}\n`;
      if (trackUrl)    msg += `*Track Here:* ${trackUrl}\n`;
      msg += `\nExpected delivery in 5–7 working days across India.\n\nWith love 🌶️\n*Maa Flavours, Ongole*\nmaaflavours.com`;
    } else {
      msg = `🛵 *Maa Flavours — Out for Delivery Today!*\n\nNamaste ${addr.name || ""},\n\nYour order *${data?.order?.order_number}* is out for delivery today! Please keep your phone handy.\n\n*Order Total:* ₹${(order.total/100).toLocaleString("en-IN")}\n\nWith love 🌶️\n*Maa Flavours, Ongole*`;
    }

    setWaMessage(msg);
    setShowWa(true);
  }

  async function copyWa() {
    await navigator.clipboard.writeText(waMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openWaLink() {
    const addr    = data?.order?.shipping_address || {};
    const mobile  = addr.mobile;
    if (!mobile) return;
    const encoded = encodeURIComponent(waMessage);
    window.open(`https://wa.me/91${mobile}?text=${encoded}`, "_blank");
  }

  if (loading) {
    return <AdminPage><div className="flex justify-center py-20"><Spinner size={32}/></div></AdminPage>;
  }
  if (!data?.order) {
    return (
      <AdminPage>
        <Alert type="error">Order not found or you lack permission to view it.</Alert>
        <Link href="/admin/orders"><Btn variant="secondary">← Back to Orders</Btn></Link>
      </AdminPage>
    );
  }

  const { order, items, statusHistory } = data;
  const addr     = order.shipping_address || {};
  const isTerminal = TERMINAL.includes(order.status);

  // Find current position in flow
  const flowIndex = STATUS_FLOW.findIndex(s => s.key === order.status);

  return (
    <AdminPage>
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <Link href="/admin/orders">
            <button style={{ color:A.grey, fontSize:12 }} className="flex items-center gap-1 mb-2">
              ← All Orders
            </button>
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1
              style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color:A.brown }}
            >
              {order.order_number}
            </h1>
            <StatusBadge status={order.status}/>
            <StatusBadge status={order.payment_status || "pending"}/>
            {order.payment_method === "cod" && (
              <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background:"rgba(46,125,50,0.1)", color:"#2E7D32" }}>
                💵 COD
              </span>
            )}
          </div>
          <p style={{ color:A.grey, fontSize:12, marginTop:4 }}>
            Placed {fmtDateTime(order.created_at)}
            {order.delivered_at && ` · Delivered ${fmtDate(order.delivered_at)}`}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          <Btn variant="secondary" onClick={openInvoice}>
            📄 GST Invoice
          </Btn>
          {(order.status === "shipped" || order.status === "out_for_delivery") && (
            <Btn variant="secondary" onClick={() => { generateWhatsApp(order, order.status); }}>
              <span style={{ color:"#25D366" }}>📱</span> WhatsApp
            </Btn>
          )}
        </div>
      </div>

      {success && <Alert type="success">{success}</Alert>}
      {error   && <Alert type="error">{error}</Alert>}

      {/* ── Status Progress Bar ── */}
      {!isTerminal && (
        <Card>
          <div className="flex items-start gap-0 overflow-x-auto pb-2">
            {STATUS_FLOW.map((step, i) => {
              const isCompleted = flowIndex >= 0 && i <= flowIndex;
              const isCurrent   = i === flowIndex;
              const isLast      = i === STATUS_FLOW.length - 1;
              return (
                <div key={step.key} className="flex flex-col items-center shrink-0" style={{ minWidth:80 }}>
                  <div className="flex items-center w-full">
                    {/* Connector left */}
                    {i > 0 && (
                      <div className="flex-1 h-0.5 transition-colors"
                        style={{ background: isCompleted ? A.gold : A.border }}/>
                    )}
                    {/* Step circle */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0 transition-all"
                      style={{
                        background: isCurrent ? A.gold : isCompleted ? `${A.gold}30` : A.cream,
                        border:     `2px solid ${isCompleted ? A.gold : A.border}`,
                        boxShadow:  isCurrent ? `0 0 0 3px ${A.gold}25` : "none",
                      }}
                    >
                      {step.icon}
                    </div>
                    {/* Connector right */}
                    {!isLast && (
                      <div className="flex-1 h-0.5 transition-colors"
                        style={{ background: isCompleted && i < flowIndex ? A.gold : A.border }}/>
                    )}
                  </div>
                  <p
                    className="mt-1.5 text-center"
                    style={{
                      fontSize:   9,
                      fontWeight: isCurrent ? 700 : 400,
                      color:      isCurrent ? A.brown : A.grey,
                      lineHeight: 1.3,
                    }}
                  >
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ── Main grid ── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* ── Left: items + timeline ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Order Items Table */}
          <Card title="Order Items" noPad>
            <Table
              columns={[
                { key:"product", label:"Product"                 },
                { key:"variant", label:"Variant"                 },
                { key:"qty",     label:"Qty",      align:"center", width:"60px" },
                { key:"price",   label:"Unit Price",align:"right"              },
                { key:"total",   label:"Total",    align:"right"               },
              ]}
              rows={(items || []).map((item: any) => ({
                product: (
                  <div className="flex items-center gap-2">
                    <span className="text-xl shrink-0">🫙</span>
                    <div>
                      <p style={{ fontWeight:600, fontSize:13, color:A.brown }}>{item.product_name}</p>
                      <p style={{ fontSize:10, color:A.grey }}>HSN: 2001 · Pickle</p>
                    </div>
                  </div>
                ),
                variant: <span style={{ fontSize:12, color:A.grey }}>{item.variant_label}</span>,
                qty:     (
                  <span
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold"
                    style={{ background:`rgba(200,150,12,0.1)`, color:A.gold }}
                  >
                    {item.quantity}
                  </span>
                ),
                price:   <span style={{ fontSize:13 }}>{fmtRupee(item.unit_price)}</span>,
                total:   <span style={{ fontWeight:700, fontSize:14 }}>{fmtRupee(item.total_price)}</span>,
              }))}
            />

            {/* Pricing breakdown */}
            <div className="px-5 py-4 space-y-2.5 border-t" style={{ borderColor:A.border }}>
              {([
                ["Subtotal (incl. GST)",  fmtRupee(order.subtotal),       false],
                order.coupon_discount > 0
                  ? [`Coupon Discount${order.coupon_code ? ` — ${order.coupon_code}` : ""}`,
                     `−${fmtRupee(order.coupon_discount)}`, true]
                  : null,
                ["Delivery Charge",       fmtRupee(order.delivery_charge  || 0), false],
                order.cod_charge > 0
                  ? ["COD Handling Charge", fmtRupee(order.cod_charge),         false]
                  : null,
              ].filter(Boolean) as [string, string, boolean][]).map(([k, v, discount], i) => (
                <div key={i} className="flex justify-between items-center">
                  <span style={{ color: discount ? "#2E7D32" : A.grey, fontSize:13 }}>{k}</span>
                  <span style={{ color: discount ? "#2E7D32" : A.brown, fontSize:13, fontWeight: discount ? 600 : 400 }}>{v}</span>
                </div>
              ))}

              {/* GST summary */}
              {(order.cgst_amount > 0 || order.igst_amount > 0) && (
                <div
                  className="pt-2.5 border-t space-y-1.5"
                  style={{ borderColor:A.border }}
                >
                  <p style={{ fontSize:10, color:A.grey, letterSpacing:"0.1em", textTransform:"uppercase", fontWeight:600 }}>
                    GST Breakdown (included in price)
                  </p>
                  {order.cgst_amount > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span style={{ fontSize:11, color:A.grey }}>CGST ({order.cgst_rate}%)</span>
                        <span style={{ fontSize:11, color:A.grey }}>{fmtRupee(order.cgst_amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ fontSize:11, color:A.grey }}>SGST ({order.sgst_rate}%)</span>
                        <span style={{ fontSize:11, color:A.grey }}>{fmtRupee(order.sgst_amount)}</span>
                      </div>
                    </>
                  )}
                  {order.igst_amount > 0 && (
                    <div className="flex justify-between">
                      <span style={{ fontSize:11, color:A.grey }}>IGST ({order.igst_rate}%)</span>
                      <span style={{ fontSize:11, color:A.grey }}>{fmtRupee(order.igst_amount)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Grand total */}
              <div
                className="flex justify-between items-center pt-3 border-t"
                style={{ borderColor:A.border }}
              >
                <span style={{ fontWeight:700, fontSize:17, fontFamily:"'Playfair Display',serif", color:A.brown }}>
                  Grand Total
                </span>
                <span style={{ fontWeight:700, fontSize:20, color:A.gold, fontFamily:"'Playfair Display',serif" }}>
                  {fmtRupee(order.total)}
                </span>
              </div>
            </div>
          </Card>

          {/* Status Timeline */}
          <Card title="Order Timeline">
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px" style={{ background:A.border }}/>
              <div className="space-y-4">
                {/* Current + pending statuses at top */}
                {isTerminal && (
                  <div className="relative pl-10">
                    <div className="absolute left-2 -translate-x-1/2 w-4 h-4 rounded-full flex items-center justify-center text-xs"
                      style={{ background:"#FFEBEE", border:"2px solid #C0272D" }}>
                      {order.status === "cancelled" ? "✕" : "↩"}
                    </div>
                    <p style={{ color:"#C0272D", fontWeight:700, fontSize:13, textTransform:"capitalize" }}>
                      {order.status}
                    </p>
                  </div>
                )}
                {(statusHistory || []).map((h: any, i: number) => (
                  <div key={i} className="relative pl-10">
                    {/* Timeline dot */}
                    <div
                      className="absolute left-2 -translate-x-1/2 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{
                        background: i === 0 ? A.gold : "#fff",
                        border:     `2px solid ${i === 0 ? A.gold : A.border}`,
                        top: 2,
                      }}
                    >
                      {i === 0 && <div className="w-1.5 h-1.5 rounded-full bg-white"/>}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p style={{ color:A.brown, fontWeight:600, fontSize:13, textTransform:"capitalize" }}>
                          {STATUS_FLOW.find(s => s.key === h.new_status)?.icon || "📋"}{" "}
                          {h.new_status?.replace(/_/g," ")}
                        </p>
                        {h.tracking_id && (
                          <span className="text-xs px-2 py-0.5 rounded" style={{ background:`rgba(200,150,12,0.1)`, color:A.gold }}>
                            📦 {h.tracking_id}
                          </span>
                        )}
                      </div>
                      <p style={{ color:A.grey, fontSize:11, marginTop:1 }}>
                        {fmtDateTime(h.created_at)}
                        {h.changed_by && ` · by ${h.changed_by}`}
                      </p>
                      {h.note && (
                        <p style={{ color:A.brown, fontSize:12, marginTop:4, padding:"4px 8px", borderLeft:`2px solid ${A.gold}`, background:`rgba(200,150,12,0.04)` }}>
                          {h.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {/* Initial order placement */}
                <div className="relative pl-10">
                  <div className="absolute left-2 -translate-x-1/2 w-4 h-4 rounded-full"
                    style={{ background:A.cream, border:`2px solid ${A.border}`, top:2 }}/>
                  <p style={{ color:A.grey, fontWeight:500, fontSize:13 }}>📝 Order Placed</p>
                  <p style={{ color:A.grey, fontSize:11 }}>{fmtDateTime(order.created_at)}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-5">

          {/* Status Update Panel */}
          <Card
            title="Update Order"
            subtitle="Changes are logged with timestamp"
          >
            <div className="space-y-3">
              {/* Status select with visual indicators */}
              <div>
                <label style={{ color:A.grey, fontSize:11, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600 }}>
                  Order Status
                </label>
                <div className="mt-1.5 grid grid-cols-1 gap-1.5">
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => setNewStatus(s)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-all"
                      style={{
                        background: newStatus === s ? `rgba(200,150,12,0.1)` : "transparent",
                        border:     `1px solid ${newStatus === s ? A.gold : "transparent"}`,
                        color:      newStatus === s ? A.brown : A.grey,
                        fontWeight: newStatus === s ? 600 : 400,
                      }}
                    >
                      <span>{STATUS_FLOW.find(sf => sf.key === s)?.icon || (s === "cancelled" ? "✕" : "↩")}</span>
                      <span style={{ textTransform:"capitalize" }}>{s.replace(/_/g," ")}</span>
                      {s === order.status && (
                        <span className="ml-auto text-xs px-1.5 py-0.5 rounded"
                          style={{ background:`rgba(200,150,12,0.15)`, color:A.gold }}>current</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Show courier/tracking only when shipping status is selected */}
              {(newStatus === "shipped" || newStatus === "out_for_delivery") && (
                <>
                  <div>
                    <label style={{ color:A.grey, fontSize:11, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600 }}>
                      Courier Partner
                    </label>
                    <select
                      value={courier}
                      onChange={e => setCourier(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ background:"#fff", border:`1px solid ${A.border}`, color:A.brown }}
                    >
                      {COURIER_PARTNERS.map(c => <option key={c} value={c}>{c || "Select courier…"}</option>)}
                    </select>
                  </div>
                  <Input
                    label="Tracking ID"
                    placeholder="e.g. DTDC12345678901"
                    value={trackId}
                    onChange={e => setTrackId(e.target.value)}
                  />
                  <Input
                    label="Tracking URL (optional)"
                    placeholder="https://www.dtdc.in/tracking/…"
                    value={trackUrl}
                    onChange={e => setTrackUrl(e.target.value)}
                  />
                </>
              )}

              <Input
                label="Internal Note (optional)"
                placeholder="e.g. Customer requested fragile sticker"
                value={note}
                onChange={e => setNote(e.target.value)}
              />

              <Btn
                onClick={updateOrder}
                loading={updating}
                className="w-full justify-center"
                disabled={newStatus === order.status && !trackId && !note}
              >
                💾 Save Changes
              </Btn>

              {/* WhatsApp helper */}
              {(newStatus === "shipped" || newStatus === "out_for_delivery") && trackId && (
                <button
                  onClick={() => generateWhatsApp(order, newStatus)}
                  className="w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                  style={{ background:"rgba(37,211,102,0.1)", color:"#1B873C", border:"1px solid rgba(37,211,102,0.3)" }}
                >
                  <span>📱</span> Preview WhatsApp Message
                </button>
              )}
            </div>
          </Card>

          {/* Customer + Address */}
          <Card title="Customer & Delivery">
            <div className="space-y-4">
              {/* Customer */}
              <div>
                <p style={{ fontSize:10, color:A.grey, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>Customer</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background:`rgba(200,150,12,0.12)`, color:A.gold }}>
                    {(addr.name || "G").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight:600, fontSize:13, color:A.brown }}>{addr.name || "—"}</p>
                    <a href={`tel:+91${addr.mobile}`} style={{ fontSize:11, color:A.grey }}>
                      +91 {addr.mobile}
                    </a>
                  </div>
                </div>
              </div>

              {/* Delivery address */}
              <div className="p-3 rounded-lg" style={{ background:A.cream, border:`1px solid ${A.border}` }}>
                <p style={{ fontSize:10, color:A.grey, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>
                  Delivery Address
                </p>
                <div style={{ color:A.brown, fontSize:12, lineHeight:1.6 }}>
                  <p style={{ fontWeight:600 }}>{addr.name}</p>
                  <p>{addr.address_line1}</p>
                  {addr.address_line2 && <p>{addr.address_line2}</p>}
                  {addr.landmark && <p style={{ color:A.grey }}>{addr.landmark}</p>}
                  <p>{addr.city}, {addr.state}</p>
                  <p style={{ fontWeight:600 }}>PIN: {addr.pincode}</p>
                </div>
              </div>

              {/* Tracking info if dispatched */}
              {(order.tracking_id || order.courier_name) && (
                <div className="p-3 rounded-lg" style={{ background:"rgba(200,150,12,0.05)", border:`1px solid rgba(200,150,12,0.2)` }}>
                  <p style={{ fontSize:10, color:A.grey, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>
                    Tracking
                  </p>
                  {order.courier_name && <p style={{ color:A.brown, fontSize:12, fontWeight:600 }}>{order.courier_name}</p>}
                  {order.tracking_id  && <p style={{ color:A.gold, fontSize:13, fontWeight:700, fontFamily:"monospace" }}>{order.tracking_id}</p>}
                  {order.tracking_url && (
                    <a href={order.tracking_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs mt-1 inline-block"
                      style={{ color:A.gold, textDecoration:"underline" }}>
                      Track shipment →
                    </a>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Payment Info */}
          <Card title="Payment Summary">
            <div className="space-y-2.5">
              {([
                ["Payment Method",  (
                  <span key="pm" className="font-medium text-sm capitalize" style={{ color:A.brown }}>
                    {order.payment_method?.replace(/_/g," ") || "—"}
                  </span>
                )],
                ["Payment Status", <StatusBadge key="ps" status={order.payment_status || "pending"}/>],
                order.razorpay_payment_id ? ["Razorpay ID", (
                  <span key="rpid" className="font-mono text-xs" style={{ color:A.grey }}>{order.razorpay_payment_id}</span>
                )] : null,
                ["Order Placed",  fmtDateTime(order.created_at)],
                order.dispatched_at ? ["Dispatched",   fmtDate(order.dispatched_at)] : null,
                order.delivered_at  ? ["Delivered",    fmtDate(order.delivered_at)]  : null,
              ].filter(Boolean) as [string, React.ReactNode][]).map(([k, v], i) => (
                <div key={i} className="flex justify-between items-center gap-3">
                  <span style={{ color:A.grey, fontSize:12 }}>{k}</span>
                  <span style={{ color:A.brown, fontSize:12 }}>{v}</span>
                </div>
              ))}
              {order.customer_notes && (
                <div className="mt-2 pt-2 border-t" style={{ borderColor:A.border }}>
                  <p style={{ fontSize:11, color:A.grey, marginBottom:4 }}>Customer Note:</p>
                  <p style={{ fontSize:12, color:A.brown, fontStyle:"italic" }}>"{order.customer_notes}"</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ── GST Invoice Modal ── */}
      <Modal
        open={showInvoice}
        onClose={() => setShowInvoice(false)}
        title="GST Tax Invoice"
        width={860}
      >
        <div className="flex justify-between items-center mb-4">
          <p style={{ color:A.grey, fontSize:12 }}>
            Invoice: INV-{data?.order?.order_number} · PDF-ready format
          </p>
          <div className="flex gap-2">
            <Btn variant="secondary" size="sm" onClick={printInvoice}>🖨 Print / Save PDF</Btn>
            <Btn variant="ghost" size="sm" onClick={() => setShowInvoice(false)}>Close</Btn>
          </div>
        </div>

        {invoiceLoading ? (
          <div className="flex justify-center py-16"><Spinner size={28}/></div>
        ) : invoiceData ? (
          <div ref={printRef} style={{ fontFamily:"'DM Sans',sans-serif" }}>
            <GstInvoice data={invoiceData}/>
          </div>
        ) : (
          <Alert type="error">Could not load invoice data. Try again.</Alert>
        )}
      </Modal>

      {/* ── WhatsApp Message Modal ── */}
      <Modal
        open={showWa}
        onClose={() => setShowWa(false)}
        title="📱 WhatsApp Dispatch Message"
        width={540}
      >
        <div className="space-y-4">
          <div
            className="p-4 rounded-xl whitespace-pre-wrap text-sm leading-relaxed"
            style={{ background:"#E7FFDB", border:"1px solid rgba(37,211,102,0.3)", color:"#1a1a1a", fontFamily:"system-ui" }}
          >
            {waMessage}
          </div>
          <div className="flex gap-2">
            <Btn
              variant="secondary"
              onClick={copyWa}
              className="flex-1 justify-center"
            >
              {copied ? "✅ Copied!" : "📋 Copy Text"}
            </Btn>
            <Btn
              onClick={openWaLink}
              className="flex-1 justify-center"
              style={{ background:"#25D366" } as any}
            >
              Open WhatsApp →
            </Btn>
          </div>
          <p style={{ color:A.grey, fontSize:11, textAlign:"center" }}>
            Sends to +91 {addr.mobile} · Edit text as needed before sending
          </p>
        </div>
      </Modal>
    </AdminPage>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GST INVOICE COMPONENT (printable HTML)
// Format: standard Indian B2C GST invoice
// ─────────────────────────────────────────────────────────────────────────────
function GstInvoice({ data }: { data: any }) {
  const inv    = data;
  const seller = inv.seller || {};
  const buyer  = inv.buyer  || {};
  const items  = inv.lineItems || [];
  const totals = inv.totals   || {};
  const isIntrastate = buyer.state?.toLowerCase().includes("andhra");

  return (
    <div style={{ maxWidth:800, margin:"0 auto", padding:"24px 32px", background:"#fff", border:"1px solid #e0d8cc" }}>
      {/* ── Header ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, paddingBottom:16, borderBottom:"2px solid #C8960C" }}>
        <div>
          <p style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:22, fontWeight:700, color:"#4A2C0A", marginBottom:2 }}>
            Maa Flavours
          </p>
          <p style={{ fontSize:10, color:"#6B6B6B", letterSpacing:"0.12em", textTransform:"uppercase" }}>
            Authentic Andhra Pickles
          </p>
          <div style={{ marginTop:8, fontSize:11, color:"#4A2C0A", lineHeight:1.6 }}>
            <p>{seller.address || "Ongole, Andhra Pradesh — 523001"}</p>
            <p>📞 {seller.phone || "+91 98765 43210"}</p>
            <p>✉ {seller.email || "maaflavours74@gmail.com"}</p>
            <p>GSTIN: {seller.gstin || "Application Pending"}</p>
            <p>FSSAI: {seller.fssai || "Application In Progress"}</p>
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ background:"#C8960C", color:"#fff", padding:"6px 14px", borderRadius:4, fontSize:12, fontWeight:700, letterSpacing:"0.05em", marginBottom:8 }}>
            TAX INVOICE
          </div>
          <table style={{ fontSize:11, color:"#4A2C0A", marginLeft:"auto" }}>
            <tbody>
              <tr><td style={{ color:"#6B6B6B", paddingRight:12 }}>Invoice No.</td><td style={{ fontWeight:700 }}>{inv.invoiceNumber || `INV-${inv.orderNumber}`}</td></tr>
              <tr><td style={{ color:"#6B6B6B" }}>Order No.</td><td>{inv.orderNumber}</td></tr>
              <tr><td style={{ color:"#6B6B6B" }}>Date</td><td>{inv.invoiceDate}</td></tr>
              <tr><td style={{ color:"#6B6B6B" }}>Place of Supply</td><td>{buyer.state || "—"}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Billed To ── */}
      <div style={{ marginBottom:20, padding:"12px 16px", background:"#F5EFE0", borderRadius:6 }}>
        <p style={{ fontSize:10, color:"#6B6B6B", letterSpacing:"0.12em", textTransform:"uppercase", fontWeight:600, marginBottom:6 }}>
          Billed To / Delivery Address
        </p>
        <div style={{ fontSize:12, color:"#4A2C0A", lineHeight:1.6 }}>
          <p style={{ fontWeight:700, fontSize:13 }}>{buyer.name || "—"}</p>
          {buyer.address_line1 && <p>{buyer.address_line1}</p>}
          {buyer.address_line2 && <p>{buyer.address_line2}</p>}
          {buyer.landmark      && <p style={{ color:"#6B6B6B" }}>{buyer.landmark}</p>}
          <p>{buyer.city}, {buyer.state} — {buyer.pincode}</p>
          <p>📞 +91 {buyer.mobile}</p>
        </div>
      </div>

      {/* ── Line Items Table ── */}
      <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:16, fontSize:12 }}>
        <thead>
          <tr style={{ background:"#4A2C0A", color:"#fff" }}>
            {["#","Description","HSN","Qty","Unit Price","Taxable Value","GST","Total"].map((h,i) => (
              <th key={i} style={{ padding:"8px 10px", textAlign: i >= 4 ? "right" : "left", fontWeight:600, fontSize:11, letterSpacing:"0.05em" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item: any, i: number) => (
            <tr key={i} style={{ borderBottom:"1px solid #EDE3CE", background: i % 2 === 0 ? "#fff" : "#FDFAF4" }}>
              <td style={{ padding:"8px 10px", color:"#6B6B6B" }}>{i + 1}</td>
              <td style={{ padding:"8px 10px", fontWeight:500 }}>{item.description}<br/><span style={{ fontSize:10, color:"#6B6B6B" }}>{item.variant}</span></td>
              <td style={{ padding:"8px 10px", color:"#6B6B6B" }}>{item.hsn}</td>
              <td style={{ padding:"8px 10px" }}>{item.quantity}</td>
              <td style={{ padding:"8px 10px", textAlign:"right" }}>₹{((item.unitPrice || 0) / 100).toFixed(2)}</td>
              <td style={{ padding:"8px 10px", textAlign:"right" }}>₹{((item.taxableValue || 0) / 100).toFixed(2)}</td>
              <td style={{ padding:"8px 10px", textAlign:"right", fontSize:10, color:"#6B6B6B" }}>
                {isIntrastate
                  ? `CGST ${(item.cgstRate || 0) * 100}% + SGST ${(item.sgstRate || 0) * 100}%`
                  : `IGST ${(item.igstRate || 0) * 100}%`
                }<br/>
                ₹{((item.totalGst || 0) / 100).toFixed(2)}
              </td>
              <td style={{ padding:"8px 10px", textAlign:"right", fontWeight:700 }}>₹{((item.totalPrice || 0) / 100).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Totals ── */}
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:20 }}>
        <table style={{ fontSize:12, minWidth:280 }}>
          <tbody>
            {([
              ["Subtotal",          `₹${((totals.subtotal || 0)/100).toFixed(2)}`],
              totals.couponDiscount > 0 ? [`Coupon (${totals.couponCode || ""})`, `−₹${(totals.couponDiscount/100).toFixed(2)}`] : null,
              totals.deliveryCharge > 0 ? ["Delivery", `₹${(totals.deliveryCharge/100).toFixed(2)}`] : null,
              isIntrastate ? [`CGST @ ${(totals.cgstRate || 6)}%`, `₹${((totals.cgstAmount || 0)/100).toFixed(2)}`]   : null,
              isIntrastate ? [`SGST @ ${(totals.sgstRate || 6)}%`, `₹${((totals.sgstAmount || 0)/100).toFixed(2)}`]   : null,
              !isIntrastate && totals.igstAmount > 0 ? [`IGST @ ${(totals.igstRate || 12)}%`, `₹${(totals.igstAmount/100).toFixed(2)}`] : null,
            ].filter(Boolean) as [string, string][]).map(([k,v],i) => (
              <tr key={i}>
                <td style={{ padding:"3px 12px 3px 0", color:"#6B6B6B" }}>{k}</td>
                <td style={{ padding:"3px 0", textAlign:"right" }}>{v}</td>
              </tr>
            ))}
            <tr style={{ borderTop:"2px solid #C8960C" }}>
              <td style={{ padding:"8px 12px 4px 0", fontWeight:700, fontSize:14, color:"#4A2C0A" }}>Total Amount</td>
              <td style={{ padding:"8px 0 4px", textAlign:"right", fontWeight:700, fontSize:16, color:"#C8960C" }}>
                ₹{((totals.grandTotal || 0)/100).toLocaleString("en-IN", { minimumFractionDigits:2 })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Amount in words */}
      <div style={{ padding:"8px 16px", background:"#F5EFE0", borderRadius:4, marginBottom:20, fontSize:11 }}>
        <strong style={{ color:"#4A2C0A" }}>Amount in Words:</strong>{" "}
        <span style={{ color:"#6B6B6B" }}>{totals.amountInWords || "—"}</span>
      </div>

      {/* ── Footer ── */}
      <div style={{ display:"flex", justifyContent:"space-between", paddingTop:16, borderTop:"1px solid #EDE3CE", fontSize:10, color:"#9B9B9B" }}>
        <div>
          <p>This is a computer-generated invoice. No signature required.</p>
          <p>Goods once sold will not be taken back. Subject to Ongole jurisdiction.</p>
        </div>
        <div style={{ textAlign:"right" }}>
          <p>Thank you for your order!</p>
          <p style={{ marginTop:2, fontWeight:600, color:"#C8960C" }}>maaflavours.com</p>
        </div>
      </div>
    </div>
  );
}

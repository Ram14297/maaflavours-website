// src/app/admin/orders/page.tsx
// Maa Flavours — Admin Orders List (Full Build)
// Features:
//   • Search by order # / customer name / mobile
//   • Filter by status, payment method, date range
//   • Status badge + quick inline status update
//   • Bulk CSV export
//   • Paginated table with totals strip
//   • Row click → opens detail page

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  AdminPage, Card, Table, StatusBadge, Btn, Input, Select,
  Pagination, Alert, fmt₹, fmtDateTime, fmtDate, A,
} from "@/components/admin/AdminUI";

// ─── Constants ────────────────────────────────────────────────────────────────
const ORDER_STATUSES = [
  "",
  "pending", "confirmed", "processing", "packed",
  "shipped", "out_for_delivery", "delivered",
  "cancelled", "refunded",
];

const STATUS_LABELS: Record<string,string> = {
  pending:          "Pending",
  confirmed:        "Confirmed",
  processing:       "Processing",
  packed:           "Packed",
  shipped:          "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered:        "Delivered",
  cancelled:        "Cancelled",
  refunded:         "Refunded",
};

const PAYMENT_METHODS = [
  { value:"",                  label:"All Methods"      },
  { value:"razorpay_upi",      label:"Razorpay UPI"     },
  { value:"razorpay_card",     label:"Razorpay Card"    },
  { value:"razorpay_netbanking",label:"Netbanking"      },
  { value:"cod",               label:"Cash on Delivery" },
];

// ─── Status step flow — for quick next-action hints ───────────────────────────
const NEXT_STATUS: Record<string,string> = {
  pending:    "confirmed",
  confirmed:  "processing",
  processing: "packed",
  packed:     "shipped",
  shipped:    "out_for_delivery",
  out_for_delivery: "delivered",
};

// ─────────────────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const [orders,   setOrders]   = useState<any[]>([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [pages,    setPages]    = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [status,   setStatus]   = useState("");
  const [payment,  setPayment]  = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");
  const [exporting,setExporting]= useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast,    setToast]    = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  // Debounced search
  function handleSearch(val: string) {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setPage(1); }, 400);
  }

  const load = useCallback(async (p: number) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit:"20" });
    if (search)   params.set("search",  search);
    if (status)   params.set("status",  status);
    if (payment)  params.set("payment", payment);
    try {
      const r = await fetch(`/api/admin/orders?${params}`);
      const d = await r.json();
      setOrders(d.orders || []);
      setTotal(d.total   || 0);
      setPages(d.pages   || 1);
    } catch {}
    setLoading(false);
  }, [search, status, payment]);

  useEffect(() => { load(page); }, [page, load]);

  // Quick status advance (e.g. confirm a pending order in one click)
  async function quickAdvance(orderId: string, currentStatus: string, e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    const next = NEXT_STATUS[currentStatus];
    if (!next) return;
    setUpdatingId(orderId);
    const r = await fetch(`/api/admin/orders/${orderId}`, {
      method:  "PATCH",
      headers: { "Content-Type":"application/json" },
      body:    JSON.stringify({ status: next }),
    });
    if (r.ok) {
      showToast(`Order advanced to "${STATUS_LABELS[next]}"`);
      await load(page);
    }
    setUpdatingId(null);
  }

  // Export current filtered orders as CSV
  async function exportCSV() {
    setExporting(true);
    try {
      // Fetch all (limit=1000) with current filters
      const params = new URLSearchParams({ page:"1", limit:"1000" });
      if (search)  params.set("search",  search);
      if (status)  params.set("status",  status);
      if (payment) params.set("payment", payment);
      const r = await fetch(`/api/admin/orders?${params}`);
      const d = await r.json();

      const header = "Order #,Customer,Mobile,Amount (₹),Payment,Status,Date";
      const rows   = (d.orders || []).map((o: any) =>
        `"${o.order_number}","${o.customer_name || "—"}","${o.customer_mobile || ""}",${(o.total/100).toFixed(2)},"${o.payment_method?.replace(/_/g," ") || ""}","${o.status}","${fmtDateTime(o.created_at)}"`
      );
      const csv  = [header, ...rows].join("\n");
      const blob = new Blob([csv], { type:"text/csv" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `maa-orders-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
    setExporting(false);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  // ── Revenue total of visible orders ──────────────────────────────────────
  const visibleRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <AdminPage>
      {/* ── Toast notification ── */}
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium"
          style={{ background:"#fff", border:`1px solid ${A.gold}`, color: A.brown }}
        >
          ✅ {toast}
        </div>
      )}

      {/* ── Filter Bar ── */}
      <Card>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3 items-end">
            <Input
              label="Search"
              placeholder="Order # · Customer name · Mobile"
              value={search}
              onChange={e => handleSearch(e.target.value)}
              className="flex-1 min-w-48"
            />
            <Select label="Status" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="w-44">
              <option value="">All Statuses</option>
              {ORDER_STATUSES.filter(Boolean).map(s => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </Select>
            <Select label="Payment Method" value={payment} onChange={e => { setPayment(e.target.value); setPage(1); }} className="w-44">
              {PAYMENT_METHODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </Select>
            <div className="flex gap-2 ml-auto">
              <Btn
                variant="ghost"
                size="sm"
                onClick={() => { setSearch(""); setStatus(""); setPayment(""); setDateFrom(""); setDateTo(""); setPage(1); }}
              >
                ✕ Reset
              </Btn>
              <Btn variant="secondary" size="sm" loading={exporting} onClick={exportCSV}>
                📥 Export CSV
              </Btn>
            </div>
          </div>

          {/* Quick status filters */}
          <div className="flex flex-wrap gap-2">
            <p style={{ color:A.grey, fontSize:11, alignSelf:"center" }}>Quick filter:</p>
            {[
              { label:"⚡ Pending",        value:"pending"          },
              { label:"📦 Processing",     value:"processing"       },
              { label:"🚚 Shipped",        value:"shipped"          },
              { label:"✅ Delivered",      value:"delivered"        },
              { label:"❌ Cancelled",      value:"cancelled"        },
            ].map(qf => (
              <button
                key={qf.value}
                onClick={() => { setStatus(status === qf.value ? "" : qf.value); setPage(1); }}
                className="px-2.5 py-1 rounded-lg text-xs transition-all"
                style={{
                  background: status === qf.value ? A.gold     : A.cream,
                  color:      status === qf.value ? "#fff"      : A.grey,
                  border:     `1px solid ${status === qf.value ? A.gold : A.border}`,
                  fontWeight: status === qf.value ? 600 : 400,
                }}
              >
                {qf.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Stats strip ── */}
      {!loading && orders.length > 0 && (
        <div
          className="flex flex-wrap gap-5 px-5 py-3 rounded-xl text-sm"
          style={{ background:"#fff", border:`1px solid ${A.border}` }}
        >
          <span style={{ color:A.grey }}>
            Showing <strong style={{ color:A.brown }}>{orders.length}</strong> of <strong style={{ color:A.brown }}>{total}</strong> orders
          </span>
          <span style={{ color:A.grey }}>
            This page revenue: <strong style={{ color:A.gold }}>{fmt₹(visibleRevenue)}</strong>
          </span>
          {status && (
            <span style={{ color:A.grey }}>
              Status: <strong style={{ color:A.brown, textTransform:"capitalize" }}>{STATUS_LABELS[status]}</strong>
            </span>
          )}
        </div>
      )}

      {/* ── Orders Table ── */}
      <Card noPad>
        <Table
          loading={loading}
          columns={[
            { key:"order",    label:"Order #",  width:"130px" },
            { key:"customer", label:"Customer"                },
            { key:"items",    label:"Items",    align:"center", width:"60px" },
            { key:"amount",   label:"Amount",   align:"right"               },
            { key:"method",   label:"Payment",  width:"130px"               },
            { key:"status",   label:"Status",   width:"160px"               },
            { key:"date",     label:"Date",     width:"130px"               },
            { key:"actions",  label:"",         width:"120px"               },
          ]}
          rows={orders.map(o => {
            const nextSt    = NEXT_STATUS[o.status];
            const isUpdating = updatingId === o.id;
            return {
              order: (
                <Link href={`/admin/orders/${o.id}`}>
                  <span
                    className="font-mono font-bold text-sm hover:underline"
                    style={{ color:A.brown, letterSpacing:"0.02em" }}
                  >
                    {o.order_number}
                  </span>
                </Link>
              ),
              customer: (
                <div>
                  <p style={{ fontSize:13, fontWeight:500, color:A.brown }}>{o.customer_name || "Guest"}</p>
                  <p style={{ fontSize:11, color:A.grey }}>+91 {o.customer_mobile}</p>
                  {o.tracking_id && (
                    <p style={{ fontSize:10, color:A.gold, marginTop:1 }}>📦 {o.tracking_id}</p>
                  )}
                </div>
              ),
              items: (
                <span
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                  style={{ background:`rgba(200,150,12,0.12)`, color:A.gold }}
                >
                  {o.item_count || 1}
                </span>
              ),
              amount: (
                <div className="text-right">
                  <p style={{ fontWeight:700, fontSize:14 }}>{fmt₹(o.total)}</p>
                  {o.coupon_code && (
                    <p style={{ fontSize:9, color:A.grey }}>🏷 {o.coupon_code}</p>
                  )}
                </div>
              ),
              method: (
                <div>
                  <MethodBadge method={o.payment_method}/>
                  <StatusBadge status={o.payment_status || "pending"}/>
                </div>
              ),
              status: (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <StatusBadge status={o.status}/>
                  {nextSt && !isUpdating && (
                    <button
                      title={`Advance to: ${STATUS_LABELS[nextSt]}`}
                      onClick={e => quickAdvance(o.id, o.status, e)}
                      className="px-1.5 py-0.5 rounded text-xs transition-opacity hover:opacity-100 opacity-60"
                      style={{ background:`rgba(200,150,12,0.1)`, color:A.gold, border:`1px solid rgba(200,150,12,0.3)` }}
                    >
                      → {STATUS_LABELS[nextSt]}
                    </button>
                  )}
                  {isUpdating && (
                    <span style={{ fontSize:11, color:A.grey }}>updating…</span>
                  )}
                </div>
              ),
              date: <span style={{ fontSize:11, color:A.grey }}>{fmtDate(o.created_at)}</span>,
              actions: (
                <div className="flex gap-1.5">
                  <Link href={`/admin/orders/${o.id}`}>
                    <Btn variant="secondary" size="sm">View</Btn>
                  </Link>
                  <a href={`/admin/orders/${o.id}?invoice=1`} target="_blank">
                    <Btn variant="ghost" size="sm" title="GST Invoice">📄</Btn>
                  </a>
                </div>
              ),
            };
          })}
          emptyMessage="No orders match your filters"
        />
        {/* Pagination */}
        {!loading && pages > 1 && (
          <div className="px-4 py-3 border-t" style={{ borderColor:A.border }}>
            <Pagination page={page} pages={pages} total={total} limit={20} onPage={setPage}/>
          </div>
        )}
      </Card>

      {/* ── Legend ── */}
      <div className="flex flex-wrap gap-4 px-1">
        <p style={{ color:A.grey, fontSize:11 }}>
          💡 Click <strong>→ status</strong> buttons for one-click status advancement.
          Click an order number to see full detail & update.
        </p>
      </div>
    </AdminPage>
  );
}

// ─── Payment Method Badge ─────────────────────────────────────────────────────
function MethodBadge({ method }: { method?: string }) {
  const MAP: Record<string, { icon:string; label:string; bg:string; color:string }> = {
    razorpay_upi:       { icon:"🔵", label:"UPI",        bg:"rgba(200,150,12,0.08)",  color:"#B8750A" },
    razorpay_card:      { icon:"💳", label:"Card",       bg:"rgba(74,44,10,0.08)",    color:"#4A2C0A" },
    razorpay_netbanking:{ icon:"🏦", label:"Netbanking",  bg:"rgba(74,44,10,0.08)",    color:"#4A2C0A" },
    cod:                { icon:"💵", label:"COD",         bg:"rgba(46,125,50,0.08)",   color:"#2E7D32" },
  };
  const m = MAP[method || ""] || { icon:"💳", label:method?.replace(/_/g," ") || "—", bg:"rgba(107,107,107,0.08)", color:"#6B6B6B" };
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium mb-1"
      style={{ background:m.bg, color:m.color }}
    >
      {m.icon} {m.label}
    </span>
  );
}

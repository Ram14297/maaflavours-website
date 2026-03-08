// src/app/admin/customers/page.tsx
// Maa Flavours — Admin Customers (Full Build)
// Features:
//   • Summary stats strip: total customers, total revenue, avg order value, repeat %
//   • Sortable, searchable, filterable customer list
//   • CSV export
//   • Rich customer profile side panel:
//     - Customer identity card (avatar, mobile, email, join date)
//     - Lifetime stats (orders, spend, avg order, last order)
//     - Product preferences (top purchased products)
//     - Paginated order history with status + payment badges
//     - Saved delivery addresses
//     - Edit customer name / email / active status
//   • Full-page customer detail at /admin/customers/[id]

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  AdminPage, Card, Table, Btn, Input, Select,
  StatusBadge, Modal, Alert, Pagination,
  fmt₹, fmtDate, fmtDateTime, A, Spinner,
} from "@/components/admin/AdminUI";

// ─── Sort options ─────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value:"newest",      label:"Newest First"     },
  { value:"oldest",      label:"Oldest First"     },
  { value:"most_spent",  label:"Highest Spend"    },
  { value:"most_orders", label:"Most Orders"      },
  { value:"least_recent",label:"Least Recent"     },
];

// Spice icon mapping for product preferences
const SPICE_COLOURS: Record<string, string> = {
  mild:"#4A7C59", medium:"#B8750A", spicy:"#C0272D", "extra-hot":"#7A1515",
};

// ─────────────────────────────────────────────────────────────────────────────
export default function CustomersPage() {
  // List state
  const [customers,  setCustomers]  = useState<any[]>([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [pages,      setPages]      = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [sort,       setSort]       = useState("newest");
  const [summary,    setSummary]    = useState<any>({});

  // Detail panel state
  const [selected,   setSelected]   = useState<any | null>(null);
  const [detail,     setDetail]     = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOrderPage, setDetailOrderPage] = useState(1);

  // Edit customer state
  const [editing,    setEditing]    = useState(false);
  const [editName,   setEditName]   = useState("");
  const [editEmail,  setEditEmail]  = useState("");
  const [editActive, setEditActive] = useState(true);
  const [editSaving, setEditSaving] = useState(false);
  const [editSuccess,setEditSuccess]= useState("");

  // Toast
  const [toast,      setToast]      = useState("");
  const searchRef = useRef<ReturnType<typeof setTimeout>>();

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  // ── Load list ─────────────────────────────────────────────────────────────
  const load = useCallback(async (p: number) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit:"20", sort });
    if (search) params.set("search", search);
    try {
      const r = await fetch(`/api/admin/customers?${params}`);
      const d = await r.json();
      setCustomers(d.customers || []);
      setTotal(d.total    || 0);
      setPages(d.pages    || 1);
      setSummary(d.summary || {});
    } catch {}
    setLoading(false);
  }, [search, sort]);

  useEffect(() => { load(page); }, [page, load]);

  function handleSearch(val: string) {
    setSearch(val);
    clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => { setPage(1); }, 350);
  }

  // ── Open customer detail panel ────────────────────────────────────────────
  async function openCustomer(c: any, orderPage = 1) {
    if (selected?.id === c.id && orderPage === detailOrderPage) {
      setSelected(null); setDetail(null); return;
    }
    setSelected(c);
    setDetailLoading(true);
    setDetailOrderPage(orderPage);
    try {
      const r = await fetch(`/api/admin/customers/${c.id}?page=${orderPage}`);
      const d = await r.json();
      setDetail(d);
      setEditName(d.customer?.name  || "");
      setEditEmail(d.customer?.email || "");
      setEditActive(d.customer?.is_active ?? true);
    } catch {}
    setDetailLoading(false);
  }

  // ── Edit customer ─────────────────────────────────────────────────────────
  async function saveEdit() {
    if (!selected) return;
    setEditSaving(true); setEditSuccess("");
    const r = await fetch(`/api/admin/customers/${selected.id}`, {
      method:  "PATCH",
      headers: { "Content-Type":"application/json" },
      body:    JSON.stringify({ name: editName, email: editEmail, is_active: editActive }),
    });
    const d = await r.json();
    if (r.ok) {
      setEditSuccess("Customer updated");
      setDetail((prev: any) => prev ? { ...prev, customer: d.customer } : prev);
      setSelected(d.customer);
      setEditing(false);
      load(page);
      showToast("Customer profile updated");
    }
    setEditSaving(false);
  }

  // ── Export CSV ────────────────────────────────────────────────────────────
  function exportCSV() {
    const params = new URLSearchParams({ format:"csv", sort });
    if (search) params.set("search", search);
    window.open(`/api/admin/customers?${params}`, "_blank");
  }

  // ── Repeat customer % ────────────────────────────────────────────────────
  const repeatPct = summary.totalCustomers > 0
    ? Math.round((summary.repeatCustomers / summary.totalCustomers) * 100)
    : 0;

  const displayedName = selected?.name || `+91 ${selected?.mobile}`;

  return (
    <AdminPage>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium"
          style={{ background:"#fff", border:`1px solid ${A.gold}`, color:A.brown }}>
          ✅ {toast}
        </div>
      )}

      {/* ── Summary stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:"Total Customers",   value: summary.totalCustomers?.toLocaleString("en-IN") || "—",        icon:"👥", colour:A.brown  },
          { label:"Total Revenue",     value: summary.totalRevenue   ? fmt₹(summary.totalRevenue) : "—",     icon:"₹",  colour:A.gold   },
          { label:"Avg Order Value",   value: summary.avgOrderValue  ? fmt₹(summary.avgOrderValue) : "—",   icon:"🛒", colour:"#2E7D32"},
          { label:"Repeat Customers",  value: `${repeatPct}%`,                                               icon:"🔄", colour:"#B8750A"},
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-5"
            style={{ background:"#fff", border:`1px solid ${A.border}`, boxShadow:"0 1px 4px rgba(74,44,10,0.04)" }}>
            <p className="text-2xl mb-1">{s.icon}</p>
            <p style={{ fontSize:22, fontWeight:700, color:s.colour, fontFamily:"'Playfair Display',serif", lineHeight:1 }}>
              {loading ? "—" : s.value}
            </p>
            <p style={{ fontSize:11, color:A.grey, marginTop:4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          label=""
          placeholder="🔍 Name · Mobile · Email"
          value={search}
          onChange={e => handleSearch(e.target.value)}
          className="flex-1 min-w-52"
        />
        <Select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} className="w-44">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
        <Btn variant="ghost" size="sm" onClick={exportCSV}>📥 Export CSV</Btn>
      </div>

      {/* ── Split layout: list + detail ── */}
      <div className={`grid gap-5 transition-all duration-300 ${selected ? "lg:grid-cols-5" : "grid-cols-1"}`}>

        {/* ── Customer List ── */}
        <div className={selected ? "lg:col-span-3" : ""}>
          <Card noPad>
            <div className="px-5 py-3.5 flex items-center justify-between border-b" style={{ borderColor:A.border }}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:700, color:A.brown }}>
                Customers <span style={{ color:A.grey, fontSize:13 }}>({total})</span>
              </h3>
            </div>

            {loading ? (
              <div className="divide-y" style={{ borderColor:A.border }}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4">
                    <div className="w-10 h-10 rounded-full animate-pulse" style={{ background:A.cream }}/>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 rounded animate-pulse" style={{ background:A.cream, width:"40%" }}/>
                      <div className="h-3 rounded animate-pulse" style={{ background:A.cream, width:"25%" }}/>
                    </div>
                  </div>
                ))}
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">👥</p>
                <p style={{ color:A.grey, fontSize:13 }}>No customers match your search</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor:A.border }}>
                {customers.map(c => {
                  const isSelected = selected?.id === c.id;
                  const initial    = (c.name || c.mobile || "?").charAt(0).toUpperCase();
                  const hasOrders  = (c.total_orders || 0) > 0;

                  return (
                    <div
                      key={c.id}
                      className="flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors"
                      style={{ background: isSelected ? `rgba(200,150,12,0.04)` : "transparent" }}
                      onClick={() => openCustomer(c)}
                    >
                      {/* Avatar */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                        style={{
                          background: isSelected ? A.gold : `rgba(200,150,12,0.12)`,
                          color:      isSelected ? "#fff" : A.gold,
                          border:     isSelected ? `2px solid ${A.gold}` : "none",
                        }}
                      >
                        {initial}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p style={{ fontWeight:600, fontSize:13, color:A.brown }} className="truncate">
                            {c.name || "—"}
                          </p>
                          {(c.total_orders || 0) > 3 && (
                            <span className="px-1.5 py-0.5 rounded text-xs font-bold shrink-0"
                              style={{ background:"rgba(200,150,12,0.12)", color:A.gold }}>
                              ⭐ Loyal
                            </span>
                          )}
                          {!c.is_active && (
                            <span className="px-1.5 py-0.5 rounded text-xs shrink-0"
                              style={{ background:"rgba(107,107,107,0.1)", color:A.grey }}>
                              Blocked
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize:11, color:A.grey }}>+91 {c.mobile}</p>
                      </div>

                      {/* Stats */}
                      <div className="text-right shrink-0 hidden sm:block">
                        <p style={{ fontWeight:700, fontSize:13, color:A.gold }}>
                          {fmt₹(c.total_spent || 0)}
                        </p>
                        <p style={{ fontSize:11, color:A.grey }}>
                          {c.total_orders || 0} order{c.total_orders !== 1 ? "s" : ""}
                        </p>
                      </div>

                      {/* Date */}
                      <div className="text-right shrink-0 hidden lg:block">
                        <p style={{ fontSize:10, color:A.grey }}>{fmtDate(c.created_at)}</p>
                      </div>

                      {/* Chevron */}
                      <span style={{ color:A.grey, fontSize:12 }}>{isSelected ? "✕" : "›"}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && pages > 1 && (
              <div className="px-4 py-3 border-t" style={{ borderColor:A.border }}>
                <Pagination page={page} pages={pages} total={total} limit={20} onPage={setPage}/>
              </div>
            )}
          </Card>
        </div>

        {/* ── Customer Detail Panel ── */}
        {selected && (
          <div className="lg:col-span-2">
            <div className="space-y-4 sticky top-4">

              {/* Profile header card */}
              <Card>
                <div className="flex items-start justify-between mb-4">
                  {/* Avatar + name */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
                      style={{ background:`rgba(200,150,12,0.12)`, color:A.gold, border:`2px solid ${A.gold}30` }}
                    >
                      {(selected.name || selected.mobile || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      {editing ? (
                        <input
                          autoFocus
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="px-2 py-1 rounded text-sm font-bold outline-none border"
                          style={{ color:A.brown, borderColor:A.gold, background:"#fff", width:"100%" }}
                        />
                      ) : (
                        <p style={{ fontWeight:700, fontSize:16, color:A.brown }}>{displayedName}</p>
                      )}
                      <p style={{ fontSize:12, color:A.grey }}>+91 {selected.mobile}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {editing ? (
                      <>
                        <Btn size="sm" loading={editSaving} onClick={saveEdit}>Save</Btn>
                        <Btn variant="ghost" size="sm" onClick={() => setEditing(false)}>✕</Btn>
                      </>
                    ) : (
                      <>
                        <Btn variant="ghost" size="sm" onClick={() => setEditing(true)}>✎ Edit</Btn>
                        <Btn variant="ghost" size="sm" onClick={() => { setSelected(null); setDetail(null); }}>✕</Btn>
                      </>
                    )}
                  </div>
                </div>

                {editSuccess && <p style={{ color:"#2E7D32", fontSize:12, marginBottom:8 }}>✅ {editSuccess}</p>}

                {detailLoading ? (
                  <div className="space-y-2">
                    {[1,2,3,4].map(i => <div key={i} className="h-8 rounded animate-pulse" style={{ background:A.cream }}/>)}
                  </div>
                ) : detail?.customer ? (
                  <>
                    {/* Identity rows */}
                    <div className="space-y-1.5 mb-4">
                      {editing ? (
                        <div className="space-y-2">
                          <div>
                            <label style={{ color:A.grey, fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em" }}>Email</label>
                            <input
                              value={editEmail}
                              onChange={e => setEditEmail(e.target.value)}
                              placeholder="customer@email.com"
                              className="w-full mt-1 px-3 py-1.5 rounded text-sm outline-none border"
                              style={{ borderColor:A.border, color:A.brown }}
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <label style={{ color:A.grey, fontSize:12 }}>Account Active</label>
                            <button
                              onClick={() => setEditActive(!editActive)}
                              className="relative rounded-full transition-colors"
                              style={{ width:40, height:22, background: editActive ? A.gold : A.border }}
                            >
                              <div className="absolute rounded-full transition-transform"
                                style={{ width:16, height:16, top:3, background:"#fff",
                                  transform: editActive ? "translateX(20px)" : "translateX(3px)",
                                  boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }}/>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {[
                            ["📞 Mobile",    `+91 ${detail.customer.mobile}`],
                            ["✉ Email",      detail.customer.email || "—"],
                            ["📅 Joined",    fmtDate(detail.customer.created_at)],
                            ["🔄 Last Active",fmtDate(detail.customer.updated_at)],
                            ["Status",       detail.customer.is_active ? "Active" : "Blocked"],
                          ].map(([k, v]) => (
                            <div key={String(k)} className="flex justify-between items-center py-1.5 border-b last:border-0"
                              style={{ borderColor:A.border }}>
                              <span style={{ color:A.grey, fontSize:12 }}>{k}</span>
                              <span style={{
                                color:  String(v) === "Active" ? "#2E7D32" : String(v) === "Blocked" ? "#C0272D" : A.brown,
                                fontSize:12, fontWeight:600,
                              }}>
                                {v}
                              </span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>

                    {/* Lifetime stats */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label:"Total Spent",  value:fmt₹(detail.customer.total_spent || 0),  colour:A.gold   },
                        { label:"Total Orders", value:String(detail.customer.total_orders || 0), colour:A.brown  },
                        { label:"Avg per Order",
                          value: detail.customer.total_orders > 0
                            ? fmt₹(Math.round((detail.customer.total_spent || 0) / detail.customer.total_orders))
                            : "—",
                          colour:"#2E7D32",
                        },
                        { label:"Customer Type",
                          value: (detail.customer.total_orders || 0) >= 5 ? "⭐ VIP"
                               : (detail.customer.total_orders || 0) > 1  ? "🔄 Repeat"
                               : "🆕 New",
                          colour: A.brown,
                        },
                      ].map(s => (
                        <div key={s.label} className="rounded-xl p-3 text-center"
                          style={{ background:A.cream, border:`1px solid ${A.border}` }}>
                          <p style={{ fontSize:16, fontWeight:700, color:s.colour, fontFamily:"'Playfair Display',serif" }}>
                            {s.value}
                          </p>
                          <p style={{ fontSize:10, color:A.grey, marginTop:2 }}>{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </Card>

              {/* Product Preferences */}
              {detail?.productPreferences?.length > 0 && (
                <Card title="Favourite Products" subtitle="Based on order history">
                  <div className="space-y-2.5">
                    {detail.productPreferences.map((p: any, i: number) => {
                      const maxOrders = detail.productPreferences[0]?.times_ordered || 1;
                      const pct       = Math.round((p.times_ordered / maxOrders) * 100);
                      return (
                        <div key={p.product_name}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-base">🫙</span>
                              <p style={{ fontSize:12, fontWeight:500, color:A.brown }}>
                                {p.product_name.replace(" Pickle","").replace(" Gongura","")}
                              </p>
                            </div>
                            <p style={{ fontSize:11, color:A.grey }}>
                              {p.times_ordered}× · {fmt₹(p.total_spent)}
                            </p>
                          </div>
                          <div className="h-1.5 rounded-full" style={{ background:`rgba(74,44,10,0.08)` }}>
                            <div className="h-full rounded-full transition-all"
                              style={{ width:`${pct}%`, background:`linear-gradient(90deg, ${A.gold}, #E8B84B)` }}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* Order History */}
              <Card
                title="Order History"
                subtitle={detail ? `${detail.orderCount || 0} orders total` : ""}
                noPad
              >
                {detailLoading ? (
                  <div className="p-4 space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-14 rounded animate-pulse" style={{ background:A.cream }}/>)}
                  </div>
                ) : !detail?.orders?.length ? (
                  <div className="text-center py-8">
                    <p style={{ color:A.grey, fontSize:13 }}>No orders placed yet</p>
                  </div>
                ) : (
                  <>
                    <div className="divide-y" style={{ borderColor:A.border }}>
                      {detail.orders.map((o: any) => (
                        <Link
                          key={o.id}
                          href={`/admin/orders/${o.id}`}
                          className="flex items-center justify-between px-4 py-3 transition-colors group"
                          style={{ background:"#fff" }}
                          onMouseEnter={e => (e.currentTarget.style.background = A.cream)}
                          onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p style={{ fontWeight:700, fontSize:12, color:A.brown, fontFamily:"monospace" }}>
                                {o.order_number}
                              </p>
                              <StatusBadge status={o.status}/>
                            </div>
                            <p style={{ fontSize:10, color:A.grey, marginTop:1 }}>
                              {fmtDate(o.created_at)}
                              {o.tracking_id && ` · 📦 ${o.tracking_id}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p style={{ fontWeight:700, fontSize:13, color:A.gold }}>{fmt₹(o.total)}</p>
                            <p style={{ fontSize:10, color:A.grey, textTransform:"capitalize" }}>
                              {o.payment_method?.replace(/_/g," ")}
                            </p>
                          </div>
                          <span style={{ color:A.grey, fontSize:12, marginLeft:8 }}>→</span>
                        </Link>
                      ))}
                    </div>

                    {/* Order pagination within detail */}
                    {(detail.orderPages || 1) > 1 && (
                      <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor:A.border }}>
                        <Btn variant="ghost" size="sm"
                          disabled={detailOrderPage <= 1}
                          onClick={() => { openCustomer(selected, detailOrderPage - 1); }}>
                          ← Older
                        </Btn>
                        <span style={{ color:A.grey, fontSize:12 }}>
                          Page {detail.orderPage} of {detail.orderPages}
                        </span>
                        <Btn variant="ghost" size="sm"
                          disabled={detailOrderPage >= (detail.orderPages || 1)}
                          onClick={() => { openCustomer(selected, detailOrderPage + 1); }}>
                          Newer →
                        </Btn>
                      </div>
                    )}
                  </>
                )}
              </Card>

              {/* Saved Addresses */}
              {detail?.addresses?.length > 0 && (
                <Card title="Saved Addresses">
                  <div className="space-y-3">
                    {detail.addresses.map((addr: any) => (
                      <div key={addr.id}
                        className="p-3.5 rounded-xl"
                        style={{ background:A.cream, border:`1px solid ${A.border}` }}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <p style={{ fontWeight:600, fontSize:13, color:A.brown }}>{addr.name}</p>
                          {addr.is_default && (
                            <span className="px-2 py-0.5 rounded text-xs font-bold"
                              style={{ background:A.gold, color:"#fff" }}>Default</span>
                          )}
                        </div>
                        <p style={{ fontSize:11, color:A.grey }}>+91 {addr.mobile}</p>
                        <p style={{ fontSize:12, color:A.brown, marginTop:3, lineHeight:1.5 }}>
                          {addr.address_line1}
                          {addr.address_line2 && `, ${addr.address_line2}`}
                          {addr.landmark && ` (${addr.landmark})`}
                          {`, ${addr.city}, ${addr.state} — ${addr.pincode}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* WhatsApp quick action */}
              {selected && (
                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/91${selected.mobile}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Btn
                      variant="secondary"
                      className="w-full justify-center"
                      style={{ color:"#1B873C", borderColor:"rgba(37,211,102,0.4)" } as any}
                    >
                      <span>📱</span> Message on WhatsApp
                    </Btn>
                  </a>
                  {detail?.customer?.email && (
                    <a href={`mailto:${detail.customer.email}`} className="flex-1">
                      <Btn variant="secondary" className="w-full justify-center">
                        ✉ Email
                      </Btn>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminPage>
  );
}

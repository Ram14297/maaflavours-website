// src/app/admin/expenses/page.tsx
// Maa Flavours — Admin Expense Tracker (Full Build)
// Features:
//   • 4 P&L KPI cards: Revenue / Expenses / Gross Profit / Profit Margin %
//   • 6-month trend bar chart (revenue vs expenses vs profit)
//   • Category breakdown — horizontal progress bars + pie-style totals
//   • Full expense log with edit/delete per row
//   • Add / Edit expense modal (category, description, amount, date, notes)
//   • CSV export for the month
//   • PDF export (print-style HTML report) via printable window
//   • Month selector (last 12 months)
//   • Delete confirmation

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import {
  AdminPage, Card, Btn, Input, Select, Modal,
  Alert, Textarea, fmt₹, fmtDate, A, Spinner,
} from "@/components/admin/AdminUI";

// ─── Category config ─────────────────────────────────────────────────────────
const CATS = [
  { value:"ingredients", label:"Ingredients",     icon:"🌶️", colour:"#C0272D" },
  { value:"packaging",   label:"Packaging",        icon:"📦", colour:"#B8750A" },
  { value:"delivery",    label:"Delivery",         icon:"🚚", colour:"#4A2C0A" },
  { value:"marketing",   label:"Marketing",        icon:"📣", colour:"#C8960C" },
  { value:"utilities",   label:"Utilities",        icon:"⚡", colour:"#4A7C59" },
  { value:"other",       label:"Other / Misc",     icon:"📋", colour:"#6B6B6B" },
];
const CAT_MAP = Object.fromEntries(CATS.map(c => [c.value, c]));

const EMPTY_FORM = {
  category:    "ingredients",
  description: "",
  amount:      "",
  expenseDate: new Date().toISOString().split("T")[0],
  notes:       "",
};

// ─── Tooltip style ────────────────────────────────────────────────────────────
const TT = {
  background:"#fff", border:`1px solid rgba(74,44,10,0.08)`,
  borderRadius:10, fontSize:12, padding:"8px 12px",
  boxShadow:"0 4px 16px rgba(0,0,0,0.08)", color:"#4A2C0A",
};

// ─────────────────────────────────────────────────────────────────────────────
export default function ExpensesPage() {
  const today = new Date();
  const [month,    setMonth]    = useState(`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}`);
  const [data,     setData]     = useState<any>(null);
  const [loading,  setLoading]  = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editTarget,setEditTarget]= useState<any | null>(null);  // null = add, object = edit
  const [form,     setForm]     = useState({ ...EMPTY_FORM });
  const [saving,   setSaving]   = useState(false);
  const [formErr,  setFormErr]  = useState("");

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting,     setDeleting]     = useState(false);

  // Feedback
  const [toast,    setToast]    = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  // ── Load data ─────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/expenses?month=${month}`);
      setData(await r.json());
    } catch {}
    setLoading(false);
  }, [month]);

  useEffect(() => { load(); }, [load]);

  // ── Month options (last 13 months) ────────────────────────────────────────
  const monthOptions = Array.from({ length: 13 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    return {
      value: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`,
      label: d.toLocaleDateString("en-IN", { year:"numeric", month:"long" }),
    };
  });

  // ── Open add modal ────────────────────────────────────────────────────────
  function openAdd() {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM, expenseDate: `${month}-${String(new Date().getDate()).padStart(2,"0")}` });
    setFormErr("");
    setShowModal(true);
  }

  // ── Open edit modal ───────────────────────────────────────────────────────
  function openEdit(e: any) {
    setEditTarget(e);
    setForm({
      category:    e.category,
      description: e.description,
      amount:      String(e.amount / 100),
      expenseDate: e.expense_date,
      notes:       e.notes || "",
    });
    setFormErr("");
    setShowModal(true);
  }

  // ── Save (add or edit) ────────────────────────────────────────────────────
  async function save() {
    if (!form.description.trim()) { setFormErr("Description is required"); return; }
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) { setFormErr("Enter a valid amount"); return; }

    setSaving(true); setFormErr("");
    const body = {
      category:    form.category,
      description: form.description.trim(),
      amount:      Math.round(amt * 100),  // rupees → paise
      expenseDate: form.expenseDate,
      notes:       form.notes.trim() || null,
    };

    const url    = editTarget ? `/api/admin/expenses/${editTarget.id}` : "/api/admin/expenses";
    const method = editTarget ? "PATCH" : "POST";
    const r = await fetch(url, { method, headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
    const d = await r.json();

    if (!r.ok) { setFormErr(d.error || "Failed to save"); setSaving(false); return; }

    setShowModal(false);
    showToast(editTarget ? "Expense updated" : "Expense added");
    await load();
    setSaving(false);
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/admin/expenses/${deleteTarget.id}`, { method:"DELETE" });
    setDeleteTarget(null);
    setDeleting(false);
    showToast("Expense deleted");
    await load();
  }

  // ── CSV Export ────────────────────────────────────────────────────────────
  function exportCSV() {
    window.open(`/api/admin/expenses?month=${month}&format=csv`, "_blank");
  }

  // ── PDF Export — printable HTML report ────────────────────────────────────
  function exportPDF() {
    const s    = data?.summary || {};
    const exps = data?.expenses || [];
    const cats = data?.categoryTotals || {};

    const catRows = CATS
      .filter(c => cats[c.value] > 0)
      .map(c => `<tr><td>${c.icon} ${c.label}</td><td style="text-align:right;font-weight:600">₹${(cats[c.value]/100).toLocaleString("en-IN",{minimumFractionDigits:2})}</td></tr>`)
      .join("");

    const expRows = exps.map((e: any) =>
      `<tr>
        <td>${e.expense_date}</td>
        <td>${CAT_MAP[e.category]?.icon || ""} ${e.category}</td>
        <td>${e.description}${e.notes ? `<br><small style="color:#6B6B6B">${e.notes}</small>` : ""}</td>
        <td style="text-align:right;font-weight:600">₹${(e.amount/100).toLocaleString("en-IN",{minimumFractionDigits:2})}</td>
      </tr>`
    ).join("");

    const monthLabel = monthOptions.find(m => m.value === month)?.label || month;
    const profitColour = s.grossProfit >= 0 ? "#2E7D32" : "#C0272D";

    const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>Maa Flavours — Expense Report ${monthLabel}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:"DM Sans",sans-serif; background:#fff; color:#4A2C0A; padding:32px; font-size:13px; }
  h1 { font-family:"Playfair Display",serif; font-size:24px; color:#4A2C0A; }
  h2 { font-family:"Playfair Display",serif; font-size:16px; color:#4A2C0A; margin:24px 0 12px; }
  .header { border-bottom:3px solid #C8960C; padding-bottom:16px; margin-bottom:24px; display:flex; justify-content:space-between; align-items:flex-end; }
  .tagline { font-size:11px; color:#6B6B6B; letter-spacing:.1em; text-transform:uppercase; margin-top:4px; }
  .kpis { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:24px; }
  .kpi { background:#F5EFE0; border-radius:10px; padding:14px; text-align:center; border-left:3px solid #C8960C; }
  .kpi-label { font-size:10px; color:#6B6B6B; text-transform:uppercase; letter-spacing:.06em; }
  .kpi-value { font-family:"Playfair Display",serif; font-size:20px; font-weight:700; margin-top:4px; }
  .grid2 { display:grid; grid-template-columns:1fr 1.6fr; gap:20px; margin-bottom:24px; }
  table { width:100%; border-collapse:collapse; font-size:12px; }
  th { background:#4A2C0A; color:#fff; padding:8px 10px; text-align:left; font-weight:600; }
  td { padding:7px 10px; border-bottom:1px solid #F5EFE0; vertical-align:top; }
  tr:nth-child(even) td { background:#FAFAF5; }
  .cat-table td { font-size:13px; }
  .profit { color:${profitColour}; }
  .footer { margin-top:32px; padding-top:12px; border-top:1px solid #F5EFE0; display:flex; justify-content:space-between; font-size:10px; color:#6B6B6B; }
  @media print { body { padding:20px; } }
</style>
</head><body>
<div class="header">
  <div>
    <h1>🫙 Maa Flavours</h1>
    <p class="tagline">Expense Report — ${monthLabel}</p>
  </div>
  <div style="text-align:right;font-size:11px;color:#6B6B6B">
    Generated: ${new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}<br>
    maaflavours.com
  </div>
</div>

<div class="kpis">
  <div class="kpi">
    <div class="kpi-label">Revenue</div>
    <div class="kpi-value" style="color:#C8960C">₹${(s.totalRevenue/100).toLocaleString("en-IN",{minimumFractionDigits:2})}</div>
  </div>
  <div class="kpi">
    <div class="kpi-label">Expenses</div>
    <div class="kpi-value" style="color:#C0272D">₹${(s.totalExpenses/100).toLocaleString("en-IN",{minimumFractionDigits:2})}</div>
  </div>
  <div class="kpi">
    <div class="kpi-label">Gross Profit</div>
    <div class="kpi-value profit">₹${(s.grossProfit/100).toLocaleString("en-IN",{minimumFractionDigits:2})}</div>
  </div>
  <div class="kpi">
    <div class="kpi-label">Profit Margin</div>
    <div class="kpi-value profit">${s.profitMargin}%</div>
  </div>
</div>

<div class="grid2">
  <div>
    <h2>Expense by Category</h2>
    <table class="cat-table">
      <thead><tr><th>Category</th><th>Amount</th></tr></thead>
      <tbody>${catRows}</tbody>
      <tfoot><tr style="font-weight:700;background:#F5EFE0">
        <td>Total Expenses</td>
        <td style="text-align:right">₹${(s.totalExpenses/100).toLocaleString("en-IN",{minimumFractionDigits:2})}</td>
      </tr></tfoot>
    </table>
  </div>
  <div>
    <h2>Profit Summary</h2>
    <table>
      <tbody>
        <tr><td>Gross Revenue</td><td style="text-align:right;color:#C8960C;font-weight:600">₹${(s.totalRevenue/100).toLocaleString("en-IN",{minimumFractionDigits:2})}</td></tr>
        <tr><td>Total Expenses</td><td style="text-align:right;color:#C0272D;font-weight:600">− ₹${(s.totalExpenses/100).toLocaleString("en-IN",{minimumFractionDigits:2})}</td></tr>
        <tr style="border-top:2px solid #4A2C0A"><td style="font-weight:700">Gross Profit</td><td class="profit" style="text-align:right;font-weight:700;font-size:15px">₹${(s.grossProfit/100).toLocaleString("en-IN",{minimumFractionDigits:2})}</td></tr>
        <tr><td style="color:#6B6B6B">Profit Margin</td><td class="profit" style="text-align:right;font-weight:700">${s.profitMargin}%</td></tr>
        <tr><td style="color:#6B6B6B">Total Transactions</td><td style="text-align:right;font-weight:600">${s.expenseCount} expenses</td></tr>
      </tbody>
    </table>
  </div>
</div>

<h2>Expense Log (${exps.length} entries)</h2>
<table>
  <thead><tr><th style="width:90px">Date</th><th style="width:100px">Category</th><th>Description</th><th style="width:110px;text-align:right">Amount</th></tr></thead>
  <tbody>${expRows}</tbody>
  <tfoot><tr style="font-weight:700;background:#F5EFE0">
    <td colspan="3">Total</td>
    <td style="text-align:right">₹${(s.totalExpenses/100).toLocaleString("en-IN",{minimumFractionDigits:2})}</td>
  </tr></tfoot>
</table>

<div class="footer">
  <span>Maa Flavours, Ongole, Andhra Pradesh</span>
  <span>This is a computer-generated report. All amounts in Indian Rupees (₹).</span>
</div>
</body></html>`;

    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  }

  // ─── Derived values ───────────────────────────────────────────────────────
  const s           = data?.summary || {};
  const expenses    = data?.expenses || [];
  const catTotals   = data?.categoryTotals || {};
  const trend       = data?.trend || [];
  const totalCatMax = Math.max(...CATS.map(c => catTotals[c.value] || 0), 1);

  const profitColour = (s.grossProfit || 0) >= 0 ? "#2E7D32" : "#C0272D";
  const marginColour = (s.profitMargin || 0) >= 20 ? "#2E7D32"
                     : (s.profitMargin || 0) >= 5  ? "#B8750A"
                     : "#C0272D";

  return (
    <AdminPage>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium"
          style={{ background:"#fff", border:`1px solid ${A.gold}`, color:A.brown }}>
          ✅ {toast}
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Select value={month} onChange={e => setMonth(e.target.value)} className="w-52">
            {monthOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
          {loading && <Spinner size={16}/>}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Btn variant="ghost" size="sm" onClick={exportCSV}>📥 CSV</Btn>
          <Btn variant="ghost" size="sm" onClick={exportPDF}>🖨 PDF Report</Btn>
          <Btn onClick={openAdd}>+ Add Expense</Btn>
        </div>
      </div>

      {/* ── P&L KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:"Revenue",      value:fmt₹(s.totalRevenue  || 0), colour:A.gold,      icon:"💰", border:A.gold },
          { label:"Expenses",     value:fmt₹(s.totalExpenses || 0), colour:"#C0272D",   icon:"📤", border:"#C0272D" },
          { label:"Gross Profit", value:fmt₹(s.grossProfit   || 0), colour:profitColour, icon: (s.grossProfit || 0) >= 0 ? "📈" : "📉", border:profitColour },
          { label:"Margin",       value:`${s.profitMargin    || 0}%`, colour:marginColour,icon:"📊", border:marginColour },
        ].map(k => (
          <div key={k.label}
            className="rounded-2xl p-5 flex flex-col"
            style={{ background:"#fff", border:`1px solid ${A.border}`, borderLeft:`4px solid ${k.border}`, boxShadow:"0 1px 6px rgba(74,44,10,0.05)" }}
          >
            <p className="text-2xl mb-2">{k.icon}</p>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:700, color:k.colour, lineHeight:1 }}>
              {loading ? "—" : k.value}
            </p>
            <p style={{ color:A.grey, fontSize:11, marginTop:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>
              {k.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── 6-Month Trend Chart ── */}
      <Card title="6-Month Trend" subtitle="Revenue vs Expenses vs Profit">
        {loading || !trend.length ? (
          <div className="h-56 animate-pulse rounded-xl" style={{ background:A.cream }}/>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trend} margin={{ top:8, right:8, left:-8, bottom:0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE3CE" vertical={false}/>
                <XAxis dataKey="month" tick={{ fill:A.grey, fontSize:11 }} axisLine={false} tickLine={false}/>
                <YAxis
                  tick={{ fill:A.grey, fontSize:10 }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => `₹${v >= 100000 ? (v/100000).toFixed(0)+"L" : v >= 1000 ? (v/1000).toFixed(0)+"k" : v}`}
                />
                <Tooltip
                  contentStyle={TT}
                  formatter={(v:number, name:string) => [
                    `₹${(v/100).toLocaleString("en-IN", { minimumFractionDigits:2 })}`,
                    name.charAt(0).toUpperCase() + name.slice(1),
                  ]}
                />
                <ReferenceLine y={0} stroke={A.border} strokeWidth={1}/>
                <Bar dataKey="revenue"  name="revenue"  fill={A.gold}       radius={[4,4,0,0]} barSize={18}/>
                <Bar dataKey="expenses" name="expenses" fill="#C0272D"      radius={[4,4,0,0]} barSize={18}/>
                <Bar dataKey="profit"   name="profit"   radius={[4,4,0,0]}  barSize={18}>
                  {trend.map((t:any, i:number) => (
                    <Cell key={i} fill={t.profit >= 0 ? "#4A7C59" : "#7A1515"}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-5 mt-2 pl-2">
              {[
                { colour:A.gold,     label:"Revenue"  },
                { colour:"#C0272D",  label:"Expenses" },
                { colour:"#4A7C59",  label:"Profit"   },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background:l.colour }}/>
                  <span style={{ color:A.grey, fontSize:11 }}>{l.label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* ── Category Breakdown + Expense Log ── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Category Breakdown */}
        <Card title="By Category" subtitle={monthOptions.find(m => m.value === month)?.label}>
          {loading ? (
            <div className="space-y-3">{[1,2,3,4,5,6].map(i=><div key={i} className="h-9 rounded animate-pulse" style={{background:A.cream}}/>)}</div>
          ) : (
            <div className="space-y-4">
              {CATS.map(cat => {
                const total = catTotals[cat.value] || 0;
                const pct   = totalCatMax > 0 ? (total / totalCatMax) * 100 : 0;
                const share = s.totalExpenses > 0 ? Math.round((total / s.totalExpenses) * 100) : 0;

                return (
                  <div key={cat.value}>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span style={{ fontSize:13, color:A.brown, fontWeight:500 }}>
                        {cat.icon} {cat.label}
                      </span>
                      <div className="text-right">
                        <span style={{ fontSize:12, fontWeight:700, color: total > 0 ? cat.colour : A.grey }}>
                          {fmt₹(total)}
                        </span>
                        {total > 0 && (
                          <span style={{ fontSize:10, color:A.grey, marginLeft:4 }}>{share}%</span>
                        )}
                      </div>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background:`rgba(74,44,10,0.08)` }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width:`${pct}%`, background:`linear-gradient(90deg, ${cat.colour}, ${cat.colour}99)` }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Total row */}
              <div className="pt-3 mt-1 border-t flex justify-between items-center" style={{ borderColor:A.border }}>
                <span style={{ fontWeight:700, fontSize:13, color:A.brown }}>Total</span>
                <span style={{ fontWeight:700, fontSize:15, color:"#C0272D" }}>{fmt₹(s.totalExpenses || 0)}</span>
              </div>

              {/* Highest category callout */}
              {s.highestCategory && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ background:"rgba(192,39,45,0.06)", border:"1px solid rgba(192,39,45,0.15)" }}>
                  <span className="text-base">{CAT_MAP[s.highestCategory]?.icon}</span>
                  <p style={{ fontSize:11, color:"#C0272D" }}>
                    <strong>{CAT_MAP[s.highestCategory]?.label}</strong> is your biggest expense
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Expense Log */}
        <div className="lg:col-span-2">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background:"#fff", border:`1px solid ${A.border}`, boxShadow:"0 1px 4px rgba(74,44,10,0.04)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor:A.border }}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:700, color:A.brown }}>
                Expense Log
                <span style={{ fontFamily:"'DM Sans',sans-serif", color:A.grey, fontSize:12, fontWeight:400, marginLeft:6 }}>
                  ({expenses.length} entries)
                </span>
              </h3>
            </div>

            {loading ? (
              <div className="p-4 space-y-3">
                {[1,2,3,4].map(i=><div key={i} className="h-14 rounded animate-pulse" style={{background:A.cream}}/>)}
              </div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">📋</p>
                <p style={{ color:A.grey, fontSize:13, marginBottom:12 }}>No expenses recorded this month</p>
                <Btn size="sm" onClick={openAdd}>+ Add First Expense</Btn>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor:A.border }}>
                {expenses.map((e: any) => {
                  const cat = CAT_MAP[e.category] || { icon:"📋", label:e.category, colour:A.grey };
                  return (
                    <div key={e.id}
                      className="flex items-start justify-between gap-3 px-5 py-3.5 group transition-colors"
                      style={{ background:"#fff" }}
                      onMouseEnter={ev => (ev.currentTarget.style.background = A.cream)}
                      onMouseLeave={ev => (ev.currentTarget.style.background = "#fff")}
                    >
                      {/* Category icon */}
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                        style={{ background:`${cat.colour}15`, border:`1px solid ${cat.colour}25` }}
                      >
                        {cat.icon}
                      </div>

                      {/* Description + meta */}
                      <div className="flex-1 min-w-0">
                        <p style={{ fontWeight:600, fontSize:13, color:A.brown }}>{e.description}</p>
                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                          <span className="text-xs px-1.5 py-0.5 rounded capitalize"
                            style={{ background:`${cat.colour}15`, color:cat.colour, fontWeight:500 }}>
                            {cat.label}
                          </span>
                          <span style={{ color:A.grey, fontSize:11 }}>{fmtDate(e.expense_date)}</span>
                          {e.notes && (
                            <span style={{ color:A.grey, fontSize:11, fontStyle:"italic" }}>· {e.notes}</span>
                          )}
                        </div>
                      </div>

                      {/* Amount + actions */}
                      <div className="flex items-center gap-3 shrink-0">
                        <p style={{ fontWeight:700, fontSize:15, color:"#C0272D" }}>
                          {fmt₹(e.amount)}
                        </p>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(e)}
                            className="p-1.5 rounded-lg transition-colors text-sm"
                            style={{ background:A.cream, color:A.grey }}
                            title="Edit"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => setDeleteTarget(e)}
                            className="p-1.5 rounded-lg transition-colors text-sm"
                            style={{ background:"rgba(192,39,45,0.08)", color:"#C0272D" }}
                            title="Delete"
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer total */}
            {expenses.length > 0 && (
              <div className="flex items-center justify-between px-5 py-3 border-t"
                style={{ borderColor:A.border, background:A.cream }}>
                <span style={{ fontWeight:600, fontSize:13, color:A.brown }}>Total Expenses</span>
                <span style={{ fontWeight:700, fontSize:16, color:"#C0272D" }}>{fmt₹(s.totalExpenses || 0)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Profit Calculator card ── */}
      {!loading && s.totalRevenue !== undefined && (
        <Card title="Profit Calculator" subtitle="Month-end P&L summary">
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Left: calculation breakdown */}
            <div className="space-y-3">
              {[
                { label:"Gross Revenue",     value: fmt₹(s.totalRevenue  || 0), colour:A.gold,      symbol:"" },
                { label:"Total Expenses",    value: fmt₹(s.totalExpenses || 0), colour:"#C0272D",   symbol:"−" },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between py-2.5 border-b" style={{ borderColor:A.border }}>
                  <div className="flex items-center gap-2">
                    {row.symbol && (
                      <span className="w-6 h-6 rounded flex items-center justify-center text-sm font-bold"
                        style={{ background:`${row.colour}15`, color:row.colour }}>
                        {row.symbol}
                      </span>
                    )}
                    <span style={{ color:A.grey, fontSize:13 }}>{row.label}</span>
                  </div>
                  <span style={{ fontWeight:700, fontSize:14, color:row.colour }}>{row.value}</span>
                </div>
              ))}

              {/* Result */}
              <div className="flex items-center justify-between py-3 px-4 rounded-xl"
                style={{ background: (s.grossProfit || 0) >= 0 ? "rgba(46,125,50,0.08)" : "rgba(192,39,45,0.08)",
                  border:`1px solid ${profitColour}25` }}>
                <div>
                  <p style={{ fontWeight:700, fontSize:14, color:A.brown }}>Gross Profit</p>
                  <p style={{ fontSize:11, color:A.grey }}>Revenue − Expenses</p>
                </div>
                <div className="text-right">
                  <p style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:700, color:profitColour }}>
                    {fmt₹(s.grossProfit || 0)}
                  </p>
                  <p style={{ fontSize:12, fontWeight:600, color:profitColour }}>
                    {s.profitMargin || 0}% margin
                  </p>
                </div>
              </div>
            </div>

            {/* Right: visual gauge */}
            <div className="flex flex-col items-center justify-center gap-4">
              {/* Circular progress gauge */}
              <div className="relative w-40 h-40">
                <svg width="160" height="160" viewBox="0 0 160 160" className="rotate-[-90deg]">
                  {/* Track */}
                  <circle cx="80" cy="80" r="64" fill="none" stroke={`${A.border}`} strokeWidth="16"/>
                  {/* Progress */}
                  <circle
                    cx="80" cy="80" r="64" fill="none"
                    stroke={marginColour}
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 64}`}
                    strokeDashoffset={`${2 * Math.PI * 64 * (1 - Math.min(Math.max(s.profitMargin || 0, 0), 100) / 100)}`}
                    style={{ transition:"stroke-dashoffset 0.8s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:700, color:marginColour, lineHeight:1 }}>
                    {s.profitMargin || 0}%
                  </p>
                  <p style={{ fontSize:10, color:A.grey, marginTop:2 }}>margin</p>
                </div>
              </div>

              {/* Margin benchmark */}
              <div className="text-center px-4">
                <p style={{ fontSize:12, color:A.grey }}>
                  {(s.profitMargin || 0) >= 25 ? "🎉 Excellent margin! Well above industry average." :
                   (s.profitMargin || 0) >= 15 ? "👍 Good margin. Consider optimising packaging costs." :
                   (s.profitMargin || 0) >= 5  ? "⚠️ Thin margin. Review expenses to improve profitability." :
                   "🚨 Below break-even. Urgent review needed."}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ── Add / Edit Modal ── */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editTarget ? "Edit Expense" : "Add Expense"}
        width={520}
      >
        <div className="space-y-4">
          {formErr && <Alert type="error">{formErr}</Alert>}

          <div className="grid grid-cols-2 gap-3">
            {/* Category */}
            <div className="col-span-2">
              <label style={{ color:A.grey, fontSize:11, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600 }}>
                Category *
              </label>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                {CATS.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
                    style={{
                      background: form.category === cat.value ? `${cat.colour}15` : "#fff",
                      border:     `1px solid ${form.category === cat.value ? cat.colour : A.border}`,
                      color:      form.category === cat.value ? cat.colour : A.grey,
                    }}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="col-span-2">
              <Input
                label="Description *"
                placeholder="e.g. Raw chilli purchase from vendor"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            {/* Amount + Date */}
            <div>
              <Input
                label="Amount (₹) *"
                type="number"
                min={0}
                step={0.01}
                placeholder="e.g. 2500"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              />
              {form.amount && parseFloat(form.amount) > 0 && (
                <p style={{ color:A.grey, fontSize:10, marginTop:2 }}>
                  = {Math.round(parseFloat(form.amount) * 100)} paise
                </p>
              )}
            </div>
            <div>
              <Input
                label="Date"
                type="date"
                value={form.expenseDate}
                onChange={e => setForm(f => ({ ...f, expenseDate: e.target.value }))}
              />
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <Input
                label="Notes (optional)"
                placeholder="Vendor name, invoice number, extra context…"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>

          {/* Preview */}
          {form.description && form.amount && (
            <div className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background:A.cream, border:`1px solid ${A.border}` }}>
              <span className="text-xl">{CAT_MAP[form.category]?.icon}</span>
              <div className="flex-1">
                <p style={{ fontWeight:600, fontSize:13, color:A.brown }}>{form.description}</p>
                <p style={{ fontSize:11, color:A.grey }}>{CAT_MAP[form.category]?.label} · {form.expenseDate}</p>
              </div>
              <p style={{ fontWeight:700, fontSize:16, color:"#C0272D" }}>
                {parseFloat(form.amount) > 0 ? fmt₹(Math.round(parseFloat(form.amount) * 100)) : "—"}
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn loading={saving} onClick={save}>
              {editTarget ? "💾 Save Changes" : "✅ Add Expense"}
            </Btn>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirmation ── */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Expense" width={420}>
        {deleteTarget && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3.5 rounded-xl"
              style={{ background:"rgba(192,39,45,0.05)", border:"1px solid rgba(192,39,45,0.2)" }}>
              <span className="text-2xl">{CAT_MAP[deleteTarget.category]?.icon}</span>
              <div>
                <p style={{ fontWeight:700, color:A.brown }}>{deleteTarget.description}</p>
                <p style={{ fontSize:12, color:A.grey }}>
                  {fmt₹(deleteTarget.amount)} · {fmtDate(deleteTarget.expense_date)}
                </p>
              </div>
            </div>
            <p style={{ color:A.grey, fontSize:13 }}>
              This expense will be permanently removed and cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Btn variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Btn>
              <Btn loading={deleting} onClick={confirmDelete}
                style={{ background:"#C0272D", color:"#fff" } as any}>
                Delete
              </Btn>
            </div>
          </div>
        )}
      </Modal>
    </AdminPage>
  );
}

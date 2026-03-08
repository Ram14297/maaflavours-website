// src/app/admin/coupons/page.tsx
// Maa Flavours — Admin Coupon Management (Step 23)
// GET /api/admin/coupons  |  POST /api/admin/coupons
// PUT /api/admin/coupons/[id]  |  DELETE /api/admin/coupons/[id]
//
// Features:
//   • 4 stat cards: Total / Active / Expired / Total Uses
//   • Top performer callout banner
//   • Search + filter tabs (All / Active / Inactive)
//   • Coupon card grid with usage progress bars
//   • Status badges: Active / Expired / Disabled / Exhausted
//   • Create / Edit modal with 3 visual discount type tiles
//   • Live preview tile in modal
//   • Random code generator
//   • Enable / Disable toggle per coupon
//   • Delete with confirmation modal
//   • Usage stats summary table ranked by usage

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AdminPage, Btn, Input, Modal,
  Alert, fmtDate, A, Spinner,
} from "@/components/admin/AdminUI";

// ─── Helpers ─────────────────────────────────────────────────────────────────────────────

const INR = (paise: number) =>
  "\u20b9" + (paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

function fmtDiscount(c: any): string {
  if (c.type === "free_shipping") return "Free Shipping";
  if (c.type === "percent")       return c.value + "% off";
  return INR(c.value);
}

function couponStatus(c: any): "active" | "expired" | "disabled" | "exhausted" {
  if (!c.is_active)                                                  return "disabled";
  if (c.expires_at && new Date(c.expires_at) < new Date())           return "expired";
  if (c.usage_limit && (c.usage_count || 0) >= c.usage_limit)        return "exhausted";
  return "active";
}

// ─── Config ─────────────────────────────────────────────────────────────────────────────

const STATUS_CFG = {
  active:    { label:"Active",    colour:"#2E7D32", bg:"rgba(46,125,50,0.10)"   },
  expired:   { label:"Expired",   colour:"#C0272D", bg:"rgba(192,39,45,0.10)"   },
  disabled:  { label:"Disabled",  colour:"#6B6B6B", bg:"rgba(107,107,107,0.10)" },
  exhausted: { label:"Exhausted", colour:"#B8750A", bg:"rgba(184,117,10,0.10)"  },
};

const TYPE_CFG = {
  flat:          { icon:"\u20b9", label:"Flat Amount",   colour:"#C8960C", desc:"Fixed rupee discount on cart total" },
  percent:       { icon:"%",   label:"Percentage",    colour:"#C0272D", desc:"% off the cart total"                },
  free_shipping: { icon:"\ud83dude9a", label:"Free Shipping", colour:"#4A2C0A", desc:"Waives delivery charges entirely"   },
};

const EMPTY_FORM = {
  code:"", description:"", type:"flat", value:"",
  minOrderAmount:"", maxDiscountAmount:"", usageLimit:"",
  validFrom: new Date().toISOString().split("T")[0],
  expiresAt:"", isActive:true,
};

const WORDS = ["MAA","ANDHRA","PICKLE","SPICY","FEST","SEASON","DEAL","SAVE","FIRST","SWEET","GONGURA"];
const randomCode = () => WORDS[Math.floor(Math.random() * WORDS.length)] + Math.floor(Math.random() * 90 + 10);

// ─── Page Component ──────────────────────────────────────────────────────────────────────────

export default function CouponsPage() {
  const [coupons,  setCoupons]  = useState<any[]>([]);
  const [summary,  setSummary]  = useState<any>({});
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState<"all"|"active"|"inactive">("all");

  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState<any | null>(null);
  const [form,      setForm]      = useState({ ...EMPTY_FORM });
  const [saving,    setSaving]    = useState(false);
  const [formErr,   setFormErr]   = useState("");

  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting,     setDeleting]     = useState(false);

  const [toast, setToast] = useState("");
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const [copied, setCopied] = useState<string | null>(null);
  function copyCode(code: string) {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 1800);
  }

  // ── Load data ─────────────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (search)                p.set("search", search);
      if (filter === "active")   p.set("active", "true");
      if (filter === "inactive") p.set("active", "false");
      const r = await fetch("/api/admin/coupons?" + p.toString());
      const d = await r.json();
      setCoupons(d.coupons || []);
      setSummary(d.summary  || {});
    } catch {}
    setLoading(false);
  }, [search, filter]);

  useEffect(() => { load(); }, [load]);

  // ── Modal open helpers ───────────────────────────────────────────────────────────────
  function openCreate() { setEditing(null); setForm({ ...EMPTY_FORM }); setFormErr(""); setShowModal(true); }
  function openEdit(c: any) {
    setEditing(c);
    setForm({
      code:              c.code,
      description:       c.description || "",
      type:              c.type,
      value:             c.type === "flat" ? String(c.value / 100) : String(c.value),
      minOrderAmount:    c.min_order_amount    ? String(c.min_order_amount / 100)    : "",
      maxDiscountAmount: c.max_discount_amount ? String(c.max_discount_amount / 100) : "",
      usageLimit:        c.usage_limit  ? String(c.usage_limit) : "",
      validFrom:         c.valid_from   ? c.valid_from.split("T")[0]  : "",
      expiresAt:         c.expires_at   ? c.expires_at.split("T")[0]  : "",
      isActive:          c.is_active,
    });
    setFormErr(""); setShowModal(true);
  }

  // ── Save coupon ──────────────────────────────────────────────────────────────────────
  async function saveCoupon() {
    const code = form.code.toUpperCase().replace(/\s+/g, "");
    if (!code)                                          { setFormErr("Coupon code is required"); return; }
    if (form.type !== "free_shipping" && Number(form.value) <= 0) { setFormErr("Enter a valid discount value"); return; }
    if (form.type === "percent" && Number(form.value) > 100)      { setFormErr("Percentage cannot exceed 100%"); return; }

    setSaving(true); setFormErr("");
    const body = {
      code,
      description:       form.description.trim() || null,
      type:              form.type,
      value:             form.type === "free_shipping" ? 1
                       : form.type === "flat" ? Math.round(Number(form.value) * 100)
                       : Number(form.value),
      minOrderAmount:    form.minOrderAmount    ? Math.round(Number(form.minOrderAmount) * 100)    : null,
      maxDiscountAmount: form.maxDiscountAmount ? Math.round(Number(form.maxDiscountAmount) * 100) : null,
      usageLimit:        form.usageLimit ? Number(form.usageLimit) : null,
      validFrom:         form.validFrom || new Date().toISOString(),
      expiresAt:         form.expiresAt || null,
      isActive:          form.isActive,
    };

    const url    = editing ? `/api/admin/coupons/${editing.id}` : "/api/admin/coupons";
    const method = editing ? "PUT" : "POST";
    const r = await fetch(url, { method, headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
    const d = await r.json();

    if (!r.ok) { setFormErr(d.error || "Save failed"); setSaving(false); return; }
    setShowModal(false);
    showToast(editing ? "Coupon updated" : "Coupon created");
    await load();
    setSaving(false);
  }

  async function toggleActive(c: any) {
    await fetch(`/api/admin/coupons/${c.id}`, {
      method:"PUT", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ isActive: !c.is_active }),
    });
    showToast(c.is_active ? "Coupon disabled" : "Coupon enabled");
    await load();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/admin/coupons/${deleteTarget.id}`, { method:"DELETE" });
    setDeleteTarget(null); setDeleting(false);
    showToast("Coupon deleted");
    await load();
  }

  function previewText(): string {
    if (form.type === "free_shipping") return "Delivery charges waived for the customer";
    const v = Number(form.value);
    if (!v) return "";
    if (form.type === "flat") return `Customer saves \u20b9${v.toLocaleString("en-IN")} on eligible orders`;
    const cap = form.maxDiscountAmount ? ` (up to \u20b9${Number(form.maxDiscountAmount).toLocaleString("en-IN")})` : "";
    return `Customer saves ${v}% off their cart${cap}`;
  }

  // ───────────────────────────────────────────────────────────────────────────────────
  return (
    <AdminPage>
      {/* Toast */}
      {(toast || copied) && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium pointer-events-none"
          style={{ background:"#fff", border:`1px solid ${A.gold}`, color:A.brown }}>
          {copied ? `\ud83d\udccb Copied: ${copied}` : `\u2705 ${toast}`}
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon:"\ud83c\udfdf", label:"Total Coupons", value:summary.total     || 0, colour:A.brown   },
          { icon:"\u2705",     label:"Active",        value:summary.active    || 0, colour:"#2E7D32" },
          { icon:"\u23f0",     label:"Expired",       value:summary.expired   || 0, colour:"#C0272D" },
          { icon:"\ud83d\udcca", label:"Total Uses",    value:summary.totalUses || 0, colour:A.gold    },
        ].map(st => (
          <div key={st.label} className="rounded-2xl p-5"
            style={{ background:"#fff", border:`1px solid ${A.border}`, boxShadow:"0 1px 4px rgba(74,44,10,0.04)" }}>
            <p className="text-2xl mb-2">{st.icon}</p>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:700, color:st.colour, lineHeight:1 }}>
              {loading ? "\u2014" : st.value.toLocaleString("en-IN")}
            </p>
            <p style={{ color:A.grey, fontSize:11, marginTop:5 }}>{st.label}</p>
          </div>
        ))}
      </div>

      {/* Top performer */}
      {!loading && summary.topPerformer && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl"
          style={{ background:"rgba(200,150,12,0.06)", border:"1px solid rgba(200,150,12,0.25)" }}>
          <span className="text-2xl">\ud83c\udfc6</span>
          <div>
            <p style={{ fontWeight:700, color:A.brown, fontSize:14 }}>
              Top performer: <span className="font-mono" style={{ color:A.gold }}>{summary.topPerformer}</span>
            </p>
            <p style={{ color:A.grey, fontSize:12 }}>Used {summary.topUses} times — your most popular coupon</p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color:A.grey }}>\ud83d\udd0d</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search code..."
            className="pl-8 pr-4 py-2 rounded-xl text-sm outline-none"
            style={{ border:`1px solid ${A.border}`, background:"#fff", color:A.brown, width:200 }}
          />
        </div>

        <div className="flex rounded-xl overflow-hidden border" style={{ borderColor:A.border }}>
          {([ ["all","All"], ["active","Active"], ["inactive","Inactive"] ] as const).map(([k,l]) => (
            <button key={k} onClick={() => setFilter(k)}
              className="px-4 py-2 text-xs font-medium transition-colors"
              style={{
                background: filter===k ? A.brown : "#fff",
                color:      filter===k ? "#fff"  : A.grey,
                borderRight:`1px solid ${A.border}`,
              }}>
              {l}
            </button>
          ))}
        </div>

        {loading && <Spinner size={16}/>}
        <Btn onClick={openCreate} className="ml-auto">+ Create Coupon</Btn>
      </div>

      {/* Coupon card grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-52 rounded-2xl animate-pulse" style={{ background:"#fff" }}/>
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-3">\ud83c\udfdf</p>
          <p style={{ color:A.grey, fontSize:14, marginBottom:20 }}>
            {search ? "No coupons match your search" : "No coupons yet"}
          </p>
          {!search && <Btn onClick={openCreate}>+ Create First Coupon</Btn>}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map(c => {
            const status   = couponStatus(c);
            const statusC  = STATUS_CFG[status];
            const typeC    = TYPE_CFG[c.type as keyof typeof TYPE_CFG] || TYPE_CFG.flat;
            const usagePct = c.usage_limit ? Math.min(((c.usage_count||0)/c.usage_limit)*100, 100) : null;
            const nearLim  = c.usage_limit && (c.usage_count||0) >= c.usage_limit * 0.8;

            return (
              <div key={c.id}
                className="rounded-2xl overflow-hidden flex flex-col"
                style={{
                  background:"#fff",
                  border:`1px solid ${status==="active" ? A.border : statusC.colour+"40"}`,
                  boxShadow: status==="active" ? "0 1px 6px rgba(74,44,10,0.04)" : "none",
                }}>

                {/* Header */}
                <div className="px-5 pt-4 pb-3" style={{ borderBottom:`1px solid ${A.border}` }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <button
                          onClick={() => copyCode(c.code)}
                          title="Copy code"
                          className="font-mono font-bold px-2.5 py-1 rounded-lg text-sm tracking-wide flex items-center gap-1.5 transition-all"
                          style={{
                            background: copied === c.code ? `${typeC.colour}30` : `${typeC.colour}15`,
                            color: typeC.colour,
                            border: `1px solid ${copied === c.code ? typeC.colour : "transparent"}`,
                          }}>
                          {c.code}
                          <span style={{ fontSize: 11 }}>{copied === c.code ? "\u2713" : "\ud83d\udccb"}</span>
                        </button>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background:statusC.bg, color:statusC.colour }}>
                          {statusC.label}
                        </span>
                      </div>
                      {c.description && (
                        <p style={{ fontSize:11, color:A.grey, lineHeight:1.4 }}>{c.description}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color:typeC.colour, lineHeight:1 }}>
                        {c.type==="free_shipping" ? "\ud83dude9a" : c.type==="percent" ? `${c.value}%` : INR(c.value)}
                      </p>
                      <p style={{ fontSize:10, color:A.grey, marginTop:2 }}>
                        {c.type==="free_shipping" ? "free delivery" : c.type==="percent" ? "off order" : "flat off"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="px-5 py-3 flex-1 space-y-2.5">
                  {/* Usage */}
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span style={{ fontSize:11, color:A.grey }}>Usage</span>
                      <span style={{ fontSize:12, fontWeight:700, color:nearLim?"#B8750A":A.brown }}>
                        {c.usage_count||0} / {c.usage_limit ?? "\u221e"}
                      </span>
                    </div>
                    {c.usage_limit ? (
                      <div className="h-2 rounded-full overflow-hidden" style={{ background:"rgba(74,44,10,0.08)" }}>
                        <div className="h-full rounded-full transition-all"
                          style={{
                            width:`${usagePct}%`,
                            background:(usagePct||0)>=100?"#C0272D":(usagePct||0)>=80?"#B8750A":A.gold,
                          }}/>
                      </div>
                    ) : (
                      <div className="h-2 rounded-full" style={{ background:"rgba(200,150,12,0.15)" }}/>
                    )}
                  </div>

                  {/* Meta chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {c.min_order_amount && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background:A.cream, color:A.grey }}>
                        Min {INR(c.min_order_amount)}
                      </span>
                    )}
                    {c.max_discount_amount && c.type==="percent" && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background:A.cream, color:A.grey }}>
                        Cap {INR(c.max_discount_amount)}
                      </span>
                    )}
                    {c.expires_at ? (
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background:status==="expired"?"rgba(192,39,45,0.08)":A.cream,
                          color:status==="expired"?"#C0272D":A.grey,
                        }}>
                        {status==="expired"?"Expired ":"Expires "}{fmtDate(c.expires_at)}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background:A.cream, color:A.grey }}>
                        No expiry
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer actions */}
                <div className="flex items-center justify-between px-4 py-2.5 gap-2"
                  style={{ borderTop:`1px solid ${A.border}`, background:A.cream }}>
                  <div className="flex gap-1.5">
                    <Btn variant="ghost" size="sm" onClick={() => openEdit(c)}>\u270e Edit</Btn>
                    <button
                      onClick={() => toggleActive(c)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium"
                      style={{
                        background:"transparent",
                        border:`1px solid ${c.is_active?"#C0272D40":"#2E7D3240"}`,
                        color:c.is_active?"#C0272D":"#2E7D32",
                      }}>
                      {c.is_active ? "Disable" : "Enable"}
                    </button>
                  </div>
                  <button
                    onClick={() => setDeleteTarget(c)}
                    className="p-1.5 rounded-lg text-sm"
                    style={{ background:"rgba(192,39,45,0.08)", color:"#C0272D" }}
                    title="Delete">
                    \ud83d\uddd1
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Usage stats table */}
      {!loading && coupons.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background:"#fff", border:`1px solid ${A.border}` }}>
          <div className="px-5 py-4 border-b" style={{ borderColor:A.border }}>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:700, color:A.brown }}>
              Usage Stats
            </h3>
            <p style={{ color:A.grey, fontSize:12, marginTop:2 }}>All coupons ranked by usage</p>
          </div>
          <div className="overflow-x-auto">
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:A.cream }}>
                  {["Rank","Code","Type","Discount","Min Order","Uses","Limit","Status","Valid Until"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left whitespace-nowrap"
                      style={{ fontSize:10, color:A.grey, fontWeight:600, textTransform:"uppercase",
                               letterSpacing:"0.08em", borderBottom:`1px solid ${A.border}` }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...coupons]
                  .sort((a,b) => (b.usage_count||0)-(a.usage_count||0))
                  .map((c, i) => {
                    const status   = couponStatus(c);
                    const statusC  = STATUS_CFG[status];
                    const typeC    = TYPE_CFG[c.type as keyof typeof TYPE_CFG] || TYPE_CFG.flat;
                    return (
                      <tr key={c.id}
                        style={{ borderBottom:`1px solid ${A.border}`, background:i%2===0?"#fff":"#FAFAF5" }}
                        onMouseEnter={e=>(e.currentTarget.style.background=A.cream)}
                        onMouseLeave={e=>(e.currentTarget.style.background=i%2===0?"#fff":"#FAFAF5")}
                      >
                        <td className="px-4 py-2.5">
                          <span style={{ fontSize:13, fontWeight:600, color:i===0?A.gold:A.grey }}>
                            {i===0?"\ud83e\udd47":i===1?"\ud83e\udd48":i===2?"\ud83e\udd49":`#${i+1}`}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="font-mono font-bold text-sm px-2 py-0.5 rounded"
                            style={{ background:`${typeC.colour}15`, color:typeC.colour }}>
                            {c.code}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span style={{ fontSize:12, color:A.grey, textTransform:"capitalize" }}>
                            {c.type.replace("_"," ")}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span style={{ fontWeight:600, fontSize:13, color:typeC.colour }}>
                            {fmtDiscount(c)}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span style={{ fontSize:12, color:A.grey }}>
                            {c.min_order_amount ? INR(c.min_order_amount) : "\u2014"}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span style={{ fontWeight:700, fontSize:15, color:A.brown }}>{c.usage_count||0}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span style={{ fontSize:12, color:A.grey }}>{c.usage_limit ?? "\u221e"}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{ background:statusC.bg, color:statusC.colour }}>
                            {statusC.label}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <span style={{ fontSize:11, color:A.grey }}>
                            {c.expires_at ? fmtDate(c.expires_at) : "Never"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? `Edit ${editing.code}` : "Create New Coupon"}
        width={580}
      >
        <div className="space-y-5">
          {formErr && <Alert type="error">{formErr}</Alert>}

          {/* Code input */}
          <div>
            <label style={{ display:"block", color:A.grey, fontSize:11, textTransform:"uppercase",
                            letterSpacing:"0.08em", fontWeight:600, marginBottom:6 }}>
              Coupon Code *
            </label>
            <div className="flex gap-2">
              <input
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code:e.target.value.toUpperCase().replace(/\s+/g,"") }))}
                placeholder="e.g. WELCOME50"
                disabled={!!editing}
                className="flex-1 px-4 py-2.5 rounded-xl outline-none font-mono font-bold text-sm"
                style={{
                  border:`1px solid ${A.border}`,
                  background:editing?A.cream:"#fff",
                  color:A.gold, letterSpacing:"0.08em",
                }}
              />
              {!editing && (
                <Btn variant="ghost" size="sm" onClick={() => setForm(f=>({...f,code:randomCode()}))}>
                  \ud83c\udfb2 Random
                </Btn>
              )}
            </div>
          </div>

          {/* Type tiles */}
          <div>
            <label style={{ display:"block", color:A.grey, fontSize:11, textTransform:"uppercase",
                            letterSpacing:"0.08em", fontWeight:600, marginBottom:8 }}>
              Discount Type *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.entries(TYPE_CFG) as [string, any][]).map(([key, cfg]) => (
                <button key={key}
                  onClick={() => setForm(f=>({...f,type:key}))}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-all"
                  style={{
                    background:form.type===key?`${cfg.colour}10`:"#fff",
                    border:`2px solid ${form.type===key?cfg.colour:A.border}`,
                    color:form.type===key?cfg.colour:A.grey,
                  }}>
                  <span className="text-2xl">{cfg.icon}</span>
                  <span style={{ fontWeight:600, fontSize:12 }}>{cfg.label}</span>
                  <span style={{ fontSize:10, lineHeight:1.3 }}>{cfg.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Values */}
          <div className="grid grid-cols-2 gap-3">
            {form.type !== "free_shipping" && (
              <Input
                label={form.type==="flat" ? "Discount Amount (\u20b9) *" : "Discount % *"}
                type="number" min={0} max={form.type==="percent"?100:undefined}
                placeholder={form.type==="flat"?"e.g. 50":"e.g. 10"}
                value={form.value}
                onChange={e => setForm(f=>({...f,value:e.target.value}))}
              />
            )}
            <Input
              label="Min Order Value (\u20b9)"
              type="number" min={0}
              placeholder="e.g. 299 (optional)"
              value={form.minOrderAmount}
              onChange={e => setForm(f=>({...f,minOrderAmount:e.target.value}))}
              className={form.type==="free_shipping"?"col-span-2":""}
            />
            {form.type === "percent" && (
              <Input
                label="Max Discount Cap (\u20b9)"
                type="number" min={0}
                placeholder="e.g. 200 (optional)"
                value={form.maxDiscountAmount}
                onChange={e => setForm(f=>({...f,maxDiscountAmount:e.target.value}))}
              />
            )}
          </div>

          {/* Description + limit + toggle */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Description (optional)"
              placeholder="e.g. First order welcome offer"
              value={form.description}
              onChange={e => setForm(f=>({...f,description:e.target.value}))}
              className="col-span-2"
            />
            <Input
              label="Usage Limit"
              type="number" min={1}
              placeholder="Blank = unlimited"
              value={form.usageLimit}
              onChange={e => setForm(f=>({...f,usageLimit:e.target.value}))}
            />
            {/* Active toggle */}
            <div className="flex flex-col justify-end pb-1">
              <label style={{ display:"block", color:A.grey, fontSize:11, textTransform:"uppercase",
                              letterSpacing:"0.08em", fontWeight:600, marginBottom:8 }}>Status</label>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setForm(f=>({...f,isActive:!f.isActive}))}
                  className="relative rounded-full shrink-0 transition-colors"
                  style={{ width:44, height:24, background:form.isActive?A.gold:A.border }}>
                  <div className="absolute top-[3px] rounded-full transition-transform"
                    style={{ width:18, height:18, background:"#fff",
                             transform:form.isActive?"translateX(23px)":"translateX(3px)",
                             boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}/>
                </button>
                <span style={{ fontSize:12, color:form.isActive?"#2E7D32":A.grey, fontWeight:500 }}>
                  {form.isActive?"Active — usable at checkout":"Inactive — hidden from customers"}
                </span>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <Input label="Valid From" type="date" value={form.validFrom}
              onChange={e => setForm(f=>({...f,validFrom:e.target.value}))}/>
            <Input label="Expires On (optional)" type="date" value={form.expiresAt}
              min={form.validFrom||undefined}
              onChange={e => setForm(f=>({...f,expiresAt:e.target.value}))}/>
          </div>

          {/* Live preview */}
          {(form.value || form.type === "free_shipping") && (
            <div className="flex items-start gap-3 p-4 rounded-xl"
              style={{ background:A.cream, border:`1px solid ${A.border}` }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{
                  background:`${(TYPE_CFG[form.type as keyof typeof TYPE_CFG]?.colour)||A.gold}15`,
                  border:`1px dashed ${(TYPE_CFG[form.type as keyof typeof TYPE_CFG]?.colour)||A.gold}40`,
                }}>
                {(TYPE_CFG[form.type as keyof typeof TYPE_CFG]?.icon)||"\ud83c\udfdf"}
              </div>
              <div className="flex-1">
                <p style={{ fontWeight:700, fontSize:13, color:A.brown }}>
                  Preview: <span className="font-mono" style={{ color:A.gold }}>{form.code||"CODE"}</span>
                </p>
                <p style={{ fontSize:12, color:A.grey, marginTop:2 }}>{previewText()}</p>
                {form.minOrderAmount && Number(form.minOrderAmount)>0 && (
                  <p style={{ fontSize:11, color:A.grey, marginTop:1 }}>
                    Applies on orders above \u20b9{Number(form.minOrderAmount).toLocaleString("en-IN")}
                  </p>
                )}
                {form.expiresAt
                  ? <p style={{ fontSize:11, color:"#B8750A", marginTop:1 }}>\u26a0 Expires {fmtDate(form.expiresAt+"T00:00:00")}</p>
                  : <p style={{ fontSize:11, color:"#2E7D32", marginTop:1 }}>\u267e No expiry date</p>
                }
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Btn variant="ghost" onClick={()=>setShowModal(false)}>Cancel</Btn>
            <Btn loading={saving} onClick={saveCoupon}>
              {editing ? "\ud83d\udcbe Save Changes" : "\u2705 Create Coupon"}
            </Btn>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal open={!!deleteTarget} onClose={()=>setDeleteTarget(null)} title="Delete Coupon" width={420}>
        {deleteTarget && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl"
              style={{ background:"rgba(192,39,45,0.04)", border:"1px solid rgba(192,39,45,0.2)" }}>
              <span className="font-mono font-bold text-base px-3 py-1.5 rounded-lg"
                style={{ background:"rgba(200,150,12,0.1)", color:A.gold }}>
                {deleteTarget.code}
              </span>
              <div>
                <p style={{ fontWeight:600, color:A.brown }}>{fmtDiscount(deleteTarget)} discount</p>
                <p style={{ fontSize:12, color:A.grey }}>Used {deleteTarget.usage_count||0} time{deleteTarget.usage_count===1?"":"s"}</p>
              </div>
            </div>
            <Alert type="error">
              This permanently deletes the coupon. Past order history with this code is preserved.
            </Alert>
            <div className="flex gap-3 justify-end">
              <Btn variant="ghost" onClick={()=>setDeleteTarget(null)}>Cancel</Btn>
              <Btn loading={deleting} onClick={confirmDelete} style={{ background:"#C0272D",color:"#fff" } as any}>
                Delete Coupon
              </Btn>
            </div>
          </div>
        )}
      </Modal>

    </AdminPage>
  );
}

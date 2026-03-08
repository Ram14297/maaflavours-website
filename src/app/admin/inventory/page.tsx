// src/app/admin/inventory/page.tsx
// Maa Flavours — Admin Inventory Management (Full Build)
// Features:
//   • Summary cards: In Stock / Low Stock / Out of Stock / Total Units
//   • Filter tabs: All | Low Stock | Out of Stock
//   • Grouped by product — shows all variants per product
//   • Inline stock qty editing with unsaved-change tracking
//   • Single stock adjustment modal (received / remove / damaged / set)
//   • Stock history drawer — per-variant log with type icons
//   • CSV export (full or filtered)
//   • Floating save bar when edits are pending

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  AdminPage, Card, Table, StatusBadge, Btn, Input, Select,
  Modal, Alert, Textarea, fmt₹, fmtDateTime, A, Spinner,
} from "@/components/admin/AdminUI";

// ─── Adjustment types ─────────────────────────────────────────────────────────
const ADJ_TYPES = [
  { value:"received",      label:"📦 Stock Received",     sign:"+", colour:"#2E7D32" },
  { value:"manual_add",    label:"➕ Manual Add",          sign:"+", colour:"#2E7D32" },
  { value:"manual_remove", label:"➖ Manual Remove",       sign:"−", colour:"#B8750A" },
  { value:"manual_set",    label:"🔢 Set Exact Quantity",  sign:"=", colour:"#4A2C0A" },
  { value:"damaged",       label:"💔 Damaged / Spoiled",   sign:"−", colour:"#C0272D" },
  { value:"returned",      label:"↩ Customer Return",     sign:"+", colour:"#2E7D32" },
  { value:"correction",    label:"✏️ Stock Correction",    sign:"±", colour:"#6B6B6B" },
];
const ADJ_MAP = Object.fromEntries(ADJ_TYPES.map(t => [t.value, t]));

// ─────────────────────────────────────────────────────────────────────────────
export default function InventoryPage() {
  const [grouped,    setGrouped]    = useState<any[]>([]);
  const [summary,    setSummary]    = useState({ inStock:0, lowStock:0, outOfStock:0, totalUnits:0, total:0 });
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState<"all"|"critical"|"out">("all");
  const [search,     setSearch]     = useState("");
  const [saving,     setSaving]     = useState(false);
  const [edits,      setEdits]      = useState<Record<string,string>>({});   // variantId → new qty string
  const [threshEdits,setThreshEdits]= useState<Record<string,string>>({});   // variantId → threshold string
  const [success,    setSuccess]    = useState("");
  const [error,      setError]      = useState("");

  // Adjustment modal
  const [adjVariant, setAdjVariant] = useState<any | null>(null);
  const [adjType,    setAdjType]    = useState("received");
  const [adjQty,     setAdjQty]     = useState("");
  const [adjNote,    setAdjNote]    = useState("");
  const [adjLoading, setAdjLoading] = useState(false);
  const [adjError,   setAdjError]   = useState("");

  // History drawer
  const [histVariant,setHistVariant]= useState<any | null>(null);
  const [history,    setHistory]    = useState<any[]>([]);
  const [histLoading,setHistLoading]= useState(false);
  const [histPage,   setHistPage]   = useState(1);
  const [histPages,  setHistPages]  = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/inventory?filter=${filter}`);
      const d = await r.json();
      setGrouped(d.grouped || []);
      setSummary(d.summary  || {});
    } catch {}
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  // ── Edit helpers ─────────────────────────────────────────────────────────
  function getQty(v: any): string {
    return edits[v.id] !== undefined ? edits[v.id] : String(v.stock_quantity);
  }
  function getThresh(v: any): string {
    return threshEdits[v.id] !== undefined ? threshEdits[v.id] : String(v.low_stock_threshold);
  }
  function setQty(id: string, val: string)    { setEdits(prev => ({ ...prev, [id]: val })); }
  function setThresh(id: string, val: string) { setThreshEdits(prev => ({ ...prev, [id]: val })); }

  const editCount  = Object.keys(edits).length + Object.keys(threshEdits).length;
  const hasEdits   = editCount > 0;

  // ── Bulk save ────────────────────────────────────────────────────────────
  async function saveAll() {
    setSaving(true); setError(""); setSuccess("");
    const allIds = new Set([...Object.keys(edits), ...Object.keys(threshEdits)]);
    const updates = Array.from(allIds).map(id => ({
      variantId:          id,
      ...(edits[id]       !== undefined ? { stockQuantity:     parseInt(edits[id]) || 0 } : {}),
      ...(threshEdits[id] !== undefined ? { lowStockThreshold: parseInt(threshEdits[id]) || 5 } : {}),
    }));
    const r = await fetch("/api/admin/inventory", {
      method:  "PATCH",
      headers: { "Content-Type":"application/json" },
      body:    JSON.stringify({ updates }),
    });
    if (r.ok) {
      setSuccess(`Saved ${updates.length} update${updates.length !== 1 ? "s" : ""}`);
      setEdits({}); setThreshEdits({});
      await load();
    } else {
      const d = await r.json();
      setError(d.error || "Save failed");
    }
    setSaving(false);
  }

  // ── Single adjustment ────────────────────────────────────────────────────
  function openAdj(variant: any) {
    setAdjVariant(variant);
    setAdjType("received");
    setAdjQty("");
    setAdjNote("");
    setAdjError("");
  }

  async function submitAdj() {
    if (!adjVariant) return;
    if (!adjQty || isNaN(Number(adjQty))) { setAdjError("Please enter a valid quantity"); return; }
    setAdjLoading(true); setAdjError("");
    const r = await fetch("/api/admin/inventory/adjust", {
      method:  "POST",
      headers: { "Content-Type":"application/json" },
      body:    JSON.stringify({ variantId: adjVariant.id, type: adjType, qty: Number(adjQty), note: adjNote }),
    });
    const d = await r.json();
    if (r.ok) {
      setAdjVariant(null);
      setSuccess(`Stock updated: ${adjVariant.product_name} ${adjVariant.label} → ${d.qtyAfter} units`);
      await load();
    } else {
      setAdjError(d.error || "Adjustment failed");
    }
    setAdjLoading(false);
  }

  // ── History drawer ───────────────────────────────────────────────────────
  async function openHistory(variant: any, page = 1) {
    setHistVariant(variant);
    setHistLoading(true);
    setHistPage(page);
    const r = await fetch(`/api/admin/inventory/history?variantId=${variant.id}&page=${page}&limit=15`);
    const d = await r.json();
    setHistory(d.history || []);
    setHistPages(d.pages || 1);
    setHistLoading(false);
  }

  // ── CSV export ───────────────────────────────────────────────────────────
  async function exportCSV() {
    window.open(`/api/admin/inventory?format=csv&filter=${filter}`, "_blank");
  }

  // ── Filter search ────────────────────────────────────────────────────────
  const displayedGroups = grouped.filter(g =>
    !search || g.product.name.toLowerCase().includes(search.toLowerCase())
  );

  // ── Status badge renderer ─────────────────────────────────────────────────
  function StockBadge({ qty, threshold }: { qty: number; threshold: number }) {
    if (qty === 0)          return <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background:"rgba(192,39,45,0.12)", color:"#C0272D" }}>Out of Stock</span>;
    if (qty <= threshold)   return <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background:"rgba(184,117,10,0.12)", color:"#B8750A" }}>Low Stock</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background:"rgba(46,125,50,0.1)", color:"#2E7D32" }}>In Stock</span>;
  }

  return (
    <AdminPage>
      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:"In Stock",    value:summary.inStock,    colour:"#2E7D32", bg:"rgba(46,125,50,0.08)",   icon:"✅" },
          { label:"Low Stock",   value:summary.lowStock,   colour:"#B8750A", bg:"rgba(184,117,10,0.08)",  icon:"⚠️" },
          { label:"Out of Stock",value:summary.outOfStock, colour:"#C0272D", bg:"rgba(192,39,45,0.08)",   icon:"🚫" },
          { label:"Total Units", value:summary.totalUnits, colour:A.brown,   bg:`rgba(74,44,10,0.05)`,    icon:"🫙" },
        ].map(s => (
          <div key={s.label}
            className="rounded-2xl p-5 text-center"
            style={{ background:s.bg, border:`1px solid ${s.colour}25` }}
          >
            <p className="text-2xl mb-1">{s.icon}</p>
            <p style={{ fontSize:28, fontWeight:700, color:s.colour, fontFamily:"'Playfair Display',serif", lineHeight:1 }}>
              {loading ? "—" : s.value.toLocaleString("en-IN")}
            </p>
            <p style={{ fontSize:11, color:s.colour, marginTop:4, fontWeight:500 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {success && <Alert type="success">{success}</Alert>}
      {error   && <Alert type="error">{error}</Alert>}

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter tabs */}
        <div className="flex rounded-xl overflow-hidden border" style={{ borderColor:A.border }}>
          {[
            { key:"all",      label:"All Variants" },
            { key:"critical", label:"⚠️ Low Stock"  },
            { key:"out",      label:"🚫 Out of Stock"},
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as any)}
              className="px-4 py-2 text-xs font-medium transition-colors"
              style={{
                background: filter === f.key ? A.brown : "#fff",
                color:      filter === f.key ? "#fff"  : A.grey,
                borderRight:`1px solid ${A.border}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <Input
          label=""
          placeholder="🔍 Search product…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-52"
        />

        <div className="flex gap-2 ml-auto">
          <Btn variant="ghost" size="sm" onClick={exportCSV}>📥 Export CSV</Btn>
          {hasEdits && (
            <Btn size="sm" loading={saving} onClick={saveAll}>
              💾 Save Changes ({editCount})
            </Btn>
          )}
        </div>
      </div>

      {/* ── Grouped product cards ── */}
      {loading ? (
        <div className="grid gap-4">
          {[1,2,3].map(i => <div key={i} className="h-36 rounded-2xl animate-pulse" style={{ background:"#fff" }}/>)}
        </div>
      ) : displayedGroups.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-3">🫙</p>
          <p style={{ color:A.grey, fontSize:14 }}>
            {filter !== "all" ? "No variants match this filter" : "No inventory data found"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedGroups.map(group => (
            <ProductInventoryCard
              key={group.product.id}
              group={group}
              edits={edits}
              threshEdits={threshEdits}
              getQty={getQty}
              getThresh={getThresh}
              setQty={setQty}
              setThresh={setThresh}
              onAdjust={openAdj}
              onHistory={openHistory}
              StockBadge={StockBadge}
            />
          ))}
        </div>
      )}

      {/* ── Floating save bar ── */}
      {hasEdits && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3.5 rounded-2xl z-40"
          style={{ background:"#fff", border:`1px solid ${A.gold}`, boxShadow:"0 8px 32px rgba(0,0,0,0.12)" }}
        >
          <p style={{ color:A.grey, fontSize:13 }}>
            <strong style={{ color:A.brown }}>{editCount}</strong> unsaved change{editCount !== 1 ? "s" : ""}
          </p>
          <Btn variant="ghost" size="sm" onClick={() => { setEdits({}); setThreshEdits({}); }}>
            Discard
          </Btn>
          <Btn size="sm" loading={saving} onClick={saveAll}>
            💾 Save All
          </Btn>
        </div>
      )}

      {/* ── Adjustment Modal ── */}
      <Modal
        open={!!adjVariant}
        onClose={() => setAdjVariant(null)}
        title="Stock Adjustment"
        width={480}
      >
        {adjVariant && (
          <div className="space-y-4">
            {/* Variant info banner */}
            <div className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background:A.cream, border:`1px solid ${A.border}` }}>
              <span className="text-2xl">🫙</span>
              <div>
                <p style={{ fontWeight:700, color:A.brown, fontSize:14 }}>{adjVariant.product_name}</p>
                <p style={{ color:A.grey, fontSize:12 }}>{adjVariant.label} · SKU: {adjVariant.sku}</p>
                <p style={{ color:A.gold, fontSize:12, fontWeight:600 }}>
                  Current stock: {adjVariant.stock_quantity} units
                </p>
              </div>
            </div>

            {/* Adjustment type selector */}
            <div>
              <label style={{ color:A.grey, fontSize:11, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600 }}>
                Adjustment Type
              </label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {ADJ_TYPES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setAdjType(t.value)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-left"
                    style={{
                      background: adjType === t.value ? `${t.colour}15` : "#fff",
                      border:     `1px solid ${adjType === t.value ? t.colour : A.border}`,
                      color:      adjType === t.value ? t.colour : A.grey,
                      fontWeight: adjType === t.value ? 600 : 400,
                    }}
                  >
                    <span style={{ fontFamily:"monospace", fontSize:12, fontWeight:700 }}>{t.sign}</span>
                    <span className="text-xs">{t.label.replace(/^[^ ]+ /,"")}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity input */}
            <Input
              label={adjType === "manual_set" ? "Set New Quantity" : "Quantity to Adjust"}
              type="number"
              min={0}
              placeholder={adjType === "manual_set" ? "Enter exact new quantity" : "e.g. 20"}
              value={adjQty}
              onChange={e => setAdjQty(e.target.value)}
            />

            {/* Preview */}
            {adjQty && !isNaN(Number(adjQty)) && (
              <div className="flex items-center gap-3 p-3 rounded-lg"
                style={{ background:"rgba(200,150,12,0.06)", border:`1px solid rgba(200,150,12,0.2)` }}>
                <span style={{ color:A.grey, fontSize:13 }}>Current: <strong>{adjVariant.stock_quantity}</strong></span>
                <span style={{ color:A.grey }}>→</span>
                <span style={{ color: ADJ_MAP[adjType]?.colour, fontSize:14, fontWeight:700 }}>
                  {adjType === "manual_set"
                    ? Number(adjQty)
                    : ["manual_remove","damaged"].includes(adjType)
                    ? Math.max(0, adjVariant.stock_quantity - Number(adjQty))
                    : adjVariant.stock_quantity + Number(adjQty)
                  } units
                </span>
              </div>
            )}

            <Input
              label="Note (optional)"
              placeholder="e.g. Restocking from supplier, Spoiled during packing…"
              value={adjNote}
              onChange={e => setAdjNote(e.target.value)}
            />

            {adjError && <Alert type="error">{adjError}</Alert>}

            <div className="flex gap-3 justify-end pt-2">
              <Btn variant="ghost" onClick={() => setAdjVariant(null)}>Cancel</Btn>
              <Btn loading={adjLoading} onClick={submitAdj}>
                Apply Adjustment
              </Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* ── History Drawer ── */}
      <Modal
        open={!!histVariant}
        onClose={() => setHistVariant(null)}
        title={`Stock History — ${histVariant?.product_name} ${histVariant?.label}`}
        width={620}
      >
        <div className="space-y-3">
          {histLoading ? (
            <div className="flex justify-center py-8"><Spinner size={24}/></div>
          ) : history.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-3xl mb-2">📋</p>
              <p style={{ color:A.grey, fontSize:13 }}>No adjustment history yet</p>
            </div>
          ) : (
            <>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px" style={{ background:A.border }}/>
                <div className="space-y-3">
                  {history.map((h, i) => {
                    const adjInfo = ADJ_MAP[h.adjustment_type] || { label:h.adjustment_type, colour:A.grey };
                    const isPositive = h.qty_change > 0;
                    return (
                      <div key={h.id} className="relative pl-10">
                        <div
                          className="absolute left-2.5 -translate-x-1/2 w-3 h-3 rounded-full border-2"
                          style={{ background:"#fff", borderColor:adjInfo.colour, top:3 }}
                        />
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                style={{ background:`${adjInfo.colour}15`, color:adjInfo.colour }}>
                                {adjInfo.label}
                              </span>
                              <span style={{
                                fontSize:13, fontWeight:700,
                                color: isPositive ? "#2E7D32" : h.qty_change < 0 ? "#C0272D" : A.grey,
                              }}>
                                {isPositive ? "+" : ""}{h.qty_change} units
                              </span>
                            </div>
                            <p style={{ color:A.grey, fontSize:11, marginTop:3 }}>
                              {h.qty_before} → {h.qty_after} units
                              {h.note && ` · ${h.note}`}
                            </p>
                            <p style={{ color:A.grey, fontSize:10, marginTop:2 }}>
                              {fmtDateTime(h.created_at)} · by {h.created_by}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p style={{ fontWeight:700, fontSize:15, color:A.brown }}>{h.qty_after}</p>
                            <p style={{ fontSize:9, color:A.grey }}>units after</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pagination */}
              {histPages > 1 && (
                <div className="flex items-center justify-between pt-3 border-t"
                  style={{ borderColor:A.border }}>
                  <Btn variant="ghost" size="sm" disabled={histPage <= 1}
                    onClick={() => openHistory(histVariant, histPage - 1)}>
                    ← Older
                  </Btn>
                  <span style={{ color:A.grey, fontSize:12 }}>
                    Page {histPage} of {histPages}
                  </span>
                  <Btn variant="ghost" size="sm" disabled={histPage >= histPages}
                    onClick={() => openHistory(histVariant, histPage + 1)}>
                    Newer →
                  </Btn>
                </div>
              )}
            </>
          )}
        </div>
      </Modal>
    </AdminPage>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT INVENTORY CARD
// Shows all variants for one product in a single card
// ─────────────────────────────────────────────────────────────────────────────
function ProductInventoryCard({
  group, edits, threshEdits, getQty, getThresh,
  setQty, setThresh, onAdjust, onHistory, StockBadge,
}: any) {
  const { product, variants } = group;
  const hasLowStock   = variants.some((v: any) => v.status === "low_stock");
  const hasOutOfStock = variants.some((v: any) => v.status === "out_of_stock");

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "#fff",
        border:     `1px solid ${hasOutOfStock ? "rgba(192,39,45,0.3)" : hasLowStock ? "rgba(184,117,10,0.3)" : A.border}`,
        boxShadow:  "0 1px 4px rgba(74,44,10,0.04)",
      }}
    >
      {/* Product header */}
      <div
        className="flex items-center justify-between px-5 py-3.5 border-b"
        style={{
          borderColor:A.border,
          background: hasOutOfStock ? "rgba(192,39,45,0.03)"
                    : hasLowStock   ? "rgba(184,117,10,0.03)"
                    : A.cream,
        }}
      >
        <div className="flex items-center gap-3">
          {/* REPLACE with actual product image */}
          <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center shrink-0"
            style={{ background:A.cream, border:`1px solid ${A.border}` }}>
            {product.image
              ? <img src={product.image} alt={product.name} className="w-full h-full object-cover"/>
              : <span className="text-xl">🫙</span>
            }
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Link href={`/admin/products/${product.id}`}>
                <p style={{ fontWeight:700, fontSize:14, color:A.brown }} className="hover:underline">
                  {product.name}
                </p>
              </Link>
              {!product.active && (
                <span className="px-1.5 py-0.5 rounded text-xs" style={{ background:"rgba(107,107,107,0.1)", color:A.grey }}>
                  Inactive
                </span>
              )}
            </div>
            <p style={{ color:A.grey, fontSize:11 }}>
              {variants.length} variant{variants.length !== 1 ? "s" : ""} ·
              Total: <strong style={{ color:A.brown }}>{variants.reduce((s: number, v: any) => s + v.stock_quantity, 0)} units</strong>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasOutOfStock && (
            <span className="px-2 py-1 rounded-full text-xs font-bold animate-pulse"
              style={{ background:"rgba(192,39,45,0.12)", color:"#C0272D" }}>🚫 Out of Stock</span>
          )}
          {!hasOutOfStock && hasLowStock && (
            <span className="px-2 py-1 rounded-full text-xs font-bold"
              style={{ background:"rgba(184,117,10,0.12)", color:"#B8750A" }}>⚠️ Low Stock</span>
          )}
        </div>
      </div>

      {/* Variants rows */}
      <div className="divide-y" style={{ borderColor:A.border }}>
        {variants.map((v: any) => {
          const currentQty   = parseInt(getQty(v)) || 0;
          const currentThresh= parseInt(getThresh(v)) || 5;
          const qtyEdited    = edits[v.id] !== undefined;
          const thrEdited    = threshEdits[v.id] !== undefined;

          return (
            <div
              key={v.id}
              className="flex flex-wrap items-center gap-4 px-5 py-3.5 transition-colors"
              style={{
                background: qtyEdited ? "rgba(200,150,12,0.03)" : "transparent",
              }}
            >
              {/* Variant label + SKU */}
              <div style={{ minWidth:100, flex:"0 0 auto" }}>
                <p style={{ fontWeight:600, fontSize:13, color:A.brown }}>{v.label}</p>
                <p style={{ fontFamily:"monospace", fontSize:10, color:A.grey }}>{v.sku}</p>
                <p style={{ fontSize:11, color:A.gold, fontWeight:600 }}>{fmt₹(v.price)}</p>
              </div>

              {/* Status badge */}
              <div style={{ flex:"0 0 auto" }}>
                <StockBadge qty={currentQty} threshold={currentThresh}/>
              </div>

              {/* Stock qty editor */}
              <div className="flex items-center gap-1.5 flex-1" style={{ minWidth:160 }}>
                <div>
                  <p style={{ fontSize:9, color:A.grey, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:3 }}>
                    Stock Qty
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setQty(v.id, String(Math.max(0, currentQty - 1)))}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-base transition-colors"
                      style={{ background:A.cream, border:`1px solid ${A.border}`, color:A.brown }}
                    >−</button>
                    <input
                      type="number" min={0}
                      value={getQty(v)}
                      onChange={e => setQty(v.id, e.target.value)}
                      className="w-16 text-center py-1.5 rounded-lg text-sm outline-none font-bold"
                      style={{
                        border:     `1px solid ${qtyEdited ? A.gold : A.border}`,
                        background: qtyEdited ? "rgba(200,150,12,0.06)" : "#fff",
                        color:      A.brown,
                        boxShadow:  qtyEdited ? `0 0 0 2px rgba(200,150,12,0.15)` : "none",
                      }}
                    />
                    <button
                      onClick={() => setQty(v.id, String(currentQty + 1))}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-base transition-colors"
                      style={{ background:A.cream, border:`1px solid ${A.border}`, color:A.brown }}
                    >+</button>
                    {qtyEdited && <span style={{ color:A.gold, fontSize:14 }}>●</span>}
                  </div>
                </div>

                {/* Threshold editor */}
                <div className="ml-4">
                  <p style={{ fontSize:9, color:A.grey, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:3 }}>
                    Alert When ≤
                  </p>
                  <input
                    type="number" min={0}
                    value={getThresh(v)}
                    onChange={e => setThresh(v.id, e.target.value)}
                    className="w-16 text-center py-1.5 rounded-lg text-sm outline-none"
                    style={{
                      border:     `1px solid ${thrEdited ? A.gold : A.border}`,
                      background: thrEdited ? "rgba(200,150,12,0.06)" : "#fff",
                      color:      A.brown,
                    }}
                  />
                </div>
              </div>

              {/* Sell-through estimate */}
              <div style={{ flex:"0 0 auto", minWidth:70 }}>
                <p style={{ fontSize:9, color:A.grey, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:3 }}>
                  ~Days Left
                </p>
                <p style={{ fontWeight:700, fontSize:13, color: currentQty === 0 ? "#C0272D" : currentQty <= currentThresh ? "#B8750A" : "#2E7D32" }}>
                  {currentQty === 0 ? "Sold out" : currentQty <= 5 ? "≤5 days" : currentQty <= 20 ? "~1 week" : "Good"}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-1.5 ml-auto flex-wrap">
                <Btn
                  variant="secondary"
                  size="sm"
                  title="Stock adjustment"
                  onClick={() => onAdjust(v)}
                >
                  ± Adjust
                </Btn>
                <Btn
                  variant="ghost"
                  size="sm"
                  title="View stock history"
                  onClick={() => onHistory(v)}
                >
                  📋 History
                </Btn>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

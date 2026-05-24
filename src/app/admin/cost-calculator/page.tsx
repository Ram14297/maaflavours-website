"use client";
// src/app/admin/cost-calculator/page.tsx
// Maa Flavours — Pickle Cost Calculator
// Enter ingredient, packaging, labour, shiprocket costs per pickle variant
// Auto-calculates total cost price, suggested sell price, and real profit margin
// "Your Pricing" section: actual sell price + delivery charge collected → real margin
// Data saved in localStorage — persists across sessions
// Download button exports everything as a CSV (opens in Excel)

import { useState, useEffect, useCallback } from "react";

// Products are fetched live from Supabase via API
interface ProductOption { slug: string; name: string; }

// ─── Cost rows ────────────────────────────────────────────────────────────────
const GROUPS = [
  {
    key: "ingredients",
    label: "🥗 Ingredients",
    rows: [
      { key: "ingredient_main", label: "Main Ingredient" },
      { key: "ingredient_oil",  label: "Groundnut Oil"   },
      { key: "ingredient_spice",label: "Spices & Masala" },
    ],
  },
  {
    key: "production",
    label: "👩‍🍳 Production",
    rows: [
      { key: "labour", label: "Labour Cost" },
      { key: "gas",    label: "Gas / Fuel"  },
    ],
  },
  {
    key: "packaging",
    label: "📦 Packaging",
    rows: [
      { key: "container", label: "Container / Pouch"  },
      { key: "lid",       label: "Lid / Seal"         },
      { key: "label",     label: "Label (Printed)"    },
      { key: "bubble",    label: "Bubble Wrap"        },
      { key: "box",       label: "Corrugated Box"     },
      { key: "tape",      label: "Tape & Misc"        },
    ],
  },
  {
    key: "logistics",
    label: "🚚 Shiprocket",
    rows: [
      { key: "ship_fwd", label: "Forward Shipping Fee"  },
      { key: "ship_cod", label: "COD Handling Fee"      },
      { key: "ship_rto", label: "RTO Provision (5–10%)" },
      { key: "ship_gst", label: "GST on Shipping (18%)" },
    ],
  },
  {
    key: "fees",
    label: "💳 Fees",
    rows: [
      { key: "gateway",   label: "Payment Gateway ~2% (Cashfree)" },
      { key: "marketing", label: "Marketing / Ads"                },
    ],
  },
];

const ALL_ROWS = GROUPS.flatMap(g => g.rows);
type CostKey = typeof ALL_ROWS[number]["key"];
type Variant  = "v250" | "v500";

type PickleCosts = Record<CostKey, Record<Variant, string>>;

function blankPickleCosts(): PickleCosts {
  const obj: any = {};
  ALL_ROWS.forEach(r => { obj[r.key] = { v250: "", v500: "" }; });
  return obj;
}

// ─── Revenue (pricing) per product ───────────────────────────────────────────
interface PricingData {
  sellingPrice:   Record<Variant, string>;
  deliveryCharge: Record<Variant, string>;
}

function blankPricing(): PricingData {
  return {
    sellingPrice:   { v250: "", v500: "" },
    deliveryCharge: { v250: "", v500: "" },
  };
}

type AllCosts   = Record<string, PickleCosts>;
type AllPricing = Record<string, PricingData>;

const STORAGE_KEY         = "mf-cost-calculator-v1";
const PRICING_STORAGE_KEY = "mf-cost-calculator-pricing-v1";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function numVal(s: string): number { return parseFloat(s) || 0; }

function totalCost(costs: PickleCosts, v: Variant): number {
  return ALL_ROWS.reduce((sum, r) => sum + numVal(costs[r.key][v]), 0);
}

function suggestedPrice(cost: number, margin: number): number {
  if (cost <= 0 || margin >= 100) return 0;
  return Math.ceil(cost / (1 - margin / 100));
}

function fmt(n: number, showSign = false): string {
  if (n === 0) return "—";
  const prefix = showSign && n > 0 ? "+" : "";
  return `${prefix}₹${n.toFixed(2)}`;
}

function pct(n: number): string {
  return n > 0 ? `${n.toFixed(1)}%` : "—";
}

// ─── Margin badge colour ──────────────────────────────────────────────────────
function marginColor(m: number): string {
  if (m >= 50) return "#2E7D32";
  if (m >= 35) return "#E07B00";
  return "var(--color-crimson)";
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CostCalculatorPage() {
  const [products, setProducts]     = useState<ProductOption[]>([]);
  const [loadingP, setLoadingP]     = useState(true);
  const [allCosts, setAllCosts]     = useState<AllCosts>({});
  const [allPricing, setAllPricing] = useState<AllPricing>({});
  const [selected, setSelected]     = useState("");
  const [margin, setMargin]         = useState(40);
  const [saved, setSaved]           = useState(false);

  // Fetch live products from Supabase
  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch("/api/admin/products?limit=100");
        const data = await res.json();
        const list: ProductOption[] = (data.products || [])
          .filter((p: any) => p.is_active)
          .map((p: any) => ({ slug: p.slug, name: p.name }));
        setProducts(list);
        if (list.length > 0) setSelected(prev => prev || list[0].slug);
      } catch {
        // fallback empty
      } finally {
        setLoadingP(false);
      }
    }
    load();
  }, []);

  // Load saved costs + pricing from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setAllCosts(JSON.parse(raw));
      const rawP = localStorage.getItem(PRICING_STORAGE_KEY);
      if (rawP) setAllPricing(JSON.parse(rawP));
    } catch {}
  }, []);

  const pickleCosts = useCallback(
    (slug: string): PickleCosts => allCosts[slug] || blankPickleCosts(),
    [allCosts]
  );

  const picklePricing = useCallback(
    (slug: string): PricingData => allPricing[slug] || blankPricing(),
    [allPricing]
  );

  const current = pickleCosts(selected);
  const pricing = picklePricing(selected);

  function updateCell(rowKey: CostKey, v: Variant, value: string) {
    setAllCosts(prev => ({
      ...prev,
      [selected]: {
        ...(prev[selected] || blankPickleCosts()),
        [rowKey]: {
          ...(prev[selected]?.[rowKey] || { v250: "", v500: "" }),
          [v]: value,
        },
      },
    }));
    setSaved(false);
  }

  function updatePricing(field: keyof PricingData, v: Variant, value: string) {
    setAllPricing(prev => ({
      ...prev,
      [selected]: {
        ...(prev[selected] || blankPricing()),
        [field]: {
          ...(prev[selected]?.[field] || { v250: "", v500: "" }),
          [v]: value,
        },
      },
    }));
    setSaved(false);
  }

  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allCosts));
    localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(allPricing));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function resetPickle() {
    if (!confirm(`Reset all costs for ${products.find(p => p.slug === selected)?.name}?`)) return;
    setAllCosts(prev => ({ ...prev, [selected]: blankPickleCosts() }));
    setAllPricing(prev => ({ ...prev, [selected]: blankPricing() }));
    setSaved(false);
  }

  // ─── CSV Download ─────────────────────────────────────────────────────────
  function downloadCSV() {
    const lines: string[] = [
      "Maa Flavours — Pickle Cost Sheet",
      `Generated: ${new Date().toLocaleDateString("en-IN")}`,
      `Target Margin: ${margin}%`,
      "",
    ];

    products.forEach(pickle => {
      const pc = pickleCosts(pickle.slug);
      const pr = picklePricing(pickle.slug);
      lines.push(`=== ${pickle.name} ===`);
      lines.push("Cost Head,250g (₹),500g (₹)");

      GROUPS.forEach(g => {
        lines.push(`--- ${g.label} ---,,`);
        g.rows.forEach(r => {
          lines.push(`${r.label},${numVal(pc[r.key].v250).toFixed(2)},${numVal(pc[r.key].v500).toFixed(2)}`);
        });
      });

      const t250 = totalCost(pc, "v250");
      const t500 = totalCost(pc, "v500");
      const s250 = suggestedPrice(t250, margin);
      const s500 = suggestedPrice(t500, margin);

      const sp250 = numVal(pr.sellingPrice.v250);
      const sp500 = numVal(pr.sellingPrice.v500);
      const dc250 = numVal(pr.deliveryCharge.v250);
      const dc500 = numVal(pr.deliveryCharge.v500);
      const rev250 = sp250 + dc250;
      const rev500 = sp500 + dc500;
      const rp250 = rev250 - t250;
      const rp500 = rev500 - t500;
      const rm250 = rev250 > 0 ? (rp250 / rev250) * 100 : 0;
      const rm500 = rev500 > 0 ? (rp500 / rev500) * 100 : 0;

      lines.push("");
      lines.push(`Total Cost Price,${t250.toFixed(2)},${t500.toFixed(2)}`);
      lines.push(`Suggested Sell Price (${margin}% margin),${s250},${s500}`);
      lines.push("");
      lines.push(`Your Actual Selling Price,${sp250},${sp500}`);
      lines.push(`Delivery Charge Collected,${dc250},${dc500}`);
      lines.push(`Total Revenue,${rev250.toFixed(2)},${rev500.toFixed(2)}`);
      lines.push(`Real Profit,${rp250.toFixed(2)},${rp500.toFixed(2)}`);
      lines.push(`Real Margin %,${rm250.toFixed(1)}%,${rm500.toFixed(1)}%`);
      lines.push("");
    });

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `maa-flavours-cost-sheet-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ─── Summary values ───────────────────────────────────────────────────────
  const cost250  = totalCost(current, "v250");
  const cost500  = totalCost(current, "v500");
  const sell250  = suggestedPrice(cost250, margin);
  const sell500  = suggestedPrice(cost500, margin);

  // Real margin (actual selling price + delivery charge)
  const sp250 = numVal(pricing.sellingPrice.v250);
  const sp500 = numVal(pricing.sellingPrice.v500);
  const dc250 = numVal(pricing.deliveryCharge.v250);
  const dc500 = numVal(pricing.deliveryCharge.v500);
  const rev250 = sp250 + dc250;
  const rev500 = sp500 + dc500;
  const realProfit250 = rev250 > 0 ? rev250 - cost250 : 0;
  const realProfit500 = rev500 > 0 ? rev500 - cost500 : 0;
  const realMargin250 = rev250 > 0 ? (realProfit250 / rev250) * 100 : 0;
  const realMargin500 = rev500 > 0 ? (realProfit500 / rev500) * 100 : 0;

  const hasRealPricing = sp250 > 0 || sp500 > 0;

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="font-playfair font-bold text-2xl" style={{ color: "var(--color-brown)" }}>
            Cost Calculator
          </h2>
          <p className="font-dm-sans text-sm mt-1" style={{ color: "var(--color-grey)" }}>
            Enter costs per pickle variant. Suggested sell price is calculated automatically.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-dm-sans text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#2E7D32" }}>
            ⬇ Download Excel (CSV)
          </button>
          <button onClick={saveToStorage}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-dm-sans text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: saved ? "#2E7D32" : "var(--color-brown)", color: "white" }}>
            {saved ? "✓ Saved!" : "💾 Save"}
          </button>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Pickle selector */}
        <div className="flex flex-col gap-1.5">
          <label className="font-dm-sans text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-gold)" }}>
            Pickle
          </label>
          <select
            value={selected}
            onChange={e => setSelected(e.target.value)}
            className="font-dm-sans text-sm px-3 py-2 rounded-xl border outline-none"
            style={{ borderColor: "rgba(200,150,12,0.3)", color: "var(--color-brown)", minWidth: 200 }}>
            {products.map(p => (
              <option key={p.slug} value={p.slug}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Margin slider */}
        <div className="flex flex-col gap-1.5">
          <label className="font-dm-sans text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-gold)" }}>
            Target Profit Margin — <span style={{ color: "var(--color-crimson)" }}>{margin}%</span>
          </label>
          <div className="flex items-center gap-3">
            <input type="range" min={10} max={70} step={5} value={margin}
              onChange={e => setMargin(Number(e.target.value))}
              className="w-40 accent-amber-700" />
            <span className="font-dm-sans text-sm font-bold" style={{ color: "var(--color-brown)" }}>
              {margin}%
            </span>
          </div>
        </div>

        <button onClick={resetPickle}
          className="self-end px-3 py-2 rounded-xl font-dm-sans text-xs transition-opacity hover:opacity-70"
          style={{ border: "1px solid rgba(192,39,45,0.3)", color: "var(--color-crimson)" }}>
          Reset Pickle
        </button>
      </div>

      {/* ── Your Pricing Panel ─────────────────────────────────────────────── */}
      <div className="rounded-2xl mb-6 overflow-hidden"
        style={{ border: "2px solid rgba(200,150,12,0.25)", background: "white", boxShadow: "0 2px 12px rgba(74,44,10,0.06)" }}>

        {/* Panel header */}
        <div className="px-5 py-3 border-b flex items-center gap-2"
          style={{ borderColor: "rgba(200,150,12,0.15)", background: "linear-gradient(90deg, rgba(200,150,12,0.07), rgba(200,150,12,0.03))" }}>
          <span className="text-base">💰</span>
          <div>
            <p className="font-dm-sans font-bold text-sm" style={{ color: "var(--color-brown)" }}>
              Your Pricing
            </p>
            <p className="font-dm-sans text-xs" style={{ color: "var(--color-grey)" }}>
              What you actually charge customers — calculates your real profit margin
            </p>
          </div>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_140px_140px] gap-0 px-5 py-2 border-b"
          style={{ borderColor: "rgba(200,150,12,0.08)", background: "var(--color-cream)" }}>
          <p className="font-dm-sans text-xs font-bold uppercase tracking-wide" style={{ color: "var(--color-brown)" }}>Field</p>
          <p className="font-dm-sans text-xs font-bold uppercase tracking-wide text-center" style={{ color: "var(--color-gold)" }}>250g (₹)</p>
          <p className="font-dm-sans text-xs font-bold uppercase tracking-wide text-center" style={{ color: "var(--color-gold)" }}>500g (₹)</p>
        </div>

        {/* Selling price row */}
        <div className="grid grid-cols-[1fr_140px_140px] gap-0 px-5 py-3 border-b items-center"
          style={{ borderColor: "rgba(200,150,12,0.08)" }}>
          <div>
            <p className="font-dm-sans text-sm font-semibold" style={{ color: "var(--color-brown)" }}>
              Your Selling Price
            </p>
            <p className="font-dm-sans text-xs" style={{ color: "var(--color-grey)" }}>
              Product price on website (e.g. ₹209)
            </p>
          </div>
          {(["v250", "v500"] as Variant[]).map(v => (
            <div key={v} className="flex justify-center">
              <input
                type="number" min={0} step={1} placeholder="0"
                value={pricing.sellingPrice[v]}
                onChange={e => updatePricing("sellingPrice", v, e.target.value)}
                className="w-28 text-center font-dm-sans text-sm px-2 py-1.5 rounded-lg border outline-none transition-all font-semibold"
                style={{ borderColor: "rgba(200,150,12,0.3)", color: "var(--color-brown)", background: "white" }}
                onFocus={e => (e.target.style.borderColor = "var(--color-gold)")}
                onBlur={e => (e.target.style.borderColor = "rgba(200,150,12,0.3)")}
              />
            </div>
          ))}
        </div>

        {/* Delivery charge row */}
        <div className="grid grid-cols-[1fr_140px_140px] gap-0 px-5 py-3 items-center"
          style={{ background: "rgba(250,247,242,0.5)" }}>
          <div>
            <p className="font-dm-sans text-sm font-semibold" style={{ color: "var(--color-brown)" }}>
              Delivery Charge Collected
            </p>
            <p className="font-dm-sans text-xs" style={{ color: "var(--color-grey)" }}>
              What customer pays for shipping (e.g. ₹89)
            </p>
          </div>
          {(["v250", "v500"] as Variant[]).map(v => (
            <div key={v} className="flex justify-center">
              <input
                type="number" min={0} step={1} placeholder="0"
                value={pricing.deliveryCharge[v]}
                onChange={e => updatePricing("deliveryCharge", v, e.target.value)}
                className="w-28 text-center font-dm-sans text-sm px-2 py-1.5 rounded-lg border outline-none transition-all font-semibold"
                style={{ borderColor: "rgba(200,150,12,0.3)", color: "var(--color-brown)", background: "white" }}
                onFocus={e => (e.target.style.borderColor = "var(--color-gold)")}
                onBlur={e => (e.target.style.borderColor = "rgba(200,150,12,0.3)")}
              />
            </div>
          ))}
        </div>

        {/* Real margin result */}
        {hasRealPricing && (
          <div className="grid grid-cols-[1fr_140px_140px] gap-0 px-5 py-4 border-t"
            style={{ borderColor: "rgba(200,150,12,0.15)", background: "rgba(46,125,50,0.05)" }}>
            <div>
              <p className="font-dm-sans font-bold text-sm" style={{ color: "#2E7D32" }}>
                ✅ Real Profit Margin
              </p>
              <p className="font-dm-sans text-xs" style={{ color: "var(--color-grey)" }}>
                Based on actual price + delivery collected
              </p>
            </div>
            {([
              { sp: sp250, dc: dc250, rev: rev250, profit: realProfit250, margin: realMargin250 },
              { sp: sp500, dc: dc500, rev: rev500, profit: realProfit500, margin: realMargin500 },
            ]).map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                {d.sp > 0 ? (
                  <>
                    <p className="font-playfair font-bold text-xl" style={{ color: marginColor(d.margin) }}>
                      {pct(d.margin)}
                    </p>
                    <p className="font-dm-sans text-xs font-semibold" style={{ color: marginColor(d.margin) }}>
                      {fmt(d.profit)} profit
                    </p>
                    <p className="font-dm-sans text-[10px]" style={{ color: "var(--color-grey)" }}>
                      Revenue ₹{d.rev.toFixed(0)}
                    </p>
                  </>
                ) : (
                  <p className="font-dm-sans text-sm" style={{ color: "var(--color-grey)" }}>—</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "250g Cost Price",    value: fmt(cost250),   sub: "total cost",           color: "#4A2C0A" },
          { label: "250g Sell Price",    value: fmt(sell250),   sub: `at ${margin}% target`,  color: "#C8960C" },
          { label: "500g Cost Price",    value: fmt(cost500),   sub: "total cost",           color: "#4A2C0A" },
          { label: "500g Sell Price",    value: fmt(sell500),   sub: `at ${margin}% target`,  color: "#C8960C" },
        ].map(card => (
          <div key={card.label} className="rounded-2xl p-4 text-center"
            style={{ background: "white", border: "1px solid rgba(200,150,12,0.15)", boxShadow: "0 1px 4px rgba(74,44,10,0.06)" }}>
            <p className="font-dm-sans text-xs mb-1" style={{ color: "var(--color-grey)" }}>{card.label}</p>
            <p className="font-playfair font-bold text-xl" style={{ color: card.color }}>{card.value}</p>
            <p className="font-dm-sans text-xs mt-0.5" style={{ color: "var(--color-grey)" }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Profit row — shows real margin if pricing entered, else suggested */}
      {hasRealPricing ? (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: "Real Profit — 250g", profit: realProfit250, margin: realMargin250, rev: rev250, cost: cost250, hasData: sp250 > 0 },
            { label: "Real Profit — 500g", profit: realProfit500, margin: realMargin500, rev: rev500, cost: cost500, hasData: sp500 > 0 },
          ].map(card => (
            <div key={card.label} className="rounded-2xl p-4 flex items-center justify-between"
              style={{
                background: card.hasData && card.margin >= 50 ? "rgba(46,125,50,0.08)" : card.hasData ? "rgba(200,120,12,0.07)" : "rgba(200,150,12,0.05)",
                border: `1px solid ${card.hasData && card.margin >= 50 ? "rgba(46,125,50,0.25)" : "rgba(200,150,12,0.15)"}`,
              }}>
              <div>
                <p className="font-dm-sans text-xs" style={{ color: "var(--color-grey)" }}>{card.label}</p>
                <p className="font-playfair font-bold text-2xl" style={{ color: card.hasData ? marginColor(card.margin) : "var(--color-grey)" }}>
                  {card.hasData ? pct(card.margin) : "—"}
                </p>
                {card.hasData && (
                  <p className="font-dm-sans text-xs mt-0.5" style={{ color: "var(--color-grey)" }}>
                    {fmt(card.profit)} on ₹{card.rev.toFixed(0)} revenue
                  </p>
                )}
              </div>
              {card.hasData && (
                <div className="text-right">
                  <span className="font-dm-sans text-sm font-bold px-3 py-1 rounded-full block"
                    style={{ background: `${marginColor(card.margin)}18`, color: marginColor(card.margin) }}>
                    {card.margin >= 50 ? "🟢 Healthy" : card.margin >= 35 ? "🟡 Ok" : "🔴 Low"}
                  </span>
                  <p className="font-dm-sans text-[10px] mt-1" style={{ color: "var(--color-grey)" }}>
                    Cost ₹{card.cost.toFixed(0)}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: "Profit per 250g unit", value: sell250 - cost250, sell: sell250 },
            { label: "Profit per 500g unit", value: sell500 - cost500, sell: sell500 },
          ].map(card => (
            <div key={card.label} className="rounded-2xl p-4 flex items-center justify-between"
              style={{ background: card.value > 0 ? "rgba(46,125,50,0.07)" : "rgba(200,150,12,0.05)", border: `1px solid ${card.value > 0 ? "rgba(46,125,50,0.2)" : "rgba(200,150,12,0.15)"}` }}>
              <div>
                <p className="font-dm-sans text-xs" style={{ color: "var(--color-grey)" }}>{card.label}</p>
                <p className="font-playfair font-bold text-lg" style={{ color: card.value > 0 ? "#2E7D32" : "var(--color-grey)" }}>
                  {card.sell > 0 ? fmt(card.value) : "—"}
                </p>
              </div>
              {card.sell > 0 && card.value > 0 && (
                <span className="font-dm-sans text-sm font-bold px-3 py-1 rounded-full"
                  style={{ background: "rgba(46,125,50,0.12)", color: "#2E7D32" }}>
                  {margin}% margin
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Cost Input Table ── */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "white", border: "1px solid rgba(200,150,12,0.15)", boxShadow: "0 2px 8px rgba(74,44,10,0.05)" }}>

        {/* Table header */}
        <div className="grid grid-cols-[1fr_120px_120px] gap-0 px-5 py-3 border-b"
          style={{ borderColor: "rgba(200,150,12,0.1)", background: "var(--color-cream)" }}>
          <p className="font-dm-sans text-xs font-bold uppercase tracking-wide" style={{ color: "var(--color-brown)" }}>Cost Head</p>
          <p className="font-dm-sans text-xs font-bold uppercase tracking-wide text-center" style={{ color: "var(--color-gold)" }}>250g (₹)</p>
          <p className="font-dm-sans text-xs font-bold uppercase tracking-wide text-center" style={{ color: "var(--color-gold)" }}>500g (₹)</p>
        </div>

        {/* Groups */}
        {GROUPS.map((group, gi) => (
          <div key={group.key}>
            {/* Group header */}
            <div className="px-5 py-2 border-b"
              style={{ borderColor: "rgba(200,150,12,0.08)", background: "rgba(200,150,12,0.04)" }}>
              <p className="font-dm-sans text-xs font-bold" style={{ color: "var(--color-brown)" }}>{group.label}</p>
            </div>

            {/* Rows */}
            {group.rows.map((row, ri) => (
              <div key={row.key}
                className="grid grid-cols-[1fr_120px_120px] gap-0 px-5 py-2.5 border-b items-center"
                style={{ borderColor: "rgba(200,150,12,0.06)", background: ri % 2 === 0 ? "white" : "rgba(250,247,242,0.5)" }}>
                <p className="font-dm-sans text-sm" style={{ color: "var(--color-brown)" }}>{row.label}</p>
                {(["v250", "v500"] as Variant[]).map(v => (
                  <div key={v} className="flex justify-center">
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      placeholder="0.00"
                      value={current[row.key as CostKey][v]}
                      onChange={e => updateCell(row.key as CostKey, v, e.target.value)}
                      className="w-24 text-center font-dm-sans text-sm px-2 py-1.5 rounded-lg border outline-none transition-all"
                      style={{
                        borderColor: "rgba(200,150,12,0.2)",
                        color: "var(--color-brown)",
                        background: "white",
                      }}
                      onFocus={e => (e.target.style.borderColor = "var(--color-gold)")}
                      onBlur={e => (e.target.style.borderColor = "rgba(200,150,12,0.2)")}
                    />
                  </div>
                ))}
              </div>
            ))}

            {/* Group subtotal */}
            <div className="grid grid-cols-[1fr_120px_120px] gap-0 px-5 py-2 border-b"
              style={{ borderColor: "rgba(200,150,12,0.1)", background: "rgba(200,150,12,0.05)" }}>
              <p className="font-dm-sans text-xs font-semibold italic" style={{ color: "var(--color-grey)" }}>
                {group.label} subtotal
              </p>
              {(["v250", "v500"] as Variant[]).map(v => {
                const sub = group.rows.reduce((s, r) => s + numVal(current[r.key as CostKey][v]), 0);
                return (
                  <p key={v} className="font-dm-sans text-xs font-semibold text-center" style={{ color: "var(--color-brown)" }}>
                    {sub > 0 ? `₹${sub.toFixed(2)}` : "—"}
                  </p>
                );
              })}
            </div>
          </div>
        ))}

        {/* ── Grand Total ── */}
        <div className="grid grid-cols-[1fr_120px_120px] gap-0 px-5 py-4"
          style={{ background: "var(--color-brown)" }}>
          <p className="font-dm-sans font-bold text-sm text-white">Total Cost Price</p>
          {([{ v: "v250" as Variant, val: cost250 }, { v: "v500" as Variant, val: cost500 }]).map(({ v, val }) => (
            <p key={v} className="font-playfair font-bold text-base text-center" style={{ color: "#E8B84B" }}>
              {val > 0 ? `₹${val.toFixed(2)}` : "—"}
            </p>
          ))}
        </div>

        {/* ── Suggested sell price ── */}
        <div className="grid grid-cols-[1fr_120px_120px] gap-0 px-5 py-4 border-t"
          style={{ borderColor: "rgba(200,150,12,0.15)", background: "rgba(46,125,50,0.06)" }}>
          <div>
            <p className="font-dm-sans font-bold text-sm" style={{ color: "#2E7D32" }}>
              Suggested Sell Price
            </p>
            <p className="font-dm-sans text-xs" style={{ color: "var(--color-grey)" }}>
              At {margin}% target margin (excl. delivery)
            </p>
          </div>
          {([{ val: sell250 }, { val: sell500 }]).map(({ val }, i) => (
            <p key={i} className="font-playfair font-bold text-lg text-center" style={{ color: "#2E7D32" }}>
              {val > 0 ? `₹${val}` : "—"}
            </p>
          ))}
        </div>

        {/* ── Real margin row (only if pricing entered) ── */}
        {hasRealPricing && (
          <div className="grid grid-cols-[1fr_120px_120px] gap-0 px-5 py-4 border-t"
            style={{ borderColor: "rgba(200,150,12,0.15)", background: "rgba(200,150,12,0.04)" }}>
            <div>
              <p className="font-dm-sans font-bold text-sm" style={{ color: "var(--color-brown)" }}>
                Real Margin (incl. delivery)
              </p>
              <p className="font-dm-sans text-xs" style={{ color: "var(--color-grey)" }}>
                Your actual sell price + delivery charge
              </p>
            </div>
            {([
              { sp: sp250, margin: realMargin250 },
              { sp: sp500, margin: realMargin500 },
            ]).map((d, i) => (
              <p key={i} className="font-playfair font-bold text-lg text-center" style={{ color: d.sp > 0 ? marginColor(d.margin) : "var(--color-grey)" }}>
                {d.sp > 0 ? pct(d.margin) : "—"}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* ── Tip ── */}
      <p className="font-dm-sans text-xs mt-4 text-center" style={{ color: "var(--color-grey)" }}>
        💡 Fill <strong>Your Pricing</strong> above to see your real margin including delivery charge collected.
        Click <strong>Save</strong> to keep your data. Click <strong>Download Excel (CSV)</strong> to export all pickles at once.
      </p>
    </div>
  );
}

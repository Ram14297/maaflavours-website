"use client";
// src/app/admin/prep/page.tsx
// Maa Flavours — Daily Prep List
// Aggregates confirmed + processing + packed orders into a single
// "what to prepare today" view. No need to open individual orders.

import { useState, useEffect } from "react";
import { AdminPage, Card, A, Btn, fmtDateTime } from "@/components/admin/AdminUI";
import type { PrepItem } from "@/app/api/admin/prep-summary/route";

export default function PrepPage() {
  const [items,      setItems]      = useState<PrepItem[]>([]);
  const [orderCount, setOrderCount] = useState(0);
  const [generatedAt,setGeneratedAt]= useState("");
  const [loading,    setLoading]    = useState(true);
  const [sending,    setSending]    = useState(false);
  const [toast,      setToast]      = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/prep-summary");
      const d = await r.json();
      setItems(d.items || []);
      setOrderCount(d.order_count || 0);
      setGeneratedAt(d.generated_at || "");
    } catch {}
    setLoading(false);
  }

  async function sendWhatsApp() {
    setSending(true);
    try {
      const r = await fetch("/api/admin/prep-summary/notify", { method: "POST" });
      if (r.ok) showToast("WhatsApp sent to your number!");
      else showToast("Failed to send. Check SMS credits.");
    } catch {
      showToast("Failed to send.");
    }
    setSending(false);
  }

  useEffect(() => { load(); }, []);

  const totalJars = items.reduce((s, i) => s + i.total_qty, 0);

  return (
    <AdminPage>
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl font-dm-sans text-sm font-semibold shadow-lg"
          style={{ background: A.gold, color: "white" }}
        >
          {toast}
        </div>
      )}

      {/* ── Summary strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: "Jars to Prepare", value: loading ? "—" : String(totalJars), accent: true },
          { label: "Orders",          value: loading ? "—" : String(orderCount) },
          { label: "Products",        value: loading ? "—" : String(items.length) },
          { label: "As of",           value: generatedAt ? fmtDateTime(generatedAt) : "—" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl px-4 py-3"
            style={{
              background: s.accent ? A.gold + "18" : A.card,
              border: `1px solid ${s.accent ? A.gold + "40" : A.border}`,
            }}
          >
            <p className="font-dm-sans text-xs mb-0.5" style={{ color: A.grey }}>{s.label}</p>
            <p className="font-playfair font-bold text-2xl" style={{ color: s.accent ? A.gold : A.brown }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <Card>
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: A.border }}
        >
          <div>
            <h2 className="font-playfair font-bold text-base" style={{ color: A.brown }}>
              Preparation Required
            </h2>
            <p className="font-dm-sans text-xs mt-0.5" style={{ color: A.grey }}>
              Confirmed + Processing + Packed orders only
            </p>
          </div>
          <div className="flex gap-2">
            <Btn variant="ghost" size="sm" onClick={load} disabled={loading}>
              {loading ? "Loading…" : "↻ Refresh"}
            </Btn>
            <Btn variant="primary" size="sm" onClick={sendWhatsApp} disabled={sending}>
              {sending ? "Sending…" : "📲 Send WhatsApp"}
            </Btn>
          </div>
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div className="px-5 py-12 text-center font-dm-sans text-sm" style={{ color: A.grey }}>
            Loading prep list…
          </div>
        ) : items.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-3xl mb-2">✅</p>
            <p className="font-playfair font-bold text-base" style={{ color: A.brown }}>All caught up!</p>
            <p className="font-dm-sans text-sm mt-1" style={{ color: A.grey }}>
              No confirmed orders pending preparation.
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: A.border }}>
            {/* Column headers */}
            <div
              className="grid grid-cols-12 gap-2 px-5 py-2 font-dm-sans text-xs font-semibold uppercase"
              style={{ color: A.grey, background: A.card }}
            >
              <div className="col-span-4">Product</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-2 text-center">Jars</div>
              <div className="col-span-2 text-center">Orders</div>
              <div className="col-span-2">Order #s</div>
            </div>

            {items.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-12 gap-2 px-5 py-4 items-center"
                style={{ borderColor: A.border }}
              >
                <div className="col-span-4">
                  <p className="font-dm-sans font-semibold text-sm" style={{ color: A.brown }}>
                    {item.product_name}
                  </p>
                </div>
                <div className="col-span-2">
                  <span
                    className="font-dm-sans text-xs px-2 py-0.5 rounded-full"
                    style={{ background: A.border, color: A.grey }}
                  >
                    {item.variant_label}
                  </span>
                </div>
                <div className="col-span-2 text-center">
                  <span
                    className="font-playfair font-bold text-xl"
                    style={{ color: A.gold }}
                  >
                    {item.total_qty}
                  </span>
                </div>
                <div className="col-span-2 text-center">
                  <span className="font-dm-sans text-sm" style={{ color: A.grey }}>
                    {item.order_count}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="font-dm-sans text-xs leading-relaxed" style={{ color: A.grey }}>
                    {item.order_numbers.join(", ")}
                  </p>
                </div>
              </div>
            ))}

            {/* Total row */}
            <div
              className="grid grid-cols-12 gap-2 px-5 py-3 items-center"
              style={{ background: A.gold + "0f" }}
            >
              <div className="col-span-4">
                <p className="font-dm-sans font-bold text-sm" style={{ color: A.brown }}>
                  TOTAL
                </p>
              </div>
              <div className="col-span-2" />
              <div className="col-span-2 text-center">
                <span className="font-playfair font-bold text-xl" style={{ color: A.gold }}>
                  {totalJars}
                </span>
              </div>
              <div className="col-span-2 text-center">
                <span className="font-dm-sans font-bold text-sm" style={{ color: A.brown }}>
                  {orderCount}
                </span>
              </div>
              <div className="col-span-2" />
            </div>
          </div>
        )}
      </Card>

      {/* ── Label count hint ── */}
      {items.length > 0 && (
        <div
          className="mt-3 px-4 py-3 rounded-xl font-dm-sans text-sm"
          style={{ background: A.card, border: `1px solid ${A.border}`, color: A.grey }}
        >
          🏷️ <strong style={{ color: A.brown }}>Labels to print: {totalJars}</strong>
          {" "}— one label per jar across all products above.
        </div>
      )}
    </AdminPage>
  );
}

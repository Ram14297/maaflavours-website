// src/app/admin/dashboard/page.tsx
// Maa Flavours — Admin Dashboard (Full Build)
// Revenue KPIs, weekly area chart, order status donuts, top products bars,
// recent orders table, low stock alerts panel, quick-action shortcuts

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend,
} from "recharts";
import {
  AdminPage, StatCard, Card, Table, StatusBadge, Btn,
  fmtRupee, fmtDate, fmtDateTime, A, Spinner, EmptyState,
} from "@/components/admin/AdminUI";

// ─── Order status colour map (for donut chart) ────────────────────────────────
const STATUS_COLOURS: Record<string, string> = {
  pending:          "#C8960C",
  confirmed:        "#4A7C59",
  processing:       "#6B4226",
  packed:           "#8B6343",
  shipped:          "#2E7D32",
  out_for_delivery: "#1B5E20",
  delivered:        "#2E7D32",
  cancelled:        "#C0272D",
  refunded:         "#B8750A",
};

// ─── Top-product accent palette (6 products) ─────────────────────────────────
const PRODUCT_COLOURS = ["#C8960C","#C0272D","#4A2C0A","#B8750A","#4A7C59","#8B4513"];

// ─── Types ────────────────────────────────────────────────────────────────────
type KPIs = {
  revenueToday:          number;
  revenueMonth:          number;
  revenueLastMonth:      number;
  revenueGrowthPercent:  number;
  totalOrders:           number;
  pendingOrders:         number;
  processingOrders:      number;
  shippedOrders:         number;
  totalCustomers:        number;
  newCustomersThisMonth: number;
  lowStockCount:         number;
};
type DashData = {
  kpis:         KPIs;
  chart:        { date: string; orders: number; revenue: number }[];
  recentOrders: any[];
  lowStock:     any[];
  topProducts:  { name: string; revenue: number; units: number }[];
};

// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [data,    setData]    = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/dashboard")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [refresh]);

  const kpis = data?.kpis;

  return (
    <AdminPage>
      {/* ── Header row ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p style={{ color: A.grey, fontSize: 12 }}>
            {new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" })} · IST
          </p>
          <h1 style={{ fontFamily:"'Playfair Display',serif", color: A.brown, fontSize: 22, fontWeight: 700, lineHeight:1.2 }}>
            Good morning 👋 Here's your store snapshot
          </h1>
        </div>
        <Btn variant="ghost" size="sm" onClick={() => setRefresh(r => r+1)}>
          <RefreshIcon/> Refresh
        </Btn>
      </div>

      {/* ── KPI cards (4 across) ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Today's Revenue"
          value={kpis ? fmtRupee(kpis.revenueToday) : "—"}
          sub="Online payments + COD"
          loading={loading}
          accent="#C8960C"
          icon={<RupeeIcon/>}
        />
        <StatCard
          title="Month Revenue"
          value={kpis ? fmtRupee(kpis.revenueMonth) : "—"}
          trend={kpis ? `${kpis.revenueGrowthPercent > 0 ? "+" : ""}${kpis.revenueGrowthPercent}% vs last month` : undefined}
          trendPositive={kpis ? kpis.revenueGrowthPercent >= 0 : undefined}
          sub={kpis ? `Last month: ${fmtRupee(kpis.revenueLastMonth)}` : ""}
          loading={loading}
          accent="#C8960C"
          icon={<TrendIcon/>}
        />
        <StatCard
          title="Total Orders"
          value={kpis ? kpis.totalOrders : "—"}
          sub={kpis ? `${kpis.pendingOrders} pending · ${kpis.processingOrders} processing` : ""}
          loading={loading}
          accent="#4A2C0A"
          icon={<OrderIcon/>}
        />
        <StatCard
          title="Customers"
          value={kpis ? kpis.totalCustomers : "—"}
          sub={kpis ? `+${kpis.newCustomersThisMonth} joined this month` : ""}
          loading={loading}
          accent="#C0272D"
          icon={<PeopleIcon/>}
        />
      </div>

      {/* ── Alert strip: pending orders + low stock ── */}
      {!loading && ((kpis?.pendingOrders ?? 0) > 0 || (kpis?.lowStockCount ?? 0) > 0) && (
        <div className="flex flex-wrap gap-3">
          {(kpis?.pendingOrders ?? 0) > 0 && (
            <Link href="/admin/orders?status=pending">
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-shadow hover:shadow-sm"
                style={{ background: "rgba(200,150,12,0.08)", border: "1px solid rgba(200,150,12,0.3)" }}
              >
                <span style={{ color: "#B8750A" }}>⚡</span>
                <span style={{ color: "#B8750A", fontSize: 13, fontWeight: 600 }}>
                  {kpis?.pendingOrders} pending order{kpis?.pendingOrders !== 1 ? "s" : ""} need attention
                </span>
                <span style={{ color: "#B8750A", fontSize: 12 }}>→</span>
              </div>
            </Link>
          )}
          {(kpis?.lowStockCount ?? 0) > 0 && (
            <Link href="/admin/inventory">
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-shadow hover:shadow-sm"
                style={{ background: "rgba(192,39,45,0.06)", border: "1px solid rgba(192,39,45,0.25)" }}
              >
                <span style={{ color: "#C0272D" }}>📦</span>
                <span style={{ color: "#C0272D", fontSize: 13, fontWeight: 600 }}>
                  {kpis?.lowStockCount} variant{kpis?.lowStockCount !== 1 ? "s" : ""} running low on stock
                </span>
                <span style={{ color: "#C0272D", fontSize: 12 }}>→</span>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* ── Charts row ── */}
      <div className="grid xl:grid-cols-3 gap-5">

        {/* Weekly Revenue Area Chart (spans 2 cols) */}
        <div className="xl:col-span-2">
          <Card
            title="Revenue & Orders — Last 7 Days"
            subtitle="Area chart with daily breakdown"
            action={<Link href="/admin/analytics"><Btn variant="ghost" size="sm">Full Report →</Btn></Link>}
          >
            {loading ? (
              <div className="h-56 animate-pulse rounded-lg" style={{ background: A.cream }}/>
            ) : (
              <ResponsiveContainer width="100%" height={224}>
                <AreaChart data={data?.chart || []} margin={{ top:8, right:8, left:-24, bottom:0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#C8960C" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#C8960C" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#C0272D" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#C0272D" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDE3CE" vertical={false}/>
                  <XAxis dataKey="date" tick={{ fill: A.grey, fontSize:11 }} axisLine={false} tickLine={false}/>
                  <YAxis
                    yAxisId="rev"
                    orientation="left"
                    tick={{ fill: A.grey, fontSize:10 }}
                    axisLine={false} tickLine={false}
                    tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+"k" : v}`}
                  />
                  <YAxis
                    yAxisId="ord"
                    orientation="right"
                    tick={{ fill: A.grey, fontSize:10 }}
                    axisLine={false} tickLine={false}
                    tickFormatter={v => `${v}`}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{ background:"#fff", border:`1px solid ${A.border}`, borderRadius:8, fontSize:12 }}
                    formatter={(v: number, name: string) =>
                      name === "revenue"
                        ? [`₹${v.toLocaleString("en-IN")}`, "Revenue"]
                        : [v, "Orders"]
                    }
                  />
                  <Area yAxisId="rev" type="monotone" dataKey="revenue" stroke="#C8960C" strokeWidth={2} fill="url(#revGrad)" dot={{ fill:"#C8960C", r:3 }}/>
                  <Area yAxisId="ord" type="monotone" dataKey="orders"  stroke="#C0272D" strokeWidth={1.5} fill="url(#ordGrad)" dot={{ fill:"#C0272D", r:2 }} strokeDasharray="4 2"/>
                </AreaChart>
              </ResponsiveContainer>
            )}
            {/* Chart legend */}
            {!loading && (
              <div className="flex gap-5 mt-2 pl-2">
                <div className="flex items-center gap-1.5"><div className="w-3 h-1.5 rounded" style={{ background:"#C8960C" }}/><span style={{ color:A.grey, fontSize:11 }}>Revenue</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-px border-t-2 border-dashed" style={{ borderColor:"#C0272D" }}/><span style={{ color:A.grey, fontSize:11 }}>Orders</span></div>
              </div>
            )}
          </Card>
        </div>

        {/* Order Status Donut */}
        <Card title="Order Status Mix" subtitle="Across all orders">
          {loading ? (
            <div className="h-56 animate-pulse rounded-full mx-auto" style={{ background: A.cream, width:160, height:160 }}/>
          ) : (
            <OrderStatusDonut data={data}/>
          )}
        </Card>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid xl:grid-cols-3 gap-5">

        {/* Recent Orders (2 cols) */}
        <div className="xl:col-span-2">
          <Card
            title="Recent Orders"
            noPad
            action={<Link href="/admin/orders"><Btn variant="ghost" size="sm">All Orders →</Btn></Link>}
          >
            <Table
              loading={loading}
              columns={[
                { key:"order",    label:"Order #"                  },
                { key:"customer", label:"Customer"                 },
                { key:"amount",   label:"Amount",  align:"right"  },
                { key:"method",   label:"Method"                   },
                { key:"status",   label:"Status"                   },
                { key:"date",     label:"Date"                     },
                { key:"action",   label:"",        width:"60px"   },
              ]}
              rows={(data?.recentOrders || []).slice(0,8).map((o: any) => ({
                order:    (
                  <span style={{ fontFamily:"'DM Sans',monospace", fontWeight:700, fontSize:12, color:A.brown }}>
                    {o.order_number}
                  </span>
                ),
                customer: (
                  <div>
                    <p style={{ fontSize:12, fontWeight:500, color:A.brown }}>{o.customer_name || "Guest"}</p>
                    <p style={{ fontSize:10, color:A.grey }}>{o.customer_mobile}</p>
                  </div>
                ),
                amount:   <span style={{ fontWeight:700, fontSize:13 }}>{fmtRupee(o.total)}</span>,
                method:   <span style={{ fontSize:11, color:A.grey, textTransform:"capitalize" }}>{o.payment_method?.replace(/_/g," ")}</span>,
                status:   <StatusBadge status={o.status}/>,
                date:     <span style={{ fontSize:11, color:A.grey }}>{fmtDate(o.created_at)}</span>,
                action:   <Link href={`/admin/orders/${o.id}`}><Btn variant="ghost" size="sm">→</Btn></Link>,
              }))}
              emptyMessage="No orders yet"
            />
          </Card>
        </div>

        {/* Right sidebar: Top Products + Low Stock */}
        <div className="space-y-5">

          {/* Top Products bar chart */}
          <Card title="Top Products" subtitle="Revenue this month">
            {loading ? (
              <div className="space-y-2">
                {[1,2,3,4,5].map(i => <div key={i} className="h-8 rounded animate-pulse" style={{ background:A.cream }}/>)}
              </div>
            ) : (
              <TopProductsChart products={data?.topProducts || []}/>
            )}
          </Card>

          {/* Low Stock Alerts */}
          <Card
            title={`Low Stock ${kpis?.lowStockCount ? `(${kpis.lowStockCount})` : ""}`}
            action={<Link href="/admin/inventory"><Btn variant="ghost" size="sm">Manage →</Btn></Link>}
          >
            {loading ? (
              <div className="space-y-2">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center gap-2 animate-pulse">
                    <div className="w-8 h-8 rounded" style={{ background:A.cream }}/>
                    <div className="flex-1"><div className="h-3 rounded mb-1" style={{ background:A.cream, width:"70%"}}/><div className="h-2 rounded" style={{ background:A.cream, width:"40%"}}/></div>
                  </div>
                ))}
              </div>
            ) : data?.lowStock && data.lowStock.length > 0 ? (
              <div className="space-y-2">
                {data.lowStock.slice(0,6).map((v: any, i: number) => {
                  const isEmpty = v.stock_quantity === 0;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 p-2.5 rounded-lg"
                      style={{
                        background: isEmpty ? "rgba(192,39,45,0.05)" : "rgba(200,150,12,0.05)",
                        border: `1px solid ${isEmpty ? "rgba(192,39,45,0.2)" : "rgba(200,150,12,0.2)"}`,
                      }}
                    >
                      <div
                        className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-base"
                        style={{ background: isEmpty ? "rgba(192,39,45,0.1)" : "rgba(200,150,12,0.1)" }}
                      >
                        🫙
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ color:A.brown, fontSize:11, fontWeight:600 }} className="truncate">{v.product_name}</p>
                        <p style={{ color:A.grey, fontSize:10 }}>{v.label}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p style={{ fontSize:13, fontWeight:700, color: isEmpty ? "#C0272D" : "#B8750A" }}>
                          {v.stock_quantity}
                        </p>
                        <p style={{ fontSize:9, color:A.grey }}>packs</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-2xl mb-1">✅</p>
                <p style={{ color:A.grey, fontSize:12 }}>All variants in stock</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ── Quick Actions row ── */}
      <Card title="Quick Actions" subtitle="Common admin tasks">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_ACTIONS.map(qa => (
            <Link key={qa.href} href={qa.href}>
              <div
                className="flex flex-col items-center gap-2 p-3 rounded-xl text-center cursor-pointer transition-all"
                style={{ border:`1px solid ${A.border}`, background:"#fff" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = A.gold; (e.currentTarget as HTMLElement).style.background = "#FFFDF5"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = A.border; (e.currentTarget as HTMLElement).style.background = "#fff"; }}
              >
                <span style={{ fontSize:20 }}>{qa.icon}</span>
                <span style={{ color:A.brown, fontSize:11, fontWeight:600 }}>{qa.label}</span>
                {qa.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-xs font-bold" style={{ background:"rgba(192,39,45,0.12)", color:"#C0272D" }}>
                    {qa.badge(kpis)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </AdminPage>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ORDER STATUS DONUT CHART
// ─────────────────────────────────────────────────────────────────────────────
function OrderStatusDonut({ data }: { data: DashData | null }) {
  const statusCounts = [
    "pending","confirmed","processing","shipped","delivered","cancelled",
  ].map(s => {
    const kpi = data?.kpis;
    const counts: Record<string, number> = {
      pending:   kpi?.pendingOrders    || 0,
      confirmed: kpi?.processingOrders || 0,
      processing: 0,
      shipped:   kpi?.shippedOrders    || 0,
      delivered: 0,
      cancelled: 0,
    };
    return { name: s.charAt(0).toUpperCase() + s.slice(1), value: counts[s], fill: STATUS_COLOURS[s] };
  }).filter(d => d.value > 0);

  if (statusCounts.length === 0) {
    return <div className="py-12 text-center"><p style={{ color:A.grey, fontSize:13 }}>No order data yet</p></div>;
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={statusCounts} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
            dataKey="value" paddingAngle={2}
          >
            {statusCounts.map((entry, i) => <Cell key={i} fill={entry.fill}/>)}
          </Pie>
          <Tooltip
            contentStyle={{ background:"#fff", border:`1px solid ${A.border}`, borderRadius:8, fontSize:12 }}
            formatter={(v: number, name: string) => [v, name]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-1 mt-1">
        {statusCounts.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background:s.fill }}/>
            <span style={{ fontSize:10, color:A.grey }}>{s.name}: <strong style={{ color:A.brown }}>{s.value}</strong></span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOP PRODUCTS BAR CHART
// ─────────────────────────────────────────────────────────────────────────────
function TopProductsChart({ products }: { products: { name: string; revenue: number; units: number }[] }) {
  if (!products.length) {
    return <p style={{ color:A.grey, fontSize:12, textAlign:"center", padding:"20px 0" }}>No sales data yet</p>;
  }

  const maxRev = Math.max(...products.map(p => p.revenue), 1);

  return (
    <div className="space-y-2.5">
      {products.slice(0,6).map((p, i) => {
        const pct = (p.revenue / maxRev) * 100;
        // Shorten product name
        const shortName = p.name.replace(" Pickle","").replace("Pulihora ","");
        return (
          <div key={i}>
            <div className="flex justify-between items-baseline mb-1">
              <span style={{ color:A.brown, fontSize:11, fontWeight:600 }} className="truncate max-w-[120px]">{shortName}</span>
              <span style={{ color:A.grey, fontSize:10, shrink:0 } as any}>{p.units}🫙</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background:A.cream }}>
                <div
                  className="h-full rounded-full"
                  style={{ width:`${pct}%`, background: PRODUCT_COLOURS[i % PRODUCT_COLOURS.length] }}
                />
              </div>
              <span style={{ color:A.grey, fontSize:10, minWidth:45, textAlign:"right" }}>{fmtRupee(p.revenue)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Quick actions config ─────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { href:"/admin/orders?status=pending", icon:"📋", label:"Pending Orders",   badge: (k?: KPIs) => k?.pendingOrders || 0 },
  { href:"/admin/products/new",          icon:"➕", label:"Add Product",      badge: null },
  { href:"/admin/inventory",             icon:"📦", label:"Stock Levels",     badge: (k?: KPIs) => k?.lowStockCount || 0 },
  { href:"/admin/coupons",               icon:"🏷️",  label:"Coupons",          badge: null },
  { href:"/admin/expenses",              icon:"💸", label:"Add Expense",      badge: null },
  { href:"/admin/analytics",             icon:"📊", label:"Analytics",        badge: null },
];

// ─── Tiny icon components ─────────────────────────────────────────────────────
function RupeeIcon()  { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>; }
function TrendIcon()  { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>; }
function OrderIcon()  { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>; }
function PeopleIcon() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>; }
function RefreshIcon(){ return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>; }

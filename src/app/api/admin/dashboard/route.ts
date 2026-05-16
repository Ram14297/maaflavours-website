// src/app/api/admin/dashboard/route.ts
// Maa Flavours — Admin Dashboard Stats API
// GET /api/admin/dashboard
// Returns: revenue KPIs, weekly chart, top products, recent orders, low stock alerts
// Protected: requires admin JWT cookie

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const supabase = createAdminSupabaseClient();
    const now = new Date();

    // ── Date helpers ─────────────────────────────────────────────────
    const today       = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastMonth    = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();
    const last7days    = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Run independent queries in parallel.
    // (Top-products is fetched as a JOIN below — a single PostgREST call —
    // not as a broken `.gte("order_id", "uuid1,uuid2")` like before, which
    // would silently return zero rows.)
    const last30daysISO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [
      { data: revToday },
      { data: revMonth },
      { data: revLastMonth },
      { data: orderStats },
      { data: totalCustomers },
      { data: newCustomers },
      { data: recentOrders },
      { data: lowStock },
      { data: topProductsJoin },
      { data: weeklyOrders },
    ] = await Promise.all([

      // Revenue today
      supabase.from("orders").select("total")
        .eq("payment_status", "paid")
        .gte("created_at", today),

      // Revenue this month
      supabase.from("orders").select("total")
        .eq("payment_status", "paid")
        .gte("created_at", startOfMonth),

      // Revenue last month
      supabase.from("orders").select("total")
        .eq("payment_status", "paid")
        .gte("created_at", lastMonth)
        .lte("created_at", lastMonthEnd),

      // Order counts by status — exclude ghost/abandoned payment orders
      supabase.from("orders").select("status").neq("status", "pending"),

      // Total customers
      supabase.from("customers").select("id", { count: "exact", head: true }),

      // New customers this month
      supabase.from("customers").select("id", { count: "exact", head: true })
        .gte("created_at", startOfMonth),

      // Recent 10 real orders (exclude ghost/abandoned payment records)
      supabase.from("orders_summary")
        .select("id, order_number, customer_name, total, status, payment_method, created_at")
        .neq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(10),

      // Low stock variants
      supabase.from("low_stock_variants")
        .select("id, sku, label, stock_quantity, low_stock_threshold, product_name")
        .limit(10),

      // Top products (last 30 days, paid orders only).
      // Single round-trip via PostgREST embedded join: pull each item with
      // its parent order, then filter inline. This replaces the previous
      // two-query pattern that was also broken (used `.gte` with a
      // comma-separated UUID string).
      supabase.from("order_items")
        .select("product_name, quantity, total_price, orders!inner(payment_status, created_at)")
        .eq("orders.payment_status", "paid")
        .gte("orders.created_at", last30daysISO)
        .limit(500),

      // Orders per day last 7 days (for chart)
      supabase.from("orders")
        .select("created_at, total, status")
        .gte("created_at", last7days)
        .order("created_at", { ascending: true }),
    ]);

    const topProducts = topProductsJoin || [];

    // ── Calculate KPIs ────────────────────────────────────────────────
    const sumPaise = (arr: { total: number }[] | null) =>
      (arr || []).reduce((acc, o) => acc + o.total, 0);

    const revTodayPaise     = sumPaise(revToday);
    const revMonthPaise     = sumPaise(revMonth);
    const revLastMonthPaise = sumPaise(revLastMonth);

    const orderStatusCounts: Record<string, number> = {};
    (orderStats || []).forEach(o => {
      orderStatusCounts[o.status] = (orderStatusCounts[o.status] || 0) + 1;
    });

    // ── Build weekly chart data ───────────────────────────────────────
    const chartData: { date: string; orders: number; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d     = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const ds    = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
      const dayOrders = (weeklyOrders || []).filter(o => o.created_at.startsWith(ds));
      chartData.push({
        date:    label,
        orders:  dayOrders.length,
        revenue: Math.round(dayOrders.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.total, 0) / 100),
      });
    }

    // ── Top products (aggregate) ──────────────────────────────────────
    const productMap: Record<string, { revenue: number; units: number }> = {};
    (topProducts || []).forEach(item => {
      if (!productMap[item.product_name]) productMap[item.product_name] = { revenue: 0, units: 0 };
      productMap[item.product_name].revenue += item.total_price;
      productMap[item.product_name].units   += item.quantity;
    });
    const topProductsSorted = Object.entries(productMap)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return NextResponse.json({
      kpis: {
        revenueToday:          revTodayPaise,
        revenueMonth:          revMonthPaise,
        revenueLastMonth:      revLastMonthPaise,
        revenueGrowthPercent:  revLastMonthPaise > 0
          ? Math.round(((revMonthPaise - revLastMonthPaise) / revLastMonthPaise) * 100)
          : 100,
        totalOrders:           Object.values(orderStatusCounts).reduce((a, b) => a + b, 0),
        // newOrders = confirmed orders waiting to be prepared/packed (the real "act now" count)
        // (ghost/abandoned Cashfree pending orders are excluded from orderStatusCounts above)
        newOrders:             orderStatusCounts["confirmed"]   || 0,
        processingOrders:      (orderStatusCounts["processing"] || 0) + (orderStatusCounts["packed"] || 0),
        shippedOrders:         (orderStatusCounts["shipped"]    || 0) + (orderStatusCounts["out_for_delivery"] || 0),
        totalCustomers:        (totalCustomers as any)?.count || 0,
        newCustomersThisMonth: (newCustomers   as any)?.count || 0,
        lowStockCount:         (lowStock || []).length,
      },
      chart:        chartData,
      recentOrders: recentOrders || [],
      lowStock:     lowStock     || [],
      topProducts:  topProductsSorted,
    });

  } catch (err: any) {
    // Previously this returned random mock data which made it impossible to
    // tell a real outage from healthy zero-state, and operations could end
    // up making decisions on hallucinated numbers. Return a real error.
    console.error("[admin/dashboard]", err.message);
    return NextResponse.json(
      { error: "Failed to load dashboard data", detail: err.message },
      { status: 500 }
    );
  }
}

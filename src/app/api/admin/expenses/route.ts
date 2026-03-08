// src/app/api/admin/expenses/route.ts
// Maa Flavours — Admin Expense Tracker API
// GET  /api/admin/expenses?month=YYYY-MM&category=&format=csv
//      Returns: expenses list, category totals, P&L summary, 6-month trend
// POST /api/admin/expenses
//      Body: { category, description, amount (paise), expenseDate, notes }

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin, getPagination } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const sp       = req.nextUrl.searchParams;
  const month    = sp.get("month") || new Date().toISOString().slice(0, 7);
  const category = sp.get("category") || "";
  const format   = sp.get("format") || "json";
  const { limit, from, to } = getPagination(sp);

  const [year, mon] = month.split("-").map(Number);
  const startDate   = `${year}-${String(mon).padStart(2, "0")}-01`;
  const endDate     = new Date(year, mon, 0).toISOString().split("T")[0]; // last day

  try {
    const supabase = createAdminSupabaseClient();

    // ── All expenses for month (no pagination for totals) ─────────────────
    let allQ = supabase
      .from("expenses")
      .select("*")
      .gte("expense_date", startDate)
      .lte("expense_date", endDate)
      .order("expense_date", { ascending: false });

    if (category) allQ = allQ.eq("category", category);
    const { data: allExpenses } = await allQ;

    const expenses = allExpenses || [];

    // CSV export
    if (format === "csv") {
      const header = "Date,Category,Description,Amount (₹),Notes";
      const rows   = expenses.map(e =>
        `"${e.expense_date}","${e.category}","${e.description}",${(e.amount/100).toFixed(2)},"${e.notes || ""}"`
      );
      const csv = [header, ...rows].join("\n");
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="expenses-${month}.csv"`,
        },
      });
    }

    // ── Category totals ───────────────────────────────────────────────────
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

    // ── Revenue for same month ────────────────────────────────────────────
    const { data: orders } = await supabase
      .from("orders")
      .select("total")
      .eq("payment_status", "paid")
      .gte("created_at", `${startDate}T00:00:00`)
      .lte("created_at", `${endDate}T23:59:59`);

    const totalRevenue = (orders || []).reduce((s, o) => s + o.total, 0);
    const grossProfit  = totalRevenue - totalExpenses;

    // ── 6-month trend ─────────────────────────────────────────────────────
    const trendMonths = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(year, mon - 1 - (5 - i), 1);
      return {
        key:   `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
        start: new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0],
        end:   new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split("T")[0],
      };
    });

    const trendData = await Promise.all(trendMonths.map(async tm => {
      const [expRes, revRes] = await Promise.all([
        supabase.from("expenses").select("amount")
          .gte("expense_date", tm.start).lte("expense_date", tm.end),
        supabase.from("orders").select("total").eq("payment_status", "paid")
          .gte("created_at", `${tm.start}T00:00:00`).lte("created_at", `${tm.end}T23:59:59`),
      ]);
      const exp = (expRes.data || []).reduce((s, e) => s + e.amount, 0);
      const rev = (revRes.data || []).reduce((s, o) => s + o.total, 0);
      return { month: tm.label, revenue: rev, expenses: exp, profit: rev - exp };
    }));

    return NextResponse.json({
      expenses,
      total:          expenses.length,
      categoryTotals,
      summary: {
        totalExpenses,
        totalRevenue,
        grossProfit,
        profitMargin: totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0,
        expenseCount: expenses.length,
        highestCategory: Object.entries(categoryTotals).sort((a,b) => b[1]-a[1])[0]?.[0] || null,
      },
      trend: trendData,
    });
  } catch (err: any) {
    console.error("[admin/expenses GET]", err.message);
    return NextResponse.json({ expenses:[], total:0, categoryTotals:{}, summary:{}, trend:[] });
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const body    = await req.json();
    const supabase = createAdminSupabaseClient();

    if (!body.category || !body.description || !body.amount) {
      return NextResponse.json({ error: "Category, description and amount are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("expenses")
      .insert({
        category:     body.category,
        description:  body.description.trim(),
        amount:       Number(body.amount),
        expense_date: body.expenseDate || new Date().toISOString().split("T")[0],
        notes:        body.notes?.trim() || null,
        added_by:     admin.email,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, expense: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

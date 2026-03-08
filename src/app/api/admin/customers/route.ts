// src/app/api/admin/customers/route.ts
// Maa Flavours — Admin Customers List API
// GET /api/admin/customers
//   ?page=1&limit=20
//   &search=    — name / mobile / email
//   &sort=newest|oldest|most_spent|most_orders|least_recent
//   &format=csv — download CSV
//   &active=true|false

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin, getPagination, formatRupees } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const sp     = req.nextUrl.searchParams;
  const search = sp.get("search") || "";
  const sort   = sp.get("sort")   || "newest";
  const format = sp.get("format") || "json";
  const active = sp.get("active");
  const { page, limit, from, to } = getPagination(sp);

  try {
    const supabase = createAdminSupabaseClient();

    let query = supabase
      .from("customers")
      .select("id, mobile, name, email, total_orders, total_spent, is_active, created_at, updated_at", { count: "exact" });

    // Search
    if (search) {
      query = query.or(`mobile.ilike.%${search}%,name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Active filter
    if (active === "true")  query = query.eq("is_active", true);
    if (active === "false") query = query.eq("is_active", false);

    // Sort
    switch (sort) {
      case "oldest":       query = query.order("created_at",    { ascending: true });  break;
      case "most_spent":   query = query.order("total_spent",   { ascending: false }); break;
      case "most_orders":  query = query.order("total_orders",  { ascending: false }); break;
      case "least_recent": query = query.order("updated_at",    { ascending: true });  break;
      default:             query = query.order("created_at",    { ascending: false }); break;
    }

    const { data, count, error } = await query.range(from, to);
    if (error) throw error;

    // Summary stats (all customers, not just this page)
    const { data: statsData } = await supabase
      .from("customers")
      .select("total_orders, total_spent")
      .eq("is_active", true);

    const allCustomers = statsData || [];
    const summary = {
      totalCustomers:  count || 0,
      totalRevenue:    allCustomers.reduce((s, c) => s + (c.total_spent  || 0), 0),
      totalOrders:     allCustomers.reduce((s, c) => s + (c.total_orders || 0), 0),
      avgOrderValue:   allCustomers.length > 0
                         ? Math.round(allCustomers.reduce((s,c) => s + (c.total_spent || 0),0)
                             / Math.max(allCustomers.reduce((s,c) => s + (c.total_orders || 0),0), 1))
                         : 0,
      repeatCustomers: allCustomers.filter(c => c.total_orders > 1).length,
    };

    // CSV export
    if (format === "csv") {
      const header = "Name,Mobile,Email,Total Orders,Total Spent (₹),Joined,Last Active";
      const rows   = (data || []).map(c =>
        `"${c.name || "—"}","${c.mobile}","${c.email || "—"}",${c.total_orders},${(c.total_spent/100).toFixed(2)},"${new Date(c.created_at).toLocaleDateString("en-IN")}","${new Date(c.updated_at).toLocaleDateString("en-IN")}"`
      );
      const csv = [header, ...rows].join("\n");
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="maa-customers-${new Date().toISOString().slice(0,10)}.csv"`,
        },
      });
    }

    return NextResponse.json({
      customers: data || [],
      total:     count || 0,
      page, limit,
      pages:     Math.ceil((count || 0) / limit),
      summary,
    });
  } catch (err: any) {
    console.error("[admin/customers]", err.message);
    return NextResponse.json({ customers: [], total: 0, page, limit, pages: 0, summary: {} });
  }
}

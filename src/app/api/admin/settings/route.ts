import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-auth";

const ALLOWED_SECTIONS = ["business","shipping","payments","notifications","social","announcement"];

const DEFAULTS: Record<string, any> = {
  business: {
    name: "Maa Flavours", tagline: "Authentic Andhra Taste — The Way Maa Made It",
    email: "support@maaflavours.com", phone: "",
    address: "Ongole, Andhra Pradesh — 523001", gstin: "", fssai: "Application In Progress", pincode: "523001",
  },
  shipping: {
    free_threshold: 49900, standard_fee: 6000, cod_extra: 3000,
    tat_days: "5-7", courier: "DTDC / Delhivery",
    zones: [
      { name: "Andhra Pradesh", fee: 0,    tat: "2-3 days" },
      { name: "South India",    fee: 4000, tat: "3-5 days" },
      { name: "Rest of India",  fee: 6000, tat: "5-7 days" },
    ],
  },
  payments: {
    razorpay_key_id: "", webhook_url: "https://maaflavours.com/api/checkout/webhook",
    cod_enabled: true, upi_enabled: true, card_enabled: true, netbanking_enabled: true,
  },
  notifications: {
    order_placed: true, order_shipped: true, order_delivered: false,
    low_stock: true, daily_summary: false, admin_whatsapp: "", admin_email: "",
  },
  social: {
    instagram: "", facebook: "", youtube: "", whatsapp_number: "",
    meta_title: "Maa Flavours — Authentic Andhra Pickles",
    meta_description: "Authentic Andhra homemade pickles from Ongole. No preservatives, traditional recipes.",
  },
  announcement: { enabled: true, text: "Free Shipping on orders above Rs.499 | Pan-India Delivery | No Preservatives" },
};

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase.from("settings").select("key, value, updated_at").in("key", ALLOWED_SECTIONS);
    if (error) throw error;
    const result: Record<string, any> = {};
    const lastUpdated: Record<string, string> = {};
    ALLOWED_SECTIONS.forEach(s => { result[s] = { ...DEFAULTS[s] }; lastUpdated[s] = ""; });
    (data || []).forEach(row => {
      const val = typeof row.value === "string" ? JSON.parse(row.value) : row.value;
      result[row.key] = { ...DEFAULTS[row.key], ...val };
      lastUpdated[row.key] = row.updated_at;
    });
    return NextResponse.json({ settings: result, lastUpdated });
  } catch (err: any) {
    console.error("[admin/settings GET]", err.message);
    const settings: Record<string, any> = {};
    ALLOWED_SECTIONS.forEach(s => { settings[s] = { ...DEFAULTS[s] }; });
    return NextResponse.json({ settings, lastUpdated: {} });
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const body = await req.json();
    const supabase = createAdminSupabaseClient();
    const { section, data } = body;
    if (!section || !ALLOWED_SECTIONS.includes(section))
      return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    const { data: existing } = await supabase.from("settings").select("value").eq("key", section).single();
    const current = existing?.value ? (typeof existing.value === "string" ? JSON.parse(existing.value) : existing.value) : {};
    const merged = { ...DEFAULTS[section], ...current, ...data };
    const { error } = await supabase.from("settings").upsert({ key: section, value: merged }, { onConflict: "key" });
    if (error) throw error;
    return NextResponse.json({ success: true, section, saved: merged });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

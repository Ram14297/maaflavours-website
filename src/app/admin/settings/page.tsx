// src/app/admin/settings/page.tsx
// Maa Flavours Admin Settings -- Full Build (Step 24)
// Tabs: Business | Shipping | Payments | Notifications | Social/SEO | Announcement | System

"use client";
import { useState, useEffect, useCallback } from "react";
import { AdminPage, Btn, Input, Textarea, Alert, A, Spinner } from "@/components/admin/AdminUI";

// Tab config
const TABS = [
  { id:"business",      icon:"\uD83C\uDFEA", label:"Business"      },
  { id:"shipping",      icon:"\uD83D\uDE9A", label:"Shipping"      },
  { id:"payments",      icon:"\uD83D\uDCB3", label:"Payments"      },
  { id:"notifications", icon:"\uD83D\uDD14", label:"Notifications" },
  { id:"social",        icon:"\uD83C\uDF10", label:"Social & SEO"  },
  { id:"announcement",  icon:"\uD83D\uDCE2", label:"Announcement"  },
  { id:"system",        icon:"\u2699\uFE0F", label:"System"        },
];

// Toggle component
function Toggle({ value, onChange, label, sub }: {
  value:boolean; onChange:(v:boolean)=>void; label:string; sub?:string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b" style={{ borderColor:A.border }}>
      <div>
        <p style={{ fontSize:13, fontWeight:600, color:A.brown }}>{label}</p>
        {sub && <p style={{ fontSize:11, color:A.grey, marginTop:1 }}>{sub}</p>}
      </div>
      <button onClick={() => onChange(!value)}
        className="relative shrink-0 rounded-full transition-colors"
        style={{ width:46, height:26, background: value ? A.gold : "rgba(74,44,10,0.12)" }}>
        <div className="absolute top-[4px] w-[18px] h-[18px] rounded-full transition-transform"
          style={{ background:"#fff", transform: value ? "translateX(24px)" : "translateX(4px)", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}/>
      </button>
    </div>
  );
}

// Section card
function SCard({ title, sub, children }: { title:string; sub:string; children:React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background:"#fff", border:`1px solid ${A.border}`, boxShadow:"0 1px 4px rgba(74,44,10,0.04)" }}>
      <div className="px-6 py-4 border-b" style={{ borderColor:A.border }}>
        <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:700, color:A.brown }}>{title}</h3>
        <p style={{ color:A.grey, fontSize:11, marginTop:2 }}>{sub}</p>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// Masked input for API keys
function MaskedInput({ label, value, onChange, placeholder, hint }: {
  label:string; value:string; onChange:(v:string)=>void; placeholder:string; hint?:string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label style={{ display:"block", color:A.grey, fontSize:11, textTransform:"uppercase",
                      letterSpacing:"0.08em", fontWeight:600, marginBottom:6 }}>{label}</label>
      <div className="flex gap-2">
        <input type={show ? "text" : "password"} value={value}
          onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="flex-1 px-4 py-2.5 rounded-xl outline-none font-mono text-sm"
          style={{ border:`1px solid ${A.border}`, background:"#fff", color:A.brown }}/>
        <button onClick={() => setShow(s => !s)} className="px-3 rounded-xl text-sm"
          style={{ background:A.cream, border:`1px solid ${A.border}`, color:A.grey }}>
          {show ? "\uD83D\uDE48" : "\uD83D\uDC41"}
        </button>
      </div>
      {hint && <p style={{ color:A.grey, fontSize:10, marginTop:3 }}>{hint}</p>}
    </div>
  );
}

// ====== MAIN PAGE ======
export default function SettingsPage() {
  const [tab,     setTab]    = useState("business");
  const [data,    setData]   = useState<Record<string,any>>({});
  const [dirty,   setDirty]  = useState<Set<string>>(new Set());
  const [loading, setLoading]= useState(true);
  const [saving,  setSaving] = useState<string|null>(null);
  const [saved,   setSaved]  = useState<string|null>(null);
  const [saveErr, setSaveErr]= useState<string|null>(null);
  const [health,  setHealth] = useState<"idle"|"ok"|"error"|"loading">("idle");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/settings");
      const d = await r.json();
      setData(d.settings || {});
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function patch(section:string, key:string, value:any) {
    setData(d => ({ ...d, [section]: { ...d[section], [key]: value } }));
    setDirty(prev => new Set(prev).add(section));
  }

  async function save(section:string) {
    setSaving(section); setSaveErr(null); setSaved(null);
    const r = await fetch("/api/admin/settings", {
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ section, data: data[section] }),
    });
    if (r.ok) {
      setSaved(section);
      setDirty(prev => { const n = new Set(prev); n.delete(section); return n; });
      setTimeout(() => setSaved(null), 3000);
    } else { setSaveErr(section); }
    setSaving(null);
  }

  // Shipping zone helpers
  const zones: {name:string;fee:number;tat:string}[] = data.shipping?.zones || [];
  function patchZone(i:number, key:string, value:any) {
    patch("shipping","zones", zones.map((z,j) => j===i ? { ...z, [key]:value } : z));
  }
  function addZone() { patch("shipping","zones",[...zones,{ name:"New Zone", fee:0, tat:"5-7 days" }]); }
  function delZone(i:number) { patch("shipping","zones",zones.filter((_,j)=>j!==i)); }

  async function testHealth() {
    setHealth("loading");
    try {
      const r = await fetch("/api/admin/dashboard");
      setHealth(r.ok ? "ok" : "error");
    } catch { setHealth("error"); }
  }

  if (loading) return (
    <AdminPage>
      <div className="space-y-4">
        {[1,2,3].map(i=><div key={i} className="h-48 rounded-xl animate-pulse" style={{ background:"#fff" }}/>)}
      </div>
    </AdminPage>
  );

  const s = data;

  return (
    <AdminPage>
      <div className="flex gap-6 items-start">

        {/* Sidebar tabs */}
        <div className="hidden lg:flex flex-col gap-1 shrink-0 rounded-2xl p-3 sticky top-6"
          style={{ width:200, background:"#fff", border:`1px solid ${A.border}`, boxShadow:"0 1px 4px rgba(74,44,10,0.04)" }}>
          <p style={{ color:A.grey, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", padding:"4px 8px 8px" }}>Settings</p>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left transition-colors relative"
              style={{
                background: tab===t.id ? `${A.brown}10` : "transparent",
                color:      tab===t.id ? A.brown : A.grey,
                fontWeight: tab===t.id ? 700 : 400,
              }}>
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {dirty.has(t.id) && <span className="ml-auto w-2 h-2 rounded-full" style={{ background:A.gold }}/>}
            </button>
          ))}
        </div>

        {/* Mobile tab pills */}
        <div className="lg:hidden w-full -mt-2 mb-2">
          <div className="flex gap-2 overflow-x-auto pb-1 flex-nowrap">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap shrink-0"
                style={{
                  background: tab===t.id ? A.brown : "#fff",
                  color:      tab===t.id ? "#fff"  : A.grey,
                  border:`1px solid ${A.border}`, fontWeight: tab===t.id ? 600 : 400,
                }}>
                {t.icon} {t.label}
                {dirty.has(t.id) && <span className="w-1.5 h-1.5 rounded-full" style={{ background:tab===t.id?"#fff":A.gold }}/>}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-5 min-w-0">

          {/* ============ BUSINESS ============ */}
          {tab==="business" && (
            <SCard title="Business Information" sub="Store identity, contact details, legal information">
              {saved==="business"   && <Alert type="success">Business details saved!</Alert>}
              {saveErr==="business" && <Alert type="error">Failed to save. Try again.</Alert>}
              <div className="grid sm:grid-cols-2 gap-4 mt-3">
                <Input label="Business Name *" value={s.business?.name||""} placeholder="Maa Flavours"
                  onChange={e => patch("business","name",e.target.value)}/>
                <Input label="Tagline" value={s.business?.tagline||""} placeholder="Your brand tagline"
                  onChange={e => patch("business","tagline",e.target.value)}/>
                <Input label="Support Email" type="email" value={s.business?.email||""} placeholder="support@maaflavours.com"
                  onChange={e => patch("business","email",e.target.value)}/>
                <Input label="Support Phone (+91)" type="tel" value={s.business?.phone||""} placeholder="98765 43210"
                  onChange={e => patch("business","phone",e.target.value)}/>
                <div className="sm:col-span-2">
                  <Textarea label="Business Address" value={s.business?.address||""} rows={2}
                    placeholder="Street, City, State — PIN"
                    onChange={e => patch("business","address",e.target.value)}/>
                </div>
                <Input label="PIN Code" value={s.business?.pincode||""} placeholder="523001"
                  onChange={e => patch("business","pincode",e.target.value)}/>
                <Input label="GSTIN" value={s.business?.gstin||""} placeholder="22AAAAA0000A1Z5"
                  onChange={e => patch("business","gstin",e.target.value)}/>
                <div className="sm:col-span-2">
                  <Input label="FSSAI License Number" value={s.business?.fssai||""} placeholder="Application In Progress"
                    onChange={e => patch("business","fssai",e.target.value)}/>
                  <p style={{ color:A.grey, fontSize:10, marginTop:3 }}>Shown on GST invoices and website footer</p>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Btn loading={saving==="business"} onClick={() => save("business")}>Save Business Details</Btn>
              </div>
            </SCard>
          )}

          {/* ============ SHIPPING ============ */}
          {tab==="shipping" && (
            <SCard title="Shipping Configuration" sub="Delivery rates, free shipping threshold, COD charges, delivery zones">
              {saved==="shipping"   && <Alert type="success">Shipping settings saved!</Alert>}
              {saveErr==="shipping" && <Alert type="error">Failed to save. Try again.</Alert>}
              <div className="grid sm:grid-cols-3 gap-4 mt-3">
                <div>
                  <Input label="Free Shipping Above (Rs.)" type="number" min={0}
                    value={String((s.shipping?.free_threshold||0)/100)} placeholder="499"
                    onChange={e => patch("shipping","free_threshold",Math.round(Number(e.target.value)*100))}/>
                  <p style={{ color:A.grey, fontSize:10, marginTop:3 }}>Cart value to waive delivery charge</p>
                </div>
                <Input label="Standard Shipping Fee (Rs.)" type="number" min={0}
                  value={String((s.shipping?.standard_fee||0)/100)} placeholder="60"
                  onChange={e => patch("shipping","standard_fee",Math.round(Number(e.target.value)*100))}/>
                <Input label="COD Extra Charge (Rs.)" type="number" min={0}
                  value={String((s.shipping?.cod_extra||0)/100)} placeholder="30"
                  onChange={e => patch("shipping","cod_extra",Math.round(Number(e.target.value)*100))}/>
                <Input label="Delivery TAT (days)" value={s.shipping?.tat_days||""} placeholder="5-7"
                  onChange={e => patch("shipping","tat_days",e.target.value)}/>
                <div className="sm:col-span-2">
                  <Input label="Courier Partners" value={s.shipping?.courier||""} placeholder="DTDC, Delhivery"
                    onChange={e => patch("shipping","courier",e.target.value)}/>
                </div>
              </div>

              {/* Rate summary chip */}
              <div className="flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl w-fit"
                style={{ background:"rgba(200,150,12,0.08)", border:"1px solid rgba(200,150,12,0.25)" }}>
                <span>&#128666;</span>
                <p style={{ fontSize:12, color:A.brown }}>
                  Free shipping above <strong>Rs.{((s.shipping?.free_threshold||0)/100).toLocaleString("en-IN")}</strong>
                  {" "}&#183; Standard Rs.{((s.shipping?.standard_fee||0)/100).toLocaleString("en-IN")}
                  {" "}&#183; COD +Rs.{((s.shipping?.cod_extra||0)/100).toLocaleString("en-IN")}
                </p>
              </div>

              {/* Zones editor */}
              <div className="mt-6 pt-5 border-t" style={{ borderColor:A.border }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p style={{ fontWeight:700, fontSize:13, color:A.brown }}>Delivery Zones</p>
                    <p style={{ fontSize:11, color:A.grey }}>Region-specific rates override the standard fee</p>
                  </div>
                  <Btn variant="ghost" size="sm" onClick={addZone}>+ Add Zone</Btn>
                </div>

                {/* Header row */}
                <div className="hidden sm:grid grid-cols-[1fr_100px_120px_40px] gap-2 px-2 mb-1">
                  {["Zone Name","Fee (Rs.)","Delivery TAT",""].map(h=>(
                    <p key={h} style={{ fontSize:10, color:A.grey, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em" }}>{h}</p>
                  ))}
                </div>

                <div className="space-y-2">
                  {zones.map((zone,i) => (
                    <div key={i} className="grid grid-cols-[1fr_100px_120px_40px] gap-2 items-center p-2 rounded-xl"
                      style={{ background:A.cream, border:`1px solid ${A.border}` }}>
                      <input value={zone.name} onChange={e => patchZone(i,"name",e.target.value)}
                        className="px-3 py-1.5 rounded-lg text-sm outline-none"
                        style={{ background:"#fff", border:`1px solid ${A.border}`, color:A.brown, fontWeight:600 }}/>
                      <input type="number" min={0} value={zone.fee/100}
                        onChange={e => patchZone(i,"fee",Math.round(Number(e.target.value)*100))}
                        className="px-3 py-1.5 rounded-lg text-sm outline-none text-right"
                        style={{ background:"#fff", border:`1px solid ${A.border}`, color:A.brown }}/>
                      <input value={zone.tat} onChange={e => patchZone(i,"tat",e.target.value)}
                        className="px-3 py-1.5 rounded-lg text-sm outline-none"
                        style={{ background:"#fff", border:`1px solid ${A.border}`, color:A.grey }} placeholder="e.g. 3-5 days"/>
                      <button onClick={() => delZone(i)} className="p-1.5 rounded-lg text-sm flex items-center justify-center"
                        style={{ background:"rgba(192,39,45,0.08)", color:"#C0272D" }}>&#128465;</button>
                    </div>
                  ))}
                  {zones.length===0 && (
                    <p style={{ color:A.grey, fontSize:12, textAlign:"center", padding:16 }}>No zones yet. Add one to set region-specific rates.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Btn loading={saving==="shipping"} onClick={() => save("shipping")}>Save Shipping Settings</Btn>
              </div>
            </SCard>
          )}

          {/* ============ PAYMENTS ============ */}
          {tab==="payments" && (
            <SCard title="Payment Configuration" sub="Razorpay gateway and payment method toggles">
              {saved==="payments"   && <Alert type="success">Payment settings saved!</Alert>}
              {saveErr==="payments" && <Alert type="error">Failed to save. Try again.</Alert>}
              <div className="space-y-4 mt-3">
                <MaskedInput label="Razorpay Key ID"
                  value={s.payments?.razorpay_key_id||""}
                  onChange={v => patch("payments","razorpay_key_id",v)}
                  placeholder="rzp_live_..."
                  hint="Public key only. Never enter your Key Secret here — set it as RAZORPAY_KEY_SECRET env var in Vercel."/>
                <Input label="Razorpay Webhook URL"
                  value={s.payments?.webhook_url||""}
                  placeholder="https://maaflavours.com/api/checkout/webhook"
                  onChange={e => patch("payments","webhook_url",e.target.value)}/>
                <div className="px-4 py-3 rounded-xl" style={{ background:"rgba(200,150,12,0.06)", border:"1px solid rgba(200,150,12,0.2)" }}>
                  <p style={{ fontSize:12, color:A.brown }}>
                    &#9888;&#65039; <strong>Security reminder:</strong> RAZORPAY_KEY_SECRET, TWILIO_AUTH_TOKEN, and SUPABASE_SERVICE_ROLE_KEY
                    must remain in Vercel environment variables only. They are never stored in the database.
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t pt-4" style={{ borderColor:A.border }}>
                <p style={{ fontWeight:700, fontSize:13, color:A.brown, marginBottom:8 }}>Payment Methods</p>
                <Toggle value={!!s.payments?.upi_enabled} onChange={v=>patch("payments","upi_enabled",v)}
                  label="UPI Payments" sub="Google Pay, PhonePe, Paytm, BHIM UPI"/>
                <Toggle value={!!s.payments?.card_enabled} onChange={v=>patch("payments","card_enabled",v)}
                  label="Credit / Debit Cards" sub="Visa, Mastercard, Rupay"/>
                <Toggle value={!!s.payments?.netbanking_enabled} onChange={v=>patch("payments","netbanking_enabled",v)}
                  label="Net Banking" sub="All major Indian banks"/>
                <Toggle value={!!s.payments?.cod_enabled} onChange={v=>patch("payments","cod_enabled",v)}
                  label="Cash on Delivery (COD)"
                  sub={`Extra charge: Rs.${((s.shipping?.cod_extra||0)/100).toLocaleString("en-IN")} — configure in Shipping tab`}/>
              </div>

              <div className="flex justify-end mt-6">
                <Btn loading={saving==="payments"} onClick={() => save("payments")}>Save Payment Settings</Btn>
              </div>
            </SCard>
          )}

          {/* ============ NOTIFICATIONS ============ */}
          {tab==="notifications" && (
            <SCard title="Notification Preferences" sub="Configure order alerts, stock alerts, and delivery channels">
              {saved==="notifications"   && <Alert type="success">Notification settings saved!</Alert>}
              {saveErr==="notifications" && <Alert type="error">Failed to save. Try again.</Alert>}

              <div className="mt-2">
                <p style={{ fontWeight:700, fontSize:13, color:A.brown, marginBottom:2 }}>Order Events</p>
                <Toggle value={!!s.notifications?.order_placed} onChange={v=>patch("notifications","order_placed",v)}
                  label="New Order Placed" sub="Alert immediately when a customer completes checkout"/>
                <Toggle value={!!s.notifications?.order_shipped} onChange={v=>patch("notifications","order_shipped",v)}
                  label="Order Shipped" sub="Alert when tracking ID is added and status becomes Shipped"/>
                <Toggle value={!!s.notifications?.order_delivered} onChange={v=>patch("notifications","order_delivered",v)}
                  label="Order Delivered" sub="Alert when order status changes to Delivered"/>
              </div>

              <div className="mt-4 pt-4 border-t" style={{ borderColor:A.border }}>
                <p style={{ fontWeight:700, fontSize:13, color:A.brown, marginBottom:2 }}>Business Alerts</p>
                <Toggle value={!!s.notifications?.low_stock} onChange={v=>patch("notifications","low_stock",v)}
                  label="Low Stock Alert" sub="Alert when product stock falls below configured threshold"/>
                <Toggle value={!!s.notifications?.daily_summary} onChange={v=>patch("notifications","daily_summary",v)}
                  label="Daily Revenue Summary" sub="Morning WhatsApp digest of previous day orders and revenue"/>
              </div>

              <div className="mt-4 pt-4 border-t grid sm:grid-cols-2 gap-4" style={{ borderColor:A.border }}>
                <div>
                  <Input label="Admin WhatsApp (+91)" type="tel"
                    value={s.notifications?.admin_whatsapp||""} placeholder="98765 43210"
                    onChange={e => patch("notifications","admin_whatsapp",e.target.value)}/>
                  <p style={{ color:A.grey, fontSize:10, marginTop:3 }}>Receives all order and stock alerts via WhatsApp</p>
                </div>
                <div>
                  <Input label="Admin Email (alerts)" type="email"
                    value={s.notifications?.admin_email||""} placeholder="admin@maaflavours.com"
                    onChange={e => patch("notifications","admin_email",e.target.value)}/>
                  <p style={{ color:A.grey, fontSize:10, marginTop:3 }}>Receives daily summaries and PDF reports</p>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Btn loading={saving==="notifications"} onClick={() => save("notifications")}>Save Notification Settings</Btn>
              </div>
            </SCard>
          )}

          {/* ============ SOCIAL & SEO ============ */}
          {tab==="social" && (
            <SCard title="Social Media & SEO" sub="Social links, WhatsApp widget number, meta tags for search engines">
              {saved==="social"   && <Alert type="success">Social and SEO settings saved!</Alert>}
              {saveErr==="social" && <Alert type="error">Failed to save. Try again.</Alert>}

              <div className="grid sm:grid-cols-2 gap-4 mt-3">
                <Input label="Instagram URL" value={s.social?.instagram||""}
                  placeholder="https://instagram.com/maaflavours"
                  onChange={e => patch("social","instagram",e.target.value)}/>
                <Input label="Facebook URL" value={s.social?.facebook||""}
                  placeholder="https://facebook.com/maaflavours"
                  onChange={e => patch("social","facebook",e.target.value)}/>
                <Input label="YouTube URL" value={s.social?.youtube||""}
                  placeholder="https://youtube.com/@maaflavours"
                  onChange={e => patch("social","youtube",e.target.value)}/>
                <div>
                  <Input label="WhatsApp Number (widget)" value={s.social?.whatsapp_number||""}
                    placeholder="919876543210"
                    onChange={e => patch("social","whatsapp_number",e.target.value)}/>
                  <p style={{ color:A.grey, fontSize:10, marginTop:3 }}>Country code + number, no +, no spaces (e.g. 919876543210)</p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t" style={{ borderColor:A.border }}>
                <p style={{ fontWeight:700, fontSize:13, color:A.brown, marginBottom:12 }}>SEO Meta Tags</p>
                <div className="space-y-4">
                  <Input label="Meta Title (60 chars max)" value={s.social?.meta_title||""}
                    placeholder="Maa Flavours -- Authentic Andhra Pickles"
                    onChange={e => patch("social","meta_title",e.target.value)}/>
                  <div>
                    <Textarea label="Meta Description (160 chars max)" rows={3}
                      value={s.social?.meta_description||""}
                      placeholder="Authentic Andhra homemade pickles from Ongole. No preservatives, traditional recipes."
                      onChange={e => patch("social","meta_description",e.target.value)}/>
                    <p style={{ color: (s.social?.meta_description||"").length > 160 ? "#C0272D" : A.grey, fontSize:10, marginTop:3, textAlign:"right" }}>
                      {(s.social?.meta_description||"").length} / 160 chars
                    </p>
                  </div>
                </div>
              </div>

              {/* Google preview */}
              {s.social?.meta_title && (
                <div className="mt-4 p-4 rounded-xl" style={{ background:A.cream, border:`1px solid ${A.border}` }}>
                  <p style={{ fontSize:10, color:A.grey, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.08em" }}>Google Search Preview</p>
                  <p style={{ fontSize:14, fontWeight:600, color:"#1558d6", marginBottom:2 }}>{s.social.meta_title}</p>
                  <p style={{ fontSize:12, color:"#0d652d", marginBottom:2 }}>maaflavours.com</p>
                  <p style={{ fontSize:13, color:"#4d5156", lineHeight:1.5 }}>{(s.social?.meta_description||"").slice(0,160)}</p>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <Btn loading={saving==="social"} onClick={() => save("social")}>Save Social & SEO</Btn>
              </div>
            </SCard>
          )}

          {/* ============ ANNOUNCEMENT BAR ============ */}
          {tab==="announcement" && (
            <SCard title="Announcement Bar" sub="The dismissible banner shown at the top of every customer page">
              {saved==="announcement"   && <Alert type="success">Announcement bar saved!</Alert>}
              {saveErr==="announcement" && <Alert type="error">Failed to save. Try again.</Alert>}
              <div className="mt-3 space-y-4">
                <Toggle value={!!s.announcement?.enabled} onChange={v=>patch("announcement","enabled",v)}
                  label="Show Announcement Bar" sub="Hides or shows the crimson banner on the customer site"/>
                <Textarea label="Announcement Text" rows={2}
                  value={s.announcement?.text||""}
                  placeholder="Free Shipping on orders above Rs.499 | Pan-India Delivery | No Preservatives"
                  onChange={e => patch("announcement","text",e.target.value)}/>
                <p style={{ color:A.grey, fontSize:11 }}>
                  Use | (pipe) to separate multiple messages. Messages auto-scroll on mobile screens.
                </p>
              </div>

              {s.announcement?.enabled && s.announcement?.text && (
                <div className="mt-5">
                  <p style={{ color:A.grey, fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600, marginBottom:8 }}>
                    Live Preview
                  </p>
                  <div className="px-4 py-2.5 text-center text-sm font-medium rounded-xl"
                    style={{ background:"#C0272D", color:"#C8960C", letterSpacing:"0.02em" }}>
                    {s.announcement.text}
                  </div>
                </div>
              )}

              {!s.announcement?.enabled && (
                <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl"
                  style={{ background:"rgba(107,107,107,0.06)", border:`1px solid ${A.border}` }}>
                  <span>&#8505;&#65039;</span>
                  <p style={{ fontSize:12, color:A.grey }}>Announcement bar is currently hidden from customers.</p>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <Btn loading={saving==="announcement"} onClick={() => save("announcement")}>Save Announcement</Btn>
              </div>
            </SCard>
          )}

          {/* ============ SYSTEM ============ */}
          {tab==="system" && (<>
            <SCard title="System Status" sub="API connectivity, session info, hosting details">
              <div className="space-y-0 mt-1 divide-y" style={{ borderColor:A.border }}>
                {[
                  { label:"Admin Session", sub:"JWT cookie — valid until logout or browser close", status:"Active", colour:"#2E7D32", bg:"rgba(46,125,50,0.1)" },
                  { label:"Database",      sub:"Supabase PostgreSQL — maaflavours project",        status:"Supabase", colour:A.brown,  bg:"rgba(74,44,10,0.08)" },
                  { label:"Hosting",       sub:"Vercel — maaflavours.com",                          status:"Vercel",  colour:A.brown,  bg:"rgba(74,44,10,0.08)" },
                  { label:"Image Storage", sub:"Supabase Storage — product-images bucket",          status:"Supabase",colour:A.brown,  bg:"rgba(74,44,10,0.08)" },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-3">
                    <div>
                      <p style={{ fontWeight:600, fontSize:13, color:A.brown }}>{row.label}</p>
                      <p style={{ fontSize:11, color:A.grey, marginTop:1 }}>{row.sub}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background:row.bg, color:row.colour }}>{row.status}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p style={{ fontWeight:600, fontSize:13, color:A.brown }}>API Health</p>
                    <p style={{ fontSize:11, color:A.grey, marginTop:1 }}>Live connectivity test to /api/admin/dashboard</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {health==="loading" && <Spinner size={14}/>}
                    {health==="ok"      && <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background:"rgba(46,125,50,0.1)", color:"#2E7D32" }}>&#10003; OK</span>}
                    {health==="error"   && <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background:"rgba(192,39,45,0.1)", color:"#C0272D" }}>&#10007; Error</span>}
                    <Btn variant="ghost" size="sm" onClick={testHealth}>Test</Btn>
                  </div>
                </div>
              </div>
            </SCard>

            <SCard title="Required Environment Variables" sub="Must be set in Vercel project settings -- never stored in the database">
              <div className="space-y-2 mt-2">
                {[
                  "NEXT_PUBLIC_SUPABASE_URL","NEXT_PUBLIC_SUPABASE_ANON_KEY","SUPABASE_SERVICE_ROLE_KEY",
                  "RAZORPAY_KEY_ID","RAZORPAY_KEY_SECRET","RAZORPAY_WEBHOOK_SECRET",
                  "TWILIO_ACCOUNT_SID","TWILIO_AUTH_TOKEN","TWILIO_VERIFY_SERVICE_SID",
                  "ADMIN_EMAIL","ADMIN_PASSWORD_HASH","NEXT_PUBLIC_SITE_URL",
                ].map(k => (
                  <div key={k} className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                    style={{ background:A.cream, border:`1px solid ${A.border}` }}>
                    <code style={{ fontFamily:"monospace", fontSize:12, color:A.brown }}>{k}</code>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background:"rgba(192,39,45,0.08)", color:"#C0272D" }}>Vercel only</span>
                  </div>
                ))}
              </div>
              <p className="mt-3" style={{ color:A.grey, fontSize:11 }}>
                Vercel Dashboard &#8594; Project &#8594; Settings &#8594; Environment Variables
              </p>
            </SCard>

            <SCard title="Debug Tools" sub="Development and testing utilities">
              <div className="flex flex-wrap gap-3">
                <Btn variant="ghost" size="sm" onClick={() => load()}>&#8635; Reload Settings</Btn>
                <Btn variant="ghost" size="sm" onClick={() => window.open("/api/admin/dashboard","_blank")}>&#128202; Inspect Dashboard API</Btn>
                <Btn variant="ghost" size="sm" onClick={() => window.open("/api/admin/settings","_blank")}>&#9881;&#65039; Inspect Settings API</Btn>
              </div>
            </SCard>
          </>)}

          {/* Unsaved changes bar */}
          {dirty.has(tab) && tab !== "system" && (
            <div className="flex items-center justify-between px-5 py-3 rounded-2xl"
              style={{ background:"rgba(200,150,12,0.08)", border:"1px solid rgba(200,150,12,0.3)" }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background:A.gold }}/>
                <p style={{ fontSize:13, color:A.brown, fontWeight:500 }}>Unsaved changes in this section</p>
              </div>
              <Btn size="sm" loading={saving===tab} onClick={() => save(tab)}>Save Now</Btn>
            </div>
          )}

        </div>
      </div>
    </AdminPage>
  );
}

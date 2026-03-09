// src/app/shipping-policy/page.tsx
// Maa Flavours — Shipping Policy Page

import type { Metadata } from "next";
import Link from "next/link";
import { Truck, Clock, MapPin, Package, AlertCircle, Phone } from "lucide-react";
import StaticPageLayout, { OrnamentLine } from "@/components/layout/StaticPageLayout";

export const metadata: Metadata = {
  title: "Shipping Policy — Maa Flavours | Pan-India Pickle Delivery",
  description: "Our complete shipping policy — delivery timelines, free shipping threshold, courier partners, and more for Maa Flavours homemade pickles.",
};

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="font-playfair font-bold text-xl sm:text-2xl mb-4" style={{ color: "var(--color-brown)" }}>
        {title}
      </h2>
      <OrnamentLine className="w-14 mb-5" />
      <div className="font-dm-sans text-sm sm:text-base leading-relaxed space-y-3" style={{ color: "var(--color-grey)" }}>
        {children}
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, color, bg }: {
  icon: React.FC<any>; label: string; value: string; color: string; bg: string;
}) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl"
      style={{ background: bg, border: `1px solid ${color}22` }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p className="font-dm-sans font-bold text-sm" style={{ color: "var(--color-brown)" }}>{label}</p>
        <p className="font-dm-sans text-sm mt-0.5" style={{ color: "var(--color-grey)" }}>{value}</p>
      </div>
    </div>
  );
}

export default function ShippingPolicyPage() {
  return (
    <StaticPageLayout
      title="Shipping Policy"
      subtitle="Everything about how we get pickles from our Ongole kitchen to your door"
      emoji="🚚"
      breadcrumb="Shipping Policy"
      updatedAt="Last updated: July 2025"
    >
      {/* Quick reference cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <InfoCard icon={Truck}    label="Free Shipping"       value="On all orders above ₹499"                         color="var(--color-crimson)"  bg="rgba(192,39,45,0.04)" />
        <InfoCard icon={Clock}    label="Standard Delivery"   value="5–7 working days across India"                    color="var(--color-gold)"     bg="rgba(200,150,12,0.05)" />
        <InfoCard icon={MapPin}   label="Delivery Coverage"   value="Pan-India · All states and union territories"     color="var(--color-brown)"    bg="rgba(74,44,10,0.04)" />
        <InfoCard icon={Package}  label="Packing"             value="Airtight glass jars · Bubble-wrap protected"      color="var(--color-grey)"     bg="rgba(107,107,107,0.05)" />
      </div>

      <OrnamentLine className="mb-8" />

      <PolicySection title="1. Shipping Coverage">
        <p>We deliver across <strong style={{ color: "var(--color-brown)" }}>all of India</strong> — every state and union territory, including remote areas. This includes Jammu & Kashmir, the Northeast states, Andaman & Nicobar Islands, and Lakshadweep.</p>
        <p>Delivery to some remote PIN codes may be routed through India Post and may take 1–2 additional days beyond standard timelines.</p>
        <p>At this time, we do not ship internationally. We are working on international shipping for the Indian diaspora and hope to offer it in the near future.</p>
      </PolicySection>

      <PolicySection title="2. Shipping Charges">
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(200,150,12,0.15)" }}>
          <div className="h-[2px]" style={{ background: "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)" }} />
          <table className="w-full text-sm font-dm-sans">
            <thead>
              <tr style={{ background: "var(--color-cream)" }}>
                <th className="px-5 py-3 text-left font-bold" style={{ color: "var(--color-brown)" }}>Order Value</th>
                <th className="px-5 py-3 text-left font-bold" style={{ color: "var(--color-brown)" }}>Shipping Charge</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t" style={{ borderColor: "rgba(200,150,12,0.08)" }}>
                <td className="px-5 py-3" style={{ color: "var(--color-grey)" }}>Below ₹499</td>
                <td className="px-5 py-3 font-semibold" style={{ color: "var(--color-brown)" }}>₹60 flat shipping</td>
              </tr>
              <tr className="border-t" style={{ borderColor: "rgba(200,150,12,0.08)", background: "rgba(200,150,12,0.02)" }}>
                <td className="px-5 py-3" style={{ color: "var(--color-grey)" }}>₹499 and above</td>
                <td className="px-5 py-3 font-bold" style={{ color: "#2E7D32" }}>FREE shipping</td>
              </tr>
              <tr className="border-t" style={{ borderColor: "rgba(200,150,12,0.08)" }}>
                <td className="px-5 py-3" style={{ color: "var(--color-grey)" }}>Cash on Delivery (COD)</td>
                <td className="px-5 py-3 font-semibold" style={{ color: "var(--color-brown)" }}>₹30 COD convenience charge (additional to shipping)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs italic" style={{ color: "var(--color-grey)" }}>Note: The free shipping threshold and charges are subject to change during special offers and sales events. The amount shown at checkout is always the final amount.</p>
      </PolicySection>

      <PolicySection title="3. Processing Time">
        <p>Once your order is placed and payment is confirmed, we begin preparing your pickle within <strong style={{ color: "var(--color-brown)" }}>12–24 hours</strong>. We make pickles in small batches, so your jar is freshly prepared for your order.</p>
        <p>Orders placed on <strong style={{ color: "var(--color-brown)" }}>Sundays and public holidays</strong> will begin processing on the next working day.</p>
        <p>You'll receive an SMS with your tracking ID once your order is dispatched from our Ongole kitchen.</p>
      </PolicySection>

      <PolicySection title="4. Delivery Timelines">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { zone: "Hyderabad, AP & Telangana", time: "3–4 working days" },
            { zone: "Metro cities (Mumbai, Delhi, Bangalore, Chennai, Kolkata)", time: "4–5 working days" },
            { zone: "Tier-2 & Tier-3 cities", time: "5–7 working days" },
            { zone: "Remote / rural PIN codes", time: "7–10 working days" },
          ].map((row) => (
            <div key={row.zone} className="p-4 rounded-xl" style={{ background: "var(--color-cream)", border: "1px solid rgba(200,150,12,0.12)" }}>
              <p className="font-dm-sans font-bold text-xs" style={{ color: "var(--color-brown)" }}>{row.zone}</p>
              <p className="font-dm-sans text-sm mt-1" style={{ color: "var(--color-grey)" }}>⏱️ {row.time}</p>
            </div>
          ))}
        </div>
        <p>These timelines are estimates and may be affected by courier delays, weather conditions, public holidays, or high-demand periods (festivals, sales events). We always aim to deliver as early as possible.</p>
      </PolicySection>

      <PolicySection title="5. Courier Partners">
        <p>We work with trusted courier partners to ensure safe and timely delivery of your pickles:</p>
        <ul className="list-none flex flex-col gap-2 mt-2">
          {["DTDC Courier", "BlueDart Express", "India Post (for remote PIN codes)"].map((c) => (
            <li key={c} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--color-gold)" }} />
              <span>{c}</span>
            </li>
          ))}
        </ul>
        <p>The courier assigned to your order depends on your PIN code and service availability in your area. We always select the courier most reliable for your location.</p>
      </PolicySection>

      <PolicySection title="6. Order Tracking">
        <p>Once your order is dispatched, you will receive:</p>
        <ul className="list-none flex flex-col gap-2">
          {[
            "An SMS with your tracking ID and courier name to your registered mobile number",
            "The tracking ID visible on your Order Details page (My Account → Orders)",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2" style={{ background: "var(--color-gold)" }} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p>You can track your shipment directly on the courier's website using the tracking ID. If the courier website isn't showing updates after 24 hours of dispatch, please contact us via WhatsApp.</p>
      </PolicySection>

      <PolicySection title="7. Packaging">
        <p>Your pickles are packed with the same care we put into making them:</p>
        <ul className="list-none flex flex-col gap-2">
          {[
            "Airtight glass jars with sealed lids to prevent spillage",
            "Each jar wrapped in bubble wrap individually",
            "Packed in corrugated cardboard boxes for outer protection",
            "Fragile sticker applied to all packages",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2" style={{ background: "var(--color-gold)" }} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p>Despite our careful packing, transit damage can occasionally occur. If your jar arrives damaged, please see our <Link href="/return-policy" className="underline" style={{ color: "var(--color-crimson)" }}>Return & Refund Policy</Link> for how we handle this.</p>
      </PolicySection>

      <PolicySection title="8. Missing or Delayed Orders">
        <p>If your order hasn't arrived within the estimated delivery window, please first check the tracking ID on the courier's website. Tracking updates can sometimes take 24 hours to appear after dispatch.</p>
        <p>If the tracking shows no movement for more than 3 working days, or if your order hasn't arrived within 12 working days, please contact us immediately:</p>
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <a href="https://wa.me/919701452929" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-dm-sans font-bold text-sm text-white transition-opacity hover:opacity-90"
            style={{ background: "#25D366" }}>
            💬 WhatsApp: +91 97014 52929
          </a>
          <a href="mailto:support@maaflavours.com"
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-dm-sans font-bold text-sm transition-opacity hover:opacity-80"
            style={{ border: "2px solid rgba(200,150,12,0.3)", color: "var(--color-brown)" }}>
            ✉️ support@maaflavours.com
          </a>
        </div>
      </PolicySection>

      <div className="mt-6 p-5 rounded-2xl flex gap-3" style={{ background: "rgba(200,150,12,0.06)", border: "1px solid rgba(200,150,12,0.15)" }}>
        <AlertCircle size={18} style={{ color: "var(--color-gold)", flexShrink: 0, marginTop: "2px" }} />
        <p className="font-dm-sans text-sm leading-relaxed" style={{ color: "var(--color-grey)" }}>
          <strong style={{ color: "var(--color-brown)" }}>Policy Updates:</strong> This shipping policy is effective as of July 2025. We reserve the right to update shipping charges and timelines. Changes will be communicated on this page and any applicable notification channels.
        </p>
      </div>
    </StaticPageLayout>
  );
}

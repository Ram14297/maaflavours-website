// src/app/return-policy/page.tsx
// Maa Flavours — Return & Refund Policy Page

import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import StaticPageLayout, { OrnamentLine } from "@/components/layout/StaticPageLayout";

export const metadata: Metadata = {
  title: "Return & Refund Policy — Maa Flavours",
  description: "Our return and refund policy for Maa Flavours homemade pickles — replacements for damaged goods, refund timelines, and how to raise a request.",
};

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="font-playfair font-bold text-xl sm:text-2xl mb-4" style={{ color: "var(--color-brown)" }}>{title}</h2>
      <OrnamentLine className="w-14 mb-5" />
      <div className="font-dm-sans text-sm sm:text-base leading-relaxed space-y-3" style={{ color: "var(--color-grey)" }}>
        {children}
      </div>
    </div>
  );
}

export default function ReturnPolicyPage() {
  return (
    <StaticPageLayout
      title="Return & Refund Policy"
      subtitle="We stand behind every jar we make — here's our commitment to you"
      emoji="↩️"
      breadcrumb="Return & Refund Policy"
      updatedAt="Last updated: July 2025"
    >
      {/* Quick summary */}
      <div className="rounded-2xl overflow-hidden mb-10" style={{ border: "1px solid rgba(200,150,12,0.15)" }}>
        <div className="h-[2px]" style={{ background: "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)" }} />
        <div className="p-6" style={{ background: "var(--color-cream)" }}>
          <p className="font-playfair font-bold text-lg mb-4" style={{ color: "var(--color-brown)" }}>Quick Summary</p>
          <div className="flex flex-col gap-3">
            {[
              { ok: true,  text: "Damaged / leaking jar on delivery → Full replacement or refund" },
              { ok: true,  text: "Wrong product received → Replacement dispatched at no charge" },
              { ok: true,  text: "Refund request approved within 24 hours of claim" },
              { ok: false, text: "Opened jars cannot be returned (food hygiene regulation)" },
              { ok: false, text: "Change-of-mind returns not accepted (perishable food product)" },
              { ok: false, text: "Damage claims must be raised within 48 hours of delivery" },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-2.5">
                {item.ok
                  ? <CheckCircle2 size={16} style={{ color: "#2E7D32", flexShrink: 0, marginTop: "2px" }} />
                  : <XCircle size={16} style={{ color: "var(--color-crimson)", flexShrink: 0, marginTop: "2px" }} />}
                <p className="font-dm-sans text-sm" style={{ color: "var(--color-grey)" }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <OrnamentLine className="mb-8" />

      <PolicySection title="1. Our Commitment">
        <p>At Maa Flavours, every jar of pickle is made with the same love and care we'd put into food made for our own family. We take quality seriously — and when something goes wrong, we take responsibility.</p>
        <p>If you receive a product that is damaged, leaking, incorrect, or otherwise not as expected, we will make it right. No lengthy forms, no bureaucratic process — just a quick resolution.</p>
      </PolicySection>

      <PolicySection title="2. What We Will Replace or Refund">
        <div className="flex flex-col gap-4">
          {[
            {
              emoji: "💔",
              title: "Damaged or Broken Jars",
              desc: "If your jar arrives broken, cracked, or damaged during transit, we will send a replacement at no cost, or refund you in full — your choice.",
            },
            {
              emoji: "🫗",
              title: "Leaking or Spilled Product",
              desc: "If the seal is broken or the product has leaked significantly, we will replace or refund the affected product.",
            },
            {
              emoji: "❌",
              title: "Wrong Product Received",
              desc: "If you received a different pickle variety or size than what you ordered, we will dispatch the correct product immediately. You may keep the incorrect one.",
            },
            {
              emoji: "⚠️",
              title: "Significantly Short Fill",
              desc: "Our jars are filled by hand and weights may vary slightly (±5%). If you believe your jar is significantly underfilled, contact us with a photo.",
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-4 p-4 rounded-xl" style={{ background: "rgba(46,125,50,0.04)", border: "1px solid rgba(46,125,50,0.12)" }}>
              <span className="text-2xl flex-shrink-0">{item.emoji}</span>
              <div>
                <p className="font-dm-sans font-bold text-sm" style={{ color: "var(--color-brown)" }}>{item.title}</p>
                <p className="font-dm-sans text-sm mt-1 leading-relaxed" style={{ color: "var(--color-grey)" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </PolicySection>

      <PolicySection title="3. What We Cannot Accept as Returns">
        <p>As a food product company, we are bound by food safety regulations and hygiene standards. We cannot accept returns for the following:</p>
        <div className="flex flex-col gap-3 mt-3">
          {[
            "Opened pickle jars — once opened, a food product cannot be resold or reused",
            "Change of mind or taste preference — we recommend reading product descriptions and trying our 250g size first",
            "Damage caused after delivery (e.g., dropped by customer)",
            "Damage claims raised more than 48 hours after delivery confirmation",
            "Products purchased from unauthorised third-party sellers",
          ].map((item) => (
            <div key={item} className="flex items-start gap-2.5">
              <XCircle size={15} style={{ color: "var(--color-crimson)", flexShrink: 0, marginTop: "2px" }} />
              <p className="font-dm-sans text-sm" style={{ color: "var(--color-grey)" }}>{item}</p>
            </div>
          ))}
        </div>
      </PolicySection>

      <PolicySection title="4. How to Raise a Return / Replacement Request">
        <p>Raising a request is simple — just follow these 3 steps:</p>
        <div className="flex flex-col gap-4 mt-3">
          {[
            { step: "01", title: "Contact us within 48 hours", desc: "Reach out via WhatsApp (+91 97014 52929) or email (maaflavours74@gmail.com) within 48 hours of your delivery." },
            { step: "02", title: "Send photos of the issue", desc: "Share clear photos of the damaged product and outer packaging. This helps us process your claim quickly and also helps us improve our packing." },
            { step: "03", title: "We resolve within 24 hours", desc: "Once we've reviewed your claim, we'll confirm a replacement dispatch or initiate a refund — within 24 hours of receiving your photos." },
          ].map((item) => (
            <div key={item.step} className="flex gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-playfair font-bold text-sm text-white flex-shrink-0"
                style={{ background: "var(--color-crimson)" }}>
                {item.step}
              </div>
              <div>
                <p className="font-dm-sans font-bold text-sm" style={{ color: "var(--color-brown)" }}>{item.title}</p>
                <p className="font-dm-sans text-sm mt-0.5 leading-relaxed" style={{ color: "var(--color-grey)" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </PolicySection>

      <PolicySection title="5. Refund Timelines">
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(200,150,12,0.15)" }}>
          <table className="w-full text-sm font-dm-sans">
            <thead>
              <tr style={{ background: "var(--color-cream)" }}>
                <th className="px-5 py-3 text-left font-bold" style={{ color: "var(--color-brown)" }}>Payment Method</th>
                <th className="px-5 py-3 text-left font-bold" style={{ color: "var(--color-brown)" }}>Refund Timeline</th>
              </tr>
            </thead>
            <tbody>
              {[
                { method: "UPI / PhonePe / GPay", time: "1–3 working days" },
                { method: "Debit Card / Credit Card", time: "5–7 working days (bank-dependent)" },
                { method: "Net Banking", time: "5–7 working days" },
                { method: "Cash on Delivery (COD)", time: "Refund as bank transfer — share account details with us" },
              ].map((row, i) => (
                <tr key={row.method} className="border-t" style={{ borderColor: "rgba(200,150,12,0.08)", background: i % 2 === 1 ? "rgba(200,150,12,0.02)" : undefined }}>
                  <td className="px-5 py-3" style={{ color: "var(--color-grey)" }}>{row.method}</td>
                  <td className="px-5 py-3 font-semibold" style={{ color: "var(--color-brown)" }}>{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>Refunds are processed after claim approval — approval happens within 24 hours of receiving your damage photos. The timelines above begin from the approval date.</p>
      </PolicySection>

      <PolicySection title="6. COD Refunds">
        <p>For Cash on Delivery orders, we process refunds as a direct bank transfer. To receive your refund, please share:</p>
        <ul className="list-none flex flex-col gap-2 mt-2">
          {["Account holder name", "Bank account number", "IFSC code", "UPI ID (preferred for faster transfer)"].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-gold)" }} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p>Send these details via WhatsApp or email once your claim is approved.</p>
      </PolicySection>

      <div className="mt-6 p-5 rounded-2xl" style={{ background: "rgba(192,39,45,0.04)", border: "1px solid rgba(192,39,45,0.15)" }}>
        <div className="flex gap-3">
          <AlertCircle size={18} style={{ color: "var(--color-crimson)", flexShrink: 0, marginTop: "2px" }} />
          <div>
            <p className="font-dm-sans font-bold text-sm" style={{ color: "var(--color-brown)" }}>Need to raise a claim?</p>
            <p className="font-dm-sans text-sm mt-1" style={{ color: "var(--color-grey)" }}>
              Contact us immediately via{" "}
              <a href="https://wa.me/919701452929" className="underline" style={{ color: "var(--color-crimson)" }}>WhatsApp (+91 97014 52929)</a>
              {" "}or{" "}
              <a href="mailto:maaflavours74@gmail.com" className="underline" style={{ color: "var(--color-crimson)" }}>maaflavours74@gmail.com</a>.
              We resolve all issues within 24 hours, no questions asked.
            </p>
          </div>
        </div>
      </div>
    </StaticPageLayout>
  );
}

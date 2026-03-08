// src/app/contact/page.tsx
// Maa Flavours — Contact Us Page
// Contact info fetched from Supabase settings (server-side, no flash)

import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Mail, MapPin, Clock, Phone, Instagram, Facebook, Youtube } from "lucide-react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import NavbarWithCart from "@/components/layout/NavbarWithCart";
import Footer from "@/components/layout/Footer";
import ContactFormClient from "./ContactFormClient";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Contact Us — Maa Flavours | Authentic Andhra Homemade Pickles",
  description:
    "Reach out to the Maa Flavours team for orders, queries, wholesale enquiries, or any help. We're based in Ongole, Andhra Pradesh.",
};

// ─── Fetch settings from Supabase ─────────────────────────────────────────
async function getContactSettings() {
  try {
    const supabase = createAdminSupabaseClient();
    const { data } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", ["business", "social"]);

    const business = (data || []).find((r) => r.key === "business")?.value || {};
    const social   = (data || []).find((r) => r.key === "social")?.value   || {};

    return { business, social };
  } catch {
    return { business: {}, social: {} };
  }
}

function OrnamentLine({ className = "" }: { className?: string }) {
  return (
    <div className={`h-px ${className}`}
      style={{ background: "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)" }} />
  );
}

function ContactCard({
  icon: Icon, label, value, href, color, bg,
}: {
  icon: React.FC<any>; label: string; value: string; href?: string; color: string; bg: string;
}) {
  const inner = (
    <div className="flex items-start gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
        <Icon size={20} strokeWidth={1.75} style={{ color }} />
      </div>
      <div>
        <p className="font-dm-sans text-xs font-semibold uppercase tracking-widest mb-0.5"
          style={{ color: "var(--color-grey)" }}>{label}</p>
        <p className="font-dm-sans font-bold text-sm sm:text-base leading-snug"
          style={{ color: "var(--color-brown)" }}>{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href}
        className="block p-5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        style={{ background: "white", border: "1px solid rgba(200,150,12,0.12)", boxShadow: "0 2px 8px rgba(74,44,10,0.05)" }}
        target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
        {inner}
      </a>
    );
  }
  return (
    <div className="p-5 rounded-2xl"
      style={{ background: "white", border: "1px solid rgba(200,150,12,0.12)", boxShadow: "0 2px 8px rgba(74,44,10,0.05)" }}>
      {inner}
    </div>
  );
}

export default async function ContactPage() {
  const { business, social } = await getContactSettings();

  // Build dynamic contact values with sensible fallbacks
  const phone     = business.phone     || "";
  const email     = business.email     || "support@maaflavours.com";
  const address   = business.address   || "Ongole, Andhra Pradesh, India — 523001";
  const waNumber  = (social.whatsapp_number || "").replace(/\D/g, "") || "919876543210";
  const waLink    = (msg: string) => `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
  const instagram = social.instagram || "https://instagram.com/maaflavours";
  const facebook  = social.facebook  || "https://facebook.com/maaflavours";
  const youtube   = social.youtube   || "https://youtube.com/@maaflavours";

  const phoneDisplay = phone || "+91 XXXXX XXXXX";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-warm-white)" }}>
      <AnnouncementBar />
      <NavbarWithCart />

      <main className="flex-1">
        {/* ── Hero ───────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden"
          style={{ background: "linear-gradient(160deg,#3A1E08 0%,#5C3010 50%,#4A2C0A 100%)", paddingTop: "clamp(2.5rem,6vw,4.5rem)", paddingBottom: "clamp(4rem,9vw,6.5rem)" }}>
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)", backgroundSize: "10px 10px" }} />
          <div className="absolute top-0 left-0 right-0 h-1"
            style={{ background: "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)" }} />
          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[10rem] sm:text-[14rem] opacity-[0.07] select-none pointer-events-none" style={{ filter: "blur(2px)" }}>📬</div>

          <div className="section-container relative z-10 text-center">
            <p className="font-dancing text-2xl mb-3" style={{ color: "var(--color-gold-light)" }}>We'd Love to Hear From You</p>
            <h1 className="font-playfair font-bold text-white leading-tight mb-4"
              style={{ fontSize: "clamp(2rem,5vw,3.5rem)" }}>
              Get in Touch
            </h1>
            <p className="font-cormorant italic text-xl leading-relaxed mx-auto"
              style={{ color: "rgba(255,255,255,0.65)", maxWidth: "44ch" }}>
              Questions about an order, a wholesale enquiry, or just want to talk pickles — we're here.
            </p>
          </div>

          <div className="absolute bottom-0 left-0 right-0" style={{ height: "56px" }}>
            <svg viewBox="0 0 1440 56" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,56 L0,28 Q360,0 720,24 Q1080,48 1440,16 L1440,56 Z" fill="var(--color-warm-white)" />
            </svg>
          </div>
        </section>

        {/* ── Main grid ─────────────────────────────────────────────── */}
        <section className="section-padding" style={{ background: "var(--color-warm-white)" }}>
          <div className="section-container">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 lg:gap-14 items-start">

              {/* LEFT — Contact form */}
              <div>
                <div className="rounded-3xl overflow-hidden"
                  style={{ background: "white", border: "1px solid rgba(200,150,12,0.12)", boxShadow: "0 4px 24px rgba(74,44,10,0.07)" }}>
                  <div className="h-[3px]"
                    style={{ background: "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)" }} />
                  <div className="px-6 sm:px-8 py-8">
                    <h2 className="font-playfair font-bold text-2xl mb-1" style={{ color: "var(--color-brown)" }}>Send Us a Message</h2>
                    <p className="font-dm-sans text-sm mb-7" style={{ color: "var(--color-grey)" }}>
                      We typically respond within 2 hours during business hours (9 AM – 6 PM IST).
                    </p>
                    <ContactFormClient />
                  </div>
                </div>
              </div>

              {/* RIGHT — Contact details */}
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="font-playfair font-bold text-2xl mb-1" style={{ color: "var(--color-brown)" }}>Contact Details</h2>
                  <OrnamentLine className="w-16 mt-3 mb-6" />
                </div>

                {/* WhatsApp */}
                <ContactCard
                  icon={MessageCircle}
                  label="WhatsApp (Fastest)"
                  value={phoneDisplay}
                  href={waLink("Hello, I have a query about Maa Flavours pickles!")}
                  color="#25D366"
                  bg="rgba(37,211,102,0.1)"
                />

                {/* Email */}
                <ContactCard
                  icon={Mail}
                  label="Email"
                  value={email}
                  href={`mailto:${email}`}
                  color="var(--color-crimson)"
                  bg="rgba(192,39,45,0.08)"
                />

                {/* Phone */}
                {phone && (
                  <ContactCard
                    icon={Phone}
                    label="Phone"
                    value={phone}
                    href={`tel:${phone}`}
                    color="var(--color-gold)"
                    bg="rgba(200,150,12,0.1)"
                  />
                )}

                {/* Address */}
                <ContactCard
                  icon={MapPin}
                  label="Our Kitchen"
                  value={address}
                  color="var(--color-brown)"
                  bg="rgba(74,44,10,0.07)"
                />

                {/* Hours */}
                <ContactCard
                  icon={Clock}
                  label="Business Hours"
                  value="Monday – Saturday · 9:00 AM – 6:00 PM IST"
                  color="var(--color-grey)"
                  bg="rgba(107,107,107,0.08)"
                />

                {/* WhatsApp CTA */}
                <a
                  href={waLink("Hello, I have a query about Maa Flavours pickles!")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-dm-sans font-bold text-base text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
                  style={{ background: "#25D366", boxShadow: "0 4px 16px rgba(37,211,102,0.3)" }}
                >
                  <MessageCircle size={20} />
                  Chat on WhatsApp — Quickest Response
                </a>

                {/* Social */}
                <div className="p-5 rounded-2xl"
                  style={{ background: "var(--color-cream)", border: "1px solid rgba(200,150,12,0.12)" }}>
                  <p className="font-dm-sans font-bold text-sm mb-3" style={{ color: "var(--color-brown)" }}>
                    Follow Our Kitchen
                  </p>
                  <div className="flex gap-3">
                    {[
                      { Icon: Instagram, href: instagram, label: "Instagram", color: "#E1306C", bg: "rgba(225,48,108,0.1)" },
                      { Icon: Facebook,  href: facebook,  label: "Facebook",  color: "#1877F2", bg: "rgba(200,150,12,0.1)" },
                      { Icon: Youtube,   href: youtube,   label: "YouTube",   color: "var(--color-crimson)", bg: "rgba(192,39,45,0.08)" },
                    ].map(({ Icon, href, label, color, bg }) => (
                      <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                        className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                        style={{ background: bg }} title={label}>
                        <Icon size={18} style={{ color }} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Topic quick links ─────────────────────────────────────── */}
        <section className="section-padding" style={{ background: "var(--color-cream)" }}>
          <div className="section-container">
            <div className="text-center mb-10">
              <h2 className="font-playfair font-bold text-2xl sm:text-3xl" style={{ color: "var(--color-brown)" }}>
                Looking for Quick Answers?
              </h2>
              <OrnamentLine className="w-20 mx-auto mt-5" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
              {[
                { emoji: "❓", title: "FAQ", desc: "Answers to the most common questions", href: "/faq" },
                { emoji: "🚚", title: "Shipping Policy", desc: "Delivery timelines, charges, and tracking", href: "/shipping-policy" },
                { emoji: "↩️", title: "Return Policy", desc: "Our replacement and refund process", href: "/return-policy" },
              ].map((item) => (
                <Link key={item.href} href={item.href}
                  className="block p-6 rounded-2xl text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group"
                  style={{ background: "white", border: "1px solid rgba(200,150,12,0.12)", boxShadow: "0 2px 8px rgba(74,44,10,0.05)" }}>
                  <span className="text-4xl mb-3 block">{item.emoji}</span>
                  <h3 className="font-dm-sans font-bold text-base mb-1 group-hover:underline" style={{ color: "var(--color-brown)" }}>{item.title}</h3>
                  <p className="font-dm-sans text-sm" style={{ color: "var(--color-grey)" }}>{item.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

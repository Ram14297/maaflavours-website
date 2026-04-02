"use client";
// src/components/layout/Footer.tsx
// Maa Flavours — Site Footer
// Fetches business/social settings from /api/settings/public on mount
// Falls back to SITE constants from products.ts if fetch fails

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Instagram, Facebook, Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { SITE } from "@/lib/constants/products";

const POLICY_LINKS = [
  { label: "FAQ", href: "/faq" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Return & Refund", href: "/return-policy" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
];

interface FooterSettings {
  phone: string;
  email: string;
  address: string;
  whatsapp: string;     // digits only, e.g. "919701452929"
  instagram: string;
  facebook: string;
}

function buildWhatsappNumber(raw: string): string {
  // Accept either a full URL (https://wa.me/91...) or just digits
  if (!raw) return SITE.whatsapp;
  const digits = raw.replace(/\D/g, "");
  return digits || SITE.whatsapp;
}

export default function Footer() {
  const [s, setS] = useState<FooterSettings>({
    phone:     SITE.phone,
    email:     SITE.email,
    address:   SITE.address,
    whatsapp:  SITE.whatsapp,
    instagram: SITE.instagram,
    facebook:  SITE.facebook,
  });

  useEffect(() => {
    fetch("/api/settings/public")
      .then((r) => r.json())
      .then((data) => {
        const b = data.business || {};
        const soc = data.social || {};
        setS((prev) => ({
          phone:     b.phone     || prev.phone,
          email:     b.email     || prev.email,
          address:   b.address   || prev.address,
          whatsapp:  buildWhatsappNumber(soc.whatsapp_number) || prev.whatsapp,
          instagram: soc.instagram || prev.instagram,
          facebook:  soc.facebook  || prev.facebook,
        }));
      })
      .catch(() => {/* silently use fallbacks */});
  }, []);

  const waLink = (msg: string) =>
    `https://wa.me/${s.whatsapp}?text=${encodeURIComponent(msg)}`;

  return (
    <>
      {/* ─── Main Footer ────────────────────────────────────────────────── */}
      <footer
        style={{
          background: "linear-gradient(180deg, #3A2006 0%, #2A1804 100%)",
          borderTop: "3px solid transparent",
          backgroundClip: "padding-box",
          position: "relative",
        }}
      >
        {/* Gold top ornamental border */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, #C8960C 20%, #E8B84B 50%, #C8960C 80%, transparent)",
          }}
        />

        <div className="section-container pt-14 pb-10">
          {/* 3-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-8">

            {/* ─── Col 1: Brand ─────────────────────────────────────────── */}
            <div>
              <Link href="/" className="inline-flex items-center gap-3 group mb-4">
                <div className="relative w-28 h-28 flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src="/maa-flavours-logo.png"
                    alt="Maa Flavours — Authentic Andhra Pickles"
                    fill
                    className="object-contain"
                    sizes="112px"
                  />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-playfair font-bold text-lg" style={{ color: "#F5EFE0" }}>
                    Maa Flavours
                  </span>
                  <span className="font-dancing text-xs" style={{ color: "var(--color-gold-light)" }}>
                    Authentic Andhra Taste
                  </span>
                </div>
              </Link>

              <p
                className="font-dm-sans text-sm leading-relaxed mb-5"
                style={{ color: "rgba(245, 239, 224, 0.65)" }}
              >
                Handcrafted Andhra pickles from Ongole, made the way Maa always made them.
                No preservatives. No shortcuts. Just tradition in every pack.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-3 mb-5">
                {[
                  { href: s.instagram, Icon: Instagram, label: "Instagram" },
                  { href: s.facebook,  Icon: Facebook,  label: "Facebook" },
                ].map(({ href, Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                    aria-label={`Follow on ${label}`}
                    style={{
                      background: "rgba(232, 184, 75, 0.12)",
                      border: "1px solid rgba(232, 184, 75, 0.25)",
                      color: "var(--color-gold-light)",
                    }}
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>

              {/* Veg badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{
                  background: "rgba(46, 125, 50, 0.15)",
                  border: "1px solid rgba(46, 125, 50, 0.3)",
                }}
              >
                <span className="veg-indicator" style={{ width: "14px", height: "14px" }} />
                <span className="font-dm-sans text-xs font-semibold" style={{ color: "#6FCF7A" }}>
                  100% Vegetarian
                </span>
              </div>
            </div>

            {/* ─── Col 2: Policies ──────────────────────────────────────── */}
            <div>
              <h4
                className="font-playfair font-semibold text-base mb-4"
                style={{ color: "var(--color-gold-light)" }}
              >
                Information
              </h4>
              <ul className="flex flex-col gap-2.5">
                {POLICY_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-dm-sans text-sm transition-colors duration-200 hover:text-gold-light"
                      style={{ color: "rgba(245, 239, 224, 0.65)" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ─── Col 3: Contact ────────────────────────────────────────── */}
            <div>
              <h4
                className="font-playfair font-semibold text-base mb-4"
                style={{ color: "var(--color-gold-light)" }}
              >
                Get in Touch
              </h4>
              <ul className="flex flex-col gap-3.5">
                {s.phone && (
                  <li>
                    <a
                      href={`tel:${s.phone}`}
                      className="flex items-start gap-3 font-dm-sans text-sm transition-colors duration-200 hover:text-gold-light group"
                      style={{ color: "rgba(245, 239, 224, 0.65)" }}
                    >
                      <Phone size={15} className="mt-0.5 flex-shrink-0" style={{ color: "var(--color-gold)" }} />
                      {s.phone}
                    </a>
                  </li>
                )}
                {s.email && (
                  <li>
                    <a
                      href={`mailto:${s.email}`}
                      className="flex items-start gap-3 font-dm-sans text-sm transition-colors duration-200 hover:text-gold-light group"
                      style={{ color: "rgba(245, 239, 224, 0.65)" }}
                    >
                      <Mail size={15} className="mt-0.5 flex-shrink-0" style={{ color: "var(--color-gold)" }} />
                      {s.email}
                    </a>
                  </li>
                )}
                {s.address && (
                  <li>
                    <div
                      className="flex items-start gap-3 font-dm-sans text-sm"
                      style={{ color: "rgba(245, 239, 224, 0.65)" }}
                    >
                      <MapPin size={15} className="mt-0.5 flex-shrink-0" style={{ color: "var(--color-gold)" }} />
                      <span>{s.address}</span>
                    </div>
                  </li>
                )}
              </ul>

              {/* WhatsApp CTA */}
              {s.whatsapp && (
                <a
                  href={waLink("Hi! I'd like to order Maa Flavours pickles.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-dm-sans text-sm font-semibold transition-all duration-200 hover:scale-105"
                  style={{
                    background: "#25D366",
                    color: "white",
                    boxShadow: "0 3px 12px rgba(37, 211, 102, 0.35)",
                  }}
                >
                  <MessageCircle size={16} />
                  Chat on WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* ─── Gold ornament divider ─────────────────────────────────── */}
          <div className="ornament-line my-8 opacity-30" />

          {/* ─── Bottom bar ────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p
              className="font-dm-sans text-xs text-center sm:text-left"
              style={{ color: "rgba(245, 239, 224, 0.4)" }}
            >
              © {SITE.copyright_year} Maa Flavours, Ongole, Andhra Pradesh. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="font-dm-sans text-xs" style={{ color: "rgba(245, 239, 224, 0.35)" }}>
                FSSAI: {SITE.fssai}
              </span>
              <span className="font-dm-sans text-xs" style={{ color: "rgba(245, 239, 224, 0.35)" }}>
                Made with ❤️ in Ongole
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── WhatsApp Floating Button ──────────────────────────────────────── */}
      {s.whatsapp && (
        <a
          href={waLink("Hi! I'd like to order Maa Flavours pickles.")}
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-float"
          aria-label="Chat on WhatsApp"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          <span
            className="absolute inset-0 rounded-full animate-ping"
            style={{ background: "rgba(37, 211, 102, 0.4)", animationDuration: "2s" }}
          />
        </a>
      )}
    </>
  );
}

// src/app/about/page.tsx
// Maa Flavours — About Us / Our Story Page
// Sections (in order):
//   1. Hero — cinematic headline over dark brown gradient
//   2. Origin Story — alternating image + text, village origin
//   3. Founder Section — photo, quote, background
//   4. Handcrafted Process — 5-step visual timeline
//   5. What Makes Us Different — 4 value pillars
//   6. In Numbers — 3 stats strip
//   7. FSSAI & Trust — certification note
//   8. CTA — shop + WhatsApp
// All images marked // REPLACE with actual photos

import Link from "next/link";
import {
  Heart, Leaf, ShieldCheck, Truck, Star, Award,
  Clock, Users, MapPin, MessageCircle, ArrowRight, ChevronRight,
} from "lucide-react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import NavbarWithCart from "@/components/layout/NavbarWithCart";
import Footer from "@/components/layout/Footer";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

// ─── Decorative ornament line ─────────────────────────────────────────────
function OrnamentLine({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-px ${className}`}
      style={{
        background:
          "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)",
      }}
    />
  );
}

// ─── Section heading component ────────────────────────────────────────────
function SectionHeading({
  eyebrow, title, subtitle, center = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "text-center" : ""}>
      {eyebrow && (
        <p
          className="font-dancing text-xl mb-2"
          style={{ color: "var(--color-crimson)" }}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className="font-playfair font-bold leading-tight"
        style={{
          color: "var(--color-brown)",
          fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="font-cormorant italic text-lg sm:text-xl mt-3 leading-relaxed max-w-2xl"
          style={{
            color: "var(--color-grey)",
            margin: center ? "0.75rem auto 0" : "0.75rem 0 0",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ─── Image placeholder component ─────────────────────────────────────────
function ImagePlaceholder({
  emoji, label, aspectRatio = "4/3", rounded = "2xl",
}: {
  emoji: string;
  label: string;
  aspectRatio?: string;
  rounded?: string;
}) {
  return (
    // REPLACE with actual photo using Next.js <Image> component
    // Example: <Image src="/images/about/founder.jpg" alt={label} fill className="object-cover" />
    <div
      className={`relative w-full flex flex-col items-center justify-center gap-3 rounded-${rounded} overflow-hidden bg-texture`}
      style={{
        aspectRatio,
        background: "linear-gradient(135deg,#F5EFE0 0%,#EDE3C8 40%,#E4D5B0 100%)",
        border: "1px solid rgba(200,150,12,0.2)",
        boxShadow: "0 8px 32px rgba(74,44,10,0.12)",
      }}
    >
      {/* Subtle corner ornaments */}
      <div className="absolute top-3 left-3 text-xs opacity-30 font-mono"
        style={{ color: "var(--color-gold)" }}>✦</div>
      <div className="absolute top-3 right-3 text-xs opacity-30 font-mono"
        style={{ color: "var(--color-gold)" }}>✦</div>
      <div className="absolute bottom-3 left-3 text-xs opacity-30 font-mono"
        style={{ color: "var(--color-gold)" }}>✦</div>
      <div className="absolute bottom-3 right-3 text-xs opacity-30 font-mono"
        style={{ color: "var(--color-gold)" }}>✦</div>

      <span className="text-6xl sm:text-7xl drop-shadow-sm">{emoji}</span>
      <p
        className="font-cormorant italic text-sm sm:text-base text-center px-4"
        style={{ color: "var(--color-brown)", opacity: 0.6 }}
      >
        {label}
      </p>
    </div>
  );
}

// ─── Process Step ─────────────────────────────────────────────────────────
function ProcessStep({
  number, icon, title, description, isLast = false,
}: {
  number: string;
  icon: string;
  title: string;
  description: string;
  isLast?: boolean;
}) {
  return (
    <div className="flex gap-5 sm:gap-6">
      {/* Left: number + connector line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-playfair font-bold text-white relative z-10"
          style={{
            background: "linear-gradient(135deg,var(--color-crimson) 0%,#8B1A1A 100%)",
            boxShadow: "0 4px 16px rgba(192,39,45,0.3)",
            border: "3px solid rgba(255,255,255,0.9)",
          }}
        >
          {number}
        </div>
        {!isLast && (
          <div
            className="flex-1 w-0.5 my-2 min-h-[40px]"
            style={{
              background:
                "linear-gradient(180deg,var(--color-gold) 0%,rgba(200,150,12,0.2) 100%)",
            }}
          />
        )}
      </div>

      {/* Right: content */}
      <div className={`pb-${isLast ? "0" : "8"} sm:pb-${isLast ? "0" : "10"} pt-1`}>
        <div className="flex items-center gap-2.5 mb-2">
          <span className="text-2xl">{icon}</span>
          <h3
            className="font-dm-sans font-bold text-base sm:text-lg"
            style={{ color: "var(--color-brown)" }}
          >
            {title}
          </h3>
        </div>
        <p
          className="font-dm-sans text-sm sm:text-base leading-relaxed"
          style={{ color: "var(--color-grey)" }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

// ─── Value Pillar ─────────────────────────────────────────────────────────
function ValuePillar({
  icon: Icon, color, bg, title, description,
}: {
  icon: React.FC<any>;
  color: string;
  bg: string;
  title: string;
  description: string;
}) {
  return (
    <div
      className="flex flex-col gap-4 p-6 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{
        background: "white",
        border: "1px solid rgba(200,150,12,0.12)",
        boxShadow: "0 4px 16px rgba(74,44,10,0.06)",
      }}
    >
      {/* Gold ornament top */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-3xl"
        style={{ display: "none" }}
      />

      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: bg }}
      >
        <Icon size={26} strokeWidth={1.75} style={{ color }} />
      </div>

      <div>
        <h3
          className="font-dm-sans font-bold text-base mb-2"
          style={{ color: "var(--color-brown)" }}
        >
          {title}
        </h3>
        <p
          className="font-dm-sans text-sm leading-relaxed"
          style={{ color: "var(--color-grey)" }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────
function StatCard({
  value, unit, label, emoji,
}: {
  value: string;
  unit?: string;
  label: string;
  emoji: string;
}) {
  return (
    <div
      className="text-center px-6 py-8 rounded-3xl"
      style={{
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(232,184,75,0.25)",
        backdropFilter: "blur(8px)",
      }}
    >
      <span className="text-3xl">{emoji}</span>
      <div className="flex items-end justify-center gap-1 mt-3">
        <span
          className="font-playfair font-bold leading-none"
          style={{ fontSize: "clamp(2.25rem, 6vw, 3.5rem)", color: "var(--color-gold-light)" }}
        >
          {value}
        </span>
        {unit && (
          <span
            className="font-playfair font-bold text-xl mb-1"
            style={{ color: "rgba(232,184,75,0.7)" }}
          >
            {unit}
          </span>
        )}
      </div>
      <p
        className="font-dm-sans text-sm mt-2"
        style={{ color: "rgba(255,255,255,0.6)" }}
      >
        {label}
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default async function AboutPage() {
  // Fetch WhatsApp number dynamically from settings
  let waNumber = "919876543210"; // fallback
  try {
    const supabase = createAdminSupabaseClient();
    const { data } = await supabase
      .from("settings").select("value").eq("key", "social").single();
    const raw: string = data?.value?.whatsapp_number || "";
    const digits = raw.replace(/\D/g, "");
    if (digits) waNumber = digits;
  } catch { /* use fallback */ }

  const waLink = `https://wa.me/${waNumber}?text=Hello%2C%20I%20saw%20your%20story%20on%20maaflavours.com%20and%20I%27d%20love%20to%20know%20more%20about%20your%20pickles!`;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-warm-white)" }}>
      <AnnouncementBar />
      <NavbarWithCart />

      <main className="flex-1">

        {/* ══════════════════════════════════════════════════
            SECTION 1 — HERO
        ══════════════════════════════════════════════════ */}
        <section
          className="relative overflow-hidden"
          style={{
            background: "linear-gradient(160deg,#3A1E08 0%,#5C3010 45%,#4A2C0A 100%)",
            minHeight: "clamp(420px,55vh,620px)",
          }}
        >
          {/* Linen texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
              backgroundSize: "10px 10px",
            }}
          />

          {/* Gold top ornament */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background:
                "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)",
            }}
          />

          {/* Radial warm glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 40%,rgba(200,150,12,0.12) 0%,transparent 70%)",
            }}
          />

          {/* Content */}
          <div className="section-container relative z-10 flex flex-col items-center justify-center text-center h-full py-20 sm:py-28">
            <p
              className="font-dancing text-2xl sm:text-3xl mb-4"
              style={{ color: "var(--color-gold-light)" }}
            >
              Our Story
            </p>

            <OrnamentLine className="w-32 mb-6 mx-auto" />

            <h1
              className="font-playfair font-bold text-white leading-tight mb-6"
              style={{ fontSize: "clamp(2.25rem, 6vw, 4.5rem)", maxWidth: "14ch" }}
            >
              Made with Love,{" "}
              <span style={{ color: "var(--color-gold-light)" }}>
                Bottled with Tradition
              </span>
            </h1>

            <p
              className="font-cormorant italic text-lg sm:text-2xl leading-relaxed mb-8"
              style={{ color: "rgba(255,255,255,0.72)", maxWidth: "42ch" }}
            >
              From a small kitchen in Ongole, Andhra Pradesh, to pickle-lovers
              across India — this is the story of Maa Flavours.
            </p>

            {/* Breadcrumb */}
            <div
              className="flex items-center gap-2 font-dm-sans text-xs"
              style={{ color: "rgba(232,184,75,0.6)" }}
            >
              <Link href="/" className="hover:opacity-80 transition-opacity">Home</Link>
              <ChevronRight size={12} />
              <span style={{ color: "var(--color-gold-light)" }}>Our Story</span>
            </div>
          </div>

          {/* Bottom wave */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{ height: "60px" }}
          >
            <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-full">
              <path
                d="M0,60 L0,30 Q360,0 720,30 Q1080,60 1440,20 L1440,60 Z"
                fill="var(--color-warm-white)"
              />
            </svg>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            SECTION 2 — ORIGIN STORY
        ══════════════════════════════════════════════════ */}
        <section className="section-padding" style={{ background: "var(--color-warm-white)" }}>
          <div className="section-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

              {/* Image */}
              <div className="relative">
                <ImagePlaceholder
                  emoji="🏡"
                  label="A kitchen in Ongole where it all began"
                  aspectRatio="4/3"
                />
                {/* Floating badge */}
                <div
                  className="absolute -bottom-5 -right-3 sm:-right-6 px-4 py-3 rounded-2xl shadow-xl"
                  style={{
                    background: "white",
                    border: "1px solid rgba(200,150,12,0.2)",
                    boxShadow: "0 8px 24px rgba(74,44,10,0.15)",
                  }}
                >
                  <p className="font-dancing text-xl" style={{ color: "var(--color-crimson)" }}>
                    Est. in Ongole
                  </p>
                  <p className="font-dm-sans text-xs mt-0.5" style={{ color: "var(--color-grey)" }}>
                    Andhra Pradesh, India
                  </p>
                </div>
              </div>

              {/* Text */}
              <div className="flex flex-col gap-6">
                <SectionHeading
                  eyebrow="Where It All Began"
                  title="A Recipe Older Than Memory"
                  subtitle="Some flavours live in a grandmother's hands, in the way she balanced spice with patience. Maa Flavours was born from exactly that."
                />

                <OrnamentLine className="w-20" />

                <div
                  className="flex flex-col gap-4 font-dm-sans text-base leading-loose"
                  style={{ color: "var(--color-grey)" }}
                >
                  <p>
                    In the sun-drenched town of <strong style={{ color: "var(--color-brown)" }}>Ongole, Andhra Pradesh</strong>,
                    every household had its own pickle recipe — passed silently from mother to daughter, from grandmother to granddaughter, never quite written down.
                  </p>
                  <p>
                    Our founder grew up watching Maa prepare pickles every summer. The careful selection of raw mangoes, the precise ratio of mustard and fenugreek, the cold-pressed sesame oil — each step deliberate, unhurried, full of intention.
                  </p>
                  <p>
                    When family and friends began asking for jars to take home — and then asking for more — a brand was born. Not a factory. Not a production line. Just an honest kitchen, honest hands, and recipes that have{" "}
                    <em style={{ color: "var(--color-brown)" }}>never needed preservatives</em> because they were never designed to be anything but real.
                  </p>
                </div>

                {/* Location pill */}
                <div className="flex items-center gap-2">
                  <MapPin size={16} style={{ color: "var(--color-crimson)" }} />
                  <span className="font-dm-sans text-sm font-semibold" style={{ color: "var(--color-brown)" }}>
                    Handcrafted in Ongole, Andhra Pradesh
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            SECTION 3 — FOUNDER
        ══════════════════════════════════════════════════ */}
        <section
          className="section-padding relative overflow-hidden"
          style={{ background: "var(--color-cream)" }}
        >
          {/* Background texture */}
          <div className="absolute inset-0 bg-texture opacity-60" />

          <div className="section-container relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

              {/* Text first on mobile, second on desktop */}
              <div className="lg:order-1 order-2 flex flex-col gap-6">
                <SectionHeading
                  eyebrow="The Hands Behind Every Jar"
                  title="Meet the Founder"
                />

                <OrnamentLine className="w-20" />

                {/* Pull quote */}
                <blockquote
                  className="relative pl-6"
                  style={{ borderLeft: "3px solid var(--color-gold)" }}
                >
                  <p
                    className="font-cormorant italic text-xl sm:text-2xl leading-relaxed"
                    style={{ color: "var(--color-brown)" }}
                  >
                    "I didn't start a business. I started sharing what Maa used to
                    make — and people just couldn't get enough of it."
                  </p>
                  <footer className="mt-3 font-dm-sans text-sm" style={{ color: "var(--color-grey)" }}>
                    — Founder, Maa Flavours, Ongole
                  </footer>
                </blockquote>

                <div
                  className="flex flex-col gap-3 font-dm-sans text-base leading-loose"
                  style={{ color: "var(--color-grey)" }}
                >
                  <p>
                    A native of Ongole, our founder grew up in a home where cooking was an act of love and tradition was the highest form of respect. After years of gifting handmade pickle jars to family and colleagues, the response was always the same: <em>"Can I get more?"</em>
                  </p>
                  <p>
                    What started as a festive tradition became <strong style={{ color: "var(--color-brown)" }}>Maa Flavours</strong> — a small-batch pickle brand committed to preserving authentic Andhra recipes exactly as they were meant to be made: by hand, in small quantities, without compromise.
                  </p>
                </div>

                {/* Mini credentials strip */}
                <div className="flex flex-wrap gap-3">
                  {[
                    { icon: "🏡", text: "Ongole-born" },
                    { icon: "🤲", text: "Family recipes" },
                    { icon: "🌿", text: "No preservatives" },
                  ].map((item) => (
                    <div
                      key={item.text}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl"
                      style={{
                        background: "white",
                        border: "1px solid rgba(200,150,12,0.2)",
                        boxShadow: "0 2px 8px rgba(74,44,10,0.06)",
                      }}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span
                        className="font-dm-sans text-xs font-semibold"
                        style={{ color: "var(--color-brown)" }}
                      >
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Founder photo */}
              <div className="lg:order-2 order-1 relative">
                {/* REPLACE with actual founder photo */}
                <div className="relative">
                  <ImagePlaceholder
                    emoji="👩‍🍳"
                    label="Founder — Maa Flavours, Ongole"
                    aspectRatio="3/4"
                    rounded="3xl"
                  />

                  {/* Rating badge */}
                  <div
                    className="absolute -bottom-5 left-4 sm:left-8 px-4 py-3 rounded-2xl shadow-xl"
                    style={{
                      background: "white",
                      border: "1px solid rgba(200,150,12,0.2)",
                      boxShadow: "0 8px 24px rgba(74,44,10,0.15)",
                    }}
                  >
                    <div className="flex items-center gap-1 mb-0.5">
                      {Array(5).fill(0).map((_, i) => (
                        <Star key={i} size={14} fill="var(--color-gold)" strokeWidth={0} />
                      ))}
                    </div>
                    <p className="font-dm-sans font-bold text-sm" style={{ color: "var(--color-brown)" }}>
                      500+ happy jars
                    </p>
                    <p className="font-dm-sans text-xs" style={{ color: "var(--color-grey)" }}>
                      delivered across India
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            SECTION 4 — HANDCRAFTED PROCESS
        ══════════════════════════════════════════════════ */}
        <section
          className="section-padding"
          style={{ background: "var(--color-warm-white)" }}
        >
          <div className="section-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">

              {/* Left: sticky image */}
              <div className="lg:sticky lg:top-28">
                <ImagePlaceholder
                  emoji="🫙"
                  label="Handcrafting authentic Andhra pickles, one jar at a time"
                  aspectRatio="3/4"
                  rounded="3xl"
                />

                {/* Process promise */}
                <div
                  className="mt-5 px-5 py-4 rounded-2xl"
                  style={{
                    background: "var(--color-cream)",
                    border: "1px solid rgba(200,150,12,0.18)",
                  }}
                >
                  <p
                    className="font-dm-sans font-bold text-sm"
                    style={{ color: "var(--color-brown)" }}
                  >
                    🕐 Made in small batches
                  </p>
                  <p
                    className="font-dm-sans text-xs mt-1 leading-relaxed"
                    style={{ color: "var(--color-grey)" }}
                  >
                    Every jar is made fresh. We never stockpile. No big batches,
                    no assembly line — just the right amount, the right way.
                  </p>
                </div>
              </div>

              {/* Right: process steps */}
              <div>
                <SectionHeading
                  eyebrow="Our Process"
                  title="Five Steps. Zero Shortcuts."
                  subtitle="This is how every single jar of Maa Flavours is made — and it's been this way since the very first batch."
                />

                <OrnamentLine className="w-20 my-7" />

                <div className="flex flex-col">
                  {[
                    {
                      number: "01",
                      icon: "🌱",
                      title: "Source Fresh, Local Ingredients",
                      description:
                        "We hand-pick our raw materials — mangoes, amla, gongura, lemon, chillies — fresh from local Andhra markets. No imported ingredients, no frozen produce. If it's not fresh, it doesn't go in.",
                    },
                    {
                      number: "02",
                      icon: "⚖️",
                      title: "Measure the Traditional Way",
                      description:
                        "Recipes passed through generations are measured by feel as much as by weight. The ratio of red chilli, mustard, fenugreek, and oil is exact — born from decades of fine-tuning, not a corporate formula.",
                    },
                    {
                      number: "03",
                      icon: "🤲",
                      title: "Mix and Marinate by Hand",
                      description:
                        "No machines touch the marinade. Ingredients are blended and massaged by hand to ensure the spices coat every piece evenly. This is the step that makes the biggest difference — and it's the one no machine can replicate.",
                    },
                    {
                      number: "04",
                      icon: "🪴",
                      title: "Mature in Earthen Tradition",
                      description:
                        "The pickle is allowed to rest and mature — the way Andhra grandmothers always did it. This slow maturing amplifies flavour naturally, without any artificial aids. Good things take time.",
                    },
                    {
                      number: "05",
                      icon: "📦",
                      title: "Pack Fresh, Ship with Care",
                      description:
                        "Each jar is cleaned, filled by hand, sealed airtight, and labelled before dispatch. We pack only what we ship — no sitting in warehouses. Your pickle reaches you as fresh as the day it was made.",
                    },
                  ].map((step, idx, arr) => (
                    <ProcessStep
                      key={step.number}
                      {...step}
                      isLast={idx === arr.length - 1}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            SECTION 5 — VALUES / WHAT MAKES US DIFFERENT
        ══════════════════════════════════════════════════ */}
        <section
          className="section-padding"
          style={{ background: "var(--color-cream)" }}
        >
          <div className="section-container">
            <div className="text-center mb-12 sm:mb-16">
              <SectionHeading
                eyebrow="Our Promises"
                title="What Makes Maa Flavours Different"
                subtitle="We don't just make pickle. We make a promise — with every jar."
                center
              />
              <OrnamentLine className="w-24 mx-auto mt-7" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <ValuePillar
                icon={Leaf}
                color="#2E7D32"
                bg="rgba(46,125,50,0.1)"
                title="No Preservatives. Ever."
                description="Our pickles are preserved the traditional way — with oil, salt, and spice. No chemicals, no artificial preservatives, no shortcuts. The recipe is the preservative."
              />
              <ValuePillar
                icon={Heart}
                color="var(--color-crimson)"
                bg="rgba(192,39,45,0.08)"
                title="Truly Homemade"
                description="Not 'inspired by home cooking.' Actually made at home, by hand, in our kitchen in Ongole. Every jar reflects the same care as a meal made for family."
              />
              <ValuePillar
                icon={ShieldCheck}
                color="var(--color-gold)"
                bg="rgba(200,150,12,0.1)"
                title="100% Vegetarian"
                description="All our pickles are 100% vegetarian — no animal products, no cross-contamination. The green dot on every jar is our promise, not just a label."
              />
              <ValuePillar
                icon={Truck}
                color="var(--color-brown)"
                bg="rgba(74,44,10,0.08)"
                title="Pan-India Delivery"
                description="From Ongole's kitchen to your door — wherever you are in India. We pack each jar with the same care whether it's going next door or across the country."
              />
            </div>

            {/* Bonus row: 2 more pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 max-w-2xl mx-auto">
              <ValuePillar
                icon={Clock}
                color="var(--color-crimson)"
                bg="rgba(192,39,45,0.07)"
                title="Made-to-Order"
                description="We make in small batches so your pickle is always fresh. No months-old stock sitting on shelves — every order is prepared with intention."
              />
              <ValuePillar
                icon={Users}
                color="var(--color-gold)"
                bg="rgba(200,150,12,0.08)"
                title="Family Recipes Only"
                description="Every product on our menu is a recipe that has been in the family for generations. We haven't invented anything — we've preserved everything."
              />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            SECTION 6 — STATS / IN NUMBERS
        ══════════════════════════════════════════════════ */}
        <section
          className="section-padding relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg,#3A1E08 0%,#5C3010 50%,#4A2C0A 100%)",
          }}
        >
          {/* Texture */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
              backgroundSize: "10px 10px",
            }}
          />

          {/* Top ornament */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background:
                "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)",
            }}
          />

          <div className="section-container relative z-10">
            <div className="text-center mb-12">
              <p
                className="font-dancing text-2xl mb-2"
                style={{ color: "var(--color-gold-light)" }}
              >
                By the numbers
              </p>
              <h2
                className="font-playfair font-bold text-3xl sm:text-4xl text-white"
              >
                Small Kitchen, Big Impact
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
              <StatCard
                value="500"
                unit="+"
                label="Happy customers across India"
                emoji="😊"
              />
              <StatCard
                value="6"
                label="Authentic Andhra pickle varieties"
                emoji="🫙"
              />
              <StatCard
                value="0"
                label="Preservatives. Ever. In any jar."
                emoji="🌿"
              />
            </div>
          </div>

          {/* Bottom wave */}
          <div className="absolute bottom-0 left-0 right-0" style={{ height: "60px" }}>
            <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-full">
              <path
                d="M0,60 L0,40 Q360,10 720,40 Q1080,70 1440,30 L1440,60 Z"
                fill="var(--color-warm-white)"
              />
            </svg>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            SECTION 7 — FSSAI & TRUST
        ══════════════════════════════════════════════════ */}
        <section
          className="section-padding"
          style={{ background: "var(--color-warm-white)" }}
        >
          <div className="section-container">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <SectionHeading
                  eyebrow="Safety & Certification"
                  title="You Deserve to Know What's in Your Jar"
                  center
                />
                <OrnamentLine className="w-24 mx-auto mt-7" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* FSSAI card */}
                <div
                  className="p-6 rounded-3xl flex flex-col gap-4"
                  style={{
                    background: "var(--color-cream)",
                    border: "1px solid rgba(200,150,12,0.2)",
                    boxShadow: "0 4px 16px rgba(74,44,10,0.07)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                      style={{ background: "white", border: "1px solid rgba(200,150,12,0.2)" }}
                    >
                      🏛️
                    </div>
                    <div>
                      <p
                        className="font-dm-sans font-bold text-sm"
                        style={{ color: "var(--color-brown)" }}
                      >
                        FSSAI Registration
                      </p>
                      <span
                        className="inline-block font-dm-sans text-xs font-semibold px-2.5 py-1 rounded-full mt-0.5"
                        style={{
                          background: "rgba(200,150,12,0.12)",
                          color: "var(--color-gold)",
                        }}
                      >
                        Application In Progress
                      </span>
                    </div>
                  </div>
                  <p
                    className="font-dm-sans text-sm leading-relaxed"
                    style={{ color: "var(--color-grey)" }}
                  >
                    We are currently in the process of obtaining our FSSAI Food Business Operator license.
                    All our products are made under strict hygiene conditions with ingredients you can
                    read and recognise. <strong style={{ color: "var(--color-brown)" }}>Certification coming soon.</strong>
                  </p>
                </div>

                {/* Ingredient transparency */}
                <div
                  className="p-6 rounded-3xl flex flex-col gap-4"
                  style={{
                    background: "var(--color-cream)",
                    border: "1px solid rgba(46,125,50,0.2)",
                    boxShadow: "0 4px 16px rgba(74,44,10,0.07)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                      style={{ background: "white", border: "1px solid rgba(46,125,50,0.15)" }}
                    >
                      🌱
                    </div>
                    <div>
                      <p className="font-dm-sans font-bold text-sm" style={{ color: "var(--color-brown)" }}>
                        Full Ingredient Transparency
                      </p>
                      <span
                        className="inline-block font-dm-sans text-xs font-semibold px-2.5 py-1 rounded-full mt-0.5"
                        style={{ background: "rgba(46,125,50,0.1)", color: "#2E7D32" }}
                      >
                        ✓ Always honest
                      </span>
                    </div>
                  </div>
                  <p
                    className="font-dm-sans text-sm leading-relaxed"
                    style={{ color: "var(--color-grey)" }}
                  >
                    Every product page lists the complete ingredient list. No hidden additives,
                    no vague "natural flavours." What you read is exactly what's in the jar —
                    because that's the only way Maa ever cooked.
                  </p>
                </div>

                {/* Hygiene */}
                <div
                  className="p-6 rounded-3xl flex flex-col gap-4"
                  style={{
                    background: "var(--color-cream)",
                    border: "1px solid rgba(200,150,12,0.18)",
                    boxShadow: "0 4px 16px rgba(74,44,10,0.07)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                      style={{ background: "white", border: "1px solid rgba(200,150,12,0.15)" }}
                    >
                      🧼
                    </div>
                    <div>
                      <p className="font-dm-sans font-bold text-sm" style={{ color: "var(--color-brown)" }}>
                        Hygienic Kitchen Standards
                      </p>
                      <span
                        className="inline-block font-dm-sans text-xs font-semibold px-2.5 py-1 rounded-full mt-0.5"
                        style={{ background: "rgba(200,150,12,0.1)", color: "var(--color-gold)" }}
                      >
                        Clean & Careful
                      </span>
                    </div>
                  </div>
                  <p
                    className="font-dm-sans text-sm leading-relaxed"
                    style={{ color: "var(--color-grey)" }}
                  >
                    Our kitchen is cleaned before every batch. All surfaces, tools, and jars are
                    sterilised. We take food safety personally — because this is food we feed
                    our own family too.
                  </p>
                </div>

                {/* Veg guarantee */}
                <div
                  className="p-6 rounded-3xl flex flex-col gap-4"
                  style={{
                    background: "var(--color-cream)",
                    border: "1px solid rgba(46,125,50,0.2)",
                    boxShadow: "0 4px 16px rgba(74,44,10,0.07)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                      style={{ background: "white", border: "1px solid rgba(46,125,50,0.15)" }}
                    >
                      ✅
                    </div>
                    <div>
                      <p className="font-dm-sans font-bold text-sm" style={{ color: "var(--color-brown)" }}>
                        100% Vegetarian
                      </p>
                      <span
                        className="inline-block font-dm-sans text-xs font-semibold px-2.5 py-1 rounded-full mt-0.5"
                        style={{ background: "rgba(46,125,50,0.1)", color: "#2E7D32" }}
                      >
                        ✓ Certified
                      </span>
                    </div>
                  </div>
                  <p
                    className="font-dm-sans text-sm leading-relaxed"
                    style={{ color: "var(--color-grey)" }}
                  >
                    Not one ingredient across all our pickles contains any animal product.
                    Zero compromise. The green dot on our label is a guarantee, not a marketing claim.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            SECTION 8 — MISSION STATEMENT
        ══════════════════════════════════════════════════ */}
        <section
          className="section-padding bg-texture relative"
          style={{ background: "var(--color-cream)" }}
        >
          <div className="section-container">
            <div
              className="max-w-3xl mx-auto rounded-3xl overflow-hidden"
              style={{
                background: "white",
                border: "1px solid rgba(200,150,12,0.15)",
                boxShadow: "0 8px 40px rgba(74,44,10,0.08)",
              }}
            >
              {/* Gold ornament */}
              <div
                className="h-1"
                style={{
                  background:
                    "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)",
                }}
              />

              <div className="px-8 sm:px-12 py-10 sm:py-14 text-center">
                <div className="ornament-diamond mb-8" />

                <p
                  className="font-dancing text-2xl mb-4"
                  style={{ color: "var(--color-crimson)" }}
                >
                  Our Mission
                </p>

                <p
                  className="font-playfair font-bold leading-tight mb-6"
                  style={{
                    color: "var(--color-brown)",
                    fontSize: "clamp(1.4rem, 3.5vw, 2.25rem)",
                  }}
                >
                  To keep Andhra's pickle tradition alive — one honest jar at a time.
                </p>

                <OrnamentLine className="w-20 mx-auto mb-6" />

                <p
                  className="font-cormorant italic text-xl leading-relaxed"
                  style={{ color: "var(--color-grey)", maxWidth: "38ch", margin: "0 auto" }}
                >
                  In a world of factory food and chemical shortcuts, we choose the long way —
                  because the long way is the right way, and the right way tastes better.
                </p>

                <div className="flex flex-wrap gap-3 justify-center mt-8">
                  {["No Preservatives", "Homemade", "Traditional Recipes", "Pan-India Delivery", "100% Vegetarian"].map((tag) => (
                    <span
                      key={tag}
                      className="font-dm-sans text-xs font-semibold px-3.5 py-2 rounded-full"
                      style={{
                        background: "var(--color-cream)",
                        color: "var(--color-brown)",
                        border: "1px solid rgba(200,150,12,0.2)",
                      }}
                    >
                      ✦ {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom: founder signature */}
              <div
                className="px-8 sm:px-12 py-6 flex items-center justify-between gap-4 flex-wrap border-t"
                style={{ borderColor: "rgba(200,150,12,0.1)", background: "var(--color-cream)" }}
              >
                <div>
                  <p
                    className="font-dancing text-2xl"
                    style={{ color: "var(--color-crimson)" }}
                  >
                    Maa Flavours
                  </p>
                  <p
                    className="font-dm-sans text-xs mt-0.5"
                    style={{ color: "var(--color-grey)" }}
                  >
                    Ongole, Andhra Pradesh · Est. with love
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} size={14} fill="var(--color-gold)" strokeWidth={0} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            SECTION 9 — CTA
        ══════════════════════════════════════════════════ */}
        <section
          className="section-padding relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg,#3A1E08 0%,#5C3010 60%,#4A2C0A 100%)",
          }}
        >
          {/* Texture */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
              backgroundSize: "10px 10px",
            }}
          />

          <div className="section-container relative z-10 text-center">
            <p
              className="font-dancing text-2xl sm:text-3xl mb-4"
              style={{ color: "var(--color-gold-light)" }}
            >
              Taste the Story
            </p>

            <h2
              className="font-playfair font-bold text-white leading-tight mb-4"
              style={{ fontSize: "clamp(1.75rem, 4.5vw, 3rem)" }}
            >
              The best way to understand our story
              <br />
              <span style={{ color: "var(--color-gold-light)" }}>
                is to taste it.
              </span>
            </h2>

            <p
              className="font-cormorant italic text-xl leading-relaxed mb-10 mx-auto"
              style={{ color: "rgba(255,255,255,0.65)", maxWidth: "40ch" }}
            >
              Six authentic Andhra pickles, handcrafted in Ongole, delivered to your door — no preservatives, no shortcuts, no compromise.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/products"
                className="flex items-center gap-2.5 px-8 py-4 rounded-xl font-dm-sans font-bold text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl"
                style={{
                  background: "var(--color-crimson)",
                  color: "white",
                  boxShadow: "0 4px 20px rgba(192,39,45,0.4)",
                }}
              >
                Shop All Pickles <ArrowRight size={18} />
              </Link>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-8 py-4 rounded-xl font-dm-sans font-bold text-base transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "2px solid rgba(232,184,75,0.4)",
                  color: "var(--color-gold-light)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <MessageCircle size={18} />
                Chat on WhatsApp
              </a>
            </div>

            {/* Trust strip */}
            <div
              className="mt-12 pt-8 flex flex-wrap items-center justify-center gap-6"
              style={{ borderTop: "1px solid rgba(232,184,75,0.15)" }}
            >
              {[
                { icon: "🌿", text: "No Preservatives" },
                { icon: "🤲", text: "Handmade in Ongole" },
                { icon: "🚚", text: "Pan-India Delivery" },
                { icon: "✅", text: "100% Vegetarian" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  <span
                    className="font-dm-sans text-sm"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

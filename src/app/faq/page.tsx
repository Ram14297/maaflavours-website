"use client";
// src/app/faq/page.tsx
// Maa Flavours — Frequently Asked Questions
// Accordion UI with 6 categories, 28 Q&As
// Client component for accordion interactivity

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import NavbarWithCart from "@/components/layout/NavbarWithCart";
import Footer from "@/components/layout/Footer";

// ─── FAQ data ─────────────────────────────────────────────────────────────
const FAQ_CATEGORIES = [
  {
    emoji: "🛒",
    title: "Ordering & Payment",
    items: [
      {
        q: "How do I place an order on Maa Flavours?",
        a: "Simply browse our product page, select your pickle and size, add to cart, and proceed to checkout. We accept UPI, debit/credit cards, net banking, and Cash on Delivery (COD). No account is required to order, but creating one lets you track your orders and save addresses.",
      },
      {
        q: "Do you accept Cash on Delivery (COD)?",
        a: "Yes! COD is available across India. A convenience charge of ₹30 is added to COD orders. For orders above ₹499, shipping is free — the COD charge is separate from shipping.",
      },
      {
        q: "Is it safe to pay online on your website?",
        a: "Absolutely. All payments are processed through Razorpay, one of India's most trusted payment gateways. We never store your card details. All transactions are encrypted with industry-standard SSL.",
      },
      {
        q: "Can I apply a coupon code at checkout?",
        a: "Yes. Enter your coupon code in the designated field at checkout. New customers can use WELCOME50 for ₹50 off their first order (minimum order ₹299). Coupon codes are case-insensitive.",
      },
      {
        q: "Can I modify or cancel my order after placing it?",
        a: "Orders can be modified or cancelled within 2 hours of placing — contact us immediately via WhatsApp (+91 97014 52929). Once the pickle is packed and dispatched, cancellations are not possible.",
      },
    ],
  },
  {
    emoji: "🚚",
    title: "Shipping & Delivery",
    items: [
      {
        q: "Do you deliver across all of India?",
        a: "Yes — we deliver Pan-India, to all states and union territories. This includes remote areas via standard courier partners. Delivery to some remote PIN codes may take an extra 1–2 days.",
      },
      {
        q: "How long does delivery take?",
        a: "Standard delivery takes 5–7 working days. Metro cities (Hyderabad, Mumbai, Bangalore, Delhi, Chennai) typically receive orders in 4–5 days. Remote areas may take up to 8–10 days.",
      },
      {
        q: "Is shipping free?",
        a: "Yes — free shipping on all orders above ₹499. For orders below ₹499, a flat shipping charge of ₹60 applies.",
      },
      {
        q: "How do I track my order?",
        a: "Once your order is dispatched, you'll receive a tracking ID via SMS and on your Order Details page (My Account → Orders). You can track directly on the courier's website using this ID.",
      },
      {
        q: "What courier services do you use?",
        a: "We partner with DTDC, BlueDart, and India Post for reliable Pan-India delivery. The courier is assigned based on your PIN code for optimal delivery speed.",
      },
    ],
  },
  {
    emoji: "🫙",
    title: "Products & Quality",
    items: [
      {
        q: "Are your pickles really homemade?",
        a: "Yes — genuinely. Every jar is made in our kitchen in Ongole, Andhra Pradesh, following generations-old family recipes. No factory, no production line. Small batches, by hand, every time.",
      },
      {
        q: "Do your pickles contain any preservatives?",
        a: "Zero preservatives. Our pickles are preserved the traditional way — with high-quality oil, salt, and spice ratios that have been protecting food for centuries. No citric acid, no sodium benzoate, no potassium sorbate.",
      },
      {
        q: "How long do the pickles stay fresh?",
        a: "At room temperature: 2–3 months. Refrigerated: up to 6 months. Key rule: always use a dry spoon. Moisture is the only thing that shortens the shelf life of a properly made traditional pickle.",
      },
      {
        q: "Are all your products 100% vegetarian?",
        a: "Yes — every single product is 100% vegetarian. No animal products of any kind in any of our pickles. The green dot on every jar is a guarantee.",
      },
      {
        q: "What oil do you use?",
        a: "We use cold-pressed sesame oil (gingelly oil) for most of our pickles — the traditional Andhra choice that also acts as a natural preservative. For some variants, refined groundnut oil is used. Check individual product pages for details.",
      },
      {
        q: "Do you have FSSAI certification?",
        a: "Our FSSAI Food Business Operator registration is currently in progress. All our products are made under strict hygiene conditions with ingredients that are fully disclosed on every product page. Certification expected soon.",
      },
    ],
  },
  {
    emoji: "↩️",
    title: "Returns & Replacements",
    items: [
      {
        q: "What is your return policy?",
        a: "We don't accept returns of opened pickle jars for hygiene reasons — once a food product is opened, it cannot be resold. However, if you receive a damaged, leaking, or incorrect product, we will replace it or refund you in full. No questions asked.",
      },
      {
        q: "My jar arrived damaged — what do I do?",
        a: "Please photograph the damaged jar and packaging, and send it to us via WhatsApp (+91 97014 52929) or email (support@maaflavours.com) within 48 hours of delivery. We'll arrange a replacement or full refund immediately.",
      },
      {
        q: "I received the wrong product — what now?",
        a: "We sincerely apologise. Please contact us within 48 hours with your order ID and a photo. We'll dispatch the correct product at no charge, or refund you if your preferred product is unavailable.",
      },
      {
        q: "How long does a refund take?",
        a: "Approved refunds are processed within 2–3 working days. The amount reflects in your account within 5–7 working days depending on your bank. UPI refunds typically arrive faster (1–3 days).",
      },
    ],
  },
  {
    emoji: "👤",
    title: "Account & Login",
    items: [
      {
        q: "How do I create an account?",
        a: "Click the account icon in the top navigation. Enter your email address, receive an OTP code, verify, and you're in. If you're a new user, we'll ask for your name — that's it. No passwords to remember.",
      },
      {
        q: "I didn't receive my OTP — what should I do?",
        a: "First, check that you entered the correct 10-digit mobile number. Wait 30 seconds, then use the 'Resend OTP' option. If it still doesn't arrive, contact us via WhatsApp and we'll manually verify your account.",
      },
      {
        q: "Can I use Maa Flavours without creating an account?",
        a: "Yes — you can browse and add items to cart without logging in. You will need to log in or enter your details at checkout to place an order. We recommend creating an account to track orders and save addresses.",
      },
      {
        q: "How do I delete my account?",
        a: "We don't have a self-serve account deletion option yet. Please email us at support@maaflavours.com with your registered mobile number and we'll delete your account and all associated data within 7 working days.",
      },
    ],
  },
  {
    emoji: "🌶️",
    title: "Pickle Questions",
    items: [
      {
        q: "Which pickle is best for beginners or those with low spice tolerance?",
        a: "We recommend our Maamidi Allam (mango ginger pickle) — it's medium spicy with sweet notes that balance the heat beautifully. Our Amla Pickle is also mild-to-medium with more sour notes than spice.",
      },
      {
        q: "What's the best pickle to pair with dosa?",
        a: "Maamidi Allam is the traditional Andhra choice for dosa. Its sweet-sour-spicy combination works beautifully in place of chutney. Our Lemon Pickle is also excellent with plain dosa.",
      },
      {
        q: "Do you offer bulk or wholesale orders?",
        a: "Yes — we offer bulk pricing for orders of 20+ jars. We also supply to restaurants and cloud kitchens in Andhra Pradesh and Telangana. Contact us via WhatsApp (+91 97014 52929) to discuss pricing and availability.",
      },
      {
        q: "Can I gift Maa Flavours pickles?",
        a: "Absolutely! Our pickles make beautiful traditional gifts for Diwali, Ugadi, Sankranti, and any occasion. Contact us for gift packaging options. We can add a personalised message card at no charge.",
      },
    ],
  },
];

// ─── Accordion Item ────────────────────────────────────────────────────────
function AccordionItem({
  question, answer, isOpen, onClick,
}: {
  question: string; answer: string; isOpen: boolean; onClick: () => void;
}) {
  return (
    <div className="border-b transition-all duration-200"
      style={{ borderColor: "rgba(200,150,12,0.1)" }}>
      <button onClick={onClick}
        className="w-full flex items-start justify-between gap-4 py-5 text-left"
        aria-expanded={isOpen}>
        <span className="font-dm-sans font-semibold text-sm sm:text-base leading-snug flex-1"
          style={{ color: isOpen ? "var(--color-crimson)" : "var(--color-brown)" }}>
          {question}
        </span>
        <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 transition-all duration-200"
          style={{
            background: isOpen ? "rgba(192,39,45,0.1)" : "rgba(200,150,12,0.08)",
            border: `1px solid ${isOpen ? "rgba(192,39,45,0.25)" : "rgba(200,150,12,0.2)"}`,
          }}>
          <ChevronDown size={14}
            className="transition-transform duration-200"
            style={{ color: isOpen ? "var(--color-crimson)" : "var(--color-gold)", transform: isOpen ? "rotate(180deg)" : "none" }} />
        </div>
      </button>
      {isOpen && (
        <div className="pb-5">
          <p className="font-dm-sans text-sm sm:text-base leading-relaxed" style={{ color: "var(--color-grey)" }}>
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── FAQ Category ──────────────────────────────────────────────────────────
function FaqCategory({
  emoji, title, items,
}: {
  emoji: string; title: string; items: { q: string; a: string }[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "white", border: "1px solid rgba(200,150,12,0.12)", boxShadow: "0 2px 12px rgba(74,44,10,0.05)" }}>
      <div className="h-[2px]"
        style={{ background: "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)" }} />
      <div className="flex items-center gap-3 px-6 py-4 border-b"
        style={{ borderColor: "rgba(200,150,12,0.08)", background: "rgba(200,150,12,0.02)" }}>
        <span className="text-2xl">{emoji}</span>
        <h2 className="font-playfair font-bold text-lg" style={{ color: "var(--color-brown)" }}>{title}</h2>
      </div>
      <div className="px-6">
        {items.map((item, i) => (
          <AccordionItem key={i}
            question={item.q}
            answer={item.a}
            isOpen={openIndex === i}
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-warm-white)" }}>
      <AnnouncementBar />
      <NavbarWithCart />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden"
          style={{ background: "linear-gradient(160deg,#3A1E08 0%,#5C3010 50%,#4A2C0A 100%)", paddingTop: "clamp(2.5rem,6vw,4.5rem)", paddingBottom: "clamp(4rem,9vw,6.5rem)" }}>
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)", backgroundSize: "10px 10px" }} />
          <div className="absolute top-0 left-0 right-0 h-1"
            style={{ background: "linear-gradient(90deg,transparent,var(--color-gold) 20%,var(--color-gold-light) 50%,var(--color-gold) 80%,transparent)" }} />
          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[10rem] sm:text-[14rem] opacity-[0.07] select-none pointer-events-none" style={{ filter: "blur(2px)" }}>❓</div>

          <div className="section-container relative z-10 text-center">
            <p className="font-dancing text-2xl mb-3" style={{ color: "var(--color-gold-light)" }}>We've got answers</p>
            <h1 className="font-playfair font-bold text-white mb-4" style={{ fontSize: "clamp(2rem,5vw,3.5rem)" }}>
              Frequently Asked Questions
            </h1>
            <p className="font-cormorant italic text-xl mx-auto" style={{ color: "rgba(255,255,255,0.65)", maxWidth: "44ch" }}>
              Everything you need to know about our pickles, orders, shipping, and more.
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0" style={{ height: "56px" }}>
            <svg viewBox="0 0 1440 56" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,56 L0,28 Q360,0 720,24 Q1080,48 1440,16 L1440,56 Z" fill="var(--color-warm-white)" />
            </svg>
          </div>
        </section>

        {/* FAQ categories */}
        <section className="section-padding" style={{ background: "var(--color-warm-white)" }}>
          <div className="section-container max-w-3xl mx-auto flex flex-col gap-6">
            {FAQ_CATEGORIES.map((cat) => (
              <FaqCategory key={cat.title} emoji={cat.emoji} title={cat.title} items={cat.items} />
            ))}

            {/* Still have questions? */}
            <div className="rounded-2xl p-8 text-center"
              style={{ background: "linear-gradient(135deg,#4A2C0A 0%,#6B3E12 100%)", border: "1px solid rgba(200,150,12,0.15)" }}>
              <div className="h-px w-20 mx-auto mb-6"
                style={{ background: "linear-gradient(90deg,transparent,var(--color-gold) 50%,transparent)" }} />
              <p className="font-dancing text-2xl mb-2" style={{ color: "var(--color-gold-light)" }}>Still have questions?</p>
              <p className="font-dm-sans text-sm mb-6" style={{ color: "rgba(255,255,255,0.6)" }}>
                We're here to help. WhatsApp us for the fastest response, or send us an email.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href="https://wa.me/919701452929" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-dm-sans font-bold text-sm text-white transition-opacity hover:opacity-90"
                  style={{ background: "#25D366" }}>
                  💬 WhatsApp Us
                </a>
                <Link href="/contact"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-dm-sans font-bold text-sm transition-opacity hover:opacity-80"
                  style={{ border: "2px solid rgba(232,184,75,0.4)", color: "var(--color-gold-light)" }}>
                  Send a Message <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

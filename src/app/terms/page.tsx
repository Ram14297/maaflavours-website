// src/app/terms/page.tsx
// Maa Flavours — Terms & Conditions Page

import type { Metadata } from "next";
import Link from "next/link";
import StaticPageLayout, { OrnamentLine } from "@/components/layout/StaticPageLayout";

export const metadata: Metadata = {
  title: "Terms & Conditions — Maa Flavours",
  description: "Terms and conditions governing the use of the Maa Flavours website and purchase of our homemade pickles.",
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

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2 mt-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2" style={{ background: "var(--color-gold)" }} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function TermsPage() {
  return (
    <StaticPageLayout
      title="Terms & Conditions"
      subtitle="Please read these carefully before using our website or placing an order"
      emoji="📋"
      breadcrumb="Terms & Conditions"
      updatedAt="Last updated: July 2025"
    >
      {/* Intro */}
      <p className="font-dm-sans text-base leading-relaxed mb-8" style={{ color: "var(--color-grey)" }}>
        These Terms & Conditions ("Terms") govern your use of the Maa Flavours website at <strong style={{ color: "var(--color-brown)" }}>maaflavours.com</strong> and any purchase you make through our platform. By accessing our website or placing an order, you agree to be bound by these Terms. If you do not agree, please do not use our website.
      </p>

      <OrnamentLine className="mb-8" />

      <PolicySection title="1. About Maa Flavours">
        <p>Maa Flavours is a homemade pickle brand based in Ongole, Andhra Pradesh, India. We produce and sell authentic Andhra-style pickles directly to consumers through our website at maaflavours.com. Our FSSAI registration is currently in progress.</p>
        <p>For any questions about these Terms, contact us at <a href="mailto:support@maaflavours.com" className="underline" style={{ color: "var(--color-crimson)" }}>support@maaflavours.com</a>.</p>
      </PolicySection>

      <PolicySection title="2. Eligibility">
        <p>To use our website and place orders, you must:</p>
        <BulletList items={[
          "Be at least 18 years of age",
          "Have a valid Indian mobile number for OTP verification",
          "Have a valid delivery address within India",
          "Not be prohibited from purchasing goods under any applicable law",
        ]} />
        <p>By using our website, you represent and warrant that you meet all eligibility requirements.</p>
      </PolicySection>

      <PolicySection title="3. Account Registration">
        <p>You may browse our website without an account. To place an order, you will need to verify your mobile number via OTP. By creating an account, you agree to:</p>
        <BulletList items={[
          "Provide accurate and complete information",
          "Maintain the security of your OTP and account",
          "Notify us immediately of any unauthorised use of your account",
          "Take responsibility for all activity that occurs under your account",
        ]} />
        <p>We reserve the right to suspend or terminate accounts that violate these Terms.</p>
      </PolicySection>

      <PolicySection title="4. Products and Pricing">
        <p>All prices on our website are in Indian Rupees (₹) and include applicable taxes. Prices are subject to change without notice, but changes will not affect orders already placed and confirmed.</p>
        <p>Product descriptions, including spice levels, ingredients, and shelf life, are provided in good faith based on our best knowledge. Exact weights may vary by ±5% due to the handmade nature of our products.</p>
        <p>We reserve the right to limit order quantities, discontinue products, or correct pricing errors. If a pricing error is discovered after your order is placed, we will notify you and provide the option to confirm the order at the correct price or cancel for a full refund.</p>
      </PolicySection>

      <PolicySection title="5. Orders and Payment">
        <p>By placing an order, you make an offer to purchase the products in your cart at the listed price. Your order is confirmed only when you receive an order confirmation via SMS.</p>
        <p>We accept the following payment methods:</p>
        <BulletList items={[
          "UPI (PhonePe, GPay, Paytm, and all UPI apps)",
          "Debit and credit cards (Visa, Mastercard, RuPay)",
          "Net banking",
          "Cash on Delivery (COD) — subject to ₹30 convenience charge",
        ]} />
        <p>All online payments are processed securely through Razorpay. We do not store any card or banking information on our servers.</p>
        <p>We reserve the right to refuse or cancel orders at our discretion, including in cases of suspected fraud, incorrect pricing, or product unavailability. In such cases, a full refund will be issued.</p>
      </PolicySection>

      <PolicySection title="6. Shipping and Delivery">
        <p>Shipping terms, timelines, and charges are governed by our <Link href="/shipping-policy" className="underline" style={{ color: "var(--color-crimson)" }}>Shipping Policy</Link>, which forms part of these Terms.</p>
        <p>We are not responsible for delays caused by courier partners, natural disasters, strikes, or other events beyond our reasonable control. We will make every effort to communicate delays to affected customers.</p>
      </PolicySection>

      <PolicySection title="7. Returns and Refunds">
        <p>Returns and refund processes are governed by our <Link href="/return-policy" className="underline" style={{ color: "var(--color-crimson)" }}>Return & Refund Policy</Link>, which forms part of these Terms.</p>
      </PolicySection>

      <PolicySection title="8. Intellectual Property">
        <p>All content on the Maa Flavours website — including but not limited to text, images, logos, product descriptions, recipes, brand elements, and design — is the exclusive property of Maa Flavours and is protected by Indian and international intellectual property laws.</p>
        <p>You may not reproduce, distribute, modify, or use any of our content for commercial purposes without our prior written consent. Personal, non-commercial use (such as sharing a product link) is permitted.</p>
      </PolicySection>

      <PolicySection title="9. Prohibited Uses">
        <p>You agree not to use our website for any of the following purposes:</p>
        <BulletList items={[
          "Any unlawful purpose or in violation of any regulations",
          "Submitting false, misleading, or fraudulent information",
          "Attempting to gain unauthorised access to any part of our systems",
          "Placing orders with no intention of payment (for COD orders)",
          "Using automated tools to scrape, index, or extract data from our website",
          "Impersonating another person or entity",
          "Posting or transmitting harmful, offensive, or defamatory content in reviews or contact forms",
        ]} />
      </PolicySection>

      <PolicySection title="10. Product Reviews">
        <p>We welcome honest customer reviews on our product pages. By submitting a review, you grant us the right to display it on our website. Reviews must:</p>
        <BulletList items={[
          "Be based on your genuine experience with the product",
          "Not contain offensive, defamatory, or misleading content",
          "Not include personal information of others",
        ]} />
        <p>We reserve the right to remove reviews that violate these guidelines.</p>
      </PolicySection>

      <PolicySection title="11. Disclaimer of Warranties">
        <p>Our website and products are provided "as is" and "as available." While we make every effort to ensure accuracy and quality, we make no warranties, express or implied, regarding:</p>
        <BulletList items={[
          "The accuracy or completeness of website content",
          "The availability of products at any given time",
          "The fitness of products for a particular purpose",
          "The uninterrupted or error-free operation of the website",
        ]} />
      </PolicySection>

      <PolicySection title="12. Limitation of Liability">
        <p>To the maximum extent permitted by Indian law, Maa Flavours shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from:</p>
        <BulletList items={[
          "Use or inability to use our website or products",
          "Errors or omissions in product information",
          "Courier delays or transit damage (beyond our replacement/refund policy)",
          "Unauthorised access to your account",
        ]} />
        <p>Our total liability to you for any claim shall not exceed the value of your most recent order.</p>
      </PolicySection>

      <PolicySection title="13. Indemnification">
        <p>You agree to indemnify and hold harmless Maa Flavours, its team members, and agents from any claims, damages, losses, or expenses (including legal fees) arising from your violation of these Terms or misuse of our website.</p>
      </PolicySection>

      <PolicySection title="14. Governing Law">
        <p>These Terms are governed by the laws of India, specifically the Information Technology Act 2000 and the Consumer Protection Act 2019. Any disputes shall be subject to the exclusive jurisdiction of the courts in Ongole, Andhra Pradesh, India.</p>
        <p>We encourage users to first contact us to resolve any dispute amicably before approaching legal forums.</p>
      </PolicySection>

      <PolicySection title="15. Changes to Terms">
        <p>We reserve the right to modify these Terms at any time. We will notify registered users of significant changes via SMS or email. Your continued use of the website after changes are posted constitutes acceptance of the revised Terms.</p>
        <p>We recommend reviewing these Terms periodically. The "Last updated" date at the top indicates when the most recent changes were made.</p>
      </PolicySection>

      <PolicySection title="16. Contact">
        <p>For any questions about these Terms, please contact us:</p>
        <div className="p-4 rounded-2xl mt-3" style={{ background: "var(--color-cream)", border: "1px solid rgba(200,150,12,0.12)" }}>
          <p className="font-dm-sans font-bold text-sm" style={{ color: "var(--color-brown)" }}>Maa Flavours</p>
          <p className="font-dm-sans text-sm mt-1 leading-relaxed" style={{ color: "var(--color-grey)" }}>
            📧 <a href="mailto:support@maaflavours.com" className="underline" style={{ color: "var(--color-crimson)" }}>support@maaflavours.com</a><br />
            💬 WhatsApp: <a href="https://wa.me/919876543210" className="underline" style={{ color: "var(--color-crimson)" }}>+91 98765 43210</a><br />
            📍 Ongole, Andhra Pradesh, India — 523001
          </p>
        </div>
      </PolicySection>
    </StaticPageLayout>
  );
}

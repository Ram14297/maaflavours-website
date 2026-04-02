"use client";
// src/components/product/ProductInfoTabs.tsx
// Maa Flavours — Product Info Tabs
// Tabs: Product Description | Ingredients | Shipping & Returns
// Accessible tab panel with smooth transitions

import { useState } from "react";
import { Truck, Package, Leaf, Info } from "lucide-react";
import { SHIPPING } from "@/lib/constants/products";

interface ProductInfoTabsProps {
  description: string;
  ingredients: string;
  shelfLifeDays: number;
  isVegetarian?: boolean;
}

const TABS = [
  { id: "description", label: "Description", icon: Info },
  { id: "ingredients", label: "Ingredients", icon: Leaf },
  { id: "shipping", label: "Shipping & Returns", icon: Truck },
  { id: "storage", label: "Storage Tips", icon: Package },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ProductInfoTabs({
  description,
  ingredients,
  shelfLifeDays,
  isVegetarian = true,
}: ProductInfoTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("description");

  const ingredientList = ingredients.split(",").map((i) => i.trim()).filter(Boolean);

  return (
    <div className="mt-10 pt-10 border-t" style={{ borderColor: "rgba(200,150,12,0.12)" }}>
      {/* ─── Tab Navigation ─────────────────────────────────────────────── */}
      <div
        className="flex gap-1 p-1 rounded-2xl mb-6 overflow-x-auto scrollbar-brand"
        style={{
          background: "var(--color-cream)",
          border: "1px solid rgba(200,150,12,0.12)",
        }}
        role="tablist"
        aria-label="Product information"
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-dm-sans text-sm font-medium transition-all duration-200 flex-shrink-0 whitespace-nowrap"
              style={{
                background: isActive ? "white" : "transparent",
                color: isActive ? "var(--color-brown)" : "var(--color-grey)",
                fontWeight: isActive ? 600 : 400,
                boxShadow: isActive ? "0 1px 6px rgba(74,44,10,0.08)" : "none",
                border: isActive ? "1px solid rgba(200,150,12,0.15)" : "1px solid transparent",
              }}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${id}`}
              id={`tab-${id}`}
            >
              <Icon size={15} />
              {label}
            </button>
          );
        })}
      </div>

      {/* ─── Tab Panels ──────────────────────────────────────────────────── */}

      {/* Description */}
      {activeTab === "description" && (
        <div
          id="panel-description"
          role="tabpanel"
          aria-labelledby="tab-description"
          className="animate-fadeIn"
        >
          <div className="prose max-w-none">
            {description.split("\n").filter(Boolean).map((para, i) => (
              <p
                key={i}
                className="font-dm-sans text-base leading-relaxed mb-4 last:mb-0"
                style={{ color: "var(--color-grey)" }}
              >
                {para.trim()}
              </p>
            ))}
          </div>

          {/* Quick specs */}
          <div
            className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t"
            style={{ borderColor: "rgba(200,150,12,0.1)" }}
          >
            {[
              { label: "Origin", value: "Ongole, Andhra Pradesh" },
              { label: "Shelf Life", value: `${shelfLifeDays} days (unopened)` },
              { label: "Dietary", value: isVegetarian ? "100% Vegetarian" : "Non-Vegetarian" },
              { label: "Preservatives", value: "Zero — None Added" },
              { label: "Made In", value: "Small Batches at Home" },
              { label: "Delivery", value: `Pan-India (${SHIPPING.estimated_days})` },
            ].map((spec) => (
              <div key={spec.label}>
                <p
                  className="font-dm-sans text-xs font-semibold tracking-wide uppercase mb-1"
                  style={{ color: "var(--color-gold)", letterSpacing: "0.06em" }}
                >
                  {spec.label}
                </p>
                <p
                  className="font-dm-sans text-sm"
                  style={{ color: "var(--color-brown)" }}
                >
                  {spec.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ingredients */}
      {activeTab === "ingredients" && (
        <div
          id="panel-ingredients"
          role="tabpanel"
          aria-labelledby="tab-ingredients"
          className="animate-fadeIn"
        >
          <div
            className="flex items-start gap-3 p-4 rounded-xl mb-6"
            style={{
              background: "rgba(46,125,50,0.06)",
              border: "1px solid rgba(46,125,50,0.15)",
            }}
          >
            <span className="text-xl flex-shrink-0 mt-0.5">🌿</span>
            <div>
              <p
                className="font-dm-sans font-semibold text-sm"
                style={{ color: "#2E7D32" }}
              >
                No Artificial Preservatives
              </p>
              <p
                className="font-dm-sans text-xs mt-0.5"
                style={{ color: "var(--color-grey)" }}
              >
                All ingredients are naturally sourced. We never add artificial colors, flavors, or preservatives.
              </p>
            </div>
          </div>

          <h4
            className="font-playfair font-semibold text-base mb-4"
            style={{ color: "var(--color-brown)" }}
          >
            Full Ingredient List
          </h4>

          <div className="flex flex-wrap gap-2.5 mb-6">
            {ingredientList.map((ingredient, i) => (
              <span
                key={i}
                className="px-3.5 py-2 rounded-full font-dm-sans text-sm transition-all duration-200 hover:scale-105"
                style={{
                  background: i === 0
                    ? "rgba(192,39,45,0.08)"
                    : "var(--color-cream)",
                  color: i === 0
                    ? "var(--color-crimson)"
                    : "var(--color-brown)",
                  border: `1px solid ${i === 0 ? "rgba(192,39,45,0.2)" : "rgba(200,150,12,0.18)"}`,
                  fontWeight: i === 0 ? 600 : 400,
                }}
              >
                {i === 0 && "⭐ "}
                {ingredient}
              </span>
            ))}
          </div>

          <p
            className="font-dm-sans text-xs italic"
            style={{ color: "var(--color-grey)" }}
          >
            * Primary ingredient highlighted. All ingredients are food-grade and sourced fresh from local Andhra markets.
          </p>
        </div>
      )}

      {/* Shipping */}
      {activeTab === "shipping" && (
        <div
          id="panel-shipping"
          role="tabpanel"
          aria-labelledby="tab-shipping"
          className="animate-fadeIn flex flex-col gap-5"
        >
          {/* Shipping info cards */}
          {[
            {
              icon: "🚚",
              title: "Standard Delivery",
              lines: [
                `Pan-India delivery in ${SHIPPING.estimated_days}`,
                `Shipping charge: ₹${SHIPPING.standard_charge_rupees} per order`,
                `Free shipping on orders above ₹${SHIPPING.free_threshold_rupees}`,
              ],
            },
            {
              icon: "💵",
              title: "Cash on Delivery",
              lines: [
                "COD available at extra ₹30",
                "Select COD at checkout",
                "Pay on delivery to courier partner",
              ],
            },
            {
              icon: "📦",
              title: "Packaging",
              lines: [
                "Packs are bubble-wrapped individually",
                "Packed in sturdy corrugated boxes",
                "Leakage-proof seal on every pack",
              ],
            },
            {
              icon: "🔄",
              title: "Returns & Refunds",
              lines: [
                "Damaged on transit: full replacement",
                "Wrong product sent: full replacement",
                "Opened packs cannot be returned",
                "Report issues within 48 hrs of delivery",
              ],
            },
          ].map((card) => (
            <div
              key={card.title}
              className="flex gap-4 p-5 rounded-2xl"
              style={{
                background: "var(--color-cream)",
                border: "1px solid rgba(200,150,12,0.12)",
              }}
            >
              <span className="text-2xl flex-shrink-0">{card.icon}</span>
              <div>
                <h5
                  className="font-dm-sans font-bold text-sm mb-2"
                  style={{ color: "var(--color-brown)" }}
                >
                  {card.title}
                </h5>
                <ul className="flex flex-col gap-1">
                  {card.lines.map((line, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 font-dm-sans text-sm"
                      style={{ color: "var(--color-grey)" }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                        style={{ background: "var(--color-gold)" }}
                      />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Storage Tips */}
      {activeTab === "storage" && (
        <div
          id="panel-storage"
          role="tabpanel"
          aria-labelledby="tab-storage"
          className="animate-fadeIn"
        >
          <div
            className="flex items-start gap-3 p-4 rounded-xl mb-6"
            style={{
              background: "rgba(200,150,12,0.06)",
              border: "1px solid rgba(200,150,12,0.15)",
            }}
          >
            <span className="text-xl flex-shrink-0">⚠️</span>
            <p
              className="font-dm-sans text-sm leading-relaxed"
              style={{ color: "var(--color-brown)" }}
            >
              <strong>Important:</strong> Our pickles contain no preservatives. Proper storage extends freshness significantly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                emoji: "🏺",
                tip: "Keep Sealed When Not in Use",
                detail: "Always close the pack tightly after every use to prevent air exposure.",
              },
              {
                emoji: "🌡️",
                tip: "Cool, Dry Storage",
                detail: `Unopened: room temperature for up to ${shelfLifeDays} days. Once opened, refrigerate for best results.`,
              },
              {
                emoji: "🥄",
                tip: "Use a Dry Spoon Always",
                detail: "Never introduce water into the pack. Always use a dry, clean spoon to avoid spoilage.",
              },
              {
                emoji: "❄️",
                tip: "Refrigerate After Opening",
                detail: "Once opened, refrigerate and consume within 60 days for best taste.",
              },
              {
                emoji: "☀️",
                tip: "Avoid Direct Sunlight",
                detail: "Store away from direct sunlight or heat sources to preserve colour and flavour.",
              },
              {
                emoji: "🌊",
                tip: "Oil Should Cover Pickle",
                detail: "If the oil level drops below the pickle, add a small amount of fresh sesame oil to keep it preserved.",
              },
            ].map((item) => (
              <div
                key={item.tip}
                className="flex gap-3 p-4 rounded-xl"
                style={{
                  background: "var(--color-cream)",
                  border: "1px solid rgba(200,150,12,0.1)",
                }}
              >
                <span className="text-xl flex-shrink-0">{item.emoji}</span>
                <div>
                  <p
                    className="font-dm-sans font-semibold text-sm mb-1"
                    style={{ color: "var(--color-brown)" }}
                  >
                    {item.tip}
                  </p>
                  <p
                    className="font-dm-sans text-xs leading-relaxed"
                    style={{ color: "var(--color-grey)" }}
                  >
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

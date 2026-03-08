// src/components/home/TrustBadges.tsx
// Maa Flavours — Trust Badges Strip
// 4 icons: Homemade | No Preservatives | Pan-India Delivery | 100% Vegetarian
// Thin gold ornamental dividers above and below

const BADGES = [
  {
    emoji: "🏺",
    title: "Homemade",
    description: "Small-batch crafted",
  },
  {
    emoji: "🌿",
    title: "No Preservatives",
    description: "Pure & natural",
  },
  {
    emoji: "🚚",
    title: "Pan-India Delivery",
    description: "Free above ₹499",
  },
  {
    emoji: "✅",
    title: "100% Vegetarian",
    description: "Always & always",
  },
];

export default function TrustBadges() {
  return (
    <section
      style={{
        background: "var(--color-warm-white)",
        position: "relative",
      }}
    >
      {/* ─── Top gold divider ─────────────────────────────────────────── */}
      <div className="ornament-line-thick" />

      <div className="section-container py-7 lg:py-9">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {BADGES.map((badge, index) => (
            <div key={badge.title} className="flex items-center gap-4">
              {/* Icon */}
              <div
                className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl lg:text-3xl"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-cream) 0%, var(--color-cream-dark) 100%)",
                  border: "1px solid rgba(200, 150, 12, 0.2)",
                  boxShadow: "0 2px 8px rgba(74, 44, 10, 0.06)",
                }}
              >
                {badge.emoji}
              </div>

              {/* Text */}
              <div className="flex flex-col">
                <span
                  className="font-dm-sans font-700 text-sm lg:text-base leading-tight"
                  style={{ color: "var(--color-brown)", fontWeight: 700 }}
                >
                  {badge.title}
                </span>
                <span
                  className="font-dm-sans text-xs lg:text-sm mt-0.5"
                  style={{ color: "var(--color-grey)" }}
                >
                  {badge.description}
                </span>
              </div>

              {/* Vertical divider between items (not after last) */}
              {index < BADGES.length - 1 && (
                <div
                  className="hidden lg:block w-px h-10 ml-auto"
                  style={{
                    background:
                      "linear-gradient(to bottom, transparent, rgba(200, 150, 12, 0.3), transparent)",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Bottom gold divider ──────────────────────────────────────────── */}
      <div className="ornament-line-thick" />
    </section>
  );
}

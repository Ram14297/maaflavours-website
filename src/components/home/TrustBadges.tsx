// src/components/home/TrustBadges.tsx
// Maa Flavours — Trust Badges Strip
// 4 icons: Homemade | No Preservatives | Pan-India Delivery | 100% Pure Vegetarian
// Thin gold ornamental dividers above and below

const BADGES = [
  {
    emoji: "🏺",
    title: "Homemade",
    description: "Small-batch crafted",
    veg: false,
  },
  {
    emoji: "🌿",
    title: "No Preservatives",
    description: "Pure & natural",
    veg: false,
  },
  {
    emoji: "🚚",
    title: "Pan-India Delivery",
    description: "Free above ₹499",
    veg: false,
  },
  {
    emoji: null,
    title: "100% Pure Vegetarian",
    description: "Every single product",
    veg: true,
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
              {badge.veg ? (
                /* ── Special Veg icon: green-tinted with FSSAI dot ── */
                <div
                  className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 relative"
                  style={{
                    background: "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)",
                    border: "1.5px solid rgba(46,125,50,0.35)",
                    boxShadow: "0 2px 12px rgba(46,125,50,0.18)",
                  }}
                >
                  {/* FSSAI-style green square with white dot */}
                  <div
                    className="w-6 h-6 lg:w-7 lg:h-7 rounded-md flex items-center justify-center"
                    style={{
                      border: "2px solid #2E7D32",
                      background: "transparent",
                    }}
                  >
                    <span
                      className="block rounded-full"
                      style={{
                        width: "10px",
                        height: "10px",
                        background: "#2E7D32",
                        boxShadow: "0 0 4px rgba(46,125,50,0.5)",
                      }}
                    />
                  </div>
                </div>
              ) : (
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
              )}

              {/* Text */}
              <div className="flex flex-col">
                <span
                  className="font-dm-sans text-sm lg:text-base leading-tight"
                  style={{
                    color: badge.veg ? "#1B5E20" : "var(--color-brown)",
                    fontWeight: 700,
                  }}
                >
                  {badge.title}
                </span>
                <span
                  className="font-dm-sans text-xs lg:text-sm mt-0.5"
                  style={{ color: badge.veg ? "#388E3C" : "var(--color-grey)", fontWeight: badge.veg ? 500 : 400 }}
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

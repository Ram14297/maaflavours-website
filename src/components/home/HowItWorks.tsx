// src/components/home/HowItWorks.tsx
// Maa Flavours — How It Works Section
// 3 steps: Handcraft → Pack Fresh → Deliver
// Gold connecting accent line between steps

const STEPS = [
  {
    step: "01",
    icon: "👐",
    title: "We Handcraft",
    description:
      "Every batch is made by hand in our home kitchen in Ongole, using traditional Andhra recipes and the finest local ingredients.",
    accent: "var(--color-crimson)",
  },
  {
    step: "02",
    icon: "🫙",
    title: "We Pack Fresh",
    description:
      "Each jar is carefully packed the same day, sealed with care, and labelled with the batch date so you always know it's fresh.",
    accent: "var(--color-gold)",
    featured: true,
  },
  {
    step: "03",
    icon: "🚚",
    title: "Delivered to Your Door",
    description:
      "Pan-India delivery in 3–7 business days. Orders above ₹499 ship free. Packed to survive the journey without breaking.",
    accent: "var(--color-brown)",
  },
];

export default function HowItWorks() {
  return (
    <section
      className="section-padding"
      style={{
        background: "var(--color-cream)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 80%, rgba(200,150,12,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(192,39,45,0.04) 0%, transparent 50%)",
        }}
      />

      <div className="section-container relative z-10">
        {/* ─── Header ──────────────────────────────────────────────────── */}
        <div className="text-center mb-14 lg:mb-16">
          <span className="section-eyebrow block mb-3">From Kitchen to Doorstep</span>
          <h2 className="section-title">
            Simple. Pure. Delivered.
          </h2>
        </div>

        {/* ─── Steps ───────────────────────────────────────────────────── */}
        <div className="relative">
          {/* Connecting line — desktop only */}
          <div
            className="hidden lg:block absolute top-[72px] left-[calc(16.67%)] right-[calc(16.67%)] h-[2px] z-0"
            style={{
              background:
                "linear-gradient(90deg, var(--color-crimson), var(--color-gold), var(--color-brown))",
              opacity: 0.3,
            }}
          />
          {/* Arrow dots on connecting line */}
          <div className="hidden lg:block absolute top-[63px] left-[calc(50%-4px)] w-2 h-[22px] z-10">
            <div
              className="w-2 h-2 rounded-full mx-auto"
              style={{ background: "var(--color-gold)" }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-6 relative z-10">
            {STEPS.map((step, index) => (
              <div
                key={step.step}
                className="flex flex-col items-center text-center group"
              >
                {/* Step number + icon circle */}
                <div className="relative mb-6">
                  {/* Outer ring */}
                  <div
                    className="w-[88px] h-[88px] rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: step.featured
                        ? "linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 100%)"
                        : "white",
                      border: `2px solid ${step.featured ? "transparent" : "rgba(200,150,12,0.25)"}`,
                      boxShadow: step.featured
                        ? "0 8px 28px rgba(200,150,12,0.3)"
                        : "0 4px 16px rgba(74,44,10,0.08)",
                    }}
                  >
                    <span className="text-3xl">{step.icon}</span>
                  </div>

                  {/* Step number badge */}
                  <div
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center font-dm-sans text-xs font-bold"
                    style={{
                      background: step.accent,
                      color: "white",
                      boxShadow: `0 2px 8px ${step.accent}50`,
                    }}
                  >
                    {step.step}
                  </div>
                </div>

                {/* Arrow between steps — mobile only */}
                {index < STEPS.length - 1 && (
                  <div
                    className="sm:hidden text-2xl mb-4"
                    style={{ color: "var(--color-gold)", opacity: 0.5 }}
                  >
                    ↓
                  </div>
                )}

                <h3
                  className="font-playfair font-semibold text-lg mb-3"
                  style={{ color: "var(--color-brown)" }}
                >
                  {step.title}
                </h3>
                <p
                  className="font-dm-sans text-sm leading-relaxed max-w-[260px]"
                  style={{ color: "var(--color-grey)" }}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Bottom CTA ───────────────────────────────────────────────── */}
        <div className="flex justify-center mt-12">
          <a
            href="/products"
            className="btn-primary inline-flex items-center gap-2 py-3.5 px-8"
          >
            Order Your First Jar
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

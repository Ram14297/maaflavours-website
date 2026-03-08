// src/components/home/RecipeInspiration.tsx
// Maa Flavours — Recipe Inspiration Section
// "Pickles That Belong at Every Table"
// 6-item pairing grid: food + pickle combination

import Link from "next/link";

const PAIRINGS = [
  {
    food: "Hot Steamed Rice",
    foodEmoji: "🍚",
    pickle: "Drumstick Pickle",
    pickleSlug: "drumstick-pickle",
    description: "The classic Andhra comfort combination — a spoonful of drumstick pickle with hot rice and ghee.",
    bg: "linear-gradient(135deg, #F5EFE0, #EDE3CE)",
  },
  {
    food: "Curd Rice",
    foodEmoji: "🥛",
    pickle: "Lemon Pickle",
    pickleSlug: "lemon-pickle",
    description: "The tangy brightness of lemon pickle cuts through creamy curd rice perfectly.",
    bg: "linear-gradient(135deg, #EDE3CE, #F5EFE0)",
  },
  {
    food: "Dosa",
    foodEmoji: "🫓",
    pickle: "Maamidi Allam",
    pickleSlug: "maamidi-allam",
    description: "Sweet, sour, and spicy Maamidi Allam is the ultimate dosa companion.",
    bg: "linear-gradient(135deg, #F5EFE0, #EDE3CE)",
  },
  {
    food: "Dal Rice",
    foodEmoji: "🍲",
    pickle: "Drumstick Pickle",
    pickleSlug: "drumstick-pickle",
    description: "Earthy dal rice paired with the bold depth of drumstick pickle is soul food.",
    bg: "linear-gradient(135deg, #EDE3CE, #F5EFE0)",
  },
  {
    food: "Idli",
    foodEmoji: "🫙",
    pickle: "Amla Pickle",
    pickleSlug: "amla-pickle",
    description: "Soft idli with tangy amla pickle is a healthy, flavour-packed breakfast.",
    bg: "linear-gradient(135deg, #F5EFE0, #EDE3CE)",
  },
  {
    food: "Pulao / Biryani",
    foodEmoji: "🍛",
    pickle: "Red Chilli Pickle",
    pickleSlug: "red-chilli-pickle",
    description: "A tiny piece of our fiery red chilli pickle elevates every biryani bite.",
    bg: "linear-gradient(135deg, #EDE3CE, #F5EFE0)",
  },
];

export default function RecipeInspiration() {
  return (
    <section
      className="section-padding"
      style={{ background: "var(--color-cream)" }}
      id="recipes"
    >
      <div className="section-container">
        {/* ─── Header ──────────────────────────────────────────────────── */}
        <div className="text-center mb-12 lg:mb-14">
          <span className="section-eyebrow block mb-3">Serving Suggestions</span>
          <h2 className="section-title mb-4">
            Pickles That Belong<br className="hidden sm:block" /> at Every Table
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 ornament-line" />
            <span style={{ color: "var(--color-gold)", fontSize: "1.25rem" }}>✦</span>
            <div className="h-px w-16 ornament-line" />
          </div>
          <p className="section-subtitle mt-4 max-w-[520px] mx-auto">
            Every pickle has its perfect pairing. Discover the combinations that Andhra kitchens have loved for generations.
          </p>
        </div>

        {/* ─── Pairing Grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PAIRINGS.map((pair) => (
            <div
              key={`${pair.food}-${pair.pickle}`}
              className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{
                background: pair.bg,
                border: "1px solid rgba(200,150,12,0.15)",
                boxShadow: "0 2px 12px rgba(74,44,10,0.06)",
              }}
            >
              {/* Gold hover border */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                style={{
                  boxShadow: "inset 0 0 0 2px rgba(200,150,12,0.4)",
                }}
              />

              <div className="p-5 lg:p-6">
                {/* Food + pickle icons */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{pair.foodEmoji}</span>
                  <span
                    className="font-dm-sans text-lg"
                    style={{ color: "rgba(200,150,12,0.6)" }}
                  >
                    +
                  </span>
                  <span className="text-3xl">🫙</span>
                </div>

                {/* Food label */}
                <div className="flex items-center gap-2 mb-2">
                  <h3
                    className="font-playfair font-semibold text-base leading-tight"
                    style={{ color: "var(--color-brown)" }}
                  >
                    {pair.food}
                  </h3>
                  <span
                    className="font-dm-sans text-xs"
                    style={{ color: "var(--color-grey)" }}
                  >
                    with
                  </span>
                </div>

                {/* Pickle name */}
                <Link
                  href={`/products/${pair.pickleSlug}`}
                  className="inline-block font-dm-sans font-semibold text-sm mb-3 transition-colors duration-200 hover:underline"
                  style={{ color: "var(--color-crimson)" }}
                >
                  {pair.pickle} →
                </Link>

                {/* Description */}
                <p
                  className="font-dm-sans text-xs leading-relaxed"
                  style={{ color: "var(--color-grey)" }}
                >
                  {pair.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            href="/blog"
            className="btn-ghost inline-flex items-center gap-2"
          >
            Explore All Recipes
            <span style={{ color: "var(--color-gold)" }}>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

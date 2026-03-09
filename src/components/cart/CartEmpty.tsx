// src/components/cart/CartEmpty.tsx
// Maa Flavours — Empty cart state inside the drawer
// Shows when there are no items, encourages browsing

import Link from "next/link";

interface CartEmptyProps {
  onClose: () => void;
}

const FEATURED_PICKS = [
  { slug: "pulihora-gongura", name: "Pulihora Gongura", emoji: "🍃", price: "₹200" },
  { slug: "drumstick-pickle", name: "Drumstick Pickle", emoji: "🥢", price: "₹180" },
  { slug: "maamidi-allam", name: "Maamidi Allam", emoji: "🥭", price: "₹190" },
];

export default function CartEmpty({ onClose }: CartEmptyProps) {
  return (
    <div className="flex flex-col items-center text-center px-5 py-8 gap-5 flex-1">
      {/* Decorative jar */}
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center text-4xl"
        style={{
          background: "var(--color-cream)",
          border: "2px dashed rgba(200,150,12,0.3)",
        }}
      >
        🫙
      </div>

      {/* Gold ornament */}
      <div className="ornament-line w-20" />

      <div>
        <h3
          className="font-playfair font-bold text-xl mb-2"
          style={{ color: "var(--color-brown)" }}
        >
          Your cart is empty
        </h3>
        <p
          className="font-cormorant italic text-base leading-snug"
          style={{ color: "var(--color-grey)" }}
        >
          Add some authentic Andhra pickles and bring the taste of home to your table.
        </p>
      </div>

      {/* Quick picks */}
      <div className="w-full">
        <p
          className="font-dm-sans text-xs font-semibold tracking-widest uppercase mb-3"
          style={{ color: "var(--color-gold)", letterSpacing: "0.1em" }}
        >
          Popular Picks
        </p>
        <div className="flex flex-col gap-2">
          {FEATURED_PICKS.map((pick) => (
            <Link
              key={pick.slug}
              href={`/products/${pick.slug}`}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 group"
              style={{
                background: "var(--color-cream)",
                border: "1px solid rgba(200,150,12,0.15)",
              }}
            >
              <span className="text-xl">{pick.emoji}</span>
              <span
                className="font-dm-sans text-sm font-medium flex-1 text-left"
                style={{ color: "var(--color-brown)" }}
              >
                {pick.name}
              </span>
              <span
                className="font-dm-sans font-semibold text-sm"
                style={{ color: "var(--color-crimson)" }}
              >
                from {pick.price}
              </span>
              <span
                className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: "var(--color-gold)" }}
              >
                →
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/products"
        onClick={onClose}
        className="btn-primary w-full py-3.5 justify-center mt-2"
      >
        Browse All Pickles
      </Link>

      {/* WhatsApp assist */}
      <a
        href="https://wa.me/919701452929?text=Hi! I need help choosing pickles."
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 font-dm-sans text-sm font-medium transition-opacity hover:opacity-70"
        style={{ color: "#25D366" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
        Need help choosing? Ask on WhatsApp
      </a>
    </div>
  );
}

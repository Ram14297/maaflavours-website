"use client";
// src/components/product/AddToCartBar.tsx
// Maa Flavours — Add to Cart action section
// Desktop: inline full-width CTAs
// Mobile: sticky bottom floating bar with price + buy button

import { ShoppingBag, Heart, Share2, MessageCircle, Zap } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";
import toast from "react-hot-toast";

interface AddToCartBarProps {
  productName: string;
  variantLabel: string;
  price: number;          // in paise
  quantity: number;
  inStock: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export default function AddToCartBar({
  productName,
  variantLabel,
  price,
  quantity,
  inStock,
  onAddToCart,
  onBuyNow,
}: AddToCartBarProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [sharing, setSharing] = useState(false);

  const totalPrice = price * quantity;

  const handleShare = async () => {
    setSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${productName} — Maa Flavours`,
          text: `Try this authentic Andhra pickle from Maa Flavours! Just ₹${formatPrice(price)}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch {
      // Share cancelled or failed silently
    } finally {
      setSharing(false);
    }
  };

  const handleWishlist = () => {
    setWishlisted((w) => !w);
    toast(wishlisted ? "Removed from wishlist" : "Added to wishlist ❤️", {
      icon: wishlisted ? "🗑️" : "❤️",
    });
  };

  return (
    <>
      {/* ─── Desktop CTA Block ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {/* Out of stock banner */}
        {!inStock && (
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl font-dm-sans text-sm font-semibold"
            style={{
              background: "rgba(192,39,45,0.07)",
              border: "1px solid rgba(192,39,45,0.2)",
              color: "var(--color-crimson)",
            }}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-current animate-pulse" />
            This size is currently out of stock. Select another or notify me.
          </div>
        )}

        {/* Main CTA buttons */}
        {inStock && (
          <>
            <button
              onClick={onAddToCart}
              className="btn-primary w-full py-4 text-base flex items-center justify-center gap-3"
              style={{ minHeight: "52px" }}
            >
              <ShoppingBag size={20} />
              Add to Cart
              <span
                className="text-sm opacity-75"
                style={{ fontWeight: 400 }}
              >
                — {variantLabel} · {formatPrice(totalPrice)}
              </span>
            </button>

            <button
              onClick={onBuyNow}
              className="w-full py-4 text-base font-dm-sans font-semibold rounded-xl flex items-center justify-center gap-2.5 transition-all duration-200 hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 100%)",
                color: "var(--color-brown)",
                boxShadow: "0 3px 12px rgba(200,150,12,0.3)",
                minHeight: "52px",
              }}
            >
              <Zap size={18} fill="var(--color-brown)" />
              Buy Now — Pay Later or UPI
            </button>
          </>
        )}

        {/* Notify if out of stock */}
        {!inStock && (
          <button
            onClick={() => toast.success("We'll notify you when it's back in stock!")}
            className="btn-ghost w-full py-4 text-base"
          >
            🔔 Notify When Available
          </button>
        )}

        {/* Secondary actions */}
        <div className="flex items-center gap-2.5">
          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-dm-sans text-sm font-medium transition-all duration-200"
            style={{
              border: `1.5px solid ${wishlisted ? "var(--color-crimson)" : "rgba(200,150,12,0.2)"}`,
              color: wishlisted ? "var(--color-crimson)" : "var(--color-grey)",
              background: wishlisted ? "rgba(192,39,45,0.05)" : "transparent",
            }}
          >
            <Heart
              size={17}
              fill={wishlisted ? "var(--color-crimson)" : "none"}
            />
            {wishlisted ? "Wishlisted" : "Wishlist"}
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            disabled={sharing}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-dm-sans text-sm font-medium transition-all duration-200 disabled:opacity-60"
            style={{
              border: "1.5px solid rgba(200,150,12,0.2)",
              color: "var(--color-grey)",
            }}
          >
            <Share2 size={16} />
            Share
          </button>

          {/* WhatsApp order */}
          <a
            href={`https://wa.me/919701452929?text=Hi! I want to order ${productName} (${variantLabel}) from Maa Flavours.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-dm-sans text-sm font-semibold transition-all duration-200 hover:opacity-90"
            style={{
              background: "#25D366",
              color: "white",
            }}
          >
            <MessageCircle size={16} />
            WhatsApp
          </a>
        </div>

        {/* Trust reassurances */}
        <div
          className="flex items-center justify-around py-3 rounded-xl"
          style={{ background: "var(--color-cream)", border: "1px solid rgba(200,150,12,0.1)" }}
        >
          {[
            { emoji: "🔒", label: "Secure Payment" },
            { emoji: "🌿", label: "No Preservatives" },
            { emoji: "🚚", label: "Pan-India Delivery" },
          ].map((trust) => (
            <div key={trust.label} className="flex flex-col items-center gap-1 text-center">
              <span className="text-base">{trust.emoji}</span>
              <span
                className="font-dm-sans text-[0.65rem] font-medium leading-tight"
                style={{ color: "var(--color-grey)" }}
              >
                {trust.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Mobile Sticky Bottom Bar ───────────────────────────────────── */}
      {/* Only visible when scrolled past the desktop CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
        style={{
          background: "var(--color-warm-white)",
          borderTop: "1px solid rgba(200,150,12,0.15)",
          boxShadow: "0 -4px 20px rgba(74,44,10,0.1)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Price display */}
          <div className="flex flex-col flex-shrink-0">
            <span
              className="font-dm-sans font-bold text-xl leading-none"
              style={{ color: "var(--color-crimson)" }}
            >
              {formatPrice(totalPrice)}
            </span>
            <span
              className="font-dm-sans text-xs"
              style={{ color: "var(--color-grey)" }}
            >
              {variantLabel} × {quantity}
            </span>
          </div>

          {/* Add to Cart */}
          {inStock ? (
            <>
              <button
                onClick={onAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-dm-sans font-semibold text-sm"
                style={{
                  border: "1.5px solid var(--color-brown)",
                  color: "var(--color-brown)",
                  background: "transparent",
                }}
              >
                <ShoppingBag size={16} />
                Add to Cart
              </button>

              <button
                onClick={onBuyNow}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-dm-sans font-semibold text-sm"
                style={{
                  background: "var(--color-crimson)",
                  color: "white",
                  boxShadow: "0 3px 10px rgba(192,39,45,0.3)",
                }}
              >
                <Zap size={16} fill="white" />
                Buy Now
              </button>
            </>
          ) : (
            <button
              onClick={() => toast.success("We'll notify you!")}
              className="flex-1 btn-ghost py-3"
            >
              🔔 Notify Me
            </button>
          )}
        </div>
      </div>

      {/* Spacer so page content isn't hidden behind mobile bar */}
      <div className="h-[72px] lg:hidden" />
    </>
  );
}

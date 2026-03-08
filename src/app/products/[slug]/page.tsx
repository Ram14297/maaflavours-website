"use client";
// src/app/products/[slug]/page.tsx
// Maa Flavours — Product Detail Page
// Assembled sections: Gallery | Variant selector | Quantity | Add to Cart
// Product info tabs | Reviews | Related products
// Fully responsive — mobile sticky bottom bar + desktop inline CTAs

import { useState, useCallback } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, ChevronRight, MessageCircle } from "lucide-react";
import { PRODUCTS, SITE } from "@/lib/constants/products";
import { formatPrice, getSpiceLevelConfig, calculateDeliveryCharge, amountForFreeShipping } from "@/lib/utils";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import NavbarWithCart from "@/components/layout/NavbarWithCart";
import Footer from "@/components/layout/Footer";
import { useCartStore } from "@/store/cartStore";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import VariantSelector from "@/components/product/VariantSelector";
import QuantityPicker from "@/components/product/QuantityPicker";
import SpiceLevelIndicator from "@/components/product/SpiceLevelIndicator";
import ProductInfoTabs from "@/components/product/ProductInfoTabs";
import ProductReviewsSection from "@/components/product/ProductReviewsSection";
import RelatedProducts from "@/components/product/RelatedProducts";
import AddToCartBar from "@/components/product/AddToCartBar";
import toast from "react-hot-toast";

// ─── Emoji map for product placeholders ────────────────────────────────────
const PRODUCT_EMOJIS: Record<string, string> = {
  "drumstick-pickle": "🥢",
  "amla-pickle": "🫙",
  "pulihora-gongura": "🍃",
  "lemon-pickle": "🍋",
  "maamidi-allam": "🥭",
  "red-chilli-pickle": "🌶️",
};

// ─── Breadcrumb ────────────────────────────────────────────────────────────
function Breadcrumb({ productName }: { productName: string }) {
  return (
    <nav
      className="flex items-center flex-wrap gap-1.5 font-dm-sans text-sm mb-6"
      aria-label="Breadcrumb"
    >
      <Link
        href="/"
        className="transition-colors hover:text-gold"
        style={{ color: "var(--color-grey)" }}
      >
        Home
      </Link>
      <ChevronRight size={13} style={{ color: "rgba(200,150,12,0.4)" }} />
      <Link
        href="/products"
        className="transition-colors hover:text-gold"
        style={{ color: "var(--color-grey)" }}
      >
        All Pickles
      </Link>
      <ChevronRight size={13} style={{ color: "rgba(200,150,12,0.4)" }} />
      <span style={{ color: "var(--color-brown)", fontWeight: 600 }}>
        {productName}
      </span>
    </nav>
  );
}

// ─── Free shipping progress bar ────────────────────────────────────────────
function FreeShippingProgress({ currentTotal }: { currentTotal: number }) {
  const needed = amountForFreeShipping(currentTotal);
  const pct = Math.min((currentTotal / 49900) * 100, 100);

  if (needed <= 0) {
    return (
      <div
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-dm-sans font-semibold"
        style={{
          background: "rgba(46,125,50,0.08)",
          border: "1px solid rgba(46,125,50,0.2)",
          color: "#2E7D32",
        }}
      >
        🚚 You qualify for <strong>Free Shipping!</strong>
      </div>
    );
  }

  return (
    <div
      className="px-3.5 py-2.5 rounded-xl"
      style={{
        background: "rgba(200,150,12,0.07)",
        border: "1px solid rgba(200,150,12,0.15)",
      }}
    >
      <p
        className="font-dm-sans text-xs mb-1.5"
        style={{ color: "var(--color-brown)" }}
      >
        🚚 Add{" "}
        <span className="font-bold">{formatPrice(needed)}</span> more for{" "}
        <span className="font-bold">Free Shipping</span>
      </p>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: "rgba(200,150,12,0.15)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, var(--color-gold), var(--color-gold-light))",
          }}
        />
      </div>
    </div>
  );
}

// ─── Main Page Component ────────────────────────────────────────────────────
interface ProductDetailPageProps {
  params: { slug: string };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = params;

  // Find product from constants — will be replaced with Supabase fetch
  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) notFound();

  const emoji = PRODUCT_EMOJIS[slug] || "🫙";
  const spiceConfig = getSpiceLevelConfig(product.spice_level);

  // ─── State ─────────────────────────────────────────────────────────────
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loginOpen, setLoginOpen] = useState(false);

  const addItem = useCartStore((s) => s.addItem);

  const selectedVariant = product.variants[selectedVariantIndex] as typeof product.variants[0] & { discounted_price?: number; stock_quantity?: number };
  const totalPrice = selectedVariant.price * quantity;
  const deliveryCharge = calculateDeliveryCharge(totalPrice);

  // ─── Handlers ──────────────────────────────────────────────────────────
  const handleAddToCart = useCallback(async () => {
    try {
      await addItem(product.slug, selectedVariantIndex, quantity);
      toast.success(
        `${product.name} (${selectedVariant.label} × ${quantity}) added to cart!`,
        { duration: 3000 }
      );
    } catch {
      toast.error("Could not add to cart. Please try again.");
    }
  }, [addItem, product.slug, product.name, selectedVariantIndex, selectedVariant.label, quantity]);

  const handleBuyNow = useCallback(async () => {
    await handleAddToCart();
    toast("Redirecting to checkout…", { icon: "⚡" });
    setTimeout(() => { window.location.href = "/checkout"; }, 500);
  }, [handleAddToCart]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--color-warm-white)" }}
    >
      <AnnouncementBar />
      <NavbarWithCart onAccountClick={() => setLoginOpen(true)} />

      <main className="flex-1">
        <div className="section-container py-6 lg:py-10">

          <Breadcrumb productName={product.name} />

          {/* ─── Main Detail Grid ─────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 mb-12">

            {/* ─── Left: Image Gallery ────────────────────────────────── */}
            <div className="reveal">
              <ProductImageGallery
                productName={product.name}
                productSlug={product.slug}
                emoji={emoji}
              />
            </div>

            {/* ─── Right: Product Info + CTA ──────────────────────────── */}
            <div className="reveal reveal-delay-1 flex flex-col gap-5">

              {/* Tag + Veg badge */}
              <div className="flex items-center justify-between">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-dm-sans text-xs font-semibold"
                  style={{
                    background: "var(--color-cream)",
                    border: "1px solid rgba(200,150,12,0.25)",
                    color: "var(--color-brown)",
                  }}
                >
                  ✨ {product.tag}
                </span>

                {/* Veg badge */}
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{
                    background: "rgba(46,125,50,0.08)",
                    border: "1px solid rgba(46,125,50,0.2)",
                  }}
                >
                  <span
                    className="block w-3 h-3 rounded-full"
                    style={{ background: "#2E7D32" }}
                  />
                  <span
                    className="font-dm-sans text-xs font-semibold"
                    style={{ color: "#2E7D32" }}
                  >
                    100% Vegetarian
                  </span>
                </div>
              </div>

              {/* Product name */}
              <div>
                <h1
                  className="font-playfair font-bold leading-tight mb-1"
                  style={{
                    color: "var(--color-brown)",
                    fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                    lineHeight: 1.15,
                  }}
                >
                  {product.name}
                </h1>
                <p
                  className="font-cormorant italic text-xl"
                  style={{ color: "var(--color-grey)" }}
                >
                  {product.subtitle}
                </p>
              </div>

              {/* Rating row */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={17}
                      fill="var(--color-gold)"
                      style={{ color: "var(--color-gold)" }}
                    />
                  ))}
                </div>
                <span
                  className="font-dm-sans font-bold text-lg"
                  style={{ color: "var(--color-brown)" }}
                >
                  4.9
                </span>
                <span
                  className="font-dm-sans text-sm"
                  style={{ color: "var(--color-grey)" }}
                >
                  · 47 reviews
                </span>
                <a
                  href="#reviews"
                  className="font-dm-sans text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: "var(--color-crimson)" }}
                >
                  Read all →
                </a>
              </div>

              {/* Gold ornament */}
              <div className="ornament-line" />

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span
                  className="font-playfair font-bold"
                  style={{
                    color: "var(--color-crimson)",
                    fontSize: "2rem",
                    lineHeight: 1,
                  }}
                >
                  {formatPrice(selectedVariant.price)}
                </span>
                {selectedVariant.discounted_price && (
                  <>
                    <span
                      className="font-dm-sans text-lg line-through"
                      style={{ color: "var(--color-grey)" }}
                    >
                      {formatPrice(selectedVariant.discounted_price)}
                    </span>
                    <span
                      className="px-2.5 py-0.5 rounded-full font-dm-sans text-xs font-bold"
                      style={{
                        background: "rgba(192,39,45,0.1)",
                        color: "var(--color-crimson)",
                      }}
                    >
                      SAVE {Math.round(((selectedVariant.discounted_price - selectedVariant.price) / selectedVariant.discounted_price) * 100)}%
                    </span>
                  </>
                )}
              </div>

              {/* Delivery info */}
              <div
                className="flex items-center gap-2 font-dm-sans text-sm px-3.5 py-2 rounded-xl"
                style={{
                  background: "var(--color-cream)",
                  border: "1px solid rgba(200,150,12,0.12)",
                }}
              >
                <span>🚚</span>
                <span style={{ color: "var(--color-grey)" }}>
                  {deliveryCharge === 0 ? (
                    <>
                      <span className="font-semibold" style={{ color: "#2E7D32" }}>Free delivery</span> on this order
                    </>
                  ) : (
                    <>
                      Delivery: <span className="font-semibold" style={{ color: "var(--color-brown)" }}>₹{deliveryCharge / 100}</span>{" "}
                      · Free above ₹499
                    </>
                  )}
                  {" "}<span style={{ color: "var(--color-gold)", fontWeight: 500 }}>Pan-India</span>
                </span>
              </div>

              {/* Spice level */}
              <div
                className="flex flex-col gap-2 p-4 rounded-xl"
                style={{
                  background: "var(--color-cream)",
                  border: "1px solid rgba(200,150,12,0.12)",
                }}
              >
                <span
                  className="font-dm-sans text-xs font-semibold tracking-wide uppercase"
                  style={{ color: "var(--color-brown)", letterSpacing: "0.08em" }}
                >
                  Spice Level
                </span>
                <SpiceLevelIndicator level={product.spice_level} />
              </div>

              {/* Variant selector */}
              <VariantSelector
                variants={product.variants}
                selectedIndex={selectedVariantIndex}
                onChange={setSelectedVariantIndex}
              />

              {/* Quantity */}
              <QuantityPicker
                quantity={quantity}
                onChange={setQuantity}
                max={(selectedVariant.stock_quantity ?? 10) > 0
                  ? Math.min(selectedVariant.stock_quantity ?? 10, 10)
                  : 0}
              />

              {/* Free shipping progress */}
              <FreeShippingProgress currentTotal={totalPrice} />

              {/* Add to Cart + Buy Now (desktop) */}
              <div className="hidden lg:block">
                <AddToCartBar
                  productName={product.name}
                  variantLabel={selectedVariant.label}
                  price={selectedVariant.price}
                  quantity={quantity}
                  inStock={(selectedVariant.stock_quantity ?? 10) > 0}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                />
              </div>

              {/* Short description */}
              <div className="border-t pt-4" style={{ borderColor: "rgba(200,150,12,0.1)" }}>
                <p
                  className="font-dm-sans text-sm leading-relaxed"
                  style={{ color: "var(--color-grey)" }}
                >
                  {product.short_description}
                </p>
              </div>
            </div>
          </div>

          {/* ─── Product Info Tabs ─────────────────────────────────────── */}
          <div className="reveal">
            <ProductInfoTabs
              description={product.description}
              ingredients={product.ingredients}
              shelfLifeDays={product.shelf_life_days}
              isVegetarian={product.is_vegetarian}
            />
          </div>

          {/* ─── Reviews Section ─────────────────────────────────────────── */}
          <div className="reveal" id="reviews">
            <ProductReviewsSection
              productSlug={product.slug}
              productName={product.name}
            />
          </div>

          {/* ─── Related Products ────────────────────────────────────────── */}
          <div className="reveal">
            <RelatedProducts currentSlug={product.slug} />
          </div>
        </div>
      </main>

      {/* ─── Mobile Sticky Bar ─────────────────────────────────────────────── */}
      <div className="lg:hidden">
        <AddToCartBar
          productName={product.name}
          variantLabel={selectedVariant.label}
          price={selectedVariant.price}
          quantity={quantity}
          inStock={(selectedVariant.stock_quantity ?? 10) > 0}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      </div>

      <Footer />
    </div>
  );
}

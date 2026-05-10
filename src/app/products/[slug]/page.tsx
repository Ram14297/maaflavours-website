"use client";
// src/app/products/[slug]/page.tsx
// Maa Flavours — Product Detail Page
// Assembled sections: Gallery | Variant selector | Quantity | Add to Cart
// Product info tabs | Reviews | Related products
// Fully responsive — mobile sticky bottom bar + desktop inline CTAs

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Star, ChevronRight, MessageCircle, ShoppingBag } from "lucide-react";
import { PRODUCTS, SITE } from "@/lib/constants/products";
import { formatPrice, calculateDeliveryCharge, amountForFreeShipping } from "@/lib/utils";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import NavbarWithCart from "@/components/layout/NavbarWithCart";
import Footer from "@/components/layout/Footer";
import { useCartStore, AddItemMeta } from "@/store/cartStore";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import VariantSelector from "@/components/product/VariantSelector";
import QuantityPicker from "@/components/product/QuantityPicker";
import ProductInfoTabs from "@/components/product/ProductInfoTabs";
import ProductReviewsSection from "@/components/product/ProductReviewsSection";
import RelatedProducts from "@/components/product/RelatedProducts";
import AddToCartBar from "@/components/product/AddToCartBar";
import toast from "react-hot-toast";

// ─── Emoji map for product placeholders ────────────────────────────────────
const PRODUCT_EMOJIS: Record<string, string> = {
  "drumstick-pickle":  "🥢",
  "amla-pickle":       "🫙",
  "pulihora-gongura":  "🍃",
  "lemon-pickle":      "🍋",
  "red-chilli-pickle": "🌶️",
  "aavakaaya":         "🥭",
};

// ─── Live product type (matches API response shape) ────────────────────────
interface LiveVariant {
  id?: string;
  weight_grams: number;
  label: string;
  price: number;
  discounted_price?: number;
  compare_at_price?: number | null;
  stock_quantity?: number;
}

interface LiveProduct {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  tag: string;
  spice_level: "mild" | "medium" | "spicy" | "extra-hot";
  short_description: string;
  description: string;
  ingredients: string;
  shelf_life_days: number;
  is_vegetarian: boolean;
  contains_garlic?: boolean;
  product_type?: string;
  images: { id: string; url: string; alt: string; is_primary: boolean; sort_order: number }[];
  variants: LiveVariant[];
}

// ─── Breadcrumb ────────────────────────────────────────────────────────────
function Breadcrumb({ productName, productType }: { productName: string; productType?: string }) {
  const isPowder = productType === "powder";
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
        href={isPowder ? "/powders" : "/products"}
        className="transition-colors hover:text-gold"
        style={{ color: "var(--color-grey)" }}
      >
        {isPowder ? "All Powders" : "All Pickles"}
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
  const pct = Math.min((currentTotal / 89900) * 100, 100);

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

// ─── Loading skeleton ──────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--color-warm-white)" }}
    >
      <AnnouncementBar />
      <NavbarWithCart />
      <main className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, var(--color-cream), var(--color-cream-dark))",
              border: "2px solid rgba(200,150,12,0.2)",
              animation: "pulseGold 1.5s ease-in-out infinite",
            }}
          >
            <ShoppingBag size={24} style={{ color: "var(--color-gold)" }} />
          </div>
          <p
            className="font-cormorant italic text-xl"
            style={{ color: "var(--color-brown)" }}
          >
            Loading pickle details…
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ─── Not found state ───────────────────────────────────────────────────────
function NotFoundState() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--color-warm-white)" }}
    >
      <AnnouncementBar />
      <NavbarWithCart />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🫙</div>
          <h1
            className="font-playfair font-bold text-3xl mb-2"
            style={{ color: "var(--color-brown)" }}
          >
            Pickle Not Found
          </h1>
          <p
            className="font-cormorant italic text-xl mb-6"
            style={{ color: "var(--color-grey)" }}
          >
            This pack seems to have run out — or it never existed.
          </p>
          <Link
            href="/products"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3"
          >
            Browse All Pickles
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ─── Main Page Component ────────────────────────────────────────────────────
interface ProductDetailPageProps {
  params: { slug: string };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = params;

  // ─── Live product state ────────────────────────────────────────────────
  const [liveProduct, setLiveProduct] = useState<LiveProduct | null>(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [is404, setIs404]             = useState(false);

  // ─── UI state — must be declared before any conditional return ─────────
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity]   = useState(1);
  const [loginOpen, setLoginOpen] = useState(false);

  const addItem = useCartStore((s) => s.addItem);

  // ─── Fetch product from live API ───────────────────────────────────────
  useEffect(() => {
    setIsLoading(true);
    setIs404(false);

    fetch(`/api/products/${slug}`)
      .then((r) => {
        if (r.status === 404) {
          setIs404(true);
          setIsLoading(false);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        const { product: p, variants, images: apiImages } = data;
        // Enrich with static content (richer descriptions, ingredients) if available
        const base = PRODUCTS.find((sp) => sp.slug === slug);

        setLiveProduct({
          id:                p.id                || slug,
          slug:              p.slug              || slug,
          name:              p.name              || base?.name              || slug,
          subtitle:          p.subtitle          || base?.subtitle          || "",
          tag:               p.tag               || base?.tag               || "",
          spice_level:       p.spice_level       || base?.spice_level       || "medium",
          short_description: p.short_description || base?.short_description || p.description || "",
          description:       p.description       || base?.description       || "",
          ingredients:       p.ingredients       || base?.ingredients       || "",
          shelf_life_days:   p.shelf_life_days   || base?.shelf_life_days   || 180,
          is_vegetarian:     p.is_vegetarian     ?? base?.is_vegetarian     ?? true,
          contains_garlic:   base?.contains_garlic,
          product_type:      p.product_type      || "pickle",
          images:            (apiImages && apiImages.length > 0) ? apiImages : [],
          variants: (variants && variants.length > 0)
            ? variants.map((v: any) => ({
                ...v,
                discounted_price:  v.discounted_price  ?? undefined,
                compare_at_price:  v.compare_at_price  ?? null,
              }))
            : (base?.variants || []),
        });
        setIsLoading(false);
      })
      .catch(() => {
        // Supabase unreachable — try static fallback
        const base = PRODUCTS.find((sp) => sp.slug === slug);
        if (base) {
          setLiveProduct({
            id:                base.slug,
            slug:              base.slug,
            name:              base.name,
            subtitle:          base.subtitle,
            tag:               base.tag,
            spice_level:       base.spice_level,
            short_description: base.short_description,
            description:       base.description,
            ingredients:       base.ingredients,
            shelf_life_days:   base.shelf_life_days,
            is_vegetarian:     base.is_vegetarian,
            contains_garlic:   base.contains_garlic,
            images:            [],
            variants:          base.variants,
          });
        } else {
          setIs404(true);
        }
        setIsLoading(false);
      });
  }, [slug]);

  // ─── Reveal animation observer ─────────────────────────────────────────
  useEffect(() => {
    if (!liveProduct) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("revealed");
      }),
      { threshold: 0.06, rootMargin: "0px 0px -20px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [liveProduct]);

  // ─── Derived values (safe with null guard below) ───────────────────────
  const selectedVariant = liveProduct?.variants[selectedVariantIndex] ?? liveProduct?.variants[0] ?? null;
  const totalPrice      = (selectedVariant?.price ?? 0) * quantity;
  const deliveryCharge  = calculateDeliveryCharge(totalPrice);

  // ─── Handlers ──────────────────────────────────────────────────────────
  const handleAddToCart = useCallback(async () => {
    if (!liveProduct || !selectedVariant) return;
    try {
      // Pass full meta so admin-added products (not in static constants) work correctly
      const primaryImage = liveProduct.images?.find((i: any) => i.is_primary) ?? liveProduct.images?.[0];
      const meta: AddItemMeta = {
        productName:     liveProduct.name,
        productSubtitle: liveProduct.subtitle,
        variantLabel:    selectedVariant.label,
        unitPrice:       selectedVariant.price,
        emoji:           PRODUCT_EMOJIS[liveProduct.slug] || "🫙",
        maxQuantity:     selectedVariant.stock_quantity ?? 10,
        imageUrl:        primaryImage?.url || "",
      };
      await addItem(liveProduct.slug, selectedVariantIndex, quantity, meta);
      toast.success(
        `${liveProduct.name} (${selectedVariant.label} × ${quantity}) added to cart!`,
        { duration: 3000 }
      );
    } catch {
      toast.error("Could not add to cart. Please try again.");
    }
  }, [addItem, liveProduct, selectedVariantIndex, selectedVariant, quantity]);

  const handleBuyNow = useCallback(async () => {
    await handleAddToCart();
    toast("Redirecting to checkout…", { icon: "⚡" });
    setTimeout(() => { window.location.href = "/checkout"; }, 500);
  }, [handleAddToCart]);

  // ─── Early returns (after all hooks) ──────────────────────────────────
  if (isLoading) return <LoadingState />;
  if (is404 || !liveProduct || !selectedVariant) return <NotFoundState />;

  // Aliases — all guaranteed non-null from here
  const product = liveProduct;
  const emoji   = PRODUCT_EMOJIS[slug] || "🫙";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--color-warm-white)" }}
    >
      <AnnouncementBar />
      <NavbarWithCart onAccountClick={() => setLoginOpen(true)} />

      <main className="flex-1">
        <div className="section-container py-6 lg:py-10">

          <Breadcrumb productName={product.name} productType={product.product_type} />

          {/* ─── Main Detail Grid ─────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 mb-12">

            {/* ─── Left: Image Gallery ────────────────────────────────── */}
            <div className="reveal">
              <ProductImageGallery
                productName={product.name}
                productSlug={product.slug}
                images={product.images}
                emoji={emoji}
              />
            </div>

            {/* ─── Right: Product Info + CTA ──────────────────────────── */}
            <div className="reveal reveal-delay-1 flex flex-col gap-5">

              {/* Tag + Veg badge */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
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
                  {product.contains_garlic ? (
                    <span
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-dm-sans text-xs font-semibold"
                      style={{
                        background: "rgba(183,28,28,0.08)",
                        border: "1px solid rgba(183,28,28,0.3)",
                        color: "#B71C1C",
                      }}
                    >
                      🧄 Contains Garlic
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-dm-sans text-xs font-semibold"
                      style={{
                        background: "rgba(46,125,50,0.08)",
                        border: "1px solid rgba(46,125,50,0.3)",
                        color: "#1B5E20",
                      }}
                    >
                      🧄 No Garlic
                    </span>
                  )}
                </div>

                {/* Veg badge */}
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                  style={{
                    background: "rgba(46,125,50,0.09)",
                    border: "1.5px solid rgba(46,125,50,0.3)",
                    boxShadow: "0 1px 6px rgba(46,125,50,0.12)",
                  }}
                >
                  {/* FSSAI-style symbol */}
                  <div
                    className="w-4 h-4 rounded-sm flex items-center justify-center flex-shrink-0"
                    style={{ border: "1.5px solid #2E7D32" }}
                  >
                    <span
                      className="block rounded-full"
                      style={{ width: "7px", height: "7px", background: "#2E7D32" }}
                    />
                  </div>
                  <span
                    className="font-dm-sans text-xs font-bold"
                    style={{ color: "#1B5E20" }}
                  >
                    100% Pure Vegetarian
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

              {/* Gold ornament */}
              <div className="ornament-line" />

              {/* Price */}
              <div className="flex items-baseline gap-3 flex-wrap">
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
                {/* compare_at_price = original price before launch offer */}
                {selectedVariant.compare_at_price && (
                  <>
                    <span
                      className="font-dm-sans text-lg line-through"
                      style={{ color: "var(--color-grey)" }}
                    >
                      {formatPrice(selectedVariant.compare_at_price)}
                    </span>
                    <span
                      className="px-2.5 py-0.5 rounded-full font-dm-sans text-xs font-bold"
                      style={{
                        background: "rgba(192,39,45,0.1)",
                        color: "var(--color-crimson)",
                      }}
                    >
                      {Math.round((1 - selectedVariant.price / selectedVariant.compare_at_price) * 100)}% OFF
                    </span>
                  </>
                )}
                {/* Fallback: DB-level discounted_price (future use) */}
                {!selectedVariant.compare_at_price && selectedVariant.discounted_price && (
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
                      {Math.round((1 - selectedVariant.price / selectedVariant.discounted_price) * 100)}% OFF
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
                      · Free above ₹899
                    </>
                  )}
                  {" "}<span style={{ color: "var(--color-gold)", fontWeight: 500 }}>Pan-India</span>
                </span>
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

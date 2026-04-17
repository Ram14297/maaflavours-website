// src/lib/constants/products.ts
// Maa Flavours — Static product catalog (6 SKUs)
// These are the source-of-truth product definitions
// Sync these with your Supabase database seed

import type { SpiceLevel } from "@/types";

export interface ProductSeed {
  slug: string;
  name: string;
  subtitle: string;
  tag: string;
  spice_level: SpiceLevel;
  short_description: string;
  description: string;
  ingredients: string;
  shelf_life_days: number;
  is_vegetarian: boolean;
  is_featured: boolean;
  variants: {
    weight_grams: number;
    label: string;
    price: number;  // in paise
  }[];
  // REPLACE with actual Supabase Storage image paths
  image_placeholder: string;
}

export const PRODUCTS: ProductSeed[] = [
  // ─── 1. Drumstick Pickle ───────────────────────────────────────────────
  {
    slug: "drumstick-pickle",
    name: "Drumstick Pickle",
    subtitle: "Medium Spicy",
    tag: "Authentic Andhra Taste",
    spice_level: "medium",
    short_description: "Fresh drumstick pieces slow-cured in sesame oil with Andhra spices. A timeless side for steamed rice and dal.",
    description: `<p>Made from tender drumsticks hand-picked from local Andhra farms, Munagakaya Pachhadi is one of the most cherished pickles in Telugu households. Each piece is carefully cleaned and marinated in cold-pressed sesame oil with freshly ground spices — the way Maa has always made it.</p><p>The subtle earthiness of drumstick meets the bold heat of Guntur red chilli and the nuttiness of sesame oil to create a pickle that is complex, aromatic, and deeply satisfying. Zero preservatives. Made in small batches. Best with hot steamed rice, curd rice, or alongside a simple dal.</p>`,
    ingredients: "Raw Drumstick (Munagakaya), Sesame Oil (Nuvvula Nune), Red Chilli Powder (Mirchi Podi), Salt (Uppu), Mustard Seeds (Avalu), Fenugreek Seeds (Menthulu), Turmeric (Pasupu), Garlic (Vellulli), Curry Leaves (Karivepaku), Asafoetida (Inguva)",
    shelf_life_days: 90,
    is_vegetarian: true,
    is_featured: true,
    variants: [
      { weight_grams: 250, label: "250g", price: 18000 },   // ₹180
      { weight_grams: 500, label: "500g", price: 32000 },   // ₹320
    ],
    image_placeholder: "drumstick-pickle", // REPLACE with actual image
  },

  // ─── 2. Amla Pickle ────────────────────────────────────────────────────
  {
    slug: "amla-pickle",
    name: "Amla Pickle",
    subtitle: "Sour & Spicy",
    tag: "Rich in Vitamin C",
    spice_level: "medium",
    short_description: "Sun-dried Indian gooseberry in sesame oil — tangy, vitamin-rich, and beautifully spiced.",
    description: `<p>Amla, the powerhouse of Vitamin C, meets Andhra's bold pickling tradition in this classic recipe. Our Amla Pickle uses fresh Indian gooseberries preserved in cold-pressed sesame oil with a fragrant blend of spices that intensifies beautifully over days.</p><p>The sour bite of amla, balanced with red chilli heat and the warmth of fenugreek, makes this a perfectly complex pickle — healthy, gut-friendly, and incredibly flavourful. A pack that belongs in every Indian kitchen.</p>`,
    ingredients: "Indian Gooseberry / Amla (Usirikaya), Sesame Oil (Nuvvula Nune), Red Chilli Powder (Mirchi Podi), Salt (Uppu), Mustard Seeds (Avalu), Fenugreek Seeds (Menthulu), Turmeric (Pasupu), Curry Leaves (Karivepaku), Asafoetida (Inguva)",
    shelf_life_days: 120,
    is_vegetarian: true,
    is_featured: true,
    variants: [
      { weight_grams: 250, label: "250g", price: 16000 },   // ₹160
      { weight_grams: 500, label: "500g", price: 29000 },   // ₹290
    ],
    image_placeholder: "amla-pickle", // REPLACE with actual image
  },

  // ─── 3. Pulihora Gongura ───────────────────────────────────────────────
  {
    slug: "pulihora-gongura",
    name: "Pulihora Gongura",
    subtitle: "Spicy",
    tag: "Rare & Traditional",
    spice_level: "spicy",
    short_description: "The iconic Andhra sorrel paste — sour, spiced, and deeply aromatic. The soul of every Telugu meal.",
    description: `<p>Gongura is to Andhra what butter is to France — irreplaceable. Our Pulihora Gongura is made from fresh sorrel leaves sourced from farms in Andhra Pradesh, slowly cooked down with garlic, red chillies, and sesame into a thick, intensely flavourful paste.</p><p>Mix it into hot rice with a spoonful of ghee and you will understand why Andhraites across the world carry it in their hearts. Rare to find outside the region, unmistakably authentic from within it. Handmade in small batches with zero preservatives.</p>`,
    ingredients: "Gongura / Sorrel Leaves (Gongura Aaku), Sesame Oil (Nuvvula Nune), Red Chilli Powder (Mirchi Podi), Garlic (Vellulli), Sesame Seeds (Nuvvulu), Mustard Seeds (Avalu), Salt (Uppu), Dry Red Chillies (Endu Mirchi), Turmeric (Pasupu), Curry Leaves (Karivepaku), Asafoetida (Inguva)",
    shelf_life_days: 60,
    is_vegetarian: true,
    is_featured: true,
    variants: [
      { weight_grams: 250, label: "250g", price: 20000 },   // ₹200
      { weight_grams: 500, label: "500g", price: 37000 },   // ₹370
    ],
    image_placeholder: "pulihora-gongura", // REPLACE with actual image
  },

  // ─── 4. Lemon Pickle ───────────────────────────────────────────────────
  {
    slug: "lemon-pickle",
    name: "Lemon Pickle",
    subtitle: "Sour & Spicy",
    tag: "Classic Andhra Staple",
    spice_level: "medium",
    short_description: "Sun-kissed lemon quarters cured in spiced sesame oil. The timeless Andhra staple that completes every thali.",
    description: `<p>There is a reason Lemon Pickle has been on every Andhra dining table for generations — it is the one condiment that works with everything. Our Nimmakaya Urugai is made from thick-skinned, juicy lemons quarter-cut and slow-marinated in cold-pressed sesame oil with a blend of bold Andhra spices.</p><p>Over time, the lemon softens and the flavours deepen into something truly special — bright, tangy, and beautifully fragrant. A jar of this pickle elevates a simple papad lunch, completes a dal-rice thali, and brings the taste of Andhra home wherever you are. Shelf life of 6 months — it only gets better with age.</p>`,
    ingredients: "Lemon (Nimmakaya), Sesame Oil (Nuvvula Nune), Red Chilli Powder (Mirchi Podi), Rock Salt (Nattu Uppu), Mustard Seeds (Avalu), Fenugreek Seeds (Menthulu), Turmeric (Pasupu), Asafoetida (Inguva)",
    shelf_life_days: 180,
    is_vegetarian: true,
    is_featured: true,
    variants: [
      { weight_grams: 250, label: "250g", price: 15000 },   // ₹150
      { weight_grams: 500, label: "500g", price: 27000 },   // ₹270
    ],
    image_placeholder: "lemon-pickle", // REPLACE with actual image
  },

  // ─── 5. Maamidi Allam ─────────────────────────────────────────────────
  {
    slug: "maamidi-allam",
    name: "Maamidi Allam",
    subtitle: "Medium Spicy & Sweet",
    tag: "Best with Rice & Dosa",
    spice_level: "medium",
    short_description: "Raw mango and fresh ginger pickle — sweet, tangy, and warmly spiced. A Maa Flavours signature.",
    description: `<p>Maamidi Allam is the pickle that surprises everyone the first time — the bold tang of raw green mango meets the earthy warmth of fresh ginger in a perfectly balanced Andhra spice blend. A touch of jaggery rounds out the flavours into something sweet, sour, and beautifully complex.</p><p>This is one of Maa's most celebrated recipes — the one people request again and again. Pairs brilliantly with dosa, idli, upma, or simply spooned over hot rice. Handmade in small batches with no preservatives. No shortcuts.</p>`,
    ingredients: "Raw Mango (Maamidi Kaaya), Fresh Ginger (Allam), Sesame Oil (Nuvvula Nune), Red Chilli Powder (Mirchi Podi), Jaggery (Bellam), Mustard Seeds (Avalu), Salt (Uppu), Fenugreek Seeds (Menthulu), Turmeric (Pasupu), Curry Leaves (Karivepaku), Asafoetida (Inguva)",
    shelf_life_days: 90,
    is_vegetarian: true,
    is_featured: true,
    variants: [
      { weight_grams: 250, label: "250g", price: 19000 },   // ₹190
      { weight_grams: 500, label: "500g", price: 35000 },   // ₹350
    ],
    image_placeholder: "maamidi-allam", // REPLACE with actual image
  },

  // ─── 6. Red Chilli Pickle ──────────────────────────────────────────────
  {
    slug: "red-chilli-pickle",
    name: "Red Chilli Pickle",
    subtitle: "Extra Hot",
    tag: "Best with Rice",
    spice_level: "extra-hot",
    short_description: "Whole Guntur red chillies preserved in golden sesame oil — fiery, fragrant, and unmistakably Andhra.",
    description: `<p>The Guntur red chilli is legendary in the spice world — known for its intense heat, deep red colour, and smoky fragrance. Our Mirapakaya Urugai celebrates this extraordinary ingredient in its purest form. Whole chillies are packed in cold-pressed sesame oil with mustard seeds, fenugreek, and asafoetida.</p><p>This is a pickle for the bold. One piece added to hot rice with a drizzle of ghee creates an experience that lingers. Spicy, aromatic, honest — made exactly the way it has been made in Andhra homes for generations. Handle with love. Serve with respect.</p>`,
    ingredients: "Red Chilli — Guntur Variety (Mirapakaya), Sesame Oil (Nuvvula Nune), Mustard Seeds (Avalu), Salt (Uppu), Fenugreek Seeds (Menthulu), Turmeric (Pasupu), Sesame Seeds (Nuvvulu), Asafoetida (Inguva)",
    shelf_life_days: 120,
    is_vegetarian: true,
    is_featured: true,
    variants: [
      { weight_grams: 250, label: "250g", price: 17000 },   // ₹170
      { weight_grams: 500, label: "500g", price: 31000 },   // ₹310
    ],
    image_placeholder: "red-chilli-pickle", // REPLACE with actual image
  },
];

// ─── Site-wide constants ─────────────────────────────────────────────────

export const SITE = {
  name: "Maa Flavours",
  tagline: "Authentic Andhra Taste — The Way Maa Made It",
  origin: "Ongole, Andhra Pradesh",
  phone: "+91 97014 52929",
  email: "hello@maaflavours.com",    // REPLACE with actual email
  whatsapp: "919701452929",
  instagram: "https://instagram.com/maaflavours",
  facebook: "https://facebook.com/maaflavours",
  youtube: "https://youtube.com/@maaflavours",
  address: "Ongole, Andhra Pradesh 523001",
  gst: "37XXXXX0000X1Z5",            // REPLACE with actual GST once received
  fssai: "20126171000153",
  copyright_year: "2025",
} as const;

export const SHIPPING = {
  free_threshold_rupees: 499,
  free_threshold_paise: 49900,
  standard_charge_rupees: 49,
  standard_charge_paise: 4900,
  cod_extra_rupees: 30,
  cod_extra_paise: 3000,
  estimated_days: "3–7 business days",
  coverage: "Pan-India",
} as const;

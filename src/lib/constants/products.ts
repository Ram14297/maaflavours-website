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
  contains_garlic?: boolean;
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
    short_description: "Tender drumstick pieces slow-cured in groundnut oil with tamarind and Andhra spices. A hearty, tangy side for hot rice.",
    description: `<p>Our Drumstick Pickle brings together fresh, tender drumstick pieces with a bold tamarind-based Andhra spice blend. The tartness of tamarind, the heat of red chilli powder, and the earthy warmth of fenugreek and mustard come together in groundnut oil to create a deeply flavourful pickle.</p><p>Made the way Maa always made it — in small batches, with patience, and without a single preservative. Best enjoyed with hot steamed rice, a drizzle of ghee, or as a side to curd rice and dal.</p>`,
    ingredients: "Drumstick Pieces, Groundnut Oil, Tamarind, Red Chilli Powder, Salt, Mustard Seeds, Asafoetida, Fenugreek Powder",
    shelf_life_days: 90,
    is_vegetarian: true,
    is_featured: true,
    variants: [
      { weight_grams: 250, label: "250g", price: 21900 },   // ₹219
      { weight_grams: 500, label: "500g", price: 40900 },   // ₹409
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
    short_description: "Sun-dried raw mango pieces preserved in groundnut oil with red chilli and turmeric. Bold, tangy and made with just 6 pure ingredients.",
    description: `<p>Sun-drying raw mango is a tradition as old as Andhra kitchens themselves. The process concentrates the mango's natural sourness, creating an intense tangy base that no fresh mango can match. We slow-cure these sun-dried pieces in groundnut oil with red chilli, turmeric, and a pinch of asafoetida — nothing more, nothing less.</p><p>The result is a pickle that is sharp, bold, and unmistakably honest. Just six simple ingredients, prepared with the patience that only home-style recipes allow. Pairs perfectly with curd rice, chapati, or a simple dal-rice meal.</p>`,
    ingredients: "Raw Mango, Groundnut Oil, Salt, Red Chilli Powder, Asafoetida, Turmeric",
    shelf_life_days: 120,
    is_vegetarian: true,
    is_featured: true,
    variants: [
      { weight_grams: 250, label: "250g", price: 17900 },   // ₹179 (disabled/seasonal)
      { weight_grams: 500, label: "500g", price: 32900 },   // ₹329 (disabled/seasonal)
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
    short_description: "Fresh sorrel leaves cooked down with tamarind, garlic and red chilli in groundnut oil. The soul of Andhra cuisine in a jar.",
    description: `<p>Gongura is the heart of Andhra cooking — its sharp, natural sourness is unlike anything else. We take fresh sorrel leaves and slow-cook them in groundnut oil with tamarind, garlic, red chilli, fenugreek, and mustard seeds until they form a thick, deeply aromatic paste. The double sourness of gongura and tamarind, tempered by garlic's warmth, creates a condiment of extraordinary depth.</p><p>Mix a spoonful into hot rice with ghee and you will understand immediately why this pickle is an emotion for every Telugu household. Rare to find outside Andhra. Unmistakably authentic from within it.</p>`,
    ingredients: "Gongura (Sorrel Leaves), Groundnut Oil, Salt, Tamarind, Red Chilli Powder, Garlic, Fenugreek Powder, Mustard Seeds",
    shelf_life_days: 60,
    is_vegetarian: true,
    is_featured: true,
    contains_garlic: true,
    variants: [
      { weight_grams: 250, label: "250g", price: 21900 },   // ₹219 ⭐ fan fav
      { weight_grams: 500, label: "500g", price: 40900 },   // ₹409 ⭐ fan fav
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
    short_description: "Lemon quarters marinated in their own juice with red chilli, turmeric and fenugreek. Pure, tangy and completely oil-free.",
    description: `<p>Our Lemon Pickle is made the traditional way — no oil, no shortcuts. Fresh lemon quarters are packed in their own lemon juice with red chilli, salt, turmeric, and fenugreek powder, then left to slowly cure until the skin softens and the flavours deepen into something truly special.</p><p>The absence of oil makes this pickle lighter and brighter than most — sharp, tangy, and clean on the palate. It cuts through heavy food, lifts a plain rice meal, and keeps well for months. A staple that belongs in every kitchen.</p>`,
    ingredients: "Lemon, Red Chilli Powder, Salt, Lemon Juice, Turmeric, Fenugreek Powder",
    shelf_life_days: 180,
    is_vegetarian: true,
    is_featured: true,
    variants: [
      { weight_grams: 250, label: "250g", price: 17900 },   // ₹179
      { weight_grams: 500, label: "500g", price: 32900 },   // ₹329
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
    short_description: "Mango ginger slow-cooked with jaggery and tamarind — a beautifully balanced sweet, sour and spicy pickle unlike any other.",
    description: `<p>Mango Ginger (Curcuma amada) is one of the most unique rhizomes in Indian cooking — it looks like ginger but carries a natural mango-like fragrance that is impossible to replicate. We combine it with jaggery for sweetness, tamarind for sourness, and red chilli for heat to create a pickle that hits every note at once.</p><p>Sweet, sour, spicy, and aromatic — this is the pickle that people reach for again and again without knowing exactly why. It pairs brilliantly with dosa, idli, curd rice, or hot rice with ghee. A truly special recipe from Maa's kitchen.</p>`,
    ingredients: "Mango Ginger, Groundnut Oil, Jaggery, Tamarind, Red Chilli Powder, Salt",
    shelf_life_days: 90,
    is_vegetarian: true,
    is_featured: true,
    variants: [
      { weight_grams: 250, label: "250g", price: 19900 },   // ₹199
      { weight_grams: 500, label: "500g", price: 36900 },   // ₹369
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
    short_description: "Whole red chillies preserved in groundnut oil and tamarind. Just four ingredients — bold, fiery and unapologetically Andhra.",
    description: `<p>Four ingredients. That is all. Whole red chillies, groundnut oil, salt, and tamarind — preserved together until the chilli softens and the tamarind adds a subtle sour depth that balances the fire. This is minimalist Andhra pickling at its finest.</p><p>There are no distractions here — just the pure, raw power of red chilli elevated by tamarind's gentle tang. A small piece on the side of your rice plate is all it takes to transform an ordinary meal into something unforgettable. Not for the faint-hearted.</p>`,
    ingredients: "Red Chilli, Groundnut Oil, Salt, Tamarind",
    shelf_life_days: 120,
    is_vegetarian: true,
    is_featured: true,
    variants: [
      { weight_grams: 250, label: "250g", price: 19900 },   // ₹199
      { weight_grams: 500, label: "500g", price: 36900 },   // ₹369
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

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
    short_description: "Tender drumstick pieces marinated in traditional Andhra spices. A classic side for hot rice.",
    description: `Made with fresh drumstick pieces hand-selected for the perfect texture, our Drumstick Pickle is a celebration of authentic Andhra flavours. Each piece is marinated in a carefully balanced blend of traditional spices — mustard seeds, fenugreek, red chilli powder, turmeric, and our signature pickling oil.

Made the way Maa always made it — in small batches, with patience, and without a single preservative. Best enjoyed with hot steamed rice, dal, or curd rice.`,
    ingredients: "Drumstick, Sesame Oil, Red Chilli Powder, Mustard Seeds, Fenugreek Seeds, Turmeric, Salt, Curry Leaves, Asafoetida",
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
    short_description: "Tangy Indian gooseberry pickle, bursting with Vitamin C and authentic Andhra spice.",
    description: `Amla, the powerhouse of Vitamin C, meets Andhra's bold pickling tradition in this classic recipe. Our Amla Pickle uses fresh Indian gooseberries, preserved in a tangy, spiced oil marinade that intensifies beautifully over days.

The sour bite of amla balanced with red chilli heat and the warmth of fenugreek makes this a perfectly complex pickle — healthy and incredibly flavourful. A pack that belongs in every Indian kitchen.`,
    ingredients: "Indian Gooseberry (Amla), Sesame Oil, Red Chilli Powder, Mustard Seeds, Fenugreek Seeds, Turmeric, Salt, Curry Leaves, Asafoetida",
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
    short_description: "The iconic sour sorrel (gongura) of Andhra, prepared as a rich, spicy pulihora paste.",
    description: `Gongura — the soul of Andhra cuisine. This rare preparation blends the bold sourness of sorrel leaves with red chillies, sesame, and our special pickling masala to create a deeply flavourful condiment that Andhraites everywhere yearn for.

Pulihora Gongura is not just a pickle — it's an emotion. Mixed into hot rice with a spoon of ghee, it transforms an ordinary meal into something truly memorable. Made in small batches to preserve freshness.`,
    ingredients: "Gongura (Sorrel Leaves), Sesame Oil, Red Chilli Powder, Sesame Seeds, Mustard Seeds, Garlic, Turmeric, Salt, Curry Leaves, Asafoetida",
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
    short_description: "The timeless Andhra lemon pickle — perfectly balanced sour, spicy, and salty.",
    description: `A pantry staple in every Andhra household — our Lemon Pickle is made with thick-skinned, juicy lemons that are cut and left to marinate in a fragrant blend of red chilli, salt, and spices.

Over time, the lemon softens and the flavours deepen into something magical. This is the pickle that completes a thali, elevates a simple papad lunch, and reminds you of home no matter where you are.`,
    ingredients: "Lemon, Rock Salt, Red Chilli Powder, Sesame Oil, Mustard Seeds, Fenugreek Seeds, Turmeric, Asafoetida",
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
    short_description: "Raw mango and ginger pickle — a sweet, tangy, spicy blend that's perfect with dosa.",
    description: `Maamidi Allam is a uniquely Andhra pickle that brings together the tartness of raw green mango with the warmth of fresh ginger. The result is a complex, layered condiment — sweet, sour, spicy, and aromatic all at once.

This pickle has a devoted following — it pairs beautifully with dosa, idli, and hot rice alike. The ginger makes it wonderfully warming, while raw mango keeps it bright and tangy. A truly special recipe from Maa's kitchen.`,
    ingredients: "Raw Mango, Fresh Ginger, Sesame Oil, Red Chilli Powder, Jaggery, Mustard Seeds, Fenugreek Seeds, Turmeric, Salt, Curry Leaves, Asafoetida",
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
    subtitle: "Spicy",
    tag: "Best with Rice",
    spice_level: "spicy",
    short_description: "Whole red chillies preserved in spiced sesame oil — bold, fiery, and irresistible.",
    description: `Not for the faint-hearted — our Red Chilli Pickle is a fiery celebration of Andhra's love for heat. Whole red chillies are stuffed with a fragrant spice blend and preserved in golden sesame oil to create a pickle that's as beautiful to look at as it is bold to taste.

A tiny piece added to hot rice with ghee creates a transcendent experience. Made with locally sourced Guntur red chillies — known globally for their intense heat and deep flavour. Handle with love.`,
    ingredients: "Red Chilli (Guntur variety), Sesame Oil, Mustard Seeds, Fenugreek Seeds, Turmeric, Rock Salt, Asafoetida, Sesame Seeds",
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
  fssai: "Application In Progress",  // REPLACE when received
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

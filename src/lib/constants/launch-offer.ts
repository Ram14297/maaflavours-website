// src/lib/constants/launch-offer.ts
// Launch offer original prices — keyed by "slug-label"
// These are the original prices BEFORE the launch discount.
// Shown as crossed-out on product cards and detail pages.
// Remove this file when the launch offer ends and prices revert.

export const LAUNCH_ORIGINAL_PRICES: Record<string, number> = {
  // Aavakaaya
  "aavakaaya-250g": 20900,
  "aavakaaya-500g": 39900,
  // Amla Pickle
  "amla-pickle-250g": 19900,
  "amla-pickle-500g": 39900,
  // Drumstick Pickle
  "drumstick-pickle-250g": 19900,
  "drumstick-pickle-500g": 39900,
  // Lemon Pickle
  "lemon-pickle-250g": 17900,
  "lemon-pickle-500g": 34900,
  // Pulihora Gongura
  "pulihora-gongura-250g": 20900,
  "pulihora-gongura-500g": 39900,
  // Red Chilli Pickle
  "red-chilli-pickle-250g": 19900,
  "red-chilli-pickle-500g": 39900,
  // Curry Leaf Powder (100g unchanged — no entry)
  "curry-leaf-powder-250g": 17900,
  "curry-leaf-powder-500g": 32900,
};

/** Returns original price in paise if a discount exists, else null */
export function getOriginalPrice(slug: string, label: string): number | null {
  const key = `${slug}-${label.toLowerCase()}`;
  return LAUNCH_ORIGINAL_PRICES[key] ?? null;
}

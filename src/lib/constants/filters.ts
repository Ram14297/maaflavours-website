// src/lib/constants/filters.ts
// Maa Flavours — Filter & Sort configuration for the Products page
// Centralized so both sidebar and mobile drawer use the same data

export const SPICE_FILTER_OPTIONS = [
  { value: "mild", label: "Mild", emoji: "🌿", className: "badge-mild" },
  { value: "medium", label: "Medium Spicy", emoji: "🌶️", className: "badge-medium" },
  { value: "spicy", label: "Spicy", emoji: "🌶️🌶️", className: "badge-spicy" },
  { value: "extra-hot", label: "Extra Hot", emoji: "🔥", className: "badge-extra-hot" },
] as const;

export const TASTE_FILTER_OPTIONS = [
  { value: "sour", label: "Sour & Tangy" },
  { value: "spicy", label: "Spicy" },
  { value: "sweet", label: "Sweet" },
  { value: "savory", label: "Savory" },
] as const;

export const PRICE_RANGES = [
  { value: "all", label: "All Prices" },
  { value: "0-200", label: "Under ₹200" },
  { value: "200-300", label: "₹200 – ₹300" },
  { value: "300-400", label: "₹300 – ₹400" },
  { value: "400+", label: "₹400 & above" },
] as const;

export const WEIGHT_OPTIONS = [
  { value: "250", label: "250g" },
  { value: "500", label: "500g" },
] as const;

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "newest", label: "Newest First" },
  { value: "bestseller", label: "Best Sellers" },
] as const;

export type SpiceFilterValue = (typeof SPICE_FILTER_OPTIONS)[number]["value"];
export type SortValue = (typeof SORT_OPTIONS)[number]["value"];
export type PriceRangeValue = (typeof PRICE_RANGES)[number]["value"];
export type WeightValue = (typeof WEIGHT_OPTIONS)[number]["value"];

export interface ProductFilters {
  spice: SpiceFilterValue[];
  weight: WeightValue[];
  priceRange: PriceRangeValue;
  search: string;
}

export const DEFAULT_FILTERS: ProductFilters = {
  spice: [],
  weight: [],
  priceRange: "all",
  search: "",
};

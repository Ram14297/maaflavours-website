"use client";
// src/hooks/useProductFilters.ts
// Maa Flavours — Custom hook for product filtering & sorting logic

import { useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { PRODUCTS, ProductSeed } from "@/lib/constants/products";
import {
  DEFAULT_FILTERS,
  ProductFilters,
  SortValue,
  WeightValue,
  PriceRangeValue,
} from "@/lib/constants/filters";

export function useProductFilters(externalProducts?: ProductSeed[]) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<ProductFilters>(() => {
    const weight = searchParams.getAll("weight") as WeightValue[];
    const priceRange = (searchParams.get("price") || "all") as PriceRangeValue;
    const search = searchParams.get("q") || "";
    return { spice: [], weight, priceRange, search };
  });

  const [sortBy, setSortBy] = useState<SortValue>(
    (searchParams.get("sort") as SortValue) || "featured"
  );

  const syncToUrl = useCallback(
    (newFilters: ProductFilters, newSort: SortValue) => {
      const params = new URLSearchParams();
      newFilters.weight.forEach((w) => params.append("weight", w));
      if (newFilters.priceRange !== "all") params.set("price", newFilters.priceRange);
      if (newFilters.search) params.set("q", newFilters.search);
      if (newSort !== "featured") params.set("sort", newSort);
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
    },
    [router, pathname]
  );

  const toggleWeight = useCallback(
    (value: WeightValue) => {
      const newFilters = {
        ...filters,
        weight: filters.weight.includes(value)
          ? filters.weight.filter((w) => w !== value)
          : [...filters.weight, value],
      };
      setFilters(newFilters);
      syncToUrl(newFilters, sortBy);
    },
    [filters, sortBy, syncToUrl]
  );

  const setPriceRange = useCallback(
    (value: PriceRangeValue) => {
      const newFilters = { ...filters, priceRange: value };
      setFilters(newFilters);
      syncToUrl(newFilters, sortBy);
    },
    [filters, sortBy, syncToUrl]
  );

  const setSearch = useCallback(
    (value: string) => {
      const newFilters = { ...filters, search: value };
      setFilters(newFilters);
      syncToUrl(newFilters, sortBy);
    },
    [filters, sortBy, syncToUrl]
  );

  const updateSort = useCallback(
    (value: SortValue) => {
      setSortBy(value);
      syncToUrl(filters, value);
    },
    [filters, syncToUrl]
  );

  const clearAllFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSortBy("featured");
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.weight.length > 0) count += filters.weight.length;
    if (filters.priceRange !== "all") count += 1;
    if (filters.search) count += 1;
    return count;
  }, [filters]);

  const filteredProducts = useMemo(() => {
    let list = [...(externalProducts ?? PRODUCTS)];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.tag.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (filters.weight.length > 0) {
      list = list.filter((p) =>
        p.variants.some((v) =>
          filters.weight.includes(String(v.weight_grams) as WeightValue)
        )
      );
    }

    if (filters.priceRange !== "all") {
      list = list.filter((p) => {
        const minPrice = Math.min(...p.variants.map((v) => v.price)) / 100;
        if (filters.priceRange === "0-200") return minPrice < 200;
        if (filters.priceRange === "200-300") return minPrice >= 200 && minPrice < 300;
        if (filters.priceRange === "300-400") return minPrice >= 300 && minPrice < 400;
        if (filters.priceRange === "400+") return minPrice >= 400;
        return true;
      });
    }

    if (sortBy === "price-asc") {
      list.sort((a, b) => Math.min(...a.variants.map((v) => v.price)) - Math.min(...b.variants.map((v) => v.price)));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => Math.min(...b.variants.map((v) => v.price)) - Math.min(...a.variants.map((v) => v.price)));
    } else if (sortBy === "name-asc") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [filters, sortBy, externalProducts]);

  return {
    filters,
    sortBy,
    activeFilterCount,
    filteredProducts,
    toggleWeight,
    setPriceRange,
    setSearch,
    updateSort,
    clearAllFilters,
  };
}

// src/app/sitemap.ts
// Maa Flavours — Dynamic XML Sitemap
// Auto-generates sitemap with all active products fetched from Supabase
// Accessible at /sitemap.xml — submitted to Google Search Console

import { MetadataRoute } from "next";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

const BASE_URL = "https://maaflavours.com";

// Static pages with their priorities
const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: BASE_URL,                          lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
  { url: `${BASE_URL}/products`,            lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
  { url: `${BASE_URL}/powders`,             lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
  { url: `${BASE_URL}/about`,               lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${BASE_URL}/contact`,             lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${BASE_URL}/blog`,                lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
  { url: `${BASE_URL}/faq`,                 lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  { url: `${BASE_URL}/cart`,                lastModified: new Date(), changeFrequency: "never",   priority: 0.3 },
  { url: `${BASE_URL}/shipping-policy`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  { url: `${BASE_URL}/return-policy`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  { url: `${BASE_URL}/privacy-policy`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  { url: `${BASE_URL}/terms`,               lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const supabase = createAdminSupabaseClient();
    const { data: products } = await supabase
      .from("products")
      .select("slug, updated_at")
      .eq("is_active", true);

    const productPages: MetadataRoute.Sitemap = (products || []).map((p) => ({
      url:             `${BASE_URL}/products/${p.slug}`,
      lastModified:    new Date(p.updated_at),
      changeFrequency: "weekly" as const,
      priority:        0.85,
    }));

    return [...STATIC_PAGES, ...productPages];
  } catch {
    // Fallback to static pages only if DB is unreachable
    return STATIC_PAGES;
  }
}

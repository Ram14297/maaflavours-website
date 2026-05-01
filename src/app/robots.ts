// src/app/robots.ts
// Maa Flavours — robots.txt generator
// Tells search engines what to crawl and where sitemap is

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/account/",
          "/checkout/",
          "/cart",
          "/order-confirmation/",
        ],
      },
    ],
    sitemap: "https://maaflavours.com/sitemap.xml",
  };
}

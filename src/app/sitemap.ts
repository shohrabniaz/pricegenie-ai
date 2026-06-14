import type { MetadataRoute } from "next";
import { SEO_GUIDES } from "@/data/seo-guides";

const BASE = "https://pricegenie-ai.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const guides = SEO_GUIDES.map((guide) => ({
    url: `${BASE}/best/${guide.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const staticPages = ["", "/search", "/analyze", "/coupons", "/student", "/advisor"].map(
    (path) => ({
      url: `${BASE}${path}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: path === "" ? 1 : 0.7,
    })
  );

  return [...staticPages, ...guides];
}

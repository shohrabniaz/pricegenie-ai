import type { PriceSource } from "@/lib/price-feed";

export type PriceFreshness = "live" | "recent" | "stale" | "estimate";

export function daysSinceIsoDate(isoDate: string): number {
  const [y, m, d] = isoDate.split("-").map(Number);
  const then = new Date(y, m - 1, d);
  const now = new Date();
  return Math.round((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
}

export function getPriceFreshness(
  updatedAt: string,
  source: PriceSource
): PriceFreshness {
  if (source === "catalog") return "estimate";
  const days = daysSinceIsoDate(updatedAt);
  if (days <= 1) return "live";
  if (days <= 3) return "recent";
  return "stale";
}

export const FRESHNESS_LABELS: Record<PriceFreshness, string> = {
  live: "Live price",
  recent: "Updated recently",
  stale: "May be outdated",
  estimate: "Catalog estimate",
};

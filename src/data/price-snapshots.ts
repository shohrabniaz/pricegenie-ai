import type { Retailer } from "@/types";
import snapshotJson from "./price-snapshots.json";

export interface PriceSnapshot {
  updatedAt: string;
  offers: Partial<Record<Retailer, number>>;
  /** Set by the daily scraper when a retailer price was read from a product page. */
  verified?: Partial<Record<Retailer, boolean>>;
}

/** Daily-refreshed store prices (see `.github/workflows/price-refresh.yml`). */
export const PRICE_SNAPSHOTS = snapshotJson as Record<string, PriceSnapshot>;

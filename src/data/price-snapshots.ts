import type { Retailer } from "@/types";
import snapshotJson from "./price-snapshots.json";

export interface PriceSnapshot {
  updatedAt: string;
  offers: Partial<Record<Retailer, number>>;
}

/** Daily-refreshed store prices (see `.github/workflows/price-refresh.yml`). */
export const PRICE_SNAPSHOTS = snapshotJson as Record<string, PriceSnapshot>;

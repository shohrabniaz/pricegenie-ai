import type { Retailer } from "@/types";

/**
 * Optional live price overrides — populate via `npm run prices:refresh` or manual edit.
 * Keys are product IDs; values map retailer → store list price (AUD, no codes).
 */
export interface PriceSnapshot {
  updatedAt: string;
  offers: Partial<Record<Retailer, number>>;
}

export const PRICE_SNAPSHOTS: Record<string, PriceSnapshot> = {
  // Example (uncomment and update after running refresh script):
  // "iphone-17-pro-256": {
  //   updatedAt: "2026-06-12",
  //   offers: { "jb-hifi": 1899, "the-good-guys": 1799 },
  // },
};

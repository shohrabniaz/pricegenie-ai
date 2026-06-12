/**
 * Scaffold for refreshing store prices from retailer pages or a feed API.
 *
 * Usage:
 *   npx tsx scripts/refresh-price-snapshots.ts
 *
 * Next steps to go live:
 * 1. Implement fetchRetailerPrice(retailer, productName) per store
 * 2. Write results to src/data/price-snapshots.ts
 * 3. Or host JSON at PRICE_FEED_URL and set env on Vercel
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { PRODUCTS } from "../src/data/products";
import { CATALOG_PRICE_UPDATED_AT } from "../src/data/catalog-meta";
import type { PriceSnapshot } from "../src/data/price-snapshots";

const today = CATALOG_PRICE_UPDATED_AT;

const snapshots: Record<string, PriceSnapshot> = {};

for (const product of PRODUCTS) {
  const offers: PriceSnapshot["offers"] = {};
  for (const offer of product.offers.filter((o) => o.inStock)) {
    offers[offer.retailer] = offer.listPrice;
  }
  snapshots[product.id] = { updatedAt: today, offers };
}

const outPath = join(process.cwd(), "src/data/price-snapshots.json");
writeFileSync(outPath, `${JSON.stringify(snapshots, null, 2)}\n`, "utf8");
console.log(`Wrote ${Object.keys(snapshots).length} product snapshots to ${outPath}`);
console.log("Set PRICE_FEED_URL to a hosted copy of this JSON for live API merges.");

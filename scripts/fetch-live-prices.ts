/**
 * Daily price refresh — scrapes retailer search pages and writes price-snapshots.json.
 *
 * Usage:
 *   npm run prices:fetch-live
 *   PRICE_REFRESH_LIMIT=5 npm run prices:fetch-live   # smoke test
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import { PRODUCTS } from "../src/data/products";
import type { PriceSnapshot } from "../src/data/price-snapshots";
import type { PriceHistoryPoint } from "../src/types";
import {
  isPlausiblePrice,
  sleep,
  todayIsoDate,
} from "./lib/price-parse";
import { appendPriceHistoryPoint } from "../src/lib/price-history";
import { createScraperPage, scrapeRetailPrice } from "./lib/retailer-scraper";

const DELAY_MS = Number(process.env.PRICE_REFRESH_DELAY_MS ?? 2_500);
const LIMIT = process.env.PRICE_REFRESH_LIMIT
  ? Number(process.env.PRICE_REFRESH_LIMIT)
  : undefined;

const ROOT = process.cwd();
const SNAPSHOT_PATH = join(ROOT, "src/data/price-snapshots.json");
const HISTORY_PATH = join(ROOT, "src/data/price-history-log.json");
const META_PATH = join(ROOT, "src/data/catalog-meta.ts");

function loadExistingHistory(): Record<string, PriceHistoryPoint[]> {
  if (!existsSync(HISTORY_PATH)) return {};
  try {
    return JSON.parse(readFileSync(HISTORY_PATH, "utf8")) as Record<
      string,
      PriceHistoryPoint[]
    >;
  } catch {
    return {};
  }
}

function loadExistingSnapshots(): Record<string, PriceSnapshot> {
  if (!existsSync(SNAPSHOT_PATH)) return {};
  try {
    return JSON.parse(readFileSync(SNAPSHOT_PATH, "utf8")) as Record<
      string,
      PriceSnapshot
    >;
  } catch {
    return {};
  }
}

function writeSnapshots(
  snapshots: Record<string, PriceSnapshot>,
  history: Record<string, PriceHistoryPoint[]>,
  stats: { success: number; failed: number; skipped: number }
) {
  writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(snapshots, null, 2)}\n`, "utf8");
  writeFileSync(HISTORY_PATH, `${JSON.stringify(history, null, 2)}\n`, "utf8");

  const today = todayIsoDate();
  writeFileSync(
    META_PATH,
    `/** When catalog store prices were last reviewed (ISO date). */\nexport const CATALOG_PRICE_UPDATED_AT = "${today}";\n`,
    "utf8"
  );

  console.log(`\nWrote ${Object.keys(snapshots).length} products → ${SNAPSHOT_PATH}`);
  console.log(`Wrote ${Object.keys(history).length} history series → ${HISTORY_PATH}`);
  console.log(`Updated CATALOG_PRICE_UPDATED_AT → ${today}`);
  console.log(
    `Scrape results: ${stats.success} ok, ${stats.failed} failed, ${stats.skipped} kept previous`
  );
}

async function main() {
  const existing = loadExistingSnapshots();
  const historyLog = loadExistingHistory();
  const today = todayIsoDate();
  const products = LIMIT ? PRODUCTS.slice(0, LIMIT) : PRODUCTS;

  const snapshots: Record<string, PriceSnapshot> = { ...existing };
  const stats = { success: 0, failed: 0, skipped: 0 };

  console.log(`PriceGenie — live price refresh (${products.length} products)\n`);

  const browser = await chromium.launch({ headless: true });
  const page = await createScraperPage(browser);

  try {
    for (const product of products) {
      const offers: PriceSnapshot["offers"] = {
        ...(existing[product.id]?.offers ?? {}),
      };

      console.log(`→ ${product.name}`);

      for (const offer of product.offers) {
        if (!offer.inStock) continue;

        const scraped = await scrapeRetailPrice(
          page,
          offer.retailer,
          product.name
        );

        const fallback =
          existing[product.id]?.offers[offer.retailer] ?? offer.listPrice;

        if (scraped && isPlausiblePrice(scraped, offer.listPrice)) {
          offers[offer.retailer] = scraped;
          stats.success += 1;
          const delta = scraped - offer.listPrice;
          const mark = delta === 0 ? "=" : delta > 0 ? "↑" : "↓";
          console.log(
            `   ✓ ${offer.retailerName}: $${scraped} ${mark} (catalog $${offer.listPrice})`
          );
        } else if (scraped) {
          offers[offer.retailer] = fallback;
          stats.skipped += 1;
          console.log(
            `   ~ ${offer.retailerName}: kept $${fallback} (scraped $${scraped} out of range)`
          );
        } else {
          offers[offer.retailer] = fallback;
          stats.failed += 1;
          console.log(
            `   ✗ ${offer.retailerName}: kept $${fallback} (scrape failed)`
          );
        }

        await sleep(DELAY_MS);
      }

      snapshots[product.id] = { updatedAt: today, offers };

      const inStockPrices = product.offers
        .filter((o) => o.inStock)
        .map((o) => offers[o.retailer])
        .filter((p): p is number => typeof p === "number" && p > 0);
      if (inStockPrices.length > 0) {
        appendPriceHistoryPoint(
          historyLog,
          product.id,
          today,
          Math.min(...inStockPrices)
        );
      }
    }
  } finally {
    await page.close();
    await browser.close();
  }

  writeSnapshots(snapshots, historyLog, stats);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

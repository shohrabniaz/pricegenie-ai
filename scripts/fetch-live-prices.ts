/**
 * Daily price refresh — scrapes retailer product pages and writes price-snapshots.json.
 *
 * Usage:
 *   npm run prices:fetch-live
 *   PRICE_REFRESH_LIMIT=5 npm run prices:fetch-live   # smoke test
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { APP_NAME } from "../src/lib/brand";
import { chromium } from "@playwright/test";
import { CATALOG_PRODUCTS } from "../src/data/products";
import type { PriceSnapshot } from "../src/data/price-snapshots";
import type { OfferDeepLinks } from "../src/lib/offer-deep-links";
import type { PriceHistoryPoint, Retailer } from "../src/types";
import {
  isPlausiblePrice,
  sleep,
  todayIsoDate,
} from "./lib/price-parse";
import { appendPriceHistoryPoint } from "../src/lib/price-history";
import { isProductPageUrl, scoreTitleMatch } from "../src/lib/offer-deep-links";
import { createScraperPage, scrapeRetailPrice } from "./lib/retailer-scraper";

const DELAY_MS = Number(process.env.PRICE_REFRESH_DELAY_MS ?? 2_500);
const LIMIT = process.env.PRICE_REFRESH_LIMIT
  ? Number(process.env.PRICE_REFRESH_LIMIT)
  : undefined;

const ROOT = process.cwd();
const SNAPSHOT_PATH = join(ROOT, "src/data/price-snapshots.json");
const HISTORY_PATH = join(ROOT, "src/data/price-history-log.json");
const DEEP_LINKS_PATH = join(ROOT, "src/data/offer-deep-links.json");
const META_PATH = join(ROOT, "src/data/catalog-meta.ts");
const METRICS_PATH = join(ROOT, "src/data/scrape-metrics.json");

interface RetailerScrapeStats {
  ok: number;
  failed: number;
  kept: number;
  skipped: number;
}

interface ScrapeMetrics {
  generatedAt: string;
  productsScraped: number;
  totals: {
    ok: number;
    failed: number;
    skipped: number;
    linksDiscovered: number;
  };
  byRetailer: Record<string, RetailerScrapeStats>;
}

function emptyRetailerStats(): RetailerScrapeStats {
  return { ok: 0, failed: 0, kept: 0, skipped: 0 };
}

function loadDeepLinks(): OfferDeepLinks {
  if (!existsSync(DEEP_LINKS_PATH)) return {};
  try {
    return JSON.parse(readFileSync(DEEP_LINKS_PATH, "utf8")) as OfferDeepLinks;
  } catch {
    return {};
  }
}

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
  deepLinks: OfferDeepLinks,
  stats: {
    success: number;
    failed: number;
    skipped: number;
    linksDiscovered: number;
  },
  metrics: ScrapeMetrics
) {
  writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(snapshots, null, 2)}\n`, "utf8");
  writeFileSync(HISTORY_PATH, `${JSON.stringify(history, null, 2)}\n`, "utf8");
  writeFileSync(DEEP_LINKS_PATH, `${JSON.stringify(deepLinks, null, 2)}\n`, "utf8");
  writeFileSync(METRICS_PATH, `${JSON.stringify(metrics, null, 2)}\n`, "utf8");

  const today = todayIsoDate();
  writeFileSync(
    META_PATH,
    `/** When catalog store prices were last reviewed (ISO date). */\nexport const CATALOG_PRICE_UPDATED_AT = "${today}";\n`,
    "utf8"
  );

  console.log(`\nWrote ${Object.keys(snapshots).length} products → ${SNAPSHOT_PATH}`);
  console.log(`Wrote ${Object.keys(history).length} history series → ${HISTORY_PATH}`);
  console.log(
    `Wrote ${Object.keys(deepLinks).length} products with deep links → ${DEEP_LINKS_PATH}`
  );
  console.log(`Updated CATALOG_PRICE_UPDATED_AT → ${today}`);
  console.log(
    `Scrape results: ${stats.success} ok, ${stats.failed} failed, ${stats.skipped} skipped, ${stats.linksDiscovered} new URLs`
  );
  console.log("\nPer-retailer:");
  for (const [retailer, r] of Object.entries(metrics.byRetailer).sort(
    (a, b) => b[1].ok - a[1].ok
  )) {
    console.log(
      `  ${retailer}: ${r.ok} ok, ${r.failed} fail, ${r.kept} kept, ${r.skipped} skip`
    );
  }
  console.log(`\nMetrics → ${METRICS_PATH}`);
}

async function main() {
  const existing = loadExistingSnapshots();
  const historyLog = loadExistingHistory();
  const deepLinks = loadDeepLinks();
  const today = todayIsoDate();
  const products = LIMIT ? CATALOG_PRODUCTS.slice(0, LIMIT) : CATALOG_PRODUCTS;

  const snapshots: Record<string, PriceSnapshot> = { ...existing };
  const stats = { success: 0, failed: 0, skipped: 0, linksDiscovered: 0 };
  const byRetailer: Record<string, RetailerScrapeStats> = {};

  function retailerStats(retailer: Retailer): RetailerScrapeStats {
    if (!byRetailer[retailer]) byRetailer[retailer] = emptyRetailerStats();
    return byRetailer[retailer]!;
  }

  console.log(`${APP_NAME} — live price refresh (${products.length} products)\n`);

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

        const catalogPrice = offer.listPrice;
        const retailer = offer.retailer as Retailer;
        const cachedUrl = deepLinks[product.id]?.[retailer]?.url;

        const { price: scraped, productUrl } = await scrapeRetailPrice(
          page,
          retailer,
          product.name,
          catalogPrice,
          cachedUrl
        );

        if (
          productUrl &&
          isProductPageUrl(retailer, productUrl) &&
          deepLinks[product.id]?.[retailer]?.url !== productUrl
        ) {
          const pageTitle = await page.title();
          const titleScore = Math.max(
            scoreTitleMatch(pageTitle, product.name),
            scoreTitleMatch(productUrl, product.name)
          );
          if (titleScore >= 0.35) {
            if (!deepLinks[product.id]) deepLinks[product.id] = {};
            deepLinks[product.id]![retailer] = {
              url: productUrl,
              discoveredAt: today,
            };
            stats.linksDiscovered += 1;
            console.log(`   ↳ saved product URL (${retailer})`);
          } else {
            console.log(
              `   ↳ rejected product URL (${retailer}, title match ${Math.round(titleScore * 100)}%)`
            );
          }
        }

        const previous =
          existing[product.id]?.offers[offer.retailer] ?? catalogPrice;

        let resolved = catalogPrice;
        if (scraped && isPlausiblePrice(scraped, catalogPrice)) {
          resolved = scraped;
          stats.success += 1;
          retailerStats(retailer).ok += 1;
          const delta = scraped - catalogPrice;
          const mark = delta === 0 ? "=" : delta > 0 ? "↑" : "↓";
          const via = productUrl || cachedUrl ? "PDP" : "search";
          console.log(
            `   ✓ ${offer.retailerName}: $${scraped} ${mark} (catalog $${catalogPrice}, ${via})`
          );
        } else if (isPlausiblePrice(previous, catalogPrice)) {
          resolved = previous;
          retailerStats(retailer).kept += 1;
          if (scraped) {
            stats.skipped += 1;
            retailerStats(retailer).skipped += 1;
            console.log(
              `   ~ ${offer.retailerName}: kept $${previous} (scraped $${scraped} out of range)`
            );
          } else {
            stats.failed += 1;
            retailerStats(retailer).failed += 1;
            console.log(
              `   ✗ ${offer.retailerName}: kept $${previous} (scrape failed)`
            );
          }
        } else {
          resolved = catalogPrice;
          stats.skipped += 1;
          retailerStats(retailer).skipped += 1;
          console.log(
            `   ~ ${offer.retailerName}: reset to catalog $${catalogPrice} (was $${previous})`
          );
        }

        offers[offer.retailer] = resolved;

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

  const metrics: ScrapeMetrics = {
    generatedAt: today,
    productsScraped: products.length,
    totals: {
      ok: stats.success,
      failed: stats.failed,
      skipped: stats.skipped,
      linksDiscovered: stats.linksDiscovered,
    },
    byRetailer,
  };

  writeSnapshots(snapshots, historyLog, deepLinks, stats, metrics);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

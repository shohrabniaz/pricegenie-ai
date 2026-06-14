import type { Page } from "@playwright/test";
import type { Retailer } from "@/types";
import { buildRetailerProductUrl } from "@/lib/retailer-urls";
import { parseAudPrice, pickBestScrapedPrice } from "./price-parse";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const RETAILER_SELECTORS: Partial<Record<Retailer, string[]>> = {
  "jb-hifi": [
    "[data-testid='product-tile-price']",
    ".price__value",
    ".price",
    "[class*='Price']",
  ],
  "harvey-norman": [".price", "[data-price]", ".product-price"],
  "the-good-guys": [".price", "[data-price-value]", ".product-price"],
  "amazon-au": [".a-price .a-offscreen", ".a-price-whole", "#priceblock_ourprice"],
  kogan: [".price", "[class*='price']", ".product-price"],
  officeworks: [".price", "[data-price]", ".ow-price"],
  "big-w": [".price", "[data-testid='price']"],
  "ebay-au": [".s-item__price", ".x-price-primary"],
  kmart: [".price", "[class*='Price']", "[data-testid='price']"],
};

/** Limit scraping to product tiles on retailer search result pages. */
const SEARCH_RESULT_ROOT: Partial<Record<Retailer, string>> = {
  "jb-hifi": "[data-testid='product-tile'], .product-tile, article[class*='product']",
  "harvey-norman": ".product-item, .product, [data-product-id]",
  "the-good-guys": ".product, [class*='ProductCard']",
  "amazon-au": "[data-component-type='s-search-result']",
  kogan: ".product-card, [class*='product']",
  officeworks: ".product-tile, [data-testid='product-tile']",
  "big-w": "[data-testid='product-tile'], .ProductTile",
  "ebay-au": ".s-item",
  kmart: "[data-testid='product-card'], .product-card",
};

function isSearchResultsUrl(url: string): boolean {
  return /search|\/s\?|_nkw=|query=|searchTerm=/i.test(url);
}

async function extractJsonLdPrice(page: Page): Promise<number | null> {
  return page.evaluate(() => {
    const scripts = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]')
    );

    for (const script of scripts) {
      try {
        const raw = JSON.parse(script.textContent || "null");
        const nodes = Array.isArray(raw) ? raw : [raw];

        for (const node of nodes) {
          if (!node || typeof node !== "object") continue;
          const type = node["@type"];
          const isProduct =
            type === "Product" ||
            (Array.isArray(type) && type.includes("Product"));

          if (!isProduct) continue;

          const offers = node.offers ?? node.Offers;
          const offer = Array.isArray(offers) ? offers[0] : offers;
          const price =
            offer?.price ??
            offer?.lowPrice ??
            offer?.highPrice ??
            node.price;

          if (price !== undefined && price !== null) {
            const n = Math.round(Number(price));
            if (n > 0) return n;
          }
        }
      } catch {
        /* ignore malformed JSON-LD */
      }
    }

    return null;
  });
}

async function pricesFromLocator(
  locator: ReturnType<Page["locator"]>,
  selectors: string[]
): Promise<number[]> {
  const prices: number[] = [];
  for (const selector of selectors) {
    const nodes = locator.locator(selector);
    const count = await nodes.count();
    for (let i = 0; i < Math.min(count, 3); i++) {
      const text = await nodes.nth(i).textContent();
      if (!text) continue;
      const price = parseAudPrice(text);
      if (price) prices.push(price);
    }
  }
  return prices;
}

async function extractFromSearchResults(
  page: Page,
  retailer: Retailer,
  selectors: string[],
  catalogPrice: number
): Promise<number | null> {
  const rootSelector = SEARCH_RESULT_ROOT[retailer];
  if (!rootSelector) return null;

  const tiles = page.locator(rootSelector);
  const tileCount = await tiles.count();
  const candidates: number[] = [];

  for (let i = 0; i < Math.min(tileCount, 4); i++) {
    const tilePrices = await pricesFromLocator(tiles.nth(i), selectors);
    candidates.push(...tilePrices);
  }

  return pickBestScrapedPrice(candidates, catalogPrice);
}

async function extractFromSelectors(
  page: Page,
  selectors: string[]
): Promise<number | null> {
  const prices = await pricesFromLocator(page.locator("body"), selectors);
  return prices[0] ?? null;
}

export async function scrapeRetailPrice(
  page: Page,
  retailer: Retailer,
  productName: string,
  catalogPrice: number
): Promise<number | null> {
  const url = buildRetailerProductUrl(retailer, productName);

  try {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 45_000,
    });
    await page.waitForTimeout(2_000);

    const selectors = RETAILER_SELECTORS[retailer] ?? [".price"];
    const onSearch = isSearchResultsUrl(url);

    if (onSearch) {
      const fromSearch = await extractFromSearchResults(
        page,
        retailer,
        selectors,
        catalogPrice
      );
      if (fromSearch) return fromSearch;
    } else {
      const fromLd = await extractJsonLdPrice(page);
      if (fromLd && pickBestScrapedPrice([fromLd], catalogPrice)) {
        return fromLd;
      }
    }

    const fromSelectors = await extractFromSelectors(page, selectors);
    if (fromSelectors && pickBestScrapedPrice([fromSelectors], catalogPrice)) {
      return fromSelectors;
    }

    return null;
  } catch {
    return null;
  }
}

export async function createScraperPage(browser: Awaited<ReturnType<typeof import("@playwright/test").chromium.launch>>) {
  const context = await browser.newContext({
    userAgent: USER_AGENT,
    locale: "en-AU",
    timezoneId: "Australia/Sydney",
    viewport: { width: 1280, height: 800 },
  });
  return context.newPage();
}

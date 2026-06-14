import type { Page } from "@playwright/test";
import type { Retailer } from "@/types";
import { buildRetailerProductUrl } from "@/lib/retailer-urls";
import { isProductPageUrl, scoreTitleMatch } from "@/lib/offer-deep-links";
import { parseAudPrice, pickBestScrapedPrice } from "./price-parse";

const RETAILER_PRICE_SELECTORS: Partial<Record<Retailer, string[]>> = {
  "jb-hifi": [
    "[data-testid='product-tile-price']",
    ".price__value",
    ".price",
    "#price",
    "[class*='Price']",
  ],
  "harvey-norman": [".price", "[data-price]", ".product-price", "#product-price"],
  "the-good-guys": [".price", "[data-price-value]", ".product-price"],
  "amazon-au": [
    ".a-price .a-offscreen",
    "#corePrice_feature_div .a-offscreen",
    "#priceblock_ourprice",
    ".a-price-whole",
  ],
  kogan: [".price", "[class*='price']", ".product-price"],
  officeworks: [".price", "[data-price]", ".ow-price"],
  "big-w": [".price", "[data-testid='price']"],
  "ebay-au": [".x-price-primary", "#prcIsum", ".display-price"],
  kmart: [".price", "[class*='Price']", "[data-testid='price']"],
};

const SEARCH_RESULT_ROOT: Partial<Record<Retailer, string>> = {
  "jb-hifi": "[data-testid='product-tile'], .product-tile",
  "harvey-norman": ".product-item-info, .product-item",
  "the-good-guys": "[class*='product-card'], .product",
  "amazon-au": "[data-component-type='s-search-result']",
  kogan: ".product-card, [class*='ProductCard']",
  officeworks: ".product-tile, [data-testid='product-tile']",
  "big-w": "[data-testid='product-tile']",
  "ebay-au": ".s-item",
  kmart: "[data-testid='product-card'], .product-card",
};

const TILE_LINK_HINT: Partial<Record<Retailer, string>> = {
  "jb-hifi": "a[href*='/products/']",
  "harvey-norman": "a[href*='.html']",
  "the-good-guys": "a[href*='/p/']",
  "amazon-au": "a[href*='/dp/'], a[href*='/gp/product/']",
  kogan: "a[href*='/au/buy/']",
  officeworks: "a[href*='/shop/']",
  "big-w": "a[href*='/product/']",
  "ebay-au": "a[href*='/itm/']",
  kmart: "a[href*='/product/']",
};

export interface ScrapeResult {
  price: number | null;
  productUrl?: string;
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

          if (price != null) {
            const n = Math.round(Number(price));
            if (n > 0) return n;
          }
        }
      } catch {
        /* ignore */
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
    for (let i = 0; i < Math.min(count, 4); i++) {
      const text = await nodes.nth(i).textContent();
      if (!text) continue;
      const price = parseAudPrice(text);
      if (price) prices.push(price);
    }
  }
  return prices;
}

async function scrapeProductPage(
  page: Page,
  url: string,
  retailer: Retailer,
  catalogPrice: number
): Promise<number | null> {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.waitForTimeout(1_500);

  const selectors = RETAILER_PRICE_SELECTORS[retailer] ?? [".price"];

  const fromLd = await extractJsonLdPrice(page);
  if (fromLd && pickBestScrapedPrice([fromLd], catalogPrice)) {
    return fromLd;
  }

  const fromSelectors = await pricesFromLocator(page.locator("body"), selectors);
  const best = pickBestScrapedPrice(fromSelectors, catalogPrice);
  return best;
}

interface SearchCandidate {
  url: string;
  title: string;
  price: number | null;
  score: number;
}

async function discoverFromSearch(
  page: Page,
  retailer: Retailer,
  productName: string,
  catalogPrice: number
): Promise<SearchCandidate | null> {
  const rootSelector = SEARCH_RESULT_ROOT[retailer];
  const linkHint = TILE_LINK_HINT[retailer];
  const priceSelectors = RETAILER_PRICE_SELECTORS[retailer] ?? [".price"];
  if (!rootSelector || !linkHint) return null;

  const tiles = page.locator(rootSelector);
  const tileCount = await tiles.count();
  const candidates: SearchCandidate[] = [];

  for (let i = 0; i < Math.min(tileCount, 6); i++) {
    const tile = tiles.nth(i);
    const link = tile.locator(linkHint).first();
    if ((await link.count()) === 0) continue;

    const href = await link.getAttribute("href");
    if (!href) continue;

    const absolute = new URL(href, page.url()).href;
    if (!isProductPageUrl(retailer, absolute)) continue;

    const title =
      (await tile.locator("h2, h3, [class*='title'], a").first().textContent()) ??
      (await link.textContent()) ??
      "";
    const prices = await pricesFromLocator(tile, priceSelectors);
    const price = pickBestScrapedPrice(prices, catalogPrice);
    const score = scoreTitleMatch(title, productName);

    if (score < 0.35) continue;

    candidates.push({ url: absolute, title: title.trim(), price, score });
  }

  if (candidates.length === 0) {
    const linkHint = TILE_LINK_HINT[retailer];
    if (linkHint) {
      const links = page.locator(linkHint);
      const linkCount = await links.count();
      for (let i = 0; i < Math.min(linkCount, 10); i++) {
        const href = await links.nth(i).getAttribute("href");
        if (!href) continue;
        const absolute = new URL(href, page.url()).href;
        if (!isProductPageUrl(retailer, absolute)) continue;
        const title = (await links.nth(i).textContent()) ?? productName;
        const score = scoreTitleMatch(title, productName);
        candidates.push({
          url: absolute,
          title: title.trim(),
          price: null,
          score: Math.max(score, 0.35),
        });
        if (candidates.length >= 3) break;
      }
    }
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    const scoreDiff = b.score - a.score;
    if (Math.abs(scoreDiff) > 0.15) return scoreDiff;
    if (a.price && b.price) {
      return (
        Math.abs(a.price - catalogPrice) - Math.abs(b.price - catalogPrice)
      );
    }
    return scoreDiff;
  });

  return candidates[0];
}

export async function scrapeRetailPrice(
  page: Page,
  retailer: Retailer,
  productName: string,
  catalogPrice: number,
  cachedProductUrl?: string
): Promise<ScrapeResult> {
  const selectors = RETAILER_PRICE_SELECTORS[retailer] ?? [".price"];

  if (cachedProductUrl && isProductPageUrl(retailer, cachedProductUrl)) {
    try {
      const price = await scrapeProductPage(
        page,
        cachedProductUrl,
        retailer,
        catalogPrice
      );
      if (price) {
        return { price, productUrl: cachedProductUrl };
      }
    } catch {
      /* fall through to search */
    }
  }

  const searchUrl = buildRetailerProductUrl(retailer, productName);

  try {
    await page.goto(searchUrl, {
      waitUntil: "domcontentloaded",
      timeout: 45_000,
    });
    await page.waitForTimeout(2_000);

    const discovered = await discoverFromSearch(
      page,
      retailer,
      productName,
      catalogPrice
    );

    if (discovered?.url) {
      let price = discovered.price;
      if (!price) {
        price = await scrapeProductPage(
          page,
          discovered.url,
          retailer,
          catalogPrice
        );
      }
      if (price) {
        return { price, productUrl: discovered.url };
      }
    }

    const rootSelector = SEARCH_RESULT_ROOT[retailer];
    if (rootSelector) {
      const tiles = page.locator(rootSelector);
      const tileCount = await tiles.count();
      const searchPrices: number[] = [];
      for (let i = 0; i < Math.min(tileCount, 4); i++) {
        const tilePrices = await pricesFromLocator(tiles.nth(i), selectors);
        searchPrices.push(...tilePrices);
      }
      const fallback = pickBestScrapedPrice(searchPrices, catalogPrice);
      if (fallback) return { price: fallback };
    }
  } catch {
    return { price: null };
  }

  return { price: null };
}

export async function createScraperPage(
  browser: Awaited<
    ReturnType<typeof import("@playwright/test").chromium.launch>
  >
) {
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    locale: "en-AU",
    timezoneId: "Australia/Sydney",
    viewport: { width: 1280, height: 800 },
  });
  return context.newPage();
}

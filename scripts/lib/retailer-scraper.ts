import type { Page } from "@playwright/test";
import type { Retailer } from "@/types";
import { buildRetailerProductUrl } from "@/lib/retailer-urls";
import { parseAudPrice } from "./price-parse";

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

async function extractFromSelectors(
  page: Page,
  selectors: string[]
): Promise<number | null> {
  for (const selector of selectors) {
    const locators = page.locator(selector);
    const count = await locators.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      const text = await locators.nth(i).textContent();
      if (!text) continue;
      const price = parseAudPrice(text);
      if (price) return price;
    }
  }
  return null;
}

async function extractFirstAudFromBody(page: Page): Promise<number | null> {
  const body = await page.locator("body").innerText();
  const prices: number[] = [];
  const regex = /\$\s*([\d,]+(?:\.\d{2})?)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(body)) !== null) {
    const parsed = parseAudPrice(match[0]);
    if (parsed && parsed >= 5) prices.push(parsed);
  }
  if (prices.length === 0) return null;
  return prices.sort((a, b) => a - b)[0];
}

export async function scrapeRetailPrice(
  page: Page,
  retailer: Retailer,
  productName: string
): Promise<number | null> {
  const url = buildRetailerProductUrl(retailer, productName);

  try {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 45_000,
    });
    await page.waitForTimeout(2_000);

    const fromLd = await extractJsonLdPrice(page);
    if (fromLd) return fromLd;

    const selectors = RETAILER_SELECTORS[retailer] ?? [".price"];
    const fromSelectors = await extractFromSelectors(page, selectors);
    if (fromSelectors) return fromSelectors;

    return extractFirstAudFromBody(page);
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

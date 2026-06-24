import type { Retailer } from "@/types";

export interface DeepLinkEntry {
  url: string;
  discoveredAt: string;
}

export type OfferDeepLinks = Record<
  string,
  Partial<Record<Retailer, DeepLinkEntry>>
>;

const PRODUCT_PATH_PATTERNS: Partial<Record<Retailer, RegExp>> = {
  "jb-hifi": /jbhifi\.com\.au\/products\//i,
  "harvey-norman": /harveynorman\.com\.au\/.*\/(buy|product)/i,
  "the-good-guys": /thegoodguys\.com\.au\/.*\/p\//i,
  "amazon-au": /amazon\.com\.au\/(dp\/|gp\/product\/)/i,
  kogan: /kogan\.com\/au\/buy\//i,
  officeworks: /officeworks\.com\.au\/shop\//i,
  "big-w": /bigw\.com\.au\/product\//i,
  "ebay-au": /ebay\.com\.au\/itm\//i,
  kmart: /kmart\.com\.au\/product\//i,
};

export function isProductPageUrl(retailer: Retailer, url: string): boolean {
  const pattern = PRODUCT_PATH_PATTERNS[retailer];
  if (!pattern) return false;
  try {
    return pattern.test(new URL(url).href);
  } catch {
    return false;
  }
}

/** Normalize affiliate wrappers and tracking params to a stable product URL. */
export function canonicalizeProductUrl(retailer: Retailer, url: string): string {
  if (!url) return url;

  try {
    const href = new URL(url).href;

    if (retailer === "amazon-au") {
      const embedded = href.match(
        /https?:\/\/(?:www\.)?amazon\.com\.au\/(?:dp|gp\/product)\/[A-Z0-9]+/i
      );
      if (embedded) {
        const parsed = new URL(embedded[0]);
        return `https://www.amazon.com.au${parsed.pathname}`;
      }
    }

    if (isProductPageUrl(retailer, href)) {
      const parsed = new URL(href);
      return `${parsed.origin}${parsed.pathname}`;
    }

    return href;
  } catch {
    return url;
  }
}

export function scoreTitleMatch(title: string, productName: string): number {
  const words = productName
    .toLowerCase()
    .replace(/[^\w\s"]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  if (words.length === 0) return 0;
  const haystack = title.toLowerCase();
  const hits = words.filter((w) => haystack.includes(w)).length;
  return hits / words.length;
}

const STOP_WORDS = new Set([
  "the",
  "and",
  "with",
  "for",
  "inch",
  "gb",
  "au",
  "new",
  "pro",
  "max",
  "plus",
]);

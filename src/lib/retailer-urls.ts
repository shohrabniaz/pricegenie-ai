import type { Retailer } from "@/types";
import { getOfferDeepLink } from "@/data/offer-deep-links";
import { isProductPageUrl } from "@/lib/offer-deep-links";

/** Homepage-only URLs that should be replaced with product-specific links. */
const GENERIC_STORE_PATTERNS = [
  /^https?:\/\/(www\.)?jbhifi\.com\.au\/?$/i,
  /^https?:\/\/(www\.)?harveynorman\.com\.au\/?$/i,
  /^https?:\/\/(www\.)?thegoodguys\.com\.au\/?$/i,
  /^https?:\/\/(www\.)?amazon\.com\.au\/?$/i,
  /^https?:\/\/(www\.)?kogan\.com\/?$/i,
  /^https?:\/\/(www\.)?officeworks\.com\.au\/?$/i,
  /^https?:\/\/(www\.)?bigw\.com\.au\/?$/i,
  /^https?:\/\/(www\.)?ebay\.com\.au\/?$/i,
  /^https?:\/\/(www\.)?kmart\.com\.au\/?$/i,
];

export function isGenericStoreUrl(url: string): boolean {
  return GENERIC_STORE_PATTERNS.some((pattern) => pattern.test(url.trim()));
}

/**
 * Builds a retailer search URL scoped to the exact product name so users
 * land on relevant results — not the store homepage.
 */
export function buildRetailerProductUrl(
  retailer: Retailer,
  productName: string
): string {
  const q = encodeURIComponent(productName.trim());
  const plus = productName.trim().replace(/\s+/g, "+");

  switch (retailer) {
    case "jb-hifi":
      return `https://www.jbhifi.com.au/search?query=${plus}`;
    case "harvey-norman":
      return `https://www.harveynorman.com.au/catalogsearch/result/?q=${q}`;
    case "the-good-guys":
      return `https://www.thegoodguys.com.au/search?q=${q}`;
    case "amazon-au":
      return `https://www.amazon.com.au/s?k=${q}`;
    case "kogan":
      return `https://www.kogan.com/au/search/?q=${q}`;
    case "officeworks":
      return `https://www.officeworks.com.au/shop/officeworks/search?q=${q}`;
    case "big-w":
      return `https://www.bigw.com.au/search?text=${q}`;
    case "ebay-au":
      return `https://www.ebay.com.au/sch/i.html?_nkw=${q}`;
    case "kmart":
      return `https://www.kmart.com.au/search/?searchTerm=${q}`;
    default:
      return `https://www.google.com/search?q=${q}+australia+buy`;
  }
}

export function resolveOfferUrl(
  retailer: Retailer,
  productName: string,
  url?: string,
  productId?: string
): string {
  void productName;
  if (productId) {
    const deepLink = getOfferDeepLink(productId, retailer);
    if (deepLink) return deepLink;
  }
  if (url && isProductPageUrl(retailer, url)) return url;
  if (url && !isGenericStoreUrl(url) && !isRetailerSearchUrl(retailer, url)) return url;

  // Never send users to search pages from "View product".
  return "";
}

function isRetailerSearchUrl(retailer: Retailer, url: string): boolean {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.toLowerCase();

    switch (retailer) {
      case "jb-hifi":
        return pathname.startsWith("/search");
      case "harvey-norman":
        return pathname.includes("/catalogsearch/result");
      case "the-good-guys":
        return pathname.startsWith("/search");
      case "amazon-au":
        return pathname === "/s";
      case "kogan":
        return pathname.startsWith("/au/search");
      case "officeworks":
        return pathname.includes("/search");
      case "big-w":
        return pathname.startsWith("/search");
      case "ebay-au":
        return pathname.startsWith("/sch/");
      case "kmart":
        return pathname.startsWith("/search");
      default:
        return false;
    }
  } catch {
    return false;
  }
}

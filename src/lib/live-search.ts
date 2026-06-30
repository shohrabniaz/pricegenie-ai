import type { Product, Retailer } from "@/types";
import { CATALOG_PRICE_UPDATED_AT } from "@/data/catalog-meta";
import { RETAILER_LABELS } from "@/data/retailers";
import { applyPriceSnapshots } from "@/lib/price-feed";
import { countVerifiedOffers } from "@/lib/offer-price-status";
import { affiliateRetailerSearchUrl } from "@/lib/affiliate";
import { searchProducts } from "@/lib/search";

/** Priority AU retailers for live search links (feedback order). */
export const LIVE_SEARCH_RETAILERS: Retailer[] = [
  "amazon-au",
  "ebay-au",
  "jb-hifi",
  "the-good-guys",
  "officeworks",
  "harvey-norman",
  "kogan",
];

export interface RetailerSearchLink {
  retailer: Retailer;
  retailerName: string;
  searchUrl: string;
}

export interface UnifiedSearchResult {
  query: string;
  products: Product[];
  retailerLinks: RetailerSearchLink[];
  pricesUpdatedAt: string;
  fromSnapshots: number;
  mode: "hybrid";
}

/**
 * Search engine model: match seed catalog + daily snapshots, surface retailer links.
 * No static import of millions of SKUs — user query drives the response.
 */
export function unifiedSearch(
  query: string,
  options: { category?: string; studentMode?: boolean } = {}
): UnifiedSearchResult {
  const trimmed = query.trim();
  const studentMode = options.studentMode ?? false;

  const catalogHits = trimmed
    ? searchProducts(trimmed, { category: options.category }, studentMode)
    : [];

  let fromSnapshots = 0;
  const products = catalogHits.map((product) => {
    const merged = applyPriceSnapshots(product);
    fromSnapshots += countVerifiedOffers(
      product.id,
      product.offers.map((offer) => ({
        retailer: offer.retailer,
        listPrice: offer.listPrice,
      }))
    );
    return merged.product;
  });

  const retailerLinks: RetailerSearchLink[] = LIVE_SEARCH_RETAILERS.map(
    (retailer) => ({
      retailer,
      retailerName: RETAILER_LABELS[retailer],
      searchUrl: affiliateRetailerSearchUrl(retailer, trimmed),
    })
  );

  const pricesUpdatedAt =
    products[0]?.pricesUpdatedAt ?? CATALOG_PRICE_UPDATED_AT;

  return {
    query: trimmed,
    products,
    retailerLinks,
    pricesUpdatedAt,
    fromSnapshots,
    mode: "hybrid",
  };
}

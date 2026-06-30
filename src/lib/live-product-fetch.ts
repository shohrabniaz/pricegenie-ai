import { getProductById } from "@/data/products";
import { applyPriceSnapshots } from "@/lib/price-feed";
import { fetchLiveOfferPrice } from "@/lib/live-offer-price";
import { countVerifiedOffers } from "@/lib/offer-price-status";
import { stripLegacyDiscountFields } from "@/lib/coupon-rules";
import { resolveOfferUrl } from "@/lib/retailer-urls";
import { isProductPageUrl } from "@/lib/offer-deep-links";
import type { Product, Retailer } from "@/types";
import type { PriceSource } from "@/lib/price-feed";

const MAX_LIVE_OFFERS = 3;

const RETAILER_FETCH_PRIORITY: Retailer[] = [
  "jb-hifi",
  "amazon-au",
  "the-good-guys",
  "harvey-norman",
  "officeworks",
  "kogan",
  "big-w",
  "ebay-au",
  "kmart",
];

export interface LiveFetchTarget {
  retailer: Retailer;
  url: string;
  catalogListPrice: number;
}

export function getLiveFetchTargets(
  product: Product,
  maxOffers = MAX_LIVE_OFFERS
): LiveFetchTarget[] {
  const catalog = getProductById(product.id) ?? product;
  const targets: LiveFetchTarget[] = [];

  for (const offer of catalog.offers) {
    if (!offer.inStock) continue;

    const url = resolveOfferUrl(
      offer.retailer,
      catalog.name,
      offer.url,
      catalog.id
    );
    if (!isProductPageUrl(offer.retailer, url)) continue;

    targets.push({
      retailer: offer.retailer,
      url,
      catalogListPrice: offer.listPrice,
    });
  }

  targets.sort(
    (a, b) =>
      RETAILER_FETCH_PRIORITY.indexOf(a.retailer) -
      RETAILER_FETCH_PRIORITY.indexOf(b.retailer)
  );

  return targets.slice(0, maxOffers);
}

export interface LiveProductPriceResult {
  product: Product;
  pricesUpdatedAt: string;
  source: PriceSource;
  liveOfferCount: number;
  liveVerifiedRetailers: Retailer[];
  liveFetchedAt: string | null;
}

export async function fetchLiveProductPrices(
  productId: string
): Promise<LiveProductPriceResult | null> {
  const catalogProduct = getProductById(productId);
  if (!catalogProduct) return null;

  const snapshotMerged = applyPriceSnapshots(catalogProduct);
  const targets = getLiveFetchTargets(catalogProduct);

  if (targets.length === 0) {
    return {
      product: snapshotMerged.product,
      pricesUpdatedAt: snapshotMerged.pricesUpdatedAt,
      source: snapshotMerged.source,
      liveOfferCount: snapshotMerged.liveOfferCount,
      liveVerifiedRetailers: [],
      liveFetchedAt: null,
    };
  }

  const settled = await Promise.allSettled(
    targets.map(async (target) => {
      const live = await fetchLiveOfferPrice(target.url);
      return { target, live };
    })
  );

  const livePrices = new Map<Retailer, number>();
  let latestFetchedAt: string | null = null;

  for (const result of settled) {
    if (result.status !== "fulfilled") continue;
    const { target, live } = result.value;
    if (live.price == null || live.price <= 0) continue;
    livePrices.set(target.retailer, live.price);
    if (!latestFetchedAt || live.fetchedAt > latestFetchedAt) {
      latestFetchedAt = live.fetchedAt;
    }
  }

  const liveVerifiedRetailers = [...livePrices.keys()];
  const offers = snapshotMerged.product.offers.map((offer) => {
    const liveList = livePrices.get(offer.retailer);
    if (liveList === undefined) return offer;
    return stripLegacyDiscountFields({
      ...offer,
      listPrice: liveList,
    });
  });

  const product: Product = {
    ...snapshotMerged.product,
    offers,
    pricesUpdatedAt: latestFetchedAt?.slice(0, 10) ?? snapshotMerged.pricesUpdatedAt,
  };

  const liveOfferCount = countVerifiedOffers(
    productId,
    catalogProduct.offers.map((offer) => ({
      retailer: offer.retailer,
      listPrice: offer.listPrice,
    })),
    liveVerifiedRetailers
  );

  return {
    product,
    pricesUpdatedAt: product.pricesUpdatedAt!,
    source: liveVerifiedRetailers.length > 0 ? "live" : snapshotMerged.source,
    liveOfferCount,
    liveVerifiedRetailers,
    liveFetchedAt: latestFetchedAt,
  };
}

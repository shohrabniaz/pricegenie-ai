import type { Product, Retailer, StoreOffer } from "@/types";
import { CATALOG_PRICE_UPDATED_AT } from "@/data/catalog-meta";
import { PRICE_SNAPSHOTS, type PriceSnapshot } from "@/data/price-snapshots";
import { stripLegacyDiscountFields } from "@/lib/coupon-rules";

export type PriceSource = "catalog" | "snapshot" | "live";

export interface ProductPriceResult {
  product: Product;
  pricesUpdatedAt: string;
  source: PriceSource;
  liveOfferCount: number;
}

function latestDate(...dates: string[]): string {
  return dates.sort((a, b) => b.localeCompare(a))[0];
}

export function getSnapshotForProduct(productId: string): PriceSnapshot | undefined {
  return PRICE_SNAPSHOTS[productId];
}

/** Merge snapshot store prices into catalog offers when a snapshot exists. */
export function applyPriceSnapshots(product: Product): ProductPriceResult {
  const snapshot = PRICE_SNAPSHOTS[product.id];
  let liveOfferCount = 0;

  const offers: StoreOffer[] = product.offers.map((offer) => {
    const liveList = snapshot?.offers[offer.retailer];
    if (liveList === undefined || liveList <= 0) {
      return offer;
    }
    if (liveList !== offer.listPrice) {
      liveOfferCount += 1;
    }
    return stripLegacyDiscountFields({
      ...offer,
      listPrice: liveList,
    });
  });

  const pricesUpdatedAt = snapshot
    ? latestDate(product.pricesUpdatedAt ?? CATALOG_PRICE_UPDATED_AT, snapshot.updatedAt)
    : product.pricesUpdatedAt ?? CATALOG_PRICE_UPDATED_AT;

  const hasSnapshotOverrides = liveOfferCount > 0;

  return {
    product: { ...product, offers, pricesUpdatedAt },
    pricesUpdatedAt,
    source: hasSnapshotOverrides ? "snapshot" : "catalog",
    liveOfferCount,
  };
}

export function getProductPrices(productId: string, catalogProduct?: Product): ProductPriceResult | null {
  if (!catalogProduct) return null;
  return applyPriceSnapshots(catalogProduct);
}

/** Fetch remote live feed when `PRICE_FEED_URL` is configured (future cron / worker). */
export async function fetchRemotePriceFeed(): Promise<Record<string, PriceSnapshot> | null> {
  const url = process.env.PRICE_FEED_URL;
  if (!url) return null;

  try {
    const res = await fetch(url, {
      headers: process.env.PRICE_FEED_API_KEY
        ? { Authorization: `Bearer ${process.env.PRICE_FEED_API_KEY}` }
        : undefined,
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, PriceSnapshot>;
    return data;
  } catch {
    return null;
  }
}

export function mergeRemoteSnapshots(
  product: Product,
  remote: Record<string, PriceSnapshot>
): ProductPriceResult {
  const snapshot = remote[product.id];
  if (!snapshot) {
    return applyPriceSnapshots(product);
  }

  const merged: Product = {
    ...product,
    offers: product.offers.map((offer) => {
      const liveList = snapshot.offers[offer.retailer as Retailer];
      if (liveList === undefined || liveList <= 0) return offer;
      return stripLegacyDiscountFields({ ...offer, listPrice: liveList });
    }),
    pricesUpdatedAt: latestDate(
      product.pricesUpdatedAt ?? CATALOG_PRICE_UPDATED_AT,
      snapshot.updatedAt
    ),
  };

  const liveOfferCount = Object.keys(snapshot.offers).length;
  return {
    product: merged,
    pricesUpdatedAt: merged.pricesUpdatedAt!,
    source: "live",
    liveOfferCount,
  };
}

import { PRICE_SNAPSHOTS } from "@/data/price-snapshots";
import type { Retailer } from "@/types";

export type OfferPriceStatus = "verified" | "estimate";

export function getOfferPriceStatus(
  productId: string,
  retailer: Retailer,
  catalogListPrice?: number,
  runtimeVerified?: readonly Retailer[]
): OfferPriceStatus {
  if (runtimeVerified?.includes(retailer)) return "verified";
  const snapshot = PRICE_SNAPSHOTS[productId];
  if (!snapshot) return "estimate";

  const snapPrice = snapshot.offers[retailer];
  if (snapPrice === undefined) return "estimate";

  const explicit = snapshot.verified?.[retailer];
  if (explicit === true) return "verified";
  if (explicit === false) return "estimate";

  // Legacy snapshots (no verified map): only trust prices that moved off catalog.
  if (catalogListPrice !== undefined && snapPrice !== catalogListPrice) {
    return "verified";
  }

  return "estimate";
}

export function countVerifiedOffers(
  productId: string,
  catalogOffers: Array<{ retailer: Retailer; listPrice: number }>,
  runtimeVerified?: readonly Retailer[]
): number {
  return catalogOffers.filter(
    (offer) =>
      getOfferPriceStatus(
        productId,
        offer.retailer,
        offer.listPrice,
        runtimeVerified
      ) === "verified"
  ).length;
}

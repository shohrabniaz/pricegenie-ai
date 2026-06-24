import type { Retailer } from "@/types";
import { getSnapshotForProduct } from "@/lib/price-feed";

export type OfferPriceStatus = "verified" | "estimate";

export function getOfferPriceStatus(
  productId: string,
  retailer: Retailer
): OfferPriceStatus {
  const snapshot = getSnapshotForProduct(productId);
  if (snapshot?.offers[retailer] !== undefined) return "verified";
  return "estimate";
}

export function countVerifiedOffers(
  productId: string,
  retailers: Retailer[]
): number {
  return retailers.filter(
    (retailer) => getOfferPriceStatus(productId, retailer) === "verified"
  ).length;
}

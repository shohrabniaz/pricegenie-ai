import type { Retailer } from "@/types";
import linksJson from "./offer-deep-links.json";
import type { DeepLinkEntry, OfferDeepLinks } from "@/lib/offer-deep-links";

export const OFFER_DEEP_LINKS = linksJson as OfferDeepLinks;

export function getOfferDeepLink(
  productId: string,
  retailer: Retailer
): string | undefined {
  return OFFER_DEEP_LINKS[productId]?.[retailer]?.url;
}

export type { DeepLinkEntry, OfferDeepLinks };

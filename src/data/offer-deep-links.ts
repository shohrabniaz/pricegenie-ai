import type { Retailer } from "@/types";
import linksJson from "./offer-deep-links.json";
import { CURATED_DEEP_LINKS } from "./curated-deep-links";
import type { DeepLinkEntry, OfferDeepLinks } from "@/lib/offer-deep-links";

export const OFFER_DEEP_LINKS = linksJson as OfferDeepLinks;

export function getOfferDeepLink(
  productId: string,
  retailer: Retailer
): string | undefined {
  return (
    CURATED_DEEP_LINKS[productId]?.[retailer]?.url ??
    OFFER_DEEP_LINKS[productId]?.[retailer]?.url
  );
}

export type { DeepLinkEntry, OfferDeepLinks };

import { detectRetailerFromUrl } from "@/lib/retailer-detect";
import { fetchRetailerHtml } from "@/lib/affiliate";
import { extractPriceFromHtml, extractTitleFromHtml } from "@/lib/html-price";
import { isProductPageUrl } from "@/lib/offer-deep-links";
import type { Retailer } from "@/types";

export interface LiveOfferPriceResult {
  price: number | null;
  title: string | null;
  retailer: Retailer | null;
  fetchedAt: string;
}

export async function fetchLiveOfferPrice(
  url: string
): Promise<LiveOfferPriceResult> {
  const fetchedAt = new Date().toISOString();
  const retailer = detectRetailerFromUrl(url);

  if (!retailer || !isProductPageUrl(retailer, url)) {
    return { price: null, title: null, retailer, fetchedAt };
  }

  const html = await fetchRetailerHtml(url);
  if (!html) {
    return { price: null, title: null, retailer, fetchedAt };
  }

  return {
    price: extractPriceFromHtml(html),
    title: extractTitleFromHtml(html),
    retailer,
    fetchedAt,
  };
}

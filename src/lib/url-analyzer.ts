import { RETAILER_LABELS } from "@/data/retailers";
import { APP_NAME } from "@/lib/brand";
import { calculateTruePrice, formatAud } from "@/lib/pricing";
import { resolveDiscounts } from "@/lib/coupon-rules";
import { fetchRetailerHtml, withAffiliateLink } from "@/lib/affiliate";
import {
  extractPriceFromHtml,
  extractSearchTermsFromTitle,
  extractTitleFromHtml,
} from "@/lib/html-price";
import { detectRetailerFromUrl } from "@/lib/retailer-detect";
import { searchProducts } from "@/lib/search";

export interface UrlAnalysisResult {
  url: string;
  retailer: string | null;
  productTitle: string | null;
  storePrice: number | null;
  affiliateUrl: string;
  alternatives: Array<{
    id: string;
    name: string;
    href: string;
    storePrice: number;
    retailerName: string;
    checkoutPrice: number;
    couponCode?: string;
  }>;
  summary: string;
}

export async function analyzeProductUrl(
  url: string,
  studentMode = false
): Promise<UrlAnalysisResult> {
  const retailer = detectRetailerFromUrl(url);
  const affiliateUrl = withAffiliateLink(url);

  const html = await fetchRetailerHtml(url);
  const productTitle = html ? extractTitleFromHtml(html) : null;
  const storePrice = html ? extractPriceFromHtml(html) : null;

  const searchTerms = productTitle
    ? extractSearchTermsFromTitle(productTitle)
    : "";

  const catalogMatches = searchTerms
    ? searchProducts(searchTerms, {}, studentMode).slice(0, 5)
    : [];

  const alternatives = catalogMatches.map((product) => {
    const best = product.offers
      .filter((o) => o.inStock)
      .map((o) => ({
        offer: o,
        breakdown: calculateTruePrice(o, studentMode, product),
      }))
      .sort((a, b) => a.breakdown.checkoutPrice - b.breakdown.checkoutPrice)[0];

    if (!best) {
      return null;
    }

    const discounts = resolveDiscounts(best.offer, product, studentMode);

    return {
      id: product.id,
      name: product.name,
      href: `/product/${product.id}`,
      storePrice: best.breakdown.listPrice,
      retailerName: best.offer.retailerName,
      checkoutPrice: best.breakdown.checkoutPrice,
      couponCode: discounts.couponCode,
    };
  }).filter(Boolean) as UrlAnalysisResult["alternatives"];

  let summary: string;
  if (storePrice && productTitle) {
    summary = `Found **${productTitle}** at **${formatAud(storePrice)}** on ${retailer ? RETAILER_LABELS[retailer] : "this store"}.`;
    if (alternatives.length > 0) {
      const cheapest = alternatives[0];
      if (cheapest.checkoutPrice < storePrice) {
        summary += ` ${APP_NAME} found a similar option from **${formatAud(cheapest.checkoutPrice)}** at ${cheapest.retailerName}.`;
      }
    }
  } else if (productTitle) {
    summary = `Parsed **${productTitle}**. Could not read the live price — check the store page directly.`;
  } else {
    summary =
      "Could not read this page. Make sure it is a product URL from a supported Australian retailer.";
  }

  return {
    url,
    retailer: retailer ? RETAILER_LABELS[retailer] : null,
    productTitle,
    storePrice,
    affiliateUrl,
    alternatives,
    summary,
  };
}

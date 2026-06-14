import type { Retailer } from "@/types";
import { buildRetailerProductUrl } from "@/lib/retailer-urls";

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "en-AU,en;q=0.9",
};

export function withAffiliateLink(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    const amazonTag = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG;
    if (amazonTag && host.includes("amazon.com.au")) {
      parsed.searchParams.set("tag", amazonTag);
      return parsed.toString();
    }

    const ebayCampaign = process.env.NEXT_PUBLIC_EBAY_CAMPAIGN_ID;
    if (ebayCampaign && host.includes("ebay.com.au")) {
      parsed.searchParams.set("campid", ebayCampaign);
      return parsed.toString();
    }
  } catch {
    return url;
  }

  return url;
}

export function affiliateRetailerSearchUrl(
  retailer: Retailer,
  query: string
): string {
  return withAffiliateLink(buildRetailerProductUrl(retailer, query));
}

export async function fetchRetailerHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: FETCH_HEADERS,
      signal: AbortSignal.timeout(12_000),
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

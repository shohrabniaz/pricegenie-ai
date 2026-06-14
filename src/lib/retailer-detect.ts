import type { Retailer } from "@/types";

const HOST_TO_RETAILER: Record<string, Retailer> = {
  "www.jbhifi.com.au": "jb-hifi",
  "jbhifi.com.au": "jb-hifi",
  "www.harveynorman.com.au": "harvey-norman",
  "harveynorman.com.au": "harvey-norman",
  "www.thegoodguys.com.au": "the-good-guys",
  "thegoodguys.com.au": "the-good-guys",
  "www.amazon.com.au": "amazon-au",
  "amazon.com.au": "amazon-au",
  "www.kogan.com": "kogan",
  "kogan.com": "kogan",
  "www.officeworks.com.au": "officeworks",
  "officeworks.com.au": "officeworks",
  "www.bigw.com.au": "big-w",
  "bigw.com.au": "big-w",
  "www.ebay.com.au": "ebay-au",
  "ebay.com.au": "ebay-au",
  "www.kmart.com.au": "kmart",
  "kmart.com.au": "kmart",
};

export function detectRetailerFromUrl(url: string): Retailer | null {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return HOST_TO_RETAILER[host] ?? null;
  } catch {
    return null;
  }
}

export function isSupportedProductUrl(url: string): boolean {
  return detectRetailerFromUrl(url) !== null;
}

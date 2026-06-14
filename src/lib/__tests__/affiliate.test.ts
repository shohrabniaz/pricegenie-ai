import { describe, expect, it, afterEach } from "vitest";
import { withAffiliateLink } from "@/lib/affiliate";

describe("affiliate", () => {
  const originalAmazon = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG;
  const originalEbay = process.env.NEXT_PUBLIC_EBAY_CAMPAIGN_ID;

  afterEach(() => {
    process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG = originalAmazon;
    process.env.NEXT_PUBLIC_EBAY_CAMPAIGN_ID = originalEbay;
  });

  it("appends Amazon affiliate tag when configured", () => {
    process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG = "pricegenie-22";
    const url = "https://www.amazon.com.au/dp/B123";
    expect(withAffiliateLink(url)).toContain("tag=pricegenie-22");
  });

  it("leaves URL unchanged when no affiliate env set", () => {
    delete process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG;
    const url = "https://www.jbhifi.com.au/products/foo";
    expect(withAffiliateLink(url)).toBe(url);
  });
});

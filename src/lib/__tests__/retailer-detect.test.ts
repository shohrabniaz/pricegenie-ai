import { describe, expect, it } from "vitest";
import { detectRetailerFromUrl, isSupportedProductUrl } from "@/lib/retailer-detect";

describe("retailer-detect", () => {
  it("detects JB Hi-Fi product URLs", () => {
    expect(
      detectRetailerFromUrl(
        "https://www.jbhifi.com.au/products/apple-macbook-air-13-m4"
      )
    ).toBe("jb-hifi");
  });

  it("detects Amazon AU", () => {
    expect(
      detectRetailerFromUrl("https://www.amazon.com.au/dp/B0CX23V2ZK")
    ).toBe("amazon-au");
  });

  it("returns null for unknown hosts", () => {
    expect(detectRetailerFromUrl("https://example.com/product")).toBeNull();
  });

  it("isSupportedProductUrl mirrors detection", () => {
    expect(isSupportedProductUrl("https://www.kogan.com/au/buy/")).toBe(true);
    expect(isSupportedProductUrl("not-a-url")).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import {
  isProductPageUrl,
  scoreTitleMatch,
} from "@/lib/offer-deep-links";

describe("offer-deep-links", () => {
  it("detects JB Hi-Fi product pages", () => {
    expect(
      isProductPageUrl(
        "jb-hifi",
        "https://www.jbhifi.com.au/products/apple-iphone-17-pro-256gb"
      )
    ).toBe(true);
    expect(
      isProductPageUrl("jb-hifi", "https://www.jbhifi.com.au/search?query=iphone")
    ).toBe(false);
  });

  it("detects Amazon AU product pages", () => {
    expect(
      isProductPageUrl(
        "amazon-au",
        "https://www.amazon.com.au/dp/B0CX23V2ZK"
      )
    ).toBe(true);
  });

  it("scores title overlap", () => {
    expect(
      scoreTitleMatch("Apple iPhone 17 Pro 256GB", "iPhone 17 Pro 256GB")
    ).toBeGreaterThan(0.5);
    expect(scoreTitleMatch("Random USB Cable", "iPhone 17 Pro 256GB")).toBeLessThan(
      0.25
    );
  });
});

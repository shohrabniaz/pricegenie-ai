import { describe, expect, it } from "vitest";
import {
  buildRetailerProductUrl,
  isGenericStoreUrl,
  resolveOfferUrl,
} from "@/lib/retailer-urls";

describe("isGenericStoreUrl", () => {
  it("flags retailer homepages", () => {
    expect(isGenericStoreUrl("https://www.jbhifi.com.au")).toBe(true);
    expect(isGenericStoreUrl("https://www.kmart.com.au/")).toBe(true);
  });

  it("allows product-specific URLs", () => {
    expect(
      isGenericStoreUrl("https://www.jbhifi.com.au/products/playstation-5")
    ).toBe(false);
  });
});

describe("buildRetailerProductUrl", () => {
  it("builds JB Hi-Fi search URLs", () => {
    expect(buildRetailerProductUrl("jb-hifi", "PS5 Slim")).toBe(
      "https://www.jbhifi.com.au/search?query=PS5+Slim"
    );
  });

  it("encodes Amazon AU queries", () => {
    expect(buildRetailerProductUrl("amazon-au", "MacBook Air M4")).toContain(
      "amazon.com.au/s?k="
    );
  });
});

describe("resolveOfferUrl", () => {
  it("keeps specific URLs", () => {
    const url = "https://www.jbhifi.com.au/products/test-item";
    expect(resolveOfferUrl("jb-hifi", "Test", url)).toBe(url);
  });

  it("replaces generic store URLs", () => {
    expect(resolveOfferUrl("kmart", "Bluetooth Speaker", "https://www.kmart.com.au")).toContain(
      "kmart.com.au/search"
    );
  });
});

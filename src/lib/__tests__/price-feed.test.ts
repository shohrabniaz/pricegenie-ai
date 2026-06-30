import { describe, expect, it } from "vitest";
import type { Product } from "@/types";
import { applyPriceSnapshots } from "@/lib/price-feed";

const syntheticProduct: Product = {
  id: "test-no-snapshot-product",
  name: "Test Widget",
  brand: "Test",
  category: "Electronics",
  image: "📦",
  description: "Synthetic product for tests",
  specs: {},
  offers: [
    {
      retailer: "kmart",
      retailerName: "Kmart",
      listPrice: 49,
      shipping: 0,
      inStock: true,
      url: "https://www.kmart.com.au/search/?searchTerm=test",
    },
  ],
  priceHistory: [{ date: "2026-06-01", price: 49 }],
  lowestEver: 49,
  tags: [],
};

describe("applyPriceSnapshots", () => {
  it("merges snapshot prices when a daily refresh exists", async () => {
    const { PRODUCTS } = await import("@/data/products");
    const product = PRODUCTS.find((p) => p.id === "iphone-17-pro-256")!;
    const result = applyPriceSnapshots(product);
    expect(result.product.offers.length).toBeGreaterThan(0);
    expect(result.pricesUpdatedAt).toBeTruthy();
    expect(result.liveOfferCount).toBeGreaterThanOrEqual(0);
  });

  it("returns catalog source when no snapshot exists", () => {
    const result = applyPriceSnapshots(syntheticProduct);
    expect(result.source).toBe("catalog");
    expect(result.pricesUpdatedAt).toBeTruthy();
  });
});

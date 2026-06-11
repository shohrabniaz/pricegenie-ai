import { describe, expect, it } from "vitest";
import type { Product } from "@/types";
import { getWaitOrBuyAdvice } from "@/lib/wait-or-buy";

function mockProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "test-product",
    name: "Test Product",
    brand: "Test",
    category: "Electronics",
    image: "📦",
    description: "Test",
    specs: {},
    tags: ["test"],
    lowestEver: 500,
    priceHistory: [
      { date: "2025-11-28", price: 500, event: "Black Friday" },
      { date: "2026-05-01", price: 900 },
      { date: "2026-06-01", price: 850 },
    ],
    offers: [
      {
        retailer: "jb-hifi",
        retailerName: "JB Hi-Fi",
        listPrice: 900,
        shipping: 0,
        inStock: true,
        url: "https://www.jbhifi.com.au/search?query=test",
      },
    ],
    ...overrides,
  };
}

describe("getWaitOrBuyAdvice", () => {
  it("recommends wait when far above historical low", () => {
    const advice = getWaitOrBuyAdvice(mockProduct(), false);
    expect(advice.recommendation).toBe("wait");
    expect(advice.expectedSavings).toBeGreaterThan(0);
  });

  it("recommends buy near historical low", () => {
    const advice = getWaitOrBuyAdvice(
      mockProduct({
        lowestEver: 880,
        offers: [
          {
            retailer: "jb-hifi",
            retailerName: "JB Hi-Fi",
            listPrice: 900,
            shipping: 0,
            inStock: true,
            url: "https://example.com",
          },
        ],
      }),
      false
    );
    expect(advice.recommendation).toBe("buy");
  });

  it("handles out of stock", () => {
    const advice = getWaitOrBuyAdvice(
      mockProduct({
        offers: [
          {
            retailer: "jb-hifi",
            retailerName: "JB Hi-Fi",
            listPrice: 900,
            shipping: 0,
            inStock: false,
            url: "https://example.com",
          },
        ],
      }),
      false
    );
    expect(advice.recommendation).toBe("neutral");
    expect(advice.headline).toContain("No stock");
  });
});

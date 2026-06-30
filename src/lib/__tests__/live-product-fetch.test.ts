import { describe, expect, it } from "vitest";
import { getLiveFetchTargets } from "@/lib/live-product-fetch";

describe("live-product-fetch", () => {
  it("returns curated PDP targets for PS5", async () => {
    const { PRODUCTS } = await import("@/data/products");
    const ps5 = PRODUCTS.find((p) => p.id === "ps5-slim")!;
    const targets = getLiveFetchTargets(ps5);

    expect(targets.length).toBeGreaterThan(0);
    expect(targets[0].retailer).toBe("jb-hifi");
    expect(targets[0].url).toContain("/products/");
  });

  it("returns no targets when no PDP URLs exist", () => {
    const targets = getLiveFetchTargets({
      id: "test-no-pdp",
      name: "Test",
      brand: "Test",
      category: "Electronics",
      image: "📦",
      description: "x",
      specs: {},
      offers: [
        {
          retailer: "kmart",
          retailerName: "Kmart",
          listPrice: 10,
          shipping: 0,
          inStock: true,
          url: "https://www.kmart.com.au",
        },
      ],
      priceHistory: [],
      lowestEver: 10,
      tags: [],
    });

    expect(targets).toHaveLength(0);
  });
});

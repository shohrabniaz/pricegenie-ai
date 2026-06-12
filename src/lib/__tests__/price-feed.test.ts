import { describe, expect, it } from "vitest";
import { PRODUCTS } from "@/data/products";
import { applyPriceSnapshots } from "@/lib/price-feed";

describe("applyPriceSnapshots", () => {
  it("returns catalog source when no overrides exist", () => {
    const product = PRODUCTS[0];
    const result = applyPriceSnapshots(product);
    expect(result.source).toBe("catalog");
    expect(result.pricesUpdatedAt).toBeTruthy();
  });
});

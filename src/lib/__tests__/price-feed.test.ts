import { describe, expect, it } from "vitest";
import { PRODUCTS } from "@/data/products";
import { applyPriceSnapshots } from "@/lib/price-feed";

describe("applyPriceSnapshots", () => {
  it("merges snapshot prices when a daily refresh exists", () => {
    const product = PRODUCTS.find((p) => p.id === "iphone-17-pro-256")!;
    const result = applyPriceSnapshots(product);
    expect(result.source).toBe("snapshot");
    expect(result.liveOfferCount).toBeGreaterThan(0);
    expect(result.pricesUpdatedAt).toBe("2026-06-14");
  });

  it("returns catalog source when no snapshot exists", () => {
    const withoutSnapshot = PRODUCTS.find(
      (p) =>
        p.id !== "iphone-17-pro-256" &&
        p.id !== "macbook-air-m4" &&
        p.id !== "asus-rog-g16" &&
        p.id !== "samsung-s25-ultra" &&
        p.id !== "sony-wh1000xm6"
    )!;
    const result = applyPriceSnapshots(withoutSnapshot);
    expect(result.source).toBe("catalog");
    expect(result.pricesUpdatedAt).toBeTruthy();
  });
});

import { describe, expect, it } from "vitest";
import type { Product } from "@/types";
import {
  appendPriceHistoryPoint,
  mergePriceHistory,
} from "@/lib/price-history";

const baseProduct: Product = {
  id: "test-laptop",
  name: "Test Laptop",
  brand: "Test",
  category: "Laptops",
  image: "💻",
  description: "Test",
  specs: {},
  offers: [],
  priceHistory: [
    { date: "2026-01-01", price: 999 },
    { date: "2026-02-01", price: 949, event: "Sale" },
  ],
  lowestEver: 949,
  tags: [],
};

describe("price-history", () => {
  it("merges logged points and updates lowestEver", () => {
    const merged = mergePriceHistory(baseProduct, {
      "test-laptop": [{ date: "2026-03-01", price: 899 }],
    });
    expect(merged.priceHistory).toHaveLength(3);
    expect(merged.lowestEver).toBe(899);
  });

  it("appendPriceHistoryPoint dedupes same date", () => {
    const log: Record<string, { date: string; price: number }[]> = {};
    appendPriceHistoryPoint(log, "p1", "2026-06-12", 100);
    appendPriceHistoryPoint(log, "p1", "2026-06-12", 95);
    expect(log.p1).toHaveLength(1);
    expect(log.p1[0].price).toBe(95);
  });

  it("appendPriceHistoryPoint adds new dates", () => {
    const log: Record<string, { date: string; price: number }[]> = {};
    appendPriceHistoryPoint(log, "p1", "2026-06-11", 100);
    appendPriceHistoryPoint(log, "p1", "2026-06-12", 98);
    expect(log.p1).toHaveLength(2);
  });
});

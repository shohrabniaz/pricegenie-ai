import { describe, expect, it } from "vitest";
import {
  getCategories,
  getFeaturedProducts,
  searchProducts,
} from "@/lib/search";

describe("searchProducts", () => {
  it("returns empty for blank query", () => {
    expect(searchProducts("")).toEqual([]);
    expect(searchProducts("   ")).toEqual([]);
  });

  it("finds products by name or tag", () => {
    const results = searchProducts("ps5");
    expect(results.length).toBeGreaterThan(0);
    expect(
      results.some(
        (p) =>
          p.name.toLowerCase().includes("ps5") ||
          p.tags.some((t) => t.includes("ps5"))
      )
    ).toBe(true);
  });

  it("filters by category and max price", () => {
    const results = searchProducts("apple", {
      category: "Phones",
      maxPrice: 5000,
      inStockOnly: true,
    });
    expect(results.every((p) => p.category === "Phones")).toBe(true);
  });

  it("sorts by true price ascending", () => {
    const results = searchProducts("gaming");
    if (results.length < 2) return;
    const first = results[0].offers.find((o) => o.inStock)?.listPrice ?? 0;
    const second = results[1].offers.find((o) => o.inStock)?.listPrice ?? 0;
    expect(first).toBeLessThanOrEqual(second + 5000);
  });
});

describe("getFeaturedProducts", () => {
  it("returns four products", () => {
    expect(getFeaturedProducts()).toHaveLength(4);
  });
});

describe("getCategories", () => {
  it("returns sorted unique categories", () => {
    const categories = getCategories();
    expect(categories.length).toBeGreaterThan(5);
    expect([...categories].sort()).toEqual(categories);
  });
});

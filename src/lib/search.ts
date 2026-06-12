import { PRODUCTS } from "@/data/products";
import type { Product, SearchFilters } from "@/types";
import { getBestOffer } from "./pricing";

export function searchProducts(
  query: string,
  filters: SearchFilters = {},
  studentMode = false
): Product[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  let results = PRODUCTS.filter((product) => {
    const haystack = [
      product.name,
      product.brand,
      product.category,
      product.description,
      ...product.tags,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized) || normalized.split(" ").every((word) => haystack.includes(word));
  });

  if (filters.category) {
    results = results.filter(
      (p) => p.category.toLowerCase() === filters.category!.toLowerCase()
    );
  }

  if (filters.inStockOnly) {
    results = results.filter((p) => p.offers.some((o) => o.inStock));
  }

  if (filters.maxPrice !== undefined) {
    results = results.filter((p) => {
      const best = getBestOffer(p.offers, studentMode, p);
      return best && best.breakdown.truePrice <= filters.maxPrice!;
    });
  }

  return results.sort((a, b) => {
    const bestA = getBestOffer(a.offers, studentMode, a);
    const bestB = getBestOffer(b.offers, studentMode, b);
    return (
      (bestA?.breakdown.truePrice ?? Infinity) -
      (bestB?.breakdown.truePrice ?? Infinity)
    );
  });
}

export function getFeaturedProducts(studentMode = false): Product[] {
  return [...PRODUCTS]
    .sort((a, b) => {
      const bestA = getBestOffer(a.offers, studentMode, a);
      const bestB = getBestOffer(b.offers, studentMode, b);
      const savingsA =
        bestA ? bestA.breakdown.listPrice - bestA.breakdown.truePrice : 0;
      const savingsB =
        bestB ? bestB.breakdown.listPrice - bestB.breakdown.truePrice : 0;
      return savingsB - savingsA;
    })
    .slice(0, 4);
}

export function getCategories(): string[] {
  return [...new Set(PRODUCTS.map((p) => p.category))].sort();
}

import type { Product, PriceHistoryPoint } from "@/types";
import { PRICE_HISTORY_LOG } from "@/data/price-history-log";

/** Merge seed catalog history with a daily scrape log (deduped by date). */
export function mergePriceHistory(
  product: Product,
  log: Record<string, PriceHistoryPoint[]>
): Product {
  const logged = log[product.id];
  if (!logged?.length) return product;

  const byDate = new Map<string, PriceHistoryPoint>();
  for (const point of product.priceHistory) {
    byDate.set(point.date, point);
  }
  for (const point of logged) {
    byDate.set(point.date, point);
  }

  const priceHistory = [...byDate.values()].sort((a, b) =>
    a.date.localeCompare(b.date)
  );
  const lowestEver = Math.min(
    product.lowestEver,
    ...priceHistory.map((p) => p.price)
  );

  return { ...product, priceHistory, lowestEver };
}

/** Merge seed catalog history with daily scrape log (deduped by date). */
export function mergeLoggedPriceHistory(product: Product): Product {
  return mergePriceHistory(product, PRICE_HISTORY_LOG);
}

export function appendPriceHistoryPoint(
  log: Record<string, PriceHistoryPoint[]>,
  productId: string,
  date: string,
  price: number
): void {
  const points = [...(log[productId] ?? [])];
  const last = points[points.length - 1];

  if (last?.date === date) {
    if (last.price !== price) {
      points[points.length - 1] = { date, price };
    }
  } else {
    points.push({ date, price });
  }

  log[productId] = points.slice(-36);
}

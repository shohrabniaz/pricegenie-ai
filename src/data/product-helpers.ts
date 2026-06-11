import type { Product, PriceHistoryPoint, StoreOffer, Retailer } from "@/types";
import { RETAILER_LABELS } from "@/data/retailers";
import { resolveOfferUrl } from "@/lib/retailer-urls";

type OfferInput = {
  retailer: Retailer;
  listPrice: number;
  shipping?: number;
  inStock?: boolean;
  url?: string;
} & Omit<Partial<StoreOffer>, "retailer" | "retailerName" | "listPrice" | "shipping" | "inStock" | "url">;

function offer(input: OfferInput, productName: string): StoreOffer {
  return {
    retailer: input.retailer,
    retailerName: RETAILER_LABELS[input.retailer],
    listPrice: input.listPrice,
    shipping: input.shipping ?? 0,
    inStock: input.inStock ?? true,
    url: resolveOfferUrl(input.retailer, productName, input.url),
    couponCode: input.couponCode,
    couponDiscount: input.couponDiscount,
    cashbackPercent: input.cashbackPercent,
    cashbackProvider: input.cashbackProvider,
    studentDiscountPercent: input.studentDiscountPercent,
  };
}

export function catalogProduct(
  base: Omit<Product, "offers" | "priceHistory"> & {
    offers: OfferInput[];
    priceHistory?: PriceHistoryPoint[];
    currentPrice?: number;
  }
): Product {
  const offers = base.offers.map((o) => offer(o, base.name));
  const current =
    base.currentPrice ??
    Math.min(...offers.filter((o) => o.inStock).map((o) => o.listPrice));

  const priceHistory: PriceHistoryPoint[] = base.priceHistory ?? [
    { date: "2025-11-28", price: base.lowestEver, event: "Black Friday" },
    { date: "2026-03-01", price: current + Math.round(current * 0.05) },
    { date: "2026-06-01", price: current },
  ];

  const { currentPrice, ...rest } = base;
  void currentPrice;
  return { ...rest, offers, priceHistory };
}

export function resolveProductUrls(product: Product): Product {
  return {
    ...product,
    offers: product.offers.map((o) => ({
      ...o,
      url: resolveOfferUrl(o.retailer, product.name, o.url),
    })),
  };
}

export { offer };

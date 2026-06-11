import type { Product, PriceHistoryPoint, StoreOffer, Retailer } from "@/types";
import { RETAILER_LABELS } from "@/data/retailers";

type OfferInput = {
  retailer: Retailer;
  listPrice: number;
  shipping?: number;
  inStock?: boolean;
  url?: string;
} & Omit<Partial<StoreOffer>, "retailer" | "retailerName" | "listPrice" | "shipping" | "inStock" | "url">;

const DEFAULT_URLS: Record<Retailer, string> = {
  "jb-hifi": "https://www.jbhifi.com.au",
  "harvey-norman": "https://www.harveynorman.com.au",
  "the-good-guys": "https://www.thegoodguys.com.au",
  "amazon-au": "https://www.amazon.com.au",
  kogan: "https://www.kogan.com",
  officeworks: "https://www.officeworks.com.au",
  "big-w": "https://www.bigw.com.au",
  "ebay-au": "https://www.ebay.com.au",
};

function offer(input: OfferInput): StoreOffer {
  return {
    retailer: input.retailer,
    retailerName: RETAILER_LABELS[input.retailer],
    listPrice: input.listPrice,
    shipping: input.shipping ?? 0,
    inStock: input.inStock ?? true,
    url: input.url ?? DEFAULT_URLS[input.retailer],
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
  const offers = base.offers.map(offer);
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

export { offer };

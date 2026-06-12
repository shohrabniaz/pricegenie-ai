import type { Product } from "@/types";
import { getBestOffer } from "./pricing";
import { formatAud } from "./pricing";

export interface WaitOrBuyAdvice {
  recommendation: "buy" | "wait" | "neutral";
  headline: string;
  detail: string;
  expectedSavings?: number;
  nextSaleEvent?: string;
}

export function getWaitOrBuyAdvice(
  product: Product,
  studentMode: boolean
): WaitOrBuyAdvice {
  const best = getBestOffer(product.offers, studentMode, product);
  if (!best) {
    return {
      recommendation: "neutral",
      headline: "No stock available",
      detail: "Check back later or set a price alert.",
    };
  }

  const currentPrice = best.breakdown.truePrice;
  const lowestEver = product.lowestEver;
  const gap = currentPrice - lowestEver;
  const gapPercent = Math.round((gap / currentPrice) * 100);

  const history = product.priceHistory;
  const blackFridayPrice = history.find((h) => h.event)?.price;
  const lastPrice = history[history.length - 1]?.price ?? currentPrice;

  if (gapPercent >= 15) {
    return {
      recommendation: "wait",
      headline: `Consider waiting — save up to ${formatAud(gap)}`,
      detail: `This product was ${formatAud(lowestEver)} during Black Friday and is currently ${formatAud(currentPrice)}. Historically drops ~${gapPercent}% during major sales.`,
      expectedSavings: gap,
      nextSaleEvent: "EOFY Sale (June) or Black Friday (November)",
    };
  }

  if (currentPrice <= lowestEver * 1.05) {
    return {
      recommendation: "buy",
      headline: "Great time to buy",
      detail: `Current true price ${formatAud(currentPrice)} is near the historical low of ${formatAud(lowestEver)}. Unlikely to drop much further before next major sale.`,
    };
  }

  if (currentPrice < lastPrice) {
    return {
      recommendation: "buy",
      headline: "Price trending down",
      detail: `Price dropped from ${formatAud(lastPrice)} to ${formatAud(currentPrice)}. Good value if you need it now.`,
    };
  }

  if (blackFridayPrice && currentPrice > blackFridayPrice * 1.1) {
    const expected = currentPrice - blackFridayPrice;
    return {
      recommendation: "wait",
      headline: `Wait for EOFY or Black Friday`,
      detail: `Expected savings of ~${formatAud(expected)} based on last Black Friday pricing of ${formatAud(blackFridayPrice)}.`,
      expectedSavings: expected,
      nextSaleEvent: "EOFY Sale (June)",
    };
  }

  return {
    recommendation: "neutral",
    headline: "Fair price right now",
    detail: `At ${formatAud(currentPrice)}, this is a reasonable price. Set an alert if you want to wait for a bigger drop.`,
  };
}

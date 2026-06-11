import type { StoreOffer, TruePriceBreakdown } from "@/types";

export function formatAud(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateTruePrice(
  offer: StoreOffer,
  studentMode: boolean
): TruePriceBreakdown {
  const listPrice = offer.listPrice;
  const couponSavings = offer.couponDiscount ?? 0;
  const afterCoupon = listPrice - couponSavings;

  const studentSavings =
    studentMode && offer.studentDiscountPercent
      ? Math.round(afterCoupon * (offer.studentDiscountPercent / 100))
      : 0;

  const afterStudent = afterCoupon - studentSavings;

  const cashbackSavings = offer.cashbackPercent
    ? Math.round(afterStudent * (offer.cashbackPercent / 100))
    : 0;

  const shipping = offer.shipping;
  const truePrice = afterStudent + shipping - cashbackSavings;

  return {
    listPrice,
    couponSavings,
    cashbackSavings,
    studentSavings,
    shipping,
    truePrice: Math.max(0, truePrice),
  };
}

export function getBestOffer(
  offers: StoreOffer[],
  studentMode: boolean
): { offer: StoreOffer; breakdown: TruePriceBreakdown } | null {
  const inStock = offers.filter((o) => o.inStock);
  if (inStock.length === 0) return null;

  let best = inStock[0];
  let bestBreakdown = calculateTruePrice(best, studentMode);

  for (const offer of inStock.slice(1)) {
    const breakdown = calculateTruePrice(offer, studentMode);
    if (breakdown.truePrice < bestBreakdown.truePrice) {
      best = offer;
      bestBreakdown = breakdown;
    }
  }

  return { offer: best, breakdown: bestBreakdown };
}

export function rankOffers(
  offers: StoreOffer[],
  studentMode: boolean
): Array<{ offer: StoreOffer; breakdown: TruePriceBreakdown }> {
  return offers
    .map((offer) => ({
      offer,
      breakdown: calculateTruePrice(offer, studentMode),
    }))
    .sort((a, b) => a.breakdown.truePrice - b.breakdown.truePrice);
}

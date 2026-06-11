import type { StoreOffer, TruePriceBreakdown } from "@/types";

export type PriceStepType = "base" | "discount" | "fee" | "cashback" | "total";

export interface PriceStep {
  label: string;
  amount: number;
  type: PriceStepType;
  detail?: string;
}

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

/** Human-readable steps showing exactly how true price is calculated. */
export function getPriceSteps(
  offer: StoreOffer,
  studentMode: boolean
): PriceStep[] {
  const b = calculateTruePrice(offer, studentMode);
  const steps: PriceStep[] = [
    {
      label: `Store list price at ${offer.retailerName}`,
      amount: b.listPrice,
      type: "base",
      detail:
        "This is the sticker price shown on the retailer's website before any discounts.",
    },
  ];

  if (b.couponSavings > 0) {
    steps.push({
      label: offer.couponCode
        ? `Coupon code ${offer.couponCode}`
        : "Coupon discount",
      amount: -b.couponSavings,
      type: "discount",
      detail: offer.couponCode
        ? `Apply code ${offer.couponCode} at checkout to save ${formatAud(b.couponSavings)}.`
        : `Estimated coupon savings of ${formatAud(b.couponSavings)}.`,
    });
  }

  if (b.studentSavings > 0) {
    steps.push({
      label: `Student discount (${offer.studentDiscountPercent}%)`,
      amount: -b.studentSavings,
      type: "discount",
      detail:
        "Education pricing applied because Student Mode is on. Verify with UNiDAYS, Student Beans, or your uni ID at checkout.",
    });
  }

  if (b.shipping > 0) {
    steps.push({
      label: "Delivery / shipping",
      amount: b.shipping,
      type: "fee",
      detail: `Shipping to most Australian metro areas is ${formatAud(b.shipping)}.`,
    });
  }

  if (b.cashbackSavings > 0) {
    steps.push({
      label: `Cashback via ${offer.cashbackProvider ?? "rewards app"}`,
      amount: -b.cashbackSavings,
      type: "cashback",
      detail: `Shop through ${offer.cashbackProvider} to receive ~${formatAud(b.cashbackSavings)} back after your purchase (${offer.cashbackPercent}% cashback).`,
    });
  }

  steps.push({
    label: "True price (what you effectively pay)",
    amount: b.truePrice,
    type: "total",
    detail:
      "Your real cost after coupons, student discounts, shipping, and cashback.",
  });

  return steps;
}

export function getTotalSavings(breakdown: TruePriceBreakdown): number {
  return (
    breakdown.couponSavings +
    breakdown.studentSavings +
    breakdown.cashbackSavings -
    breakdown.shipping
  );
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

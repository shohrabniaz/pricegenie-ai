import type { Product, StoreOffer, TruePriceBreakdown } from "@/types";
import { resolveDiscounts } from "@/lib/coupon-rules";

export type PriceStepType = "base" | "discount" | "fee" | "cashback" | "subtotal" | "total";

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
  studentMode: boolean,
  product?: Product
): TruePriceBreakdown {
  const listPrice = offer.listPrice;
  const discounts = product
    ? resolveDiscounts(offer, product, studentMode)
    : {
        couponCode: offer.couponCode,
        couponDiscount: offer.couponDiscount ?? 0,
        studentDiscountPercent: studentMode ? (offer.studentDiscountPercent ?? 0) : 0,
      };

  const couponSavings = discounts.couponDiscount;
  const afterCoupon = listPrice - couponSavings;

  const studentSavings =
    discounts.studentDiscountPercent > 0
      ? Math.round(afterCoupon * (discounts.studentDiscountPercent / 100))
      : 0;

  const afterStudent = afterCoupon - studentSavings;
  const shipping = offer.shipping;

  const checkoutPrice = afterStudent + shipping;

  const cashbackSavings = offer.cashbackPercent
    ? Math.round(afterStudent * (offer.cashbackPercent / 100))
    : 0;

  const truePrice = checkoutPrice - cashbackSavings;

  return {
    listPrice,
    couponSavings,
    cashbackSavings,
    studentSavings,
    shipping,
    checkoutPrice: Math.max(0, checkoutPrice),
    truePrice: Math.max(0, truePrice),
    couponCode: discounts.couponCode,
    studentDiscountPercent: discounts.studentDiscountPercent,
  };
}

/** Human-readable steps: store price → checkout → effective after cashback. */
export function getPriceSteps(
  offer: StoreOffer,
  studentMode: boolean,
  product?: Product
): PriceStep[] {
  const b = calculateTruePrice(offer, studentMode, product);
  const steps: PriceStep[] = [
    {
      label: `Store price on ${offer.retailerName} (no codes)`,
      amount: b.listPrice,
      type: "base",
      detail:
        "This matches the price shown on the retailer website before you enter any coupon or student codes.",
    },
  ];

  if (b.couponSavings > 0) {
    steps.push({
      label: b.couponCode ? `Coupon ${b.couponCode}` : "Coupon discount",
      amount: -b.couponSavings,
      type: "discount",
      detail: b.couponCode
        ? `Enter code ${b.couponCode} at checkout to save ${formatAud(b.couponSavings)}.`
        : `Estimated coupon savings of ${formatAud(b.couponSavings)}.`,
    });
  }

  if (b.studentSavings > 0) {
    steps.push({
      label: `Student discount (${b.studentDiscountPercent}%)`,
      amount: -b.studentSavings,
      type: "discount",
      detail:
        "Education pricing — verify with UNiDAYS, Student Beans, or your uni ID at checkout.",
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

  if (b.couponSavings > 0 || b.studentSavings > 0 || b.shipping > 0) {
    steps.push({
      label: "Checkout total (on retailer site)",
      amount: b.checkoutPrice,
      type: "subtotal",
      detail: "What you pay at the store checkout after applicable codes and shipping.",
    });
  }

  if (b.cashbackSavings > 0) {
    steps.push({
      label: `Cashback via ${offer.cashbackProvider ?? "rewards app"}`,
      amount: -b.cashbackSavings,
      type: "cashback",
      detail: `Not shown on ${offer.retailerName} — shop through ${offer.cashbackProvider} for ~${formatAud(b.cashbackSavings)} back (${offer.cashbackPercent}% cashback).`,
    });
  }

  steps.push({
    label:
      b.cashbackSavings > 0
        ? "Effective price (after cashback)"
        : "Price you pay at checkout",
    amount: b.truePrice,
    type: "total",
    detail:
      b.cashbackSavings > 0
        ? "Your real cost after checkout discounts and estimated cashback."
        : "Matches the retailer checkout total when no cashback app is used.",
  });

  return steps;
}

export function getTotalSavings(breakdown: TruePriceBreakdown): number {
  return breakdown.listPrice + breakdown.shipping - breakdown.truePrice;
}

export function hasActiveDeals(
  breakdown: TruePriceBreakdown,
  studentMode: boolean
): boolean {
  return (
    breakdown.couponSavings > 0 ||
    (studentMode && breakdown.studentSavings > 0) ||
    breakdown.cashbackSavings > 0
  );
}

export function getBestOffer(
  offers: StoreOffer[],
  studentMode: boolean,
  product?: Product
): { offer: StoreOffer; breakdown: TruePriceBreakdown } | null {
  const inStock = offers.filter((o) => o.inStock);
  if (inStock.length === 0) return null;

  let best = inStock[0];
  let bestBreakdown = calculateTruePrice(best, studentMode, product);

  for (const offer of inStock.slice(1)) {
    const breakdown = calculateTruePrice(offer, studentMode, product);
    if (breakdown.truePrice < bestBreakdown.truePrice) {
      best = offer;
      bestBreakdown = breakdown;
    }
  }

  return { offer: best, breakdown: bestBreakdown };
}

export function rankOffers(
  offers: StoreOffer[],
  studentMode: boolean,
  product?: Product
): Array<{ offer: StoreOffer; breakdown: TruePriceBreakdown }> {
  return offers
    .map((offer) => ({
      offer,
      breakdown: calculateTruePrice(offer, studentMode, product),
    }))
    .sort((a, b) => a.breakdown.truePrice - b.breakdown.truePrice);
}

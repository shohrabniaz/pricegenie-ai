import { describe, expect, it } from "vitest";
import type { StoreOffer } from "@/types";
import {
  calculateTruePrice,
  formatAud,
  getBestOffer,
  getPriceSteps,
  getTotalSavings,
  rankOffers,
} from "@/lib/pricing";

const baseOffer: StoreOffer = {
  retailer: "jb-hifi",
  retailerName: "JB Hi-Fi",
  listPrice: 1000,
  shipping: 10,
  inStock: true,
  url: "https://www.jbhifi.com.au/search?query=test",
  couponCode: "SAVE50",
  couponDiscount: 50,
  cashbackPercent: 5,
  cashbackProvider: "Cashrewards",
  studentDiscountPercent: 10,
};

describe("formatAud", () => {
  it("formats AUD without cents", () => {
    expect(formatAud(1899)).toMatch(/\$1,?899/);
  });
});

describe("calculateTruePrice", () => {
  it("applies coupon, student, shipping, and cashback", () => {
    const result = calculateTruePrice(baseOffer, true);
    expect(result.listPrice).toBe(1000);
    expect(result.couponSavings).toBe(50);
    expect(result.studentSavings).toBe(95);
    expect(result.shipping).toBe(10);
    expect(result.cashbackSavings).toBe(43);
    expect(result.truePrice).toBe(822);
  });

  it("skips student discount when student mode is off", () => {
    const result = calculateTruePrice(baseOffer, false);
    expect(result.studentSavings).toBe(0);
    expect(result.truePrice).toBe(912);
  });

  it("never returns a negative true price", () => {
    const result = calculateTruePrice(
      { ...baseOffer, listPrice: 10, couponDiscount: 100, shipping: 0 },
      false
    );
    expect(result.truePrice).toBe(0);
  });
});

describe("getPriceSteps", () => {
  it("includes coupon and cashback detail lines", () => {
    const steps = getPriceSteps(baseOffer, true);
    expect(steps[0].type).toBe("base");
    expect(steps.some((s) => s.label.includes("SAVE50"))).toBe(true);
    expect(steps.some((s) => s.type === "cashback")).toBe(true);
    expect(steps.at(-1)?.type).toBe("total");
  });
});

describe("getTotalSavings", () => {
  it("sums savings minus shipping", () => {
    const breakdown = calculateTruePrice(baseOffer, true);
    expect(getTotalSavings(breakdown)).toBe(178);
  });
});

describe("getBestOffer", () => {
  it("picks the lowest true price in stock", () => {
    const offers: StoreOffer[] = [
      baseOffer,
      {
        ...baseOffer,
        retailer: "amazon-au",
        retailerName: "Amazon AU",
        listPrice: 900,
        couponDiscount: 0,
        cashbackPercent: 0,
      },
    ];
    const best = getBestOffer(offers, false);
    expect(best?.offer.retailer).toBe("amazon-au");
    expect(best?.breakdown.truePrice).toBe(910);
  });

  it("returns null when nothing is in stock", () => {
    expect(
      getBestOffer([{ ...baseOffer, inStock: false }], false)
    ).toBeNull();
  });
});

describe("rankOffers", () => {
  it("sorts offers by true price ascending", () => {
    const ranked = rankOffers(
      [
        { ...baseOffer, listPrice: 1200 },
        { ...baseOffer, listPrice: 800 },
      ],
      false
    );
    expect(ranked[0].breakdown.truePrice).toBeLessThan(
      ranked[1].breakdown.truePrice
    );
  });
});

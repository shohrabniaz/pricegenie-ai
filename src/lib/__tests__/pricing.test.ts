import { describe, expect, it } from "vitest";
import type { Product, StoreOffer } from "@/types";
import {
  calculateTruePrice,
  formatAud,
  getBestOffer,
  getPriceSteps,
  getTotalSavings,
  rankOffers,
} from "@/lib/pricing";

const mockProduct: Product = {
  id: "test-laptop",
  name: "Test Gaming Laptop",
  brand: "Test",
  category: "Laptops",
  image: "💻",
  description: "Test",
  specs: {},
  tags: ["gaming", "laptop"],
  lowestEver: 900,
  priceHistory: [],
  offers: [],
};

const baseOffer: StoreOffer = {
  retailer: "jb-hifi",
  retailerName: "JB Hi-Fi",
  listPrice: 1000,
  shipping: 10,
  inStock: true,
  url: "https://www.jbhifi.com.au/search?query=test",
  cashbackPercent: 5,
  cashbackProvider: "Cashrewards",
};

describe("formatAud", () => {
  it("formats AUD without cents", () => {
    expect(formatAud(1899)).toMatch(/\$1,?899/);
  });
});

describe("calculateTruePrice", () => {
  it("keeps store price as checkout when no deals apply", () => {
    const result = calculateTruePrice(baseOffer, false, mockProduct);
    expect(result.listPrice).toBe(1000);
    expect(result.couponSavings).toBe(0);
    expect(result.studentSavings).toBe(0);
    expect(result.checkoutPrice).toBe(1010);
    expect(result.cashbackSavings).toBe(50);
    expect(result.truePrice).toBe(960);
  });

  it("applies AUDIO20 coupon for headphones over $300 at JB", () => {
    const audioProduct: Product = {
      ...mockProduct,
      id: "test-headphones",
      name: "Test Headphones Pro",
      category: "Audio",
      tags: ["headphone", "audio"],
    };
    const result = calculateTruePrice(baseOffer, false, audioProduct);
    expect(result.couponSavings).toBe(20);
    expect(result.checkoutPrice).toBe(990);
  });

  it("never returns a negative true price", () => {
    const result = calculateTruePrice(
      { ...baseOffer, listPrice: 10, shipping: 0 },
      false,
      mockProduct
    );
    expect(result.truePrice).toBeGreaterThanOrEqual(0);
  });
});

describe("getPriceSteps", () => {
  it("starts with store price and ends with total", () => {
    const steps = getPriceSteps(baseOffer, false, mockProduct);
    expect(steps[0].type).toBe("base");
    expect(steps[0].label).toMatch(/Store price/i);
    expect(steps.at(-1)?.type).toBe("total");
  });
});

describe("getTotalSavings", () => {
  it("sums savings from list through effective price", () => {
    const breakdown = calculateTruePrice(baseOffer, false, mockProduct);
    expect(getTotalSavings(breakdown)).toBe(50);
  });
});

describe("getBestOffer", () => {
  it("picks the lowest checkout price in stock", () => {
    const offers: StoreOffer[] = [
      baseOffer,
      {
        ...baseOffer,
        retailer: "amazon-au",
        retailerName: "Amazon AU",
        listPrice: 900,
        cashbackPercent: 0,
      },
    ];
    const best = getBestOffer(offers, false, mockProduct);
    expect(best?.offer.retailer).toBe("amazon-au");
    expect(best?.breakdown.checkoutPrice).toBe(910);
  });

  it("returns null when nothing is in stock", () => {
    expect(
      getBestOffer([{ ...baseOffer, inStock: false }], false, mockProduct)
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
      false,
      mockProduct
    );
    expect(ranked[0].breakdown.truePrice).toBeLessThan(
      ranked[1].breakdown.truePrice
    );
  });
});

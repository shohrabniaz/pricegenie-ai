import { describe, expect, it } from "vitest";
import { PRODUCTS } from "@/data/products";
import { resolveDiscounts } from "@/lib/coupon-rules";
import { calculateTruePrice } from "@/lib/pricing";

describe("resolveDiscounts", () => {
  it("does not apply SAVE50 under $500", () => {
    const product = PRODUCTS.find((p) => p.id === "kmart-wireless-earbuds")!;
    const offer = product.offers.find((o) => o.retailer === "kmart")!;
    const discounts = resolveDiscounts(offer, product, false);
    expect(discounts.couponDiscount).toBe(0);
  });

  it("applies SAVE50 on eligible electronics over $500", () => {
    const product = PRODUCTS.find((p) => p.id === "iphone-17-pro-256")!;
    const offer = product.offers.find((o) => o.retailer === "the-good-guys")!;
    const discounts = resolveDiscounts(offer, product, false);
    expect(discounts.couponCode).toBe("SAVE50");
    expect(discounts.couponDiscount).toBe(50);
  });

  it("applies EDU10 as percent only when student mode is on", () => {
    const product = PRODUCTS.find((p) => p.id === "macbook-air-m4")!;
    const offer = product.offers.find((o) => o.retailer === "jb-hifi")!;
    const off = resolveDiscounts(offer, product, false);
    const on = resolveDiscounts(offer, product, true);
    expect(off.studentDiscountPercent).toBe(0);
    expect(on.studentDiscountPercent).toBeGreaterThanOrEqual(10);
  });

  it("store price unchanged when no deals apply", () => {
    const product = PRODUCTS.find((p) => p.id === "ps5-slim")!;
    const offer = product.offers.find((o) => o.retailer === "jb-hifi")!;
    const breakdown = calculateTruePrice(offer, false, product);
    expect(breakdown.couponSavings).toBe(0);
    expect(breakdown.checkoutPrice).toBe(breakdown.listPrice + breakdown.shipping);
    expect(breakdown.truePrice).toBe(breakdown.checkoutPrice);
  });
});

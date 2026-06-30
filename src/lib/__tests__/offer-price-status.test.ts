import { describe, expect, it } from "vitest";
import {
  countVerifiedOffers,
  getOfferPriceStatus,
} from "@/lib/offer-price-status";

describe("offer-price-status", () => {
  it("returns estimate when no snapshot exists", () => {
    expect(getOfferPriceStatus("nonexistent-product", "jb-hifi", 649)).toBe(
      "estimate"
    );
  });

  it("treats matching catalog snapshot prices as estimates", () => {
    expect(getOfferPriceStatus("ps5-slim", "jb-hifi", 649)).toBe("estimate");
    expect(getOfferPriceStatus("ps5-slim", "amazon-au", 599)).toBe("estimate");
  });

  it("counts only scrape-verified or divergent snapshot offers", () => {
    const count = countVerifiedOffers("ps5-slim", [
      { retailer: "amazon-au", listPrice: 599 },
      { retailer: "jb-hifi", listPrice: 649 },
      { retailer: "big-w", listPrice: 629 },
      { retailer: "the-good-guys", listPrice: 649 },
    ]);
    expect(count).toBe(0);
  });
});

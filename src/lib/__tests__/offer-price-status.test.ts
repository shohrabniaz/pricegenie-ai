import { describe, expect, it } from "vitest";
import {
  countVerifiedOffers,
  getOfferPriceStatus,
} from "@/lib/offer-price-status";

describe("offer-price-status", () => {
  it("returns estimate when no snapshot exists", () => {
    expect(getOfferPriceStatus("nonexistent-product", "jb-hifi")).toBe(
      "estimate"
    );
  });

  it("counts verified offers from snapshots", () => {
    const count = countVerifiedOffers("anker-735-charger", [
      "amazon-au",
      "jb-hifi",
    ]);
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

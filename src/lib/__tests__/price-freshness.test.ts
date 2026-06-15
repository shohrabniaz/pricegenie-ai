import { describe, expect, it } from "vitest";
import { daysSinceIsoDate, getPriceFreshness } from "@/lib/price-freshness";

describe("price-freshness", () => {
  it("marks catalog-only prices as estimate", () => {
    expect(getPriceFreshness("2026-06-14", "catalog")).toBe("estimate");
  });

  it("marks snapshot from today as live", () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(getPriceFreshness(today, "snapshot")).toBe("live");
  });

  it("marks old snapshots as stale", () => {
    expect(getPriceFreshness("2026-01-01", "snapshot")).toBe("stale");
  });

  it("computes day difference for ISO dates", () => {
    expect(daysSinceIsoDate("2026-06-10")).toBeGreaterThanOrEqual(0);
  });
});

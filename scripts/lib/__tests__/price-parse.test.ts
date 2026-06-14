import { describe, expect, it } from "vitest";
import { isPlausiblePrice, parseAudPrice, pickBestScrapedPrice } from "../price-parse";

describe("parseAudPrice", () => {
  it("parses AUD strings", () => {
    expect(parseAudPrice(" $1,299.00 ")).toBe(1299);
    expect(parseAudPrice("AUD $49")).toBe(49);
  });

  it("rejects invalid values", () => {
    expect(parseAudPrice("free")).toBeNull();
  });
});

describe("isPlausiblePrice", () => {
  it("allows reasonable drift from catalog", () => {
    expect(isPlausiblePrice(950, 1000)).toBe(true);
    expect(isPlausiblePrice(550, 1000)).toBe(false);
    expect(isPlausiblePrice(400, 1000)).toBe(false);
    expect(isPlausiblePrice(1200, 1000)).toBe(false);
  });

  it("rejects prices too far above catalog (wrong listing)", () => {
    expect(isPlausiblePrice(2197, 1769)).toBe(false);
    expect(isPlausiblePrice(2030, 1769)).toBe(true);
  });
});

describe("pickBestScrapedPrice", () => {
  it("picks closest plausible candidate", () => {
    expect(pickBestScrapedPrice([2197, 1899, 65], 1899)).toBe(1899);
    expect(pickBestScrapedPrice([2197, 65], 1899)).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { isPlausiblePrice, parseAudPrice } from "../price-parse";

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
    expect(isPlausiblePrice(400, 1000)).toBe(false);
  });
});

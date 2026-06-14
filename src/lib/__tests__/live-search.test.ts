import { describe, expect, it } from "vitest";
import { unifiedSearch } from "@/lib/live-search";

describe("live-search", () => {
  it("returns catalog matches with retailer search links", () => {
    const result = unifiedSearch("macbook", {});
    expect(result.query).toBe("macbook");
    expect(result.products.length).toBeGreaterThan(0);
    expect(result.retailerLinks.length).toBe(7);
    expect(result.retailerLinks[0].retailer).toBe("amazon-au");
    expect(result.retailerLinks[0].searchUrl).toContain("amazon.com.au");
  });

  it("includes student mode in pricing path", () => {
    const normal = unifiedSearch("ipad", { studentMode: false });
    const student = unifiedSearch("ipad", { studentMode: true });
    expect(normal.products.length).toBe(student.products.length);
  });
});

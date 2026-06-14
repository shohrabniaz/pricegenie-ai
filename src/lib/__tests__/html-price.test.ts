import { describe, expect, it } from "vitest";
import {
  extractPriceFromHtml,
  extractSearchTermsFromTitle,
  extractTitleFromHtml,
} from "@/lib/html-price";

const JSON_LD_HTML = `
<html><head>
<script type="application/ld+json">
{"@type":"Product","name":"Test Laptop","offers":{"@type":"Offer","price":"899.00","priceCurrency":"AUD"}}
</script>
<meta property="og:title" content="Test Laptop | JB Hi-Fi" />
</head><body></body></html>`;

describe("html-price", () => {
  it("extracts price from JSON-LD", () => {
    expect(extractPriceFromHtml(JSON_LD_HTML)).toBe(899);
  });

  it("extracts title from og:title", () => {
    expect(extractTitleFromHtml(JSON_LD_HTML)).toBe("Test Laptop | JB Hi-Fi");
  });

  it("strips retailer suffix from search terms", () => {
    expect(extractSearchTermsFromTitle("MacBook Air M4 | JB Hi-Fi")).toBe(
      "MacBook Air M4"
    );
  });

  it("parses visible dollar amounts as fallback", () => {
    const html = "<html><body><span class='price'>$1,049.00</span></body></html>";
    expect(extractPriceFromHtml(html)).toBe(1049);
  });
});

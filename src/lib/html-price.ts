import { load } from "cheerio";

/** Extract store list price from retailer HTML (JSON-LD, meta, visible price). */
export function extractPriceFromHtml(html: string): number | null {
  const fromLd = extractJsonLdPrice(html);
  if (fromLd) return fromLd;

  const $ = load(html);
  const meta =
    $('meta[property="product:price:amount"]').attr("content") ??
    $('meta[itemprop="price"]').attr("content");
  if (meta) {
    const n = Math.round(parseFloat(meta));
    if (n > 0) return n;
  }

  const selectors = [
    "[data-testid='product-tile-price']",
    ".a-price .a-offscreen",
    ".price__value",
    ".price",
    "[class*='Price']",
  ];
  for (const sel of selectors) {
    const text = $(sel).first().text();
    const parsed = parseAud(text);
    if (parsed) return parsed;
  }

  const bodyText = $("body").text();
  const match = bodyText.match(/\$\s*([\d,]+(?:\.\d{2})?)/);
  if (match) return parseAud(match[0]);

  return null;
}

export function extractTitleFromHtml(html: string): string | null {
  const $ = load(html);
  const og = $('meta[property="og:title"]').attr("content");
  if (og) return og.trim();
  const h1 = $("h1").first().text().trim();
  return h1 || null;
}

function extractJsonLdPrice(html: string): number | null {
  const scripts = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi
  );
  if (!scripts) return null;

  for (const block of scripts) {
    const inner = block.replace(/<\/?script[^>]*>/gi, "");
    try {
      const raw = JSON.parse(inner);
      const nodes = Array.isArray(raw) ? raw : [raw];
      for (const node of nodes) {
        if (!node || typeof node !== "object") continue;
        const type = node["@type"];
        const isProduct =
          type === "Product" ||
          (Array.isArray(type) && type.includes("Product"));
        if (!isProduct) continue;
        const offers = node.offers ?? node.Offers;
        const offer = Array.isArray(offers) ? offers[0] : offers;
        const price =
          offer?.price ?? offer?.lowPrice ?? offer?.highPrice ?? node.price;
        if (price != null) {
          const n = Math.round(Number(price));
          if (n > 0) return n;
        }
      }
    } catch {
      /* ignore */
    }
  }
  return null;
}

function parseAud(text: string): number | null {
  const match = text.replace(/\u00a0/g, " ").match(/\$\s*([\d,]+(?:\.\d{2})?)/);
  if (!match) return null;
  const value = Math.round(parseFloat(match[1].replace(/,/g, "")));
  return value > 0 && value < 100_000 ? value : null;
}

export function extractSearchTermsFromTitle(title: string): string {
  return title
    .replace(/\s*[|\-–—].*$/, "")
    .replace(/\b(JB Hi-Fi|Harvey Norman|Amazon|Kmart|eBay)\b/gi, "")
    .trim()
    .slice(0, 120);
}

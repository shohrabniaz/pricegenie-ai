import { PRODUCTS } from "@/data/products";
import { searchProducts } from "./search";
import { getBestOffer, formatAud } from "./pricing";
import { getWaitOrBuyAdvice } from "./wait-or-buy";

const BUDGET_PATTERN =
  /(?:under|below|less than|max|budget)\s*\$?\s*(\d[\d,]*)/i;
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  laptop: ["laptop", "macbook", "xps", "gaming", "notebook"],
  phone: ["phone", "iphone", "galaxy", "smartphone", "mobile"],
  tv: ["tv", "television", "oled", "screen"],
  audio: ["headphone", "earbuds", "speaker", "audio"],
  tablet: ["ipad", "tablet"],
};

function extractBudget(query: string): number | undefined {
  const match = query.match(BUDGET_PATTERN);
  if (!match) return undefined;
  return parseInt(match[1].replace(/,/g, ""), 10);
}

function detectCategory(query: string): string | undefined {
  const lower = query.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) {
      return category === "laptop"
        ? "Laptops"
        : category === "phone"
          ? "Phones"
          : category === "tv"
            ? "TVs"
            : category === "audio"
              ? "Audio"
              : category === "tablet"
                ? "Tablets"
                : undefined;
    }
  }
  return undefined;
}

export function generateAiResponse(
  query: string,
  studentMode: boolean
): string {
  const trimmed = query.trim();
  if (!trimmed) {
    return "Ask me anything — e.g. **Best gaming laptop under $2,000?** or **Should I wait to buy the iPhone 17 Pro?**";
  }

  const lower = trimmed.toLowerCase();

  if (lower.includes("wait") || lower.includes("buy now") || lower.includes("should i")) {
    const product = PRODUCTS.find((p) =>
      lower.includes(p.name.toLowerCase()) ||
      lower.includes(p.brand.toLowerCase()) ||
      p.tags.some((t) => lower.includes(t))
    );
    if (product) {
      const advice = getWaitOrBuyAdvice(product, studentMode);
      const emoji =
        advice.recommendation === "buy"
          ? "✅"
          : advice.recommendation === "wait"
            ? "⏳"
            : "ℹ️";
      let response = `${emoji} **${advice.headline}**\n\n${advice.detail}`;
      if (advice.nextSaleEvent) {
        response += `\n\n📅 Next likely sale: ${advice.nextSaleEvent}`;
      }
      return response;
    }
  }

  const budget = extractBudget(trimmed);
  const category = detectCategory(trimmed);

  const searchTerms = trimmed
    .replace(BUDGET_PATTERN, "")
    .replace(/best|good|cheap|recommend|gaming|for|a|the/gi, "")
    .trim();

  const results = searchProducts(
    searchTerms || (category ?? "laptop"),
    { maxPrice: budget, category, inStockOnly: true },
    studentMode
  ).slice(0, 3);

  if (results.length === 0) {
    return budget
      ? `I couldn't find in-stock products under ${formatAud(budget)}. Try increasing your budget or browse our featured deals on the home page.`
      : "I couldn't find matching products. Try searching for a specific brand or product name.";
  }

  const labels = ["Best overall value", "Runner-up", "Alternative option"];
  let response = studentMode
    ? "🎓 **Student Mode ON** — prices include student discounts, coupons & cashback where available.\n\n"
    : "";

  response += `Here are my top picks${budget ? ` under ${formatAud(budget)}` : ""}:\n\n`;

  results.forEach((product, i) => {
    const best = getBestOffer(product.offers, studentMode)!;
    const advice = getWaitOrBuyAdvice(product, studentMode);
    response += `**${i + 1}. ${product.name}** — ${labels[i] ?? "Option"}\n`;
    response += `   True price: **${formatAud(best.breakdown.truePrice)}** at ${best.offer.retailerName}\n`;
    response += `   ${product.description}\n`;
    if (best.breakdown.couponSavings > 0) {
      response += `   🏷️ Coupon saves ${formatAud(best.breakdown.couponSavings)}\n`;
    }
    if (best.breakdown.studentSavings > 0) {
      response += `   🎓 Student discount saves ${formatAud(best.breakdown.studentSavings)}\n`;
    }
    if (best.breakdown.cashbackSavings > 0) {
      response += `   💰 Cashback: ${formatAud(best.breakdown.cashbackSavings)} via ${best.offer.cashbackProvider}\n`;
    }
    response += `   ${advice.recommendation === "wait" ? "⏳" : "✅"} ${advice.headline}\n\n`;
  });

  response +=
    "💡 **Tip:** Toggle Student Mode in the header if you have a valid student ID for extra savings.";

  return response;
}

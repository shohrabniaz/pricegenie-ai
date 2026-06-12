import { PRODUCTS } from "@/data/products";
import type { Product } from "@/types";
import { AI_ASSISTANT_NAME } from "@/lib/brand";
import { searchProducts } from "./search";
import { getBestOffer, formatAud, rankOffers } from "./pricing";
import { getWaitOrBuyAdvice } from "./wait-or-buy";
import { buildRetailerProductUrl } from "./retailer-urls";

export interface AiReply {
  summary: string;
  body: string;
  suggestions: string[];
  productLinks?: Array<{ name: string; href: string; price: string; store: string }>;
}

export interface AiChatTurn {
  role: "user" | "assistant";
  content: string;
}

const BUDGET_PATTERN =
  /(?:under|below|less than|max|budget|for)\s*\$?\s*(\d[\d,]*)/i;

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  laptop: ["laptop", "macbook", "xps", "gaming", "notebook", "chromebook"],
  phone: ["phone", "iphone", "galaxy", "smartphone", "mobile", "pixel"],
  tv: ["tv", "television", "oled", "screen", "qled"],
  audio: ["headphone", "earbuds", "earphone", "speaker", "audio", "airpods", "buds"],
  tablet: ["ipad", "tablet", "kindle"],
  gaming: ["ps5", "playstation", "xbox", "nintendo", "switch", "gaming", "console"],
  kmart: ["kmart", "k mart"],
  electronics: ["electronics", "electronic", "gadget", "tech"],
};

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "i",
  "me",
  "my",
  "for",
  "to",
  "of",
  "in",
  "on",
  "at",
  "best",
  "good",
  "cheap",
  "cheapest",
  "recommend",
  "recommended",
  "suggest",
  "please",
  "show",
  "find",
  "get",
  "need",
  "want",
  "looking",
  "some",
  "any",
  "should",
  "can",
  "you",
  "what",
  "which",
  "is",
  "are",
  "do",
  "does",
  "buy",
  "shop",
  "shopping",
  "deal",
  "deals",
  "tell",
  "about",
  "give",
  "help",
  "with",
  "also",
  "more",
  "other",
  "options",
  "alternative",
  "alternatives",
]);

const GREETING_ONLY =
  /^(hi|hello|hey|g'?day|thanks|thank you|yo|sup|good\s+(morning|afternoon|evening))[!.?\s]*$/i;
const HELP_ONLY = /^(help|what can you do|what do you do)[!.?\s]*$/i;

const COMPARE_SPLIT = /\s+(?:vs\.?|versus)\s+/i;

function extractBudget(query: string): number | undefined {
  const match = query.match(BUDGET_PATTERN);
  if (!match) return undefined;
  return parseInt(match[1].replace(/,/g, ""), 10);
}

function detectCategory(query: string): string | undefined {
  const lower = query.toLowerCase();
  if (CATEGORY_KEYWORDS.kmart.some((k) => lower.includes(k))) return "Kmart";
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === "kmart") continue;
    if (keywords.some((k) => lower.includes(k))) {
      const map: Record<string, string> = {
        laptop: "Laptops",
        phone: "Phones",
        tv: "TVs",
        audio: "Audio",
        tablet: "Tablets",
        gaming: "Gaming",
        electronics: "Electronics",
      };
      return map[category];
    }
  }
  return undefined;
}

function pickSearchTerms(query: string): string {
  const withoutBudget = query.replace(BUDGET_PATTERN, "").trim();
  return withoutBudget
    .split(/\s+/)
    .filter((word) => {
      const clean = word.toLowerCase().replace(/[^\w]/g, "");
      return clean.length > 1 && !STOP_WORDS.has(clean);
    })
    .join(" ")
    .trim();
}

function enrichQueryWithContext(query: string, history?: AiChatTurn[]): string {
  const trimmed = query.trim();
  const lower = trimmed.toLowerCase();
  const shortFollowUp =
    trimmed.split(/\s+/).length <= 5 &&
    /\b(cheaper|more|other|alternative|that|those|it|them|instead|else|again|same)\b/i.test(
      lower
    );

  if (!history?.length || (!shortFollowUp && trimmed.split(/\s+/).length > 3)) {
    return trimmed;
  }

  const userMessages = history.filter((m) => m.role === "user");
  const previous = userMessages[userMessages.length - 1];
  if (!previous || previous.content === trimmed) return trimmed;

  return `${previous.content} ${trimmed}`;
}

function extractProductTokens(query: string): string[] {
  const tokens = new Set<string>();
  const picked = pickSearchTerms(query);
  if (picked) tokens.add(picked);

  const lower = query.toLowerCase();
  for (const keywords of Object.values(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (keyword.length > 2 && lower.includes(keyword)) {
        tokens.add(keyword);
      }
    }
  }

  const matches = query.match(/\b[a-z]*\d+[a-z0-9]*\b/gi) ?? [];
  for (const match of matches) {
    const clean = match.toLowerCase();
    if (!STOP_WORDS.has(clean)) tokens.add(clean);
  }

  return [...tokens];
}

function searchFromQuery(
  query: string,
  filters: { maxPrice?: number; category?: string; inStockOnly?: boolean },
  studentMode: boolean
): Product[] {
  const category = detectCategory(query);
  const searchFilters = {
    ...filters,
    category: filters.category ?? (category === "Kmart" ? undefined : category),
  };

  const attempts = [
    ...extractProductTokens(query),
    category && category !== "Kmart" ? category.toLowerCase() : "",
  ].filter((term) => term.length > 0);

  const seen = new Set<string>();
  const merged: Product[] = [];

  for (const term of attempts) {
    for (const product of searchProducts(term, searchFilters, studentMode)) {
      if (!seen.has(product.id)) {
        seen.add(product.id);
        merged.push(product);
      }
    }
    if (merged.length >= 5) break;
  }

  return merged;
}

function scoreProductMatch(query: string, product: Product): number {
  const lower = query.toLowerCase();
  let score = 0;

  if (lower.includes(product.name.toLowerCase())) score += 10;
  if (lower.includes(product.brand.toLowerCase())) score += 4;

  const nameWords = product.name.toLowerCase().split(/\s+/);
  for (const word of nameWords) {
    if (word.length > 2 && lower.includes(word)) score += 2;
  }

  for (const tag of product.tags) {
    if (tag.length > 2 && lower.includes(tag.toLowerCase())) score += 1;
  }

  return score;
}

function findMentionedProduct(query: string, studentMode = false): Product | undefined {
  const results = searchFromQuery(query, { inStockOnly: true }, studentMode);

  if (results.length === 1) return results[0];

  let best: Product | undefined;
  let bestScore = 0;

  const pool = results.length > 0 ? results : PRODUCTS;
  for (const product of pool) {
    const score = scoreProductMatch(query, product);
    if (score > bestScore) {
      bestScore = score;
      best = product;
    }
  }

  return bestScore >= 3 ? best : results[0];
}

function buildProductLinks(
  products: Product[],
  studentMode: boolean
): AiReply["productLinks"] {
  return products.slice(0, 3).map((product) => {
    const best = getBestOffer(product.offers, studentMode)!;
    return {
      name: product.name,
      href: `/product/${product.id}`,
      price: formatAud(best.breakdown.truePrice),
      store: best.offer.retailerName,
    };
  });
}

function helpReply(): AiReply {
  return {
    summary: `I'm ${AI_ASSISTANT_NAME} — here's what I can help you with.`,
    body: [
      "I compare **true prices** across JB Hi-Fi, Harvey Norman, Amazon AU, Kmart, and more — factoring in coupons, student discounts, cashback, and shipping.",
      "",
      "**Try asking:**",
      "• Best gaming laptop under $1,500?",
      "• How much is the PS5?",
      "• Should I wait to buy the iPhone 17 Pro?",
      "• Compare AirPods vs Samsung Galaxy Buds",
      "• Cheapest Kmart headphones under $30",
      "",
      "Toggle **Student Mode** in the header if you have a uni ID — I'll factor in education pricing automatically.",
    ].join("\n"),
    suggestions: [
      "Best laptop under $1,000?",
      "Kmart deals on headphones",
      "Should I wait for EOFY sales?",
    ],
  };
}

function greetingReply(): AiReply {
  return {
    summary: `G'day! Your wish for the best price is my command.`,
    body: [
      `I'm **${AI_ASSISTANT_NAME}** — I search ${PRODUCTS.length}+ products across Australian stores and tell you the **real** price you'll pay.`,
      "",
      "Ask me for recommendations, wait-or-buy advice, Kmart bargains, or student budget picks. What are you shopping for today?",
    ].join("\n"),
    suggestions: [
      "Best phone under $800?",
      "Kmart TV deals",
      "Student laptop picks",
    ],
  };
}

function splitCompareParts(query: string): [string, string] | null {
  const compareMatch = query.match(
    /compare\s+(.+?)\s+(?:with|to|vs\.?|versus|and|or)\s+(.+)/i
  );
  if (compareMatch) {
    return [compareMatch[1].trim(), compareMatch[2].trim()];
  }

  const parts = query.replace(/\bcompare\b/gi, "").split(COMPARE_SPLIT);
  if (parts.length >= 2 && parts[0].trim() && parts[1].trim()) {
    return [parts[0].trim(), parts[1].trim()];
  }

  return null;
}

function compareReply(query: string, studentMode: boolean): AiReply | null {
  const lower = query.toLowerCase();
  const isCompareIntent =
    /\b(compare|comparison|better|which (?:is|one)|difference between)\b/.test(
      lower
    ) ||
    COMPARE_SPLIT.test(query) ||
    /\bcompare\b.+\b(?:with|to|and|or)\b/i.test(query);

  if (!isCompareIntent) return null;

  const parts = splitCompareParts(query);
  if (!parts) return null;

  const [leftTerm, rightTerm] = parts;
  const left = searchFromQuery(leftTerm, { inStockOnly: true }, studentMode)[0];
  const right = searchFromQuery(rightTerm, { inStockOnly: true }, studentMode)[0];

  if (!left || !right) {
    return {
      summary: "I couldn't match both products for a comparison.",
      body: [
        left
          ? `I found **${left.name}** but need a clearer second product.`
          : right
            ? `I found **${right.name}** but need a clearer first product.`
            : "Try naming both products, e.g. **Compare AirPods vs Galaxy Buds**.",
        "",
        "Use **vs**, **or**, or **compare X with Y**.",
      ].join("\n"),
      suggestions: ["Compare AirPods vs Galaxy Buds", "PS5 vs Xbox Series X"],
      productLinks: buildProductLinks(
        [left, right].filter(Boolean) as Product[],
        studentMode
      ),
    };
  }

  const bestL = getBestOffer(left.offers, studentMode)!;
  const bestR = getBestOffer(right.offers, studentMode)!;
  const cheaper = bestL.breakdown.truePrice <= bestR.breakdown.truePrice ? left : right;
  const cheaperBest = getBestOffer(cheaper.offers, studentMode)!;

  return {
    summary: `**${cheaper.name}** wins on true price at ${formatAud(cheaperBest.breakdown.truePrice)}.`,
    body: [
      `**${left.name}**`,
      `• True price: **${formatAud(bestL.breakdown.truePrice)}** at ${bestL.offer.retailerName}`,
      `• [View on ${bestL.offer.retailerName}](${buildRetailerProductUrl(bestL.offer.retailer, left.name)}) · [Full comparison](/product/${left.id})`,
      "",
      `**${right.name}**`,
      `• True price: **${formatAud(bestR.breakdown.truePrice)}** at ${bestR.offer.retailerName}`,
      `• [View on ${bestR.offer.retailerName}](${buildRetailerProductUrl(bestR.offer.retailer, right.name)}) · [Full comparison](/product/${right.id})`,
      "",
      cheaper.id === left.id
        ? `💡 **Verdict:** ${left.name} is **${formatAud(bestR.breakdown.truePrice - bestL.breakdown.truePrice)}** cheaper on true price.`
        : `💡 **Verdict:** ${right.name} is **${formatAud(bestL.breakdown.truePrice - bestR.breakdown.truePrice)}** cheaper on true price.`,
    ].join("\n"),
    suggestions: [`Should I wait for ${cheaper.name}?`, "Show more alternatives"],
    productLinks: buildProductLinks([left, right], studentMode),
  };
}

function studentPackReply(studentMode: boolean): AiReply {
  const kmartPick = PRODUCTS.filter((p) =>
    p.offers.some((o) => o.retailer === "kmart" && o.inStock)
  ).slice(0, 1);

  const picks = searchProducts("laptop student", {}, studentMode)
    .slice(0, 1)
    .concat(searchProducts("headphones", {}, studentMode).slice(0, 1))
    .concat(searchProducts("monitor coding", {}, studentMode).slice(0, 1))
    .concat(kmartPick);

  const unique = [...new Map(picks.map((p) => [p.id, p])).values()].slice(0, 4);

  let body = "Here's a **student starter pack** I'd recommend for uni in Australia:\n\n";
  unique.forEach((product, i) => {
    const best = getBestOffer(product.offers, studentMode)!;
    body += `**${i + 1}. ${product.name}** — ${formatAud(best.breakdown.truePrice)} at ${best.offer.retailerName}\n`;
    body += `   [Shop at store](${buildRetailerProductUrl(best.offer.retailer, product.name)}) · [Compare in app](/product/${product.id})\n\n`;
  });
  body += "🎓 Turn on **Student Mode** for education discounts on Apple, Samsung, and more.";

  return {
    summary: "Student survival pack — laptop, audio, monitor & essentials.",
    body,
    suggestions: ["Best laptop under $1,000?", "Kmart dorm room essentials"],
    productLinks: buildProductLinks(unique, studentMode),
  };
}

function productPriceReply(product: Product, studentMode: boolean): AiReply {
  const best = getBestOffer(product.offers, studentMode)!;
  const ranked = rankOffers(product.offers, studentMode);
  const savings = best.breakdown.listPrice - best.breakdown.truePrice;

  let body = `**${product.name}** — best true price **${formatAud(best.breakdown.truePrice)}** at **${best.offer.retailerName}**.\n\n`;
  if (savings > 0) body += `You save **${formatAud(savings)}** vs list price after discounts.\n\n`;
  body += `[Buy at ${best.offer.retailerName}](${buildRetailerProductUrl(best.offer.retailer, product.name)}) · [Full breakdown](/product/${product.id})\n\n`;
  body += "**Other stores:**\n";
  ranked.slice(0, 4).forEach(({ offer, breakdown }, i) => {
    body += `${i + 1}. ${offer.retailerName} — ${formatAud(breakdown.truePrice)}\n`;
  });

  return {
    summary: `${product.name} from ${formatAud(best.breakdown.truePrice)} true price.`,
    body,
    suggestions: [
      `Should I wait for ${product.name}?`,
      `Cheaper alternatives to ${product.name}?`,
    ],
    productLinks: buildProductLinks([product], studentMode),
  };
}

function productDetailReply(product: Product, studentMode: boolean): AiReply {
  const best = getBestOffer(product.offers, studentMode)!;
  const advice = getWaitOrBuyAdvice(product, studentMode);

  return {
    summary: `Here's the rundown on **${product.name}**.`,
    body: [
      product.description,
      "",
      `• **Category:** ${product.category}`,
      `• **Best true price:** ${formatAud(best.breakdown.truePrice)} at ${best.offer.retailerName}`,
      `• **${advice.recommendation === "wait" ? "⏳" : "✅"}** ${advice.headline}`,
      "",
      `[Shop at ${best.offer.retailerName}](${buildRetailerProductUrl(best.offer.retailer, product.name)}) · [Compare all stores](/product/${product.id})`,
    ].join("\n"),
    suggestions: [
      `How much is ${product.name}?`,
      `Should I wait for ${product.name}?`,
    ],
    productLinks: buildProductLinks([product], studentMode),
  };
}

function waitOrBuyReply(product: Product, studentMode: boolean): AiReply {
  const advice = getWaitOrBuyAdvice(product, studentMode);
  const best = getBestOffer(product.offers, studentMode)!;
  const ranked = rankOffers(product.offers, studentMode);

  const icon =
    advice.recommendation === "buy" ? "✅" : advice.recommendation === "wait" ? "⏳" : "ℹ️";

  let body = `${icon} **${advice.headline}**\n\n${advice.detail}\n\n`;
  body += `**Current best deal:** ${formatAud(best.breakdown.truePrice)} at ${best.offer.retailerName}\n`;
  body += `[Buy at ${best.offer.retailerName}](${buildRetailerProductUrl(best.offer.retailer, product.name)}) · [Full comparison](/product/${product.id})\n\n`;

  if (advice.expectedSavings) {
    body += `💰 Potential savings if you wait: **${formatAud(advice.expectedSavings)}**\n`;
  }
  if (advice.nextSaleEvent) {
    body += `📅 Next likely sale: ${advice.nextSaleEvent}\n`;
  }

  body += "\n**All stores compared:**\n";
  ranked.slice(0, 4).forEach(({ offer, breakdown }, i) => {
    body += `${i + 1}. ${offer.retailerName} — ${formatAud(breakdown.truePrice)} [shop](${buildRetailerProductUrl(offer.retailer, product.name)})\n`;
  });

  return {
    summary: advice.headline,
    body,
    suggestions: [
      `Cheaper alternatives to ${product.name}?`,
      "Best deals at Kmart?",
    ],
    productLinks: [
      {
        name: product.name,
        href: `/product/${product.id}`,
        price: formatAud(best.breakdown.truePrice),
        store: best.offer.retailerName,
      },
    ],
  };
}

function recommendationReply(query: string, studentMode: boolean): AiReply {
  const budget = extractBudget(query);
  const category = detectCategory(query);
  const kmartFilter = category === "Kmart" || query.toLowerCase().includes("kmart");

  const results = searchFromQuery(
    query,
    { maxPrice: budget, inStockOnly: true },
    studentMode
  );

  const filtered = kmartFilter
    ? results.filter((p) => p.offers.some((o) => o.retailer === "kmart"))
    : results;

  const top = (filtered.length > 0 ? filtered : results).slice(0, 3);

  if (top.length === 0) {
    return {
      summary: budget
        ? `Nothing in stock under ${formatAud(budget)} — try raising your budget.`
        : "I couldn't find a match — try a brand or product name.",
      body: "Browse the [full catalog](/search) or ask me about laptops, phones, Kmart deals, or gaming gear.",
      suggestions: ["Browse all electronics", "Kmart headphone deals", "Best laptop under $1,200?"],
    };
  }

  const labels = ["Best overall value", "Great runner-up", "Solid alternative"];
  const studentNote = studentMode
    ? "🎓 **Student Mode is ON** — I've included education discounts, coupons & cashback.\n\n"
    : "";

  let body = studentNote;
  body += `I compared **${top.length} options**${budget ? ` under **${formatAud(budget)}**` : ""}${kmartFilter ? " at **Kmart** and other stores" : ""}:\n\n`;

  top.forEach((product, i) => {
    const best = getBestOffer(product.offers, studentMode)!;
    const advice = getWaitOrBuyAdvice(product, studentMode);
    const savings = best.breakdown.listPrice - best.breakdown.truePrice;

    body += `### ${i + 1}. ${product.name}\n`;
    body += `*${labels[i]}*\n\n`;
    body += `${product.description}\n\n`;
    body += `• **True price:** ${formatAud(best.breakdown.truePrice)} at **${best.offer.retailerName}**\n`;
    if (savings > 0) body += `• **You save:** ${formatAud(savings)} vs list price\n`;
    if (best.breakdown.couponSavings > 0)
      body += `• 🏷️ Coupon: −${formatAud(best.breakdown.couponSavings)}\n`;
    if (best.breakdown.studentSavings > 0)
      body += `• 🎓 Student: −${formatAud(best.breakdown.studentSavings)}\n`;
    if (best.breakdown.cashbackSavings > 0)
      body += `• 💰 Cashback: −${formatAud(best.breakdown.cashbackSavings)} via ${best.offer.cashbackProvider}\n`;
    body += `• ${advice.recommendation === "wait" ? "⏳" : "✅"} ${advice.headline}\n`;
    body += `• [Shop at ${best.offer.retailerName}](${buildRetailerProductUrl(best.offer.retailer, product.name)}) · [Compare all stores](/product/${product.id})\n\n`;
  });

  body += "💡 **Tip:** I can also tell you whether to wait for EOFY or Black Friday — just ask!";

  return {
    summary: `Top ${top.length} picks${budget ? ` under ${formatAud(budget)}` : ""} — best true price first.`,
    body,
    suggestions: [
      top[0] ? `Should I wait for ${top[0].name}?` : "Best Kmart deals?",
      "Compare with another product",
      "Student budget picks",
    ],
    productLinks: buildProductLinks(top, studentMode),
  };
}

function unclearReply(query: string): AiReply {
  const partial = searchFromQuery(query, { inStockOnly: true }, false);
  if (partial.length > 0) {
    return recommendationReply(query, false);
  }

  return {
    summary: "I didn't quite catch that — try a product or category.",
    body: [
      `I can help with **recommendations**, **prices**, **comparisons**, and **wait-or-buy** advice.`,
      "",
      "**Examples:**",
      "• Best laptop under $1,200",
      "• How much is the PS5?",
      "• Compare AirPods vs Galaxy Buds",
      "• Should I wait for iPhone 17 Pro?",
      "• Kmart headphones under $30",
    ].join("\n"),
    suggestions: [
      "Best gaming laptop under $1,500?",
      "How much is PS5?",
      "Kmart TV deals",
    ],
  };
}

export function generateAiReply(
  query: string,
  studentMode: boolean,
  history?: AiChatTurn[]
): AiReply {
  const trimmed = enrichQueryWithContext(query.trim(), history);
  if (!trimmed) {
    return helpReply();
  }

  if (GREETING_ONLY.test(trimmed)) {
    return greetingReply();
  }
  if (HELP_ONLY.test(trimmed)) {
    return helpReply();
  }

  const lower = trimmed.toLowerCase();

  if (
    lower.includes("student pack") ||
    lower.includes("student survival") ||
    lower.includes("new student")
  ) {
    return studentPackReply(studentMode);
  }

  const compare = compareReply(trimmed, studentMode);
  if (compare) return compare;

  const product = findMentionedProduct(trimmed, studentMode);

  if (product) {
    if (
      /\b(wait|buy now|should i buy|worth (buying|it)|good time to buy)\b/i.test(lower)
    ) {
      return waitOrBuyReply(product, studentMode);
    }
    if (/\b(how much|price|cost|cheapest)\b/i.test(lower)) {
      return productPriceReply(product, studentMode);
    }
    if (
      /\b(tell me about|info|details|what is|about the)\b/i.test(lower) ||
      scoreProductMatch(trimmed, product) >= 5
    ) {
      return productDetailReply(product, studentMode);
    }
  }

  if (
    /\b(best|recommend|suggest|cheapest|good|looking for|need|want|show me|find|options|under|below|deals?)\b/i.test(
      lower
    ) ||
    detectCategory(trimmed) ||
    extractBudget(trimmed)
  ) {
    return recommendationReply(trimmed, studentMode);
  }

  if (product) {
    return productDetailReply(product, studentMode);
  }

  return unclearReply(trimmed);
}

/** Legacy string format for tests */
export function generateAiResponse(
  query: string,
  studentMode: boolean,
  history?: AiChatTurn[]
): string {
  const reply = generateAiReply(query, studentMode, history);
  return `**${reply.summary}**\n\n${reply.body}`;
}

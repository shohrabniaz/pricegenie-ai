import { PRODUCTS } from "@/data/products";
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

const BUDGET_PATTERN =
  /(?:under|below|less than|max|budget|for)\s*\$?\s*(\d[\d,]*)/i;

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  laptop: ["laptop", "macbook", "xps", "gaming", "notebook", "chromebook"],
  phone: ["phone", "iphone", "galaxy", "smartphone", "mobile", "pixel"],
  tv: ["tv", "television", "oled", "screen", "qled"],
  audio: ["headphone", "earbuds", "speaker", "audio", "airpods"],
  tablet: ["ipad", "tablet", "kindle"],
  gaming: ["ps5", "playstation", "xbox", "nintendo", "switch", "gaming"],
  kmart: ["kmart", "k mart"],
  electronics: ["electronics", "electronic", "gadget", "tech"],
};

const GREETINGS = /^(hi|hello|hey|g'?day|thanks|thank you|help|what can you do)\b/i;

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

function findMentionedProduct(query: string) {
  const lower = query.toLowerCase();
  return PRODUCTS.find(
    (p) =>
      lower.includes(p.name.toLowerCase()) ||
      lower.includes(p.brand.toLowerCase()) ||
      p.tags.some((t) => t.length > 3 && lower.includes(t))
  );
}

function pickSearchTerms(query: string): string {
  return query
    .replace(BUDGET_PATTERN, "")
    .replace(
      /\b(best|good|cheap|recommend|gaming|for|a|the|should|i|buy|wait|kmart|please|show|me|find|compare|vs|versus)\b/gi,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();
}

function buildProductLinks(
  products: typeof PRODUCTS,
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
      "• Should I wait to buy the iPhone 17 Pro?",
      "• Cheapest Kmart electronics for a student room?",
      "• Compare AirPods vs Samsung Galaxy Buds",
      "• Student survival pack under $2,000",
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

function greetingReply(name = "there"): AiReply {
  return {
    summary: `G'day! Your wish for the best price is my command.`,
    body: [
      `Hey ${name}! I'm **${AI_ASSISTANT_NAME}** — I search ${PRODUCTS.length}+ products across Australian stores and tell you the **real** price you'll pay.`,
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

function compareReply(query: string, studentMode: boolean): AiReply | null {
  const lower = query.toLowerCase();
  if (!lower.includes("vs") && !lower.includes("versus") && !lower.includes("compare"))
    return null;

  const parts = query.split(/\s+vs\s+|\s+versus\s+/i);
  if (parts.length < 2) return null;

  const leftTerm = parts[0].replace(/\bcompare\b/gi, "").trim();
  const rightTerm = parts[1].trim();
  const left = searchProducts(leftTerm, {}, studentMode)[0];
  const right = searchProducts(rightTerm, {}, studentMode)[0];
  if (!left || !right) return null;

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

  const picks = searchProducts("laptop student", {}, studentMode).slice(0, 1)
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

function waitOrBuyReply(product: NonNullable<ReturnType<typeof findMentionedProduct>>, studentMode: boolean): AiReply {
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
    productLinks: [{ name: product.name, href: `/product/${product.id}`, price: formatAud(best.breakdown.truePrice), store: best.offer.retailerName }],
  };
}

function recommendationReply(query: string, studentMode: boolean): AiReply {
  const budget = extractBudget(query);
  const category = detectCategory(query);
  const searchTerms = pickSearchTerms(query);

  const results = searchProducts(
    searchTerms || category?.toLowerCase() || "electronics",
    { maxPrice: budget, category: category === "Kmart" ? undefined : category, inStockOnly: true },
    studentMode
  );

  const kmartFilter = category === "Kmart" || query.toLowerCase().includes("kmart");
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

export function generateAiReply(query: string, studentMode: boolean): AiReply {
  const trimmed = query.trim();
  if (!trimmed) {
    return helpReply();
  }

  if (GREETINGS.test(trimmed)) {
    return trimmed.toLowerCase().includes("help") ? helpReply() : greetingReply();
  }

  const lower = trimmed.toLowerCase();
  if (lower.includes("student pack") || lower.includes("student survival") || lower.includes("new student")) {
    return studentPackReply(studentMode);
  }

  const compare = compareReply(trimmed, studentMode);
  if (compare) return compare;

  if (
    lower.includes("wait") ||
    lower.includes("buy now") ||
    lower.includes("should i") ||
    lower.includes("worth it")
  ) {
    const product = findMentionedProduct(trimmed);
    if (product) return waitOrBuyReply(product, studentMode);
  }

  return recommendationReply(trimmed, studentMode);
}

/** Legacy string format for tests */
export function generateAiResponse(query: string, studentMode: boolean): string {
  const reply = generateAiReply(query, studentMode);
  return `**${reply.summary}**\n\n${reply.body}`;
}

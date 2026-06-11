/**
 * PriceGenie AI catalog & engine sanity checks.
 * Run: npx tsx scripts/sanity-check.ts
 */
import { PRODUCTS } from "../src/data/products";
import { COUPONS } from "../src/data/coupons";
import { searchProducts, getCategories, getFeaturedProducts } from "../src/lib/search";
import { getBestOffer } from "../src/lib/pricing";
import { getWaitOrBuyAdvice } from "../src/lib/wait-or-buy";
import { generateAiResponse, generateAiReply } from "../src/lib/ai-advisor";
import { isGenericStoreUrl } from "../src/lib/retailer-urls";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`FAIL: ${message}`);
  }
}

console.log("PriceGenie AI — sanity check\n");

// Catalog size
assert(PRODUCTS.length >= 60, `Expected 60+ products, got ${PRODUCTS.length}`);
console.log(`✓ Catalog: ${PRODUCTS.length} products`);

// Unique IDs
const ids = PRODUCTS.map((p) => p.id);
assert(ids.length === new Set(ids).size, "Duplicate product IDs found");
console.log("✓ All product IDs unique");

// Every product has offers and valid pricing
for (const product of PRODUCTS) {
  assert(product.offers.length > 0, `${product.id} has no offers`);
  assert(product.priceHistory.length > 0, `${product.id} has no price history`);
  const best = getBestOffer(product.offers, false);
  assert(best !== null, `${product.id} has no in-stock offers`);
  if (best) {
    assert(best.breakdown.truePrice > 0, `${product.id} true price invalid`);
    assert(
      best.breakdown.truePrice <= best.breakdown.listPrice + best.breakdown.shipping,
      `${product.id} true price exceeds list + shipping`
    );
  }
  const studentBest = getBestOffer(product.offers, true);
  assert(studentBest !== null, `${product.id} student mode has no offers`);
  getWaitOrBuyAdvice(product, false);
  getWaitOrBuyAdvice(product, true);
  assert(Boolean(product.imageUrl), `${product.id} missing imageUrl`);
  for (const offer of product.offers) {
    assert(
      !isGenericStoreUrl(offer.url),
      `${product.id} @ ${offer.retailer} still uses a store homepage URL`
    );
    assert(
      offer.url.length > 30,
      `${product.id} @ ${offer.retailer} URL looks too short: ${offer.url}`
    );
  }
}
console.log("✓ All products pass pricing, URLs & wait-or-buy checks");

// Categories
const categories = getCategories();
assert(categories.length >= 8, `Expected 8+ categories, got ${categories.length}`);
console.log(`✓ Categories: ${categories.join(", ")}`);

// Search smoke tests
const searchTests = [
  "ps5",
  "playstation",
  "airpods",
  "monitor",
  "gaming laptop",
  "student calculator",
  "iphone",
  "tv",
  "printer",
  "sim",
  "kmart",
  "electronics",
  "webcam",
  "power bank",
];
for (const term of searchTests) {
  const results = searchProducts(term, {}, false);
  assert(results.length > 0, `Search "${term}" returned no results`);
}
console.log(`✓ Search: ${searchTests.length} common queries return results`);

// Featured products
const featured = getFeaturedProducts(true);
assert(featured.length === 4, "Featured should return 4 products");
console.log("✓ Featured products load");

// AI advisor
const aiReply = generateAiResponse("best gaming laptop under $1500", true);
assert(aiReply.length > 50, "AI advisor returned empty response");
const kmartAi = generateAiReply("kmart headphones under $30", true);
assert(Boolean(kmartAi.productLinks?.length), "Kmart AI query failed");
const compareAi = generateAiReply("compare airpods vs galaxy buds", true);
assert(compareAi.body.includes("Verdict"), "Compare AI response missing verdict");
console.log("✓ AI advisor responds (recommendations, Kmart, compare)");

// Coupons
assert(COUPONS.length >= 10, "Expected 10+ coupons");
assert(COUPONS.some((c) => c.retailer === "kmart"), "Missing Kmart coupons");
console.log(`✓ Coupons: ${COUPONS.length} codes`);

// Student budget search
const budgetResults = searchProducts("laptop", { maxPrice: 1000 }, true);
assert(budgetResults.length > 0, "Budget laptop search returned nothing");
console.log("✓ Student budget filter works");

console.log(`\n--- Results: ${passed} passed, ${failed} failed ---`);

if (failed > 0) {
  process.exit(1);
}

console.log("\nAll sanity checks passed.");

import type { Coupon, Product, StoreOffer } from "@/types";

export interface CouponRule {
  coupon: Coupon;
  type: "fixed" | "percent";
  amount: number;
  minOrder?: number;
  studentOnly?: boolean;
  categories?: string[];
  brands?: string[];
  tagAny?: string[];
  nameIncludes?: string[];
}

/** Machine-readable rules aligned with `src/data/coupons.ts` descriptions. */
export const COUPON_RULES: CouponRule[] = [
  {
    coupon: {
      id: "c1",
      code: "SAVE50",
      retailer: "the-good-guys",
      retailerName: "The Good Guys",
      discount: "$50 off",
      description: "$50 off orders over $500 on electronics",
      expiry: "2026-08-31",
      successRate: 87,
      studentOnly: false,
    },
    type: "fixed",
    amount: 50,
    minOrder: 500,
    categories: ["Electronics", "TVs", "Phones", "Laptops", "Gaming", "Audio", "Tablets", "Monitors", "Appliances"],
  },
  {
    coupon: {
      id: "c2",
      code: "EDU10",
      retailer: "jb-hifi",
      retailerName: "JB Hi-Fi",
      discount: "10% off",
      description: "Education discount on laptops and tablets",
      expiry: "2026-12-31",
      successRate: 92,
      studentOnly: true,
    },
    type: "percent",
    amount: 10,
    categories: ["Laptops", "Tablets"],
    studentOnly: true,
  },
  {
    coupon: {
      id: "c3",
      code: "GAMING100",
      retailer: "kogan",
      retailerName: "Kogan",
      discount: "$100 off",
      description: "$100 off gaming laptops over $1,800",
      expiry: "2026-07-15",
      successRate: 78,
      studentOnly: false,
    },
    type: "fixed",
    amount: 100,
    minOrder: 1800,
    categories: ["Laptops"],
    tagAny: ["gaming"],
  },
  {
    coupon: {
      id: "c4",
      code: "GALAXY50",
      retailer: "jb-hifi",
      retailerName: "JB Hi-Fi",
      discount: "$50 off",
      description: "$50 off Samsung Galaxy phones",
      expiry: "2026-09-30",
      successRate: 85,
      studentOnly: false,
    },
    type: "fixed",
    amount: 50,
    brands: ["Samsung"],
    nameIncludes: ["galaxy"],
    categories: ["Phones"],
  },
  {
    coupon: {
      id: "c5",
      code: "TV150",
      retailer: "the-good-guys",
      retailerName: "The Good Guys",
      discount: "$150 off",
      description: "$150 off OLED TVs over $2,000",
      expiry: "2026-08-31",
      successRate: 81,
      studentOnly: false,
    },
    type: "fixed",
    amount: 150,
    minOrder: 2000,
    categories: ["TVs"],
    tagAny: ["oled"],
  },
  {
    coupon: {
      id: "c5b",
      code: "TV150",
      retailer: "kogan",
      retailerName: "Kogan",
      discount: "$150 off",
      description: "$150 off OLED TVs over $2,000",
      expiry: "2026-08-31",
      successRate: 81,
      studentOnly: false,
    },
    type: "fixed",
    amount: 150,
    minOrder: 2000,
    categories: ["TVs"],
    tagAny: ["oled"],
  },
  {
    coupon: {
      id: "c6",
      code: "AUDIO20",
      retailer: "jb-hifi",
      retailerName: "JB Hi-Fi",
      discount: "$20 off",
      description: "$20 off headphones over $300",
      expiry: "2026-10-31",
      successRate: 90,
      studentOnly: false,
    },
    type: "fixed",
    amount: 20,
    minOrder: 300,
    categories: ["Audio"],
    tagAny: ["headphone", "earbuds", "airpods", "audio"],
  },
  {
    coupon: {
      id: "c8",
      code: "STUDENT15",
      retailer: "harvey-norman",
      retailerName: "Harvey Norman",
      discount: "15% off",
      description: "Student discount on selected tech",
      expiry: "2026-12-31",
      successRate: 88,
      studentOnly: true,
    },
    type: "percent",
    amount: 15,
    studentOnly: true,
  },
  {
    coupon: {
      id: "c9",
      code: "KMART20",
      retailer: "kmart",
      retailerName: "Kmart",
      discount: "$20 off",
      description: "$20 off electronics orders over $100 online",
      expiry: "2026-09-30",
      successRate: 82,
      studentOnly: false,
    },
    type: "fixed",
    amount: 20,
    minOrder: 100,
    categories: ["Electronics", "Audio", "TVs", "Tablets", "Gaming", "Appliances"],
  },
  {
    coupon: {
      id: "c10",
      code: "ANKO15",
      retailer: "kmart",
      retailerName: "Kmart",
      discount: "15% off Anko",
      description: "15% off Anko homewares and electronics",
      expiry: "2026-10-31",
      successRate: 79,
      studentOnly: false,
    },
    type: "percent",
    amount: 15,
    brands: ["Anko"],
  },
];

export interface ResolvedDiscounts {
  couponCode?: string;
  couponDiscount: number;
  studentDiscountPercent: number;
  appliedRules: string[];
}

function matchesRule(
  rule: CouponRule,
  offer: StoreOffer,
  product: Product,
  studentMode: boolean
): boolean {
  if (rule.coupon.retailer !== offer.retailer) return false;
  if (rule.studentOnly && !studentMode) return false;
  if (rule.coupon.studentOnly && !studentMode) return false;
  if (rule.minOrder !== undefined && offer.listPrice < rule.minOrder) return false;
  if (rule.categories && !rule.categories.includes(product.category)) return false;
  if (rule.brands && !rule.brands.some((b) => b.toLowerCase() === product.brand.toLowerCase())) {
    return false;
  }
  if (rule.tagAny) {
    const tags = product.tags.map((t) => t.toLowerCase());
    if (!rule.tagAny.some((t) => tags.some((tag) => tag.includes(t.toLowerCase())))) {
      return false;
    }
  }
  if (rule.nameIncludes) {
    const name = product.name.toLowerCase();
    if (!rule.nameIncludes.some((part) => name.includes(part.toLowerCase()))) return false;
  }
  return true;
}

function discountAmount(rule: CouponRule, listPrice: number): number {
  if (rule.type === "percent") {
    return Math.round(listPrice * (rule.amount / 100));
  }
  return rule.amount;
}

/** Pick the best eligible coupon for this store listing (fixed $ vs %). */
export function resolveDiscounts(
  offer: StoreOffer,
  product: Product,
  studentMode: boolean
): ResolvedDiscounts {
  let couponDiscount = 0;
  let couponCode: string | undefined;
  let studentDiscountPercent = 0;
  const appliedRules: string[] = [];

  for (const rule of COUPON_RULES) {
    if (!matchesRule(rule, offer, product, studentMode)) continue;

    if (rule.coupon.studentOnly || rule.studentOnly) {
      studentDiscountPercent = Math.max(studentDiscountPercent, rule.amount);
      appliedRules.push(rule.coupon.code);
      continue;
    }

    const amount = discountAmount(rule, offer.listPrice);
    if (amount > couponDiscount) {
      couponDiscount = amount;
      couponCode = rule.coupon.code;
      appliedRules.push(rule.coupon.code);
    }
  }

  // Apple education pricing at JB / Harvey Norman (not stackable with EDU10 % on same item)
  if (
    studentMode &&
    product.brand.toLowerCase() === "apple" &&
    (offer.retailer === "jb-hifi" || offer.retailer === "harvey-norman")
  ) {
    studentDiscountPercent = Math.max(studentDiscountPercent, 5);
    appliedRules.push("APPLE-EDU");
  }

  // Samsung education at JB when no GALAXY50 fixed coupon already applied
  if (
    studentMode &&
    product.brand.toLowerCase() === "samsung" &&
    offer.retailer === "jb-hifi" &&
    couponDiscount < 50
  ) {
    studentDiscountPercent = Math.max(studentDiscountPercent, 5);
    appliedRules.push("SAMSUNG-EDU");
  }

  couponDiscount = Math.min(couponDiscount, offer.listPrice);

  return {
    couponCode,
    couponDiscount,
    studentDiscountPercent,
    appliedRules,
  };
}

/** Strip legacy per-offer discount fields — rules are resolved at calculation time. */
export function stripLegacyDiscountFields(offer: StoreOffer): StoreOffer {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- omit legacy discount fields
  const { couponCode, couponDiscount, studentDiscountPercent, ...base } = offer;
  return base;
}

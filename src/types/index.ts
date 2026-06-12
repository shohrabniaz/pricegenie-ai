export type Retailer =
  | "jb-hifi"
  | "harvey-norman"
  | "the-good-guys"
  | "amazon-au"
  | "kogan"
  | "officeworks"
  | "big-w"
  | "ebay-au"
  | "kmart";

export interface StoreOffer {
  retailer: Retailer;
  retailerName: string;
  listPrice: number;
  shipping: number;
  inStock: boolean;
  url: string;
  couponCode?: string;
  couponDiscount?: number;
  cashbackPercent?: number;
  cashbackProvider?: "ShopBack" | "Cashrewards";
  studentDiscountPercent?: number;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  event?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  /** @deprecated Legacy emoji — use imageUrl */
  image: string;
  /** Populated at catalog load via enrichProduct */
  imageUrl?: string;
  description: string;
  specs: Record<string, string>;
  offers: StoreOffer[];
  priceHistory: PriceHistoryPoint[];
  lowestEver: number;
  tags: string[];
}

export interface Coupon {
  id: string;
  code: string;
  retailer: Retailer;
  retailerName: string;
  discount: string;
  description: string;
  expiry: string;
  successRate: number;
  studentOnly: boolean;
}

export interface StudentDiscount {
  id: string;
  brand: string;
  title: string;
  discount: string;
  description: string;
  url: string;
  verification: "UNiDAYS" | "Student Beans" | "Edu email" | "ID card";
}

export interface TruePriceBreakdown {
  /** Price on retailer site before any codes (AUD). */
  listPrice: number;
  couponSavings: number;
  cashbackSavings: number;
  studentSavings: number;
  shipping: number;
  /** Total at retailer checkout after codes + shipping, before cashback. */
  checkoutPrice: number;
  /** Effective cost after cashback (if any). */
  truePrice: number;
  couponCode?: string;
  studentDiscountPercent?: number;
}

export interface PriceAlert {
  id: string;
  productId: string;
  productName: string;
  targetPrice: number;
  createdAt: string;
}

export interface AiMessage {
  role: "user" | "assistant";
  content: string;
}

export interface SearchFilters {
  maxPrice?: number;
  inStockOnly?: boolean;
  category?: string;
}

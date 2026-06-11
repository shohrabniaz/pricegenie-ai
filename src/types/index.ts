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
  image: string;
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
  listPrice: number;
  couponSavings: number;
  cashbackSavings: number;
  studentSavings: number;
  shipping: number;
  truePrice: number;
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

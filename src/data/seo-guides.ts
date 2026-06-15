import { APP_NAME } from "@/lib/brand";

export interface SeoGuide {
  slug: string;
  title: string;
  description: string;
  searchQuery: string;
  maxPrice?: number;
  category?: string;
  intro: string;
  tips: string[];
}

export const SEO_GUIDES: SeoGuide[] = [
  {
    slug: "best-laptops-under-1000-australia",
    title: "Best Laptops Under $1,000 in Australia (2026)",
    description:
      "Compare the best laptops under $1,000 AUD from JB Hi-Fi, Amazon AU, Harvey Norman and more. True prices with coupons and student discounts.",
    searchQuery: "laptop",
    maxPrice: 1000,
    category: "Laptops",
    intro:
      `You do not need to spend $2,000 for a solid everyday laptop in Australia. These picks balance performance, battery life, and value — with store prices verified and deals calculated by ${APP_NAME}.`,
    tips: [
      "Check Student Mode if you have a .edu.au email — education pricing can drop checkout by 10% or more.",
      "Amazon AU and eBay AU often beat in-store sales; compare shipping before you buy.",
      "Wait for EOFY (June) or Black Friday if your current laptop still works — laptops see the steepest drops then.",
    ],
  },
  {
    slug: "best-student-laptop-australia",
    title: "Best Student Laptops in Australia (2026)",
    description:
      "Top student laptops for uni and TAFE in Australia. Education discounts, lightweight options, and true lowest price across AU retailers.",
    searchQuery: "student laptop",
    category: "Laptops",
    intro:
      "For lectures, essays, and light creative work, these laptops offer the best value for Australian students — with EDU discounts and cashback included where available.",
    tips: [
      `Turn on Student Mode in ${APP_NAME} to auto-apply education pricing.`,
      "A 13–14\" screen and 8GB+ RAM is the sweet spot for most degrees.",
      "Officeworks and JB Hi-Fi run back-to-uni promos in January — set a price alert if you can wait.",
    ],
  },
  {
    slug: "best-gaming-monitor-2026",
    title: "Best Gaming Monitors in Australia (2026)",
    description:
      "144Hz and ultrawide gaming monitors compared across Australian retailers. Real store prices, coupons, and cashback.",
    searchQuery: "gaming monitor",
    category: "Monitors",
    intro:
      "Whether you want 1440p 144Hz or a budget 1080p panel, these monitors offer strong value in the AU market right now.",
    tips: [
      "Match refresh rate to your GPU — 1080p 144Hz is easier to drive than 4K.",
      "The Good Guys and JB Hi-Fi bundle monitor + desk deals around sales events.",
      `Check coupon codes on ${APP_NAME} before checkout — GAMING100-style promos appear seasonally.`,
    ],
  },
  {
    slug: "cheapest-iphone-australia-2026",
    title: "Cheapest iPhone in Australia (2026)",
    description:
      "Compare iPhone 17, iPhone 16 and Pro models across JB Hi-Fi, Amazon AU, Harvey Norman and more. True prices with coupons and cashback.",
    searchQuery: "iphone",
    category: "Phones",
    intro:
      `iPhone prices move every sale season in Australia. These are the best current deals on Apple phones — with store prices checked and true checkout cost calculated in ${APP_NAME}.`,
    tips: [
      "Trade-in promos at Apple and carriers can beat retailer sales — compare total cost, not headline price.",
      "Amazon AU often has the lowest list price; JB Hi-Fi and The Good Guys run bundle deals.",
      "Use Wait or Buy on the product page if you're not in a rush — EOFY and Black Friday usually drop prices.",
    ],
  },
  {
    slug: "best-ps5-deals-australia",
    title: "Best PS5 Deals in Australia (2026)",
    description:
      "PlayStation 5 Slim and Digital Edition prices compared across Australian retailers. Coupons, cashback and true lowest price.",
    searchQuery: "playstation ps5",
    category: "Gaming",
    intro:
      "The PS5 Slim has settled into regular discount cycles in Australia. Here's where to buy today — and what you'll actually pay after promos.",
    tips: [
      "Digital Edition is often $50–100 cheaper if you do not need a disc drive.",
      "The Good Guys and Harvey Norman run gaming bundle deals around school holidays.",
      `Set a price alert in ${APP_NAME} if you're waiting for a sub-$550 digital deal.`,
    ],
  },
  {
    slug: "student-essentials-australia",
    title: "Student Essentials Australia — Laptops, Audio & More (2026)",
    description:
      "Back-to-uni shopping guide: laptops, headphones, monitors and dorm essentials with student discounts across AU retailers.",
    searchQuery: "student",
    category: "Student Essentials",
    intro:
      "Starting uni or TAFE? These essentials cover lectures, shared housing, and late-night study — with Student Mode pricing where available.",
    tips: [
      `Enable Student Mode in ${APP_NAME} before comparing — education pricing is not always shown on retailer sites.`,
      "Prioritise laptop + headphones first; monitor and printer can wait until week two.",
      "Kmart and Big W are strong for budget dorm gear; compare True Price before checkout.",
    ],
  },
];

export function getSeoGuide(slug: string): SeoGuide | undefined {
  return SEO_GUIDES.find((g) => g.slug === slug);
}

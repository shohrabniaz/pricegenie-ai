import type { Product } from "@/types";

/** High-res favicon from retailer / brand domain (Clearbit logo API is discontinued). */
function brandLogo(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

/** Product-specific photos (Unsplash / Wikimedia). */
const PRODUCT_IMAGES: Record<string, string> = {
  "iphone-17-pro-256":
    "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=480&h=480&fit=crop",
  "macbook-air-m4":
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=480&h=480&fit=crop",
  "asus-rog-g16":
    "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=480&h=480&fit=crop",
  "samsung-s25-ultra":
    "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=480&h=480&fit=crop",
  "sony-wh1000xm6":
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=480&h=480&fit=crop",
  "lg-65-c4-oled":
    "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=480&h=480&fit=crop",
  "dell-xps-15":
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=480&h=480&fit=crop",
  "ipad-air-m3":
    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=480&h=480&fit=crop",
  "ps5-slim":
    "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=480&h=480&fit=crop",
  "xbox-series-x":
    "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=480&h=480&fit=crop",
  "nintendo-switch-oled":
    "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=480&h=480&fit=crop",
  "airpods-pro-3":
    "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=480&h=480&fit=crop",
  "kmart-anko-bluetooth-speaker":
    "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=480&h=480&fit=crop",
  "kmart-wireless-earbuds":
    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=480&h=480&fit=crop",
};

const BRAND_DOMAINS: Record<string, string> = {
  Apple: "apple.com",
  Samsung: "samsung.com",
  Sony: "sony.com",
  LG: "lg.com",
  Dell: "dell.com",
  ASUS: "asus.com",
  HP: "hp.com",
  Lenovo: "lenovo.com",
  Microsoft: "microsoft.com",
  Nintendo: "nintendo.com",
  Google: "google.com",
  Kmart: "kmart.com.au",
  Anko: "kmart.com.au",
  Logitech: "logitech.com",
  Bose: "bose.com",
  JBL: "jbl.com",
  Canon: "canon.com",
  GoPro: "gopro.com",
  Dyson: "dyson.com",
  Breville: "breville.com",
  Meta: "meta.com",
  Valve: "valvesoftware.com",
  Amazon: "amazon.com.au",
  Anker: "anker.com",
  Razer: "razer.com",
  Corsair: "corsair.com",
  "TP-Link": "tp-link.com",
  TCL: "tcl.com",
  Ninja: "ninjakitchen.com",
  Bosch: "bosch.com",
  Philips: "philips.com",
  Ring: "ring.com",
  DJI: "dji.com",
  Fitbit: "fitbit.com",
  "Oral-B": "oralb.com",
  Belong: "belong.com.au",
  Epson: "epson.com",
  "Western Digital": "westerndigital.com",
  Blue: "bluemic.com",
  Elgato: "elgato.com",
  Neewer: "neewer.com",
  SanDisk: "sandisk.com",
  Xiaomi: "mi.com",
  AOC: "aoc.com",
  MSI: "msi.com",
};

const CATEGORY_IMAGES: Record<string, string> = {
  Phones:
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=480&h=480&fit=crop",
  Laptops:
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=480&h=480&fit=crop",
  TVs: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=480&h=480&fit=crop",
  Audio:
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=480&h=480&fit=crop",
  Gaming:
    "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=480&h=480&fit=crop",
  Monitors:
    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=480&h=480&fit=crop",
  Tablets:
    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=480&h=480&fit=crop",
  Wearables:
    "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=480&h=480&fit=crop",
  Cameras:
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=480&h=480&fit=crop",
  Storage:
    "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=480&h=480&fit=crop",
  Accessories:
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=480&h=480&fit=crop",
  Printers:
    "https://images.unsplash.com/photo-1612815159322-7a0c0c4c8e3e?w=480&h=480&fit=crop",
  Appliances:
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=480&h=480&fit=crop",
  Electronics:
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=480&h=480&fit=crop",
  "Smart Home":
    "https://images.unsplash.com/photo-1558002038-1055907df827?w=480&h=480&fit=crop",
  Health:
    "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=480&h=480&fit=crop",
  "Student Essentials":
    "https://images.unsplash.com/photo-1434030214721-735e8da981bd?w=480&h=480&fit=crop",
};

export function getProductImageUrl(
  product: Pick<Product, "id" | "brand" | "category">
): string {
  if (PRODUCT_IMAGES[product.id]) return PRODUCT_IMAGES[product.id];
  const domain = BRAND_DOMAINS[product.brand];
  if (domain) return brandLogo(domain);
  return (
    CATEGORY_IMAGES[product.category] ??
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=480&h=480&fit=crop"
  );
}

export function enrichProductImage<T extends Product>(product: T): T & { imageUrl: string } {
  return { ...product, imageUrl: getProductImageUrl(product) };
}

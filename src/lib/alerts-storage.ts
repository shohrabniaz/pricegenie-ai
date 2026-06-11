import type { PriceAlert } from "@/types";

const STORAGE_KEY = "pricemate-price-alerts";

export function getAlerts(): PriceAlert[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PriceAlert[]) : [];
  } catch {
    return [];
  }
}

export function saveAlert(alert: PriceAlert): void {
  const alerts = getAlerts();
  alerts.push(alert);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
}

export function removeAlert(id: string): void {
  const alerts = getAlerts().filter((a) => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
}

export function hasAlert(productId: string): boolean {
  return getAlerts().some((a) => a.productId === productId);
}

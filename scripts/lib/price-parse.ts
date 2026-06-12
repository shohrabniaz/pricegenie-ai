/** Parse first AUD dollar amount from visible text (no cents rounding up). */
export function parseAudPrice(text: string): number | null {
  const normalized = text.replace(/\u00a0/g, " ");
  const match = normalized.match(/\$\s*([\d,]+(?:\.\d{2})?)/);
  if (!match) return null;
  const value = Math.round(parseFloat(match[1].replace(/,/g, "")));
  return value > 0 && value < 100_000 ? value : null;
}

/** Reject scraped prices that look like garbage vs catalog anchor. */
export function isPlausiblePrice(
  scraped: number,
  catalogPrice: number,
  tolerance = 0.45
): boolean {
  const min = Math.round(catalogPrice * (1 - tolerance));
  const max = Math.round(catalogPrice * (1 + tolerance));
  return scraped >= min && scraped <= max;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

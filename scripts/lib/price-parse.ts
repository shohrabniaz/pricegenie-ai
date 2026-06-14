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
  tolerance?: { below?: number; above?: number }
): boolean {
  const below = tolerance?.below ?? 0.25;
  const above = tolerance?.above ?? 0.15;
  const min = Math.round(catalogPrice * (1 - below));
  const max = Math.round(catalogPrice * (1 + above));
  return scraped >= min && scraped <= max;
}

/** Pick scraped price closest to catalog when multiple search hits exist. */
export function pickBestScrapedPrice(
  candidates: number[],
  catalogPrice: number
): number | null {
  const plausible = candidates.filter((p) => isPlausiblePrice(p, catalogPrice));
  if (plausible.length === 0) return null;
  return plausible.sort(
    (a, b) => Math.abs(a - catalogPrice) - Math.abs(b - catalogPrice)
  )[0];
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

import type { PriceHistoryPoint } from "@/types";
import historyJson from "./price-history-log.json";

/** Daily-appended best store prices from automated scrapes. */
export const PRICE_HISTORY_LOG = historyJson as Record<
  string,
  PriceHistoryPoint[]
>;

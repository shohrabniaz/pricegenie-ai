"use client";

import type { Product } from "@/types";
import { formatAud } from "@/lib/pricing";

interface PriceHistoryChartProps {
  product: Product;
}

export function PriceHistoryChart({ product }: PriceHistoryChartProps) {
  const history = product.priceHistory;
  if (history.length === 0) return null;

  const prices = history.map((h) => h.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h3 className="text-sm font-semibold text-white">Price History</h3>
      <p className="mt-1 text-xs text-slate-500">
        Lowest ever: {formatAud(product.lowestEver)}
      </p>

      <div className="mt-6 flex items-end justify-between gap-2 h-32">
        {history.map((point) => {
          const height = ((point.price - min) / range) * 80 + 20;
          const isLowest = point.price === min;
          return (
            <div
              key={point.date}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <span className="text-[10px] font-medium text-slate-400">
                {formatAud(point.price)}
              </span>
              <div
                className={`w-full max-w-[48px] rounded-t-lg transition-all ${
                  isLowest
                    ? "bg-gradient-to-t from-teal-600 to-teal-400"
                    : "bg-white/15"
                }`}
                style={{ height: `${height}%` }}
              />
              <span className="text-[9px] text-slate-600">
                {new Date(point.date).toLocaleDateString("en-AU", {
                  month: "short",
                  year: "2-digit",
                })}
              </span>
              {point.event && (
                <span className="text-[8px] font-medium text-amber-400">
                  {point.event}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

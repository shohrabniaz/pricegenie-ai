import { Clock } from "lucide-react";
import type { PriceSource } from "@/lib/price-feed";
import { formatPriceAge, formatPriceDate } from "@/lib/format-date";

interface PriceUpdatedBadgeProps {
  updatedAt: string;
  source?: PriceSource;
  liveOfferCount?: number;
  className?: string;
}

export function PriceUpdatedBadge({
  updatedAt,
  source = "catalog",
  liveOfferCount = 0,
  className = "",
}: PriceUpdatedBadgeProps) {
  const live = source === "live" || (source === "snapshot" && liveOfferCount > 0);

  return (
    <p
      className={`flex items-center gap-1.5 text-xs text-slate-500 ${className}`}
      data-testid="price-updated-badge"
    >
      <Clock className="h-3.5 w-3.5 shrink-0" />
      <span>
        Store prices updated {formatPriceDate(updatedAt)}
        <span className="text-slate-600"> · {formatPriceAge(updatedAt)}</span>
        {live && (
          <span className="ml-1 rounded bg-teal-500/15 px-1.5 py-0.5 text-[10px] font-medium text-teal-400">
            {liveOfferCount > 0 ? `${liveOfferCount} live` : "live feed"}
          </span>
        )}
      </span>
    </p>
  );
}

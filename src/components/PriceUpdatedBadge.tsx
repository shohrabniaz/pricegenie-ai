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
  const verifiedLabel =
    source === "snapshot" && liveOfferCount > 0
      ? `${liveOfferCount} stores verified`
      : source === "live"
        ? "live feed"
        : null;

  return (
    <p
      className={`flex items-center gap-1.5 text-xs text-slate-500 ${className}`}
      data-testid="price-updated-badge"
    >
      <Clock className="h-3.5 w-3.5 shrink-0" />
      <span>
        Store prices updated {formatPriceDate(updatedAt)}
        <span className="text-slate-600"> · {formatPriceAge(updatedAt)}</span>
        {verifiedLabel && (
          <span className="ml-1 rounded bg-teal-500/15 px-1.5 py-0.5 text-[10px] font-medium text-teal-400">
            {verifiedLabel}
          </span>
        )}
      </span>
    </p>
  );
}

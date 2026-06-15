import type { PriceFreshness } from "@/lib/price-freshness";
import { FRESHNESS_LABELS } from "@/lib/price-freshness";

const STYLES: Record<PriceFreshness, string> = {
  live: "bg-teal-500/15 text-teal-300 border-teal-500/25",
  recent: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  stale: "bg-amber-500/10 text-amber-300 border-amber-500/25",
  estimate: "bg-slate-500/10 text-slate-400 border-white/10",
};

interface PriceFreshnessBadgeProps {
  freshness: PriceFreshness;
  className?: string;
}

export function PriceFreshnessBadge({
  freshness,
  className = "",
}: PriceFreshnessBadgeProps) {
  return (
    <span
      data-testid={`price-freshness-${freshness}`}
      className={`inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${STYLES[freshness]} ${className}`}
    >
      {FRESHNESS_LABELS[freshness]}
    </span>
  );
}

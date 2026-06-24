import { Info } from "lucide-react";
import { APP_NAME } from "@/lib/brand";

interface PriceEstimateBannerProps {
  verifiedCount?: number;
  totalOffers?: number;
  variant?: "default" | "compact";
  className?: string;
}

export function PriceEstimateBanner({
  verifiedCount = 0,
  totalOffers,
  variant = "default",
  className = "",
}: PriceEstimateBannerProps) {
  const allVerified =
    totalOffers !== undefined &&
    totalOffers > 0 &&
    verifiedCount >= totalOffers;

  if (allVerified) {
    return (
      <p
        className={`flex items-start gap-2 rounded-xl border border-teal-500/25 bg-teal-500/10 px-3 py-2 text-xs text-teal-200 ${className}`}
        data-testid="price-estimate-banner"
      >
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Store prices verified by {APP_NAME}&apos;s daily refresh.
      </p>
    );
  }

  const message =
    verifiedCount > 0
      ? `${verifiedCount} of ${totalOffers ?? "some"} store prices verified today. Others are catalog estimates — paste a product URL on Analyze for a live check.`
      : `Prices shown are catalog estimates until verified by our daily refresh. For the most accurate price, paste the retailer link on Analyze.`;

  if (variant === "compact") {
    return (
      <p
        className={`text-[11px] leading-relaxed text-slate-500 ${className}`}
        data-testid="price-estimate-banner"
      >
        {message}
      </p>
    );
  }

  return (
    <p
      className={`flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-100/90 ${className}`}
      data-testid="price-estimate-banner"
    >
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />
      {message}
    </p>
  );
}

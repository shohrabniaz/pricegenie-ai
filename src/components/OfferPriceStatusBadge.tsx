import type { OfferPriceStatus } from "@/lib/offer-price-status";

const STYLES: Record<OfferPriceStatus, string> = {
  verified: "bg-teal-500/15 text-teal-400",
  estimate: "bg-amber-500/10 text-amber-300",
};

const LABELS: Record<OfferPriceStatus, string> = {
  verified: "Verified",
  estimate: "Estimate",
};

interface OfferPriceStatusBadgeProps {
  status: OfferPriceStatus;
  className?: string;
}

export function OfferPriceStatusBadge({
  status,
  className = "",
}: OfferPriceStatusBadgeProps) {
  return (
    <span
      data-testid={`offer-price-${status}`}
      title={
        status === "verified"
          ? "Price verified by daily scrape"
          : "Catalog estimate — confirm on retailer site"
      }
      className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${STYLES[status]} ${className}`}
    >
      {LABELS[status]}
    </span>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import type { Product } from "@/types";
import { useStudentMode } from "@/context/StudentModeContext";
import { formatPriceDate } from "@/lib/format-date";
import { applyPriceSnapshots } from "@/lib/price-feed";
import { formatAud, getBestOffer, hasActiveDeals } from "@/lib/pricing";
import { ProductImage } from "@/components/ProductImage";
import { PriceFreshnessBadge } from "@/components/PriceFreshnessBadge";
import { getPriceFreshness } from "@/lib/price-freshness";
import { countVerifiedOffers } from "@/lib/offer-price-status";
import { OfferPriceStatusBadge } from "@/components/OfferPriceStatusBadge";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { studentMode } = useStudentMode();
  const { pricesUpdatedAt, source } = applyPriceSnapshots(product);
  const freshness = getPriceFreshness(pricesUpdatedAt, source);
  const best = getBestOffer(product.offers, studentMode, product);
  const verifiedCount = countVerifiedOffers(
    product.id,
    product.offers.map((o) => o.retailer)
  );

  if (!best) return null;

  const deals = hasActiveDeals(best.breakdown, studentMode);
  const savings = best.breakdown.listPrice - best.breakdown.truePrice;

  return (
    <Link
      href={`/product/${product.id}`}
      data-testid={`product-card-${product.id}`}
      className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-teal-500/30 hover:bg-white/[0.06]"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <ProductImage product={product} size="card" />
        {deals && savings > 0 && (
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">
            Save {formatAud(savings)}
          </span>
        )}
      </div>

      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {product.brand} · {product.category}
      </p>
      <h3 className="mt-1 font-semibold text-white group-hover:text-teal-300">
        {product.name}
      </h3>

      <div className="mt-auto pt-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-slate-500">Store price at {best.offer.retailerName}</p>
            <p className="text-2xl font-bold text-white">
              {formatAud(best.breakdown.listPrice)}
            </p>
            {deals && best.breakdown.truePrice < best.breakdown.checkoutPrice && (
              <p className="text-xs text-purple-300">
                {formatAud(best.breakdown.truePrice)} after cashback
              </p>
            )}
            {deals && best.breakdown.checkoutPrice < best.breakdown.listPrice + best.breakdown.shipping && (
              <p className="text-xs text-teal-400">
                {formatAud(best.breakdown.checkoutPrice)} with deals at checkout
              </p>
            )}
            {pricesUpdatedAt && (
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <OfferPriceStatusBadge
                  status={verifiedCount > 0 ? "verified" : "estimate"}
                />
                <p className="text-[10px] text-slate-600">
                  {verifiedCount > 0
                    ? `${verifiedCount} store${verifiedCount === 1 ? "" : "s"} verified`
                    : `As of ${formatPriceDate(pricesUpdatedAt)}`}
                </p>
                {verifiedCount > 0 && (
                  <PriceFreshnessBadge freshness={freshness} />
                )}
              </div>
            )}
          </div>
          <ArrowRight className="h-5 w-5 text-slate-600 transition group-hover:translate-x-1 group-hover:text-teal-400" />
        </div>

        {deals && (
          <div className="mt-2 flex flex-wrap gap-1">
            {best.breakdown.couponSavings > 0 && best.breakdown.couponCode && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                <Tag className="h-3 w-3" />
                Code {best.breakdown.couponCode}
              </span>
            )}
            {best.breakdown.cashbackSavings > 0 && (
              <span className="rounded-md bg-purple-500/15 px-2 py-0.5 text-[10px] font-medium text-purple-300">
                Cashback est.
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

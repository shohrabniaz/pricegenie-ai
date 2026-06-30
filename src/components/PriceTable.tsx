"use client";

import { ExternalLink } from "lucide-react";
import type { Product, Retailer, StoreOffer } from "@/types";
import { useStudentMode } from "@/context/StudentModeContext";
import { withAffiliateLink } from "@/lib/affiliate";
import { getOfferLinkKind } from "@/lib/retailer-urls";
import { getOfferPriceStatus } from "@/lib/offer-price-status";
import { OfferPriceStatusBadge } from "@/components/OfferPriceStatusBadge";
import { formatAud, rankOffers } from "@/lib/pricing";
import type { TruePriceBreakdown } from "@/types";
import { RETAILER_COLORS } from "@/data/retailers";
import { getProductById } from "@/data/products";

interface PriceTableProps {
  product: Product;
  runtimeVerifiedRetailers?: readonly Retailer[];
}

function StoreLinkButton({
  offer,
  productName,
}: {
  offer: StoreOffer;
  productName: string;
}) {
  const linkKind = getOfferLinkKind(offer.retailer, offer.url);
  if (linkKind === "none") return null;

  const label =
    linkKind === "pdp"
      ? "View product"
      : `Find on ${offer.retailerName}`;

  return (
    <a
      href={withAffiliateLink(offer.url)}
      data-testid="view-product-link"
      data-link-kind={linkKind}
      target="_blank"
      rel="noopener noreferrer"
      title={`${label}: ${productName} at ${offer.retailerName}`}
      className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
    >
      {label}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

function OfferBadges({
  offer,
  index,
  productId,
  catalogListPrice,
  runtimeVerifiedRetailers,
}: {
  offer: StoreOffer;
  index: number;
  productId: string;
  catalogListPrice?: number;
  runtimeVerifiedRetailers?: readonly Retailer[];
}) {
  const priceStatus = getOfferPriceStatus(
    productId,
    offer.retailer,
    catalogListPrice,
    runtimeVerifiedRetailers
  );
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ background: RETAILER_COLORS[offer.retailer] }}
      />
      <span className="font-medium text-white">{offer.retailerName}</span>
      <OfferPriceStatusBadge status={priceStatus} />
      {index === 0 && (
        <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-[10px] font-bold text-teal-300">
          BEST
        </span>
      )}
    </div>
  );
}

function DealsList({ breakdown }: { breakdown: TruePriceBreakdown }) {
  return (
    <div className="flex flex-col gap-0.5 text-xs">
      {breakdown.couponSavings > 0 && (
        <span className="text-amber-400">
          -{formatAud(breakdown.couponSavings)} coupon
        </span>
      )}
      {breakdown.studentSavings > 0 && (
        <span className="text-blue-400">
          -{formatAud(breakdown.studentSavings)} student
        </span>
      )}
      {breakdown.cashbackSavings > 0 && (
        <span className="text-purple-400">
          -{formatAud(breakdown.cashbackSavings)} cashback
        </span>
      )}
      {breakdown.shipping > 0 && (
        <span className="text-slate-500">
          +{formatAud(breakdown.shipping)} shipping
        </span>
      )}
      {breakdown.couponSavings === 0 &&
        breakdown.studentSavings === 0 &&
        breakdown.cashbackSavings === 0 &&
        breakdown.shipping === 0 && <span className="text-slate-600">—</span>}
    </div>
  );
}

export function PriceTable({
  product,
  runtimeVerifiedRetailers,
}: PriceTableProps) {
  const { studentMode } = useStudentMode();
  const ranked = rankOffers(product.offers, studentMode, product);
  const catalogOffers = getProductById(product.id)?.offers;

  return (
    <div data-testid="price-table" className="min-w-0">
      {/* Mobile: stacked cards */}
      <div className="space-y-3 md:hidden">
        {ranked.map(({ offer, breakdown }, i) => (
          <div
            key={offer.retailer}
            className={`rounded-2xl border border-white/10 bg-white/[0.03] p-4 ${
              i === 0 ? "border-teal-500/30 bg-teal-500/5" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <OfferBadges
                offer={offer}
                index={i}
                productId={product.id}
                catalogListPrice={catalogOffers?.find(
                  (o) => o.retailer === offer.retailer
                )?.listPrice}
                runtimeVerifiedRetailers={runtimeVerifiedRetailers}
              />
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  offer.inStock
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {offer.inStock ? "In stock" : "Out"}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-500">
                  Store price
                </p>
                <p className="font-medium text-slate-300">
                  {formatAud(breakdown.listPrice)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-500">
                  Checkout
                </p>
                <p
                  className={`text-lg font-bold ${i === 0 ? "text-teal-300" : "text-white"}`}
                >
                  {formatAud(breakdown.checkoutPrice)}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <DealsList breakdown={breakdown} />
            </div>

            <div className="mt-4">
              <StoreLinkButton offer={offer} productName={product.name} />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-2xl border border-white/10 md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Store</th>
              <th className="px-4 py-3">Store price</th>
              <th className="px-4 py-3">Deals</th>
              <th className="px-4 py-3">Checkout</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {ranked.map(({ offer, breakdown }, i) => (
              <tr
                key={offer.retailer}
                className={`border-b border-white/5 transition hover:bg-white/[0.03] ${
                  i === 0 ? "bg-teal-500/5" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <OfferBadges
                    offer={offer}
                    index={i}
                    productId={product.id}
                    catalogListPrice={catalogOffers?.find(
                      (o) => o.retailer === offer.retailer
                    )?.listPrice}
                    runtimeVerifiedRetailers={runtimeVerifiedRetailers}
                  />
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {formatAud(breakdown.listPrice)}
                </td>
                <td className="px-4 py-3">
                  <DealsList breakdown={breakdown} />
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-lg font-bold ${i === 0 ? "text-teal-300" : "text-white"}`}
                  >
                    {formatAud(breakdown.checkoutPrice)}
                  </span>
                  {breakdown.cashbackSavings > 0 && (
                    <p className="text-[10px] text-purple-400">
                      {formatAud(breakdown.truePrice)} after cashback
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      offer.inStock
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {offer.inStock ? "In stock" : "Out"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StoreLinkButton offer={offer} productName={product.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

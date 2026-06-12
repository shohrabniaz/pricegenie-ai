"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getProductById } from "@/data/products";
import { PriceTable } from "@/components/PriceTable";
import { WaitOrBuyCard } from "@/components/WaitOrBuyCard";
import { PriceHistoryChart } from "@/components/PriceHistoryChart";
import { PriceAlertButton } from "@/components/PriceAlertButton";
import { ProductImage } from "@/components/ProductImage";
import { TruePriceExplainer } from "@/components/TruePriceExplainer";
import { OfferBreakdownList } from "@/components/OfferBreakdownList";
import { useStudentMode } from "@/context/StudentModeContext";
import { formatAud, getBestOffer, getTotalSavings } from "@/lib/pricing";

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const product = getProductById(id);
  const { studentMode } = useStudentMode();

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-lg text-slate-400">Product not found</p>
        <Link href="/search" className="mt-4 inline-block text-teal-400">
          Back to search
        </Link>
      </div>
    );
  }

  const best = getBestOffer(product.offers, studentMode, product);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        href="/search"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to search
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <ProductImage product={product} size="detail" className="mx-auto" />
            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">
              {product.brand} · {product.category}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-white">
              {product.name}
            </h1>
            <p className="mt-3 text-sm text-slate-400">{product.description}</p>

            {best && (
              <div className="mt-6 rounded-xl border border-teal-500/30 bg-teal-500/10 p-4">
                <p className="text-xs text-teal-400">Store price at {best.offer.retailerName}</p>
                <p className="text-3xl font-bold text-white">
                  {formatAud(best.breakdown.listPrice)}
                </p>
                {best.breakdown.checkoutPrice < best.breakdown.listPrice + best.breakdown.shipping && (
                  <p className="mt-2 text-sm text-teal-300">
                    {formatAud(best.breakdown.checkoutPrice)} at checkout with deals
                  </p>
                )}
                {best.breakdown.cashbackSavings > 0 && (
                  <p className="text-sm text-purple-300">
                    {formatAud(best.breakdown.truePrice)} effective after cashback
                  </p>
                )}
                {getTotalSavings(best.breakdown) > 0 && (
                  <p className="mt-1 text-xs font-medium text-emerald-400">
                    Up to {formatAud(getTotalSavings(best.breakdown))} total savings
                  </p>
                )}
              </div>
            )}

            <dl className="mt-6 space-y-2">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <dt className="text-slate-500">{key}</dt>
                  <dd className="font-medium text-white">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6">
              <PriceAlertButton
                key={`${product.id}-${studentMode}`}
                product={product}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          {best && (
            <TruePriceExplainer
              offer={best.offer}
              product={product}
              highlight
            />
          )}

          <div>
            <h2 className="mb-4 text-lg font-bold text-white">
              Compare all stores
            </h2>
            <PriceTable product={product} />
          </div>

          <OfferBreakdownList product={product} />
          <WaitOrBuyCard product={product} />
          <PriceHistoryChart product={product} />
        </div>
      </div>
    </div>
  );
}

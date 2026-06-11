"use client";

import { ExternalLink } from "lucide-react";
import type { Product } from "@/types";
import { useStudentMode } from "@/context/StudentModeContext";
import { formatAud, rankOffers } from "@/lib/pricing";
import { RETAILER_COLORS } from "@/data/retailers";

interface PriceTableProps {
  product: Product;
}

export function PriceTable({ product }: PriceTableProps) {
  const { studentMode } = useStudentMode();
  const ranked = rankOffers(product.offers, studentMode);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Store</th>
            <th className="px-4 py-3">List</th>
            <th className="px-4 py-3 hidden sm:table-cell">Savings</th>
            <th className="px-4 py-3">True Price</th>
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
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: RETAILER_COLORS[offer.retailer] }}
                  />
                  <span className="font-medium text-white">
                    {offer.retailerName}
                  </span>
                  {i === 0 && (
                    <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-[10px] font-bold text-teal-300">
                      BEST
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-slate-400">
                {formatAud(breakdown.listPrice)}
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
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
                    breakdown.shipping === 0 && (
                      <span className="text-slate-600">—</span>
                    )}
                </div>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`text-lg font-bold ${i === 0 ? "text-teal-300" : "text-white"}`}
                >
                  {formatAud(breakdown.truePrice)}
                </span>
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
                <a
                  href={offer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`View ${product.name} at ${offer.retailerName}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
                >
                  View product
                  <ExternalLink className="h-3 w-3" />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

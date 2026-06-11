"use client";

import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import type { Product } from "@/types";
import { useStudentMode } from "@/context/StudentModeContext";
import { formatAud, getBestOffer } from "@/lib/pricing";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { studentMode } = useStudentMode();
  const best = getBestOffer(product.offers, studentMode);

  if (!best) return null;

  const savings = best.breakdown.listPrice - best.breakdown.truePrice;

  return (
    <Link
      href={`/product/${product.id}`}
      data-testid={`product-card-${product.id}`}
      className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-teal-500/30 hover:bg-white/[0.06]"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="text-4xl">{product.image}</span>
        {savings > 0 && (
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
            <p className="text-xs text-slate-500">True price from</p>
            <p className="text-2xl font-bold text-white">
              {formatAud(best.breakdown.truePrice)}
            </p>
            <p className="text-xs text-slate-500">{best.offer.retailerName}</p>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-600 transition group-hover:translate-x-1 group-hover:text-teal-400" />
        </div>

        {(best.breakdown.couponSavings > 0 || best.breakdown.cashbackSavings > 0) && (
          <div className="mt-2 flex flex-wrap gap-1">
            {best.breakdown.couponSavings > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                <Tag className="h-3 w-3" />
                Coupon applied
              </span>
            )}
            {best.breakdown.cashbackSavings > 0 && (
              <span className="rounded-md bg-purple-500/15 px-2 py-0.5 text-[10px] font-medium text-purple-300">
                Cashback available
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

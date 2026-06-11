"use client";

import { Clock, ShoppingCart, Scale } from "lucide-react";
import type { Product } from "@/types";
import { useStudentMode } from "@/context/StudentModeContext";
import { getWaitOrBuyAdvice } from "@/lib/wait-or-buy";
import { formatAud } from "@/lib/pricing";

interface WaitOrBuyCardProps {
  product: Product;
}

const ICONS = {
  buy: ShoppingCart,
  wait: Clock,
  neutral: Scale,
};

const STYLES = {
  buy: "border-emerald-500/30 bg-emerald-500/10",
  wait: "border-amber-500/30 bg-amber-500/10",
  neutral: "border-slate-500/30 bg-slate-500/10",
};

const TEXT = {
  buy: "text-emerald-300",
  wait: "text-amber-300",
  neutral: "text-slate-300",
};

export function WaitOrBuyCard({ product }: WaitOrBuyCardProps) {
  const { studentMode } = useStudentMode();
  const advice = getWaitOrBuyAdvice(product, studentMode);
  const Icon = ICONS[advice.recommendation];

  return (
    <div
      className={`rounded-2xl border p-5 ${STYLES[advice.recommendation]}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`rounded-xl bg-white/10 p-2.5 ${TEXT[advice.recommendation]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Wait or Buy?
          </p>
          <h3
            className={`mt-1 text-lg font-bold ${TEXT[advice.recommendation]}`}
          >
            {advice.headline}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            {advice.detail}
          </p>
          {advice.expectedSavings && (
            <p className="mt-2 text-sm font-semibold text-white">
              Potential savings: {formatAud(advice.expectedSavings)}
            </p>
          )}
          {advice.nextSaleEvent && (
            <p className="mt-1 text-xs text-slate-500">
              Next sale: {advice.nextSaleEvent}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

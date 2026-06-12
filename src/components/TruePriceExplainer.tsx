"use client";

import {
  GraduationCap,
  Info,
  Minus,
  Plus,
  Receipt,
  Tag,
  Wallet,
} from "lucide-react";
import type { Product, StoreOffer } from "@/types";
import { useStudentMode } from "@/context/StudentModeContext";
import {
  formatAud,
  getPriceSteps,
  getTotalSavings,
  calculateTruePrice,
} from "@/lib/pricing";

interface TruePriceExplainerProps {
  offer: StoreOffer;
  product: Product;
  highlight?: boolean;
}

function StepIcon({ type }: { type: string }) {
  switch (type) {
    case "discount":
      return <Tag className="h-4 w-4 text-amber-400" />;
    case "cashback":
      return <Wallet className="h-4 w-4 text-purple-400" />;
    case "fee":
      return <Plus className="h-4 w-4 text-slate-400" />;
    case "total":
      return <Receipt className="h-4 w-4 text-teal-400" />;
    default:
      return <Minus className="h-4 w-4 text-slate-500" />;
  }
}

export function TruePriceExplainer({
  offer,
  product,
  highlight = false,
}: TruePriceExplainerProps) {
  const { studentMode } = useStudentMode();
  const steps = getPriceSteps(offer, studentMode, product);
  const breakdown = calculateTruePrice(offer, studentMode, product);
  const savings = getTotalSavings(breakdown);

  return (
    <div
      data-testid="true-price-explainer"
      className={`rounded-2xl border p-5 ${
        highlight
          ? "border-teal-500/30 bg-teal-500/5"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-white/10 p-2">
          <Info className="h-5 w-5 text-teal-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white">
            How we calculated this price
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            The {offer.retailerName} website may show{" "}
            <strong className="text-slate-300">{formatAud(breakdown.listPrice)}</strong>{" "}
            for {product.name}. Below is how optional coupon codes, student
            pricing, shipping, and cashback change what you pay.
          </p>
        </div>
      </div>

      <ol className="mt-5 space-y-3">
        {steps.map((step, i) => (
          <li
            key={i}
            className={`rounded-xl border px-4 py-3 ${
              step.type === "total"
                ? "border-teal-500/40 bg-teal-500/10"
                : "border-white/5 bg-black/20"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <StepIcon type={step.type} />
                <span
                  className={`text-sm font-medium ${
                    step.type === "total" ? "text-teal-200" : "text-slate-300"
                  }`}
                >
                  {step.label}
                </span>
                {step.label.includes("Student") && (
                  <GraduationCap className="h-3.5 w-3.5 text-amber-400" />
                )}
              </div>
              <span
                className={`shrink-0 font-mono text-sm font-bold ${
                  step.amount < 0
                    ? "text-emerald-400"
                    : step.type === "total"
                      ? "text-teal-300 text-lg"
                      : "text-white"
                }`}
              >
                {step.amount < 0 ? "−" : step.type === "fee" ? "+" : ""}
                {formatAud(Math.abs(step.amount))}
              </span>
            </div>
            {step.detail && (
              <p className="mt-2 pl-6 text-xs leading-relaxed text-slate-500">
                {step.detail}
              </p>
            )}
          </li>
        ))}
      </ol>

      {savings > 0 && (
        <p className="mt-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          You save up to {formatAud(savings)} vs the store price at{" "}
          {offer.retailerName} when all listed deals apply.
        </p>
      )}

      <p className="mt-3 text-xs text-slate-600">
        Prices are estimated from publicly available deals and may differ on the
        live store page. Always confirm the final total at checkout on{" "}
        {offer.retailerName}.
      </p>
    </div>
  );
}

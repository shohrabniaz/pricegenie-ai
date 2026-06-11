"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Product } from "@/types";
import { useStudentMode } from "@/context/StudentModeContext";
import { rankOffers, formatAud, getPriceSteps } from "@/lib/pricing";
import { RETAILER_COLORS } from "@/data/retailers";

interface OfferBreakdownListProps {
  product: Product;
}

export function OfferBreakdownList({ product }: OfferBreakdownListProps) {
  const { studentMode } = useStudentMode();
  const ranked = rankOffers(product.offers, studentMode);
  const [open, setOpen] = useState<string | null>(ranked[0]?.offer.retailer ?? null);

  return (
    <div className="space-y-2" data-testid="offer-breakdown-list">
      <h3 className="text-sm font-semibold text-white">
        Per-store price breakdown
      </h3>
      <p className="text-xs text-slate-500">
        Tap a store to see exactly how list price becomes true price.
      </p>
      {ranked.map(({ offer, breakdown }, i) => {
        const isOpen = open === offer.retailer;
        const steps = getPriceSteps(offer, studentMode);
        return (
          <div
            key={offer.retailer}
            className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]"
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : offer.retailer)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-white/[0.04]"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: RETAILER_COLORS[offer.retailer] }}
                />
                <span className="text-sm font-medium text-white">
                  {offer.retailerName}
                </span>
                {i === 0 && (
                  <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-[10px] font-bold text-teal-300">
                    BEST
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-teal-300">
                  {formatAud(breakdown.truePrice)}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-500 transition ${isOpen ? "rotate-180" : ""}`}
                />
              </div>
            </button>
            {isOpen && (
              <div className="border-t border-white/5 px-4 py-3">
                <ul className="space-y-2 text-xs">
                  {steps.map((step, si) => (
                    <li key={si} className="text-slate-400">
                      <div className="flex justify-between gap-2">
                        <span>{step.label}</span>
                        <span
                          className={
                            step.amount < 0
                              ? "text-emerald-400"
                              : step.type === "total"
                                ? "font-bold text-teal-300"
                                : "text-slate-300"
                          }
                        >
                          {step.amount < 0 ? "−" : ""}
                          {formatAud(Math.abs(step.amount))}
                        </span>
                      </div>
                      {step.detail && (
                        <p className="mt-0.5 text-[11px] text-slate-600">
                          {step.detail}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import type { Product } from "@/types";
import { useStudentMode } from "@/context/StudentModeContext";
import { getBestOffer, formatAud } from "@/lib/pricing";
import {
  getAlerts,
  saveAlert,
  removeAlert,
  hasAlert,
} from "@/lib/alerts-storage";

interface PriceAlertButtonProps {
  product: Product;
}

export function PriceAlertButton({ product }: PriceAlertButtonProps) {
  const { studentMode } = useStudentMode();
  const [active, setActive] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [targetPrice, setTargetPrice] = useState("");

  useEffect(() => {
    setActive(hasAlert(product.id));
    const best = getBestOffer(product.offers, studentMode);
    if (best) {
      setTargetPrice(String(Math.round(best.breakdown.truePrice * 0.9)));
    }
  }, [product.id, product.offers, studentMode]);

  function handleToggle() {
    if (active) {
      const alert = getAlerts().find((a) => a.productId === product.id);
      if (alert) removeAlert(alert.id);
      setActive(false);
      setShowForm(false);
    } else {
      setShowForm(true);
    }
  }

  function handleSave() {
    const price = parseInt(targetPrice, 10);
    if (!price || price <= 0) return;

    saveAlert({
      id: crypto.randomUUID(),
      productId: product.id,
      productName: product.name,
      targetPrice: price,
      createdAt: new Date().toISOString(),
    });
    setActive(true);
    setShowForm(false);
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleToggle}
        className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
          active
            ? "border-teal-500/50 bg-teal-500/15 text-teal-300"
            : "border-white/10 bg-white/5 text-white hover:bg-white/10"
        }`}
      >
        {active ? (
          <>
            <BellOff className="h-4 w-4" />
            Alert active — tap to remove
          </>
        ) : (
          <>
            <Bell className="h-4 w-4" />
            Set price alert
          </>
        )}
      </button>

      {showForm && !active && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm text-slate-400">
            Notify me when true price drops below:
          </p>
          <div className="mt-2 flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                $
              </span>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-7 pr-3 text-white focus:border-teal-500/50 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500"
            >
              Save
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-600">
            Alerts are stored locally on your device (free, no account needed).
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Trash2 } from "lucide-react";
import type { PriceAlert } from "@/types";
import { getAlerts, removeAlert } from "@/lib/alerts-storage";
import { formatAud } from "@/lib/pricing";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);

  useEffect(() => {
    setAlerts(getAlerts());
  }, []);

  function handleRemove(id: string) {
    removeAlert(id);
    setAlerts(getAlerts());
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-white">Price Alerts</h1>
      <p className="mt-2 text-slate-400">
        Stored locally on your device — no account required, completely free.
      </p>

      {alerts.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-white/10 p-12 text-center">
          <Bell className="mx-auto h-10 w-10 text-slate-600" />
          <p className="mt-4 text-slate-400">No alerts yet</p>
          <p className="mt-2 text-sm text-slate-600">
            Search for a product and tap &ldquo;Set price alert&rdquo; on the
            product page.
          </p>
          <Link
            href="/search"
            className="mt-6 inline-block rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-500"
          >
            Start searching
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div>
                <Link
                  href={`/product/${alert.productId}`}
                  className="font-semibold text-white hover:text-teal-400"
                >
                  {alert.productName}
                </Link>
                <p className="mt-1 text-sm text-slate-400">
                  Alert when below {formatAud(alert.targetPrice)}
                </p>
                <p className="text-xs text-slate-600">
                  Set {new Date(alert.createdAt).toLocaleDateString("en-AU")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(alert.id)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                aria-label="Remove alert"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

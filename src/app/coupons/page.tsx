"use client";

import { useState } from "react";
import { Copy, Check, Tag } from "lucide-react";
import { COUPONS } from "@/data/coupons";
import { useStudentMode } from "@/context/StudentModeContext";

export default function CouponsPage() {
  const { studentMode } = useStudentMode();
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = studentMode
    ? COUPONS
    : COUPONS.filter((c) => !c.studentOnly);

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Coupon Codes</h1>
        <p className="mt-2 text-slate-400">
          Working discount codes for Australian retailers. Success rates based
          on community reports.
        </p>
        {studentMode && (
          <p className="mt-2 text-sm text-amber-400">
            Student Mode ON — showing student-only codes too.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((coupon) => (
          <div
            key={coupon.id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-amber-400" />
                  <span className="font-semibold text-white">
                    {coupon.retailerName}
                  </span>
                  {coupon.studentOnly && (
                    <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300">
                      STUDENT
                    </span>
                  )}
                </div>
                <p className="mt-2 text-2xl font-bold text-amber-400">
                  {coupon.discount}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {coupon.description}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => copyCode(coupon.code)}
                className="flex items-center gap-2 rounded-lg border border-dashed border-white/20 bg-white/5 px-4 py-2 font-mono text-sm font-bold text-white transition hover:border-teal-500/50"
              >
                {coupon.code}
                {copied === coupon.code ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4 text-slate-500" />
                )}
              </button>
              <div className="text-right text-xs text-slate-500">
                <p>{coupon.successRate}% success</p>
                <p>Exp: {coupon.expiry}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

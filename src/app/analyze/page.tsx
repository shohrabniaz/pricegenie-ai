"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Link2, Loader2 } from "lucide-react";
import { useStudentMode } from "@/context/StudentModeContext";
import { formatAud } from "@/lib/pricing";
import type { UrlAnalysisResult } from "@/lib/url-analyzer";

export default function AnalyzePage() {
  const { studentMode } = useStudentMode();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UrlAnalysisResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/analyze-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), studentMode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not analyze this URL");
        return;
      }
      setResult(data as UrlAnalysisResult);
    } catch {
      setError("Network error — try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/15 text-teal-300">
          <Link2 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Paste any product URL</h1>
          <p className="text-sm text-slate-500">
            JB Hi-Fi, Amazon AU, Harvey Norman, eBay AU & more
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block text-sm font-medium text-slate-400">
          Product link
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.jbhifi.com.au/products/..."
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base text-white placeholder:text-slate-600 focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500/30"
          />
        </label>
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-3 text-sm font-semibold text-[#0B1220] transition hover:bg-teal-400 disabled:opacity-50 sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing…
            </>
          ) : (
            "Analyze price"
          )}
        </button>
      </form>

      {error && (
        <p className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-8 space-y-6" data-testid="analyze-result">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            {result.productTitle && (
              <h2 className="text-lg font-semibold text-white">
                {result.productTitle}
              </h2>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              {result.retailer && (
                <span className="text-slate-400">{result.retailer}</span>
              )}
              {result.storePrice != null && (
                <span className="text-2xl font-bold text-teal-300">
                  {formatAud(result.storePrice)}
                </span>
              )}
            </div>
            <p className="mt-3 text-sm text-slate-400">
              {result.summary.replace(/\*\*/g, "")}
            </p>
            <a
              href={result.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
            >
              View on store
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {result.alternatives.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white">
                Cheaper alternatives in PriceGenie
              </h3>
              <ul className="mt-3 space-y-2">
                {result.alternatives.map((alt) => (
                  <li
                    key={alt.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
                  >
                    <div>
                      <Link
                        href={alt.href}
                        className="font-medium text-white hover:text-teal-300"
                      >
                        {alt.name}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {alt.retailerName}
                        {alt.couponCode && (
                          <span className="ml-2 text-amber-400">
                            Code {alt.couponCode}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-teal-300">
                        {formatAud(alt.checkoutPrice)}
                      </p>
                      <p className="text-xs text-slate-500">
                        store {formatAud(alt.storePrice)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

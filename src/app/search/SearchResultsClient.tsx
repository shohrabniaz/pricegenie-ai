"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { AnalyzeUrlBar } from "@/components/AnalyzeUrlBar";
import { ProductCard } from "@/components/ProductCard";
import { RetailerSearchLinks } from "@/components/RetailerSearchLinks";
import { PriceEstimateBanner } from "@/components/PriceEstimateBanner";
import { useStudentMode } from "@/context/StudentModeContext";
import { getCategories, getFeaturedProducts } from "@/lib/search";
import type { UnifiedSearchResult } from "@/lib/live-search";

interface SearchResultsClientProps {
  query: string;
  category?: string;
  initialData: UnifiedSearchResult | null;
}

export function SearchResultsClient({
  query,
  category,
  initialData,
}: SearchResultsClientProps) {
  const { studentMode } = useStudentMode();
  const [studentData, setStudentData] = useState<UnifiedSearchResult | null>(
    null
  );
  const [studentFetchKey, setStudentFetchKey] = useState<string | null>(null);

  useEffect(() => {
    if (!query || !studentMode) {
      return;
    }

    const controller = new AbortController();
    const fetchKey = `${query}|${category ?? ""}`;
    const searchParams = new URLSearchParams({ q: query, studentMode: "true" });
    if (category) searchParams.set("category", category);

    fetch(`/api/search?${searchParams}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((json: UnifiedSearchResult) => {
        if (!controller.signal.aborted) {
          setStudentData(json);
          setStudentFetchKey(fetchKey);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setStudentData(null);
          setStudentFetchKey(fetchKey);
        }
      });

    return () => controller.abort();
  }, [query, category, studentMode]);

  const studentFetchId = studentMode ? `${query}|${category ?? ""}` : null;
  const data = studentMode ? studentData : initialData;
  const loading = Boolean(
    studentFetchId && studentFetchKey !== studentFetchId
  );
  const results = query ? (data?.products ?? []) : [];
  const categories = getCategories();
  const featured = getFeaturedProducts(studentMode).slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <SearchBar defaultValue={query} autoFocus={Boolean(query)} />

      {!query && (
        <div className="mt-6 space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-violet-300">
              Live price check
            </p>
            <AnalyzeUrlBar className="mt-2" />
          </div>
          <p className="text-sm text-slate-500">
            Search any product name above, or try a popular query below.
          </p>
          <div className="flex flex-wrap gap-2">
            {["ps5", "macbook", "airpods", "student laptop", "oled tv"].map(
              (term) => (
                <Link
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400 transition hover:border-teal-500/30 hover:text-teal-300"
                >
                  {term}
                </Link>
              )
            )}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Sample guides</h2>
            <p className="mt-1 text-xs text-slate-500">
              Curated comparisons — prices may be estimates
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      )}

      {query && (
        <>
          <p className="mt-4 text-sm text-slate-500">
            {loading ? (
              "Searching…"
            ) : (
              <>
                Results for &ldquo;{query}&rdquo;
                {studentMode && (
                  <span className="ml-2 text-amber-400">· Student Mode ON</span>
                )}
              </>
            )}
          </p>

          {data && !loading && (
            <RetailerSearchLinks
              links={data.retailerLinks}
              query={query}
              prominent
            />
          )}

          {data && results.length > 0 && !loading && (
            <PriceEstimateBanner
              className="mt-6"
              verifiedCount={data.fromSnapshots}
              totalOffers={results.reduce((n, p) => n + p.offers.length, 0)}
            />
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <a
                key={cat}
                href={`/search?q=${encodeURIComponent(query || cat)}&category=${encodeURIComponent(cat)}`}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  category === cat
                    ? "border-teal-500/50 bg-teal-500/15 text-teal-300"
                    : "border-white/10 text-slate-500 hover:border-white/20"
                }`}
              >
                {cat}
              </a>
            ))}
          </div>

          {!loading && results.length === 0 && (
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
              <p className="text-lg text-slate-300">No guide matches yet</p>
              <p className="mt-2 text-sm text-slate-500">
                Use the retailer links above for live listings, or paste a product
                URL on{" "}
                <Link href="/analyze" className="text-teal-400 hover:underline">
                  Analyze
                </Link>{" "}
                for the most accurate price.
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold text-white">
                Similar items in our buying guides
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Coupons and true-price math — confirm shelf price on the store
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

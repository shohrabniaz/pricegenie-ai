"use client";

import { useEffect, useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { ProductCard } from "@/components/ProductCard";
import { RetailerSearchLinks } from "@/components/RetailerSearchLinks";
import { useStudentMode } from "@/context/StudentModeContext";
import { PRODUCTS } from "@/data/products";
import { getCategories } from "@/lib/search";
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <SearchBar defaultValue={query} autoFocus />

      {query && (
        <p className="mt-4 text-sm text-slate-500">
          {loading ? (
            "Searching…"
          ) : (
            <>
              {results.length} result{results.length !== 1 ? "s" : ""} for
              &ldquo;{query}&rdquo;
              {data && data.fromSnapshots > 0 && (
                <span className="ml-2 text-emerald-400/90">
                  · {data.fromSnapshots} with daily price refresh
                </span>
              )}
            </>
          )}
          {studentMode && (
            <span className="ml-2 text-amber-400">· Student Mode ON</span>
          )}
        </p>
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

      {query && !loading && results.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-lg text-slate-400">No catalog matches</p>
          <p className="mt-2 text-sm text-slate-600">
            Try retailer links below, paste a URL on{" "}
            <a href="/analyze" className="text-teal-400 hover:underline">
              Analyze
            </a>
            , or ask{" "}
            <a href="/advisor" className="text-teal-400 hover:underline">
              Genie
            </a>
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {data && query && (
        <RetailerSearchLinks links={data.retailerLinks} query={query} />
      )}

      {!query && (
        <>
          <p className="mt-8 text-sm text-slate-500">
            Browse all {PRODUCTS.length} products or search above
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

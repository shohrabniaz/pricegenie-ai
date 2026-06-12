"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { SearchBar } from "@/components/SearchBar";
import { ProductCard } from "@/components/ProductCard";
import { useStudentMode } from "@/context/StudentModeContext";
import { PRODUCTS } from "@/data/products";
import { searchProducts, getCategories } from "@/lib/search";

function SearchResults() {
  const params = useSearchParams();
  const query = params.get("q") ?? "";
  const category = params.get("category") ?? undefined;
  const { studentMode } = useStudentMode();

  const results = query
    ? searchProducts(query, { category }, studentMode)
    : [];

  const categories = getCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <SearchBar defaultValue={query} autoFocus />

      {query && (
        <p className="mt-4 text-sm text-slate-500">
          {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;
          {query}&rdquo;
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

      {query && results.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-lg text-slate-400">No products found</p>
          <p className="mt-2 text-sm text-slate-600">
            Try a different search term or ask our{" "}
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

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-8 text-slate-500">
          Loading...
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}

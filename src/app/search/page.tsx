import { Suspense } from "react";
import { unifiedSearch } from "@/lib/live-search";
import { SearchResultsClient } from "@/app/search/SearchResultsClient";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

async function SearchContent({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q ?? "";
  const category = params.category;

  const initialData = query
    ? unifiedSearch(query, { category, studentMode: false })
    : null;

  return (
    <SearchResultsClient
      query={query}
      category={category}
      initialData={initialData}
    />
  );
}

export default function SearchPage(props: SearchPageProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-8 text-slate-500">
          Loading...
        </div>
      }
    >
      <SearchContent {...props} />
    </Suspense>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  defaultValue?: string;
  size?: "default" | "large";
  autoFocus?: boolean;
}

export function SearchBar({
  defaultValue = "",
  size = "default",
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  }

  const isLarge = size === "large";

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={`flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 shadow-xl transition focus-within:border-teal-500/50 focus-within:ring-2 focus-within:ring-teal-500/20 ${
          isLarge ? "p-2" : "p-1.5"
        }`}
      >
        <Search
          className={`shrink-0 text-slate-500 ${isLarge ? "ml-3 h-5 w-5" : "ml-2 h-4 w-4"}`}
        />
        <input
          type="search"
          data-testid="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search iPhone 17 Pro, gaming laptop under $1500..."
          autoFocus={autoFocus}
          className={`flex-1 bg-transparent text-white placeholder:text-slate-500 focus:outline-none ${
            isLarge ? "py-3 text-base" : "py-2 text-sm"
          }`}
        />
        <button
          type="submit"
          data-testid="search-submit"
          className={`shrink-0 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 font-semibold text-white transition hover:from-teal-400 hover:to-emerald-500 ${
            isLarge ? "px-6 py-3 text-sm" : "px-4 py-2 text-xs"
          }`}
        >
          Search
        </button>
      </div>
    </form>
  );
}

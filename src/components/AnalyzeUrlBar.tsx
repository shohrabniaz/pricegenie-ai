"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Link2 } from "lucide-react";

interface AnalyzeUrlBarProps {
  size?: "default" | "large";
  className?: string;
}

export function AnalyzeUrlBar({
  size = "default",
  className = "",
}: AnalyzeUrlBarProps) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const isLarge = size === "large";

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;
    router.push(`/analyze?url=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div
        className={`flex flex-col gap-2 rounded-2xl border border-violet-500/20 bg-violet-500/5 sm:flex-row sm:items-center ${
          isLarge ? "p-2" : "p-1.5"
        }`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Link2
            className={`shrink-0 text-violet-300 ${isLarge ? "ml-2 h-5 w-5" : "ml-1.5 h-4 w-4"}`}
          />
          <input
            type="url"
            data-testid="analyze-url-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste JB Hi-Fi, Amazon AU, or Harvey Norman product URL…"
            className={`min-w-0 flex-1 bg-transparent text-base text-white placeholder:text-slate-500 focus:outline-none ${
              isLarge ? "py-3" : "py-2"
            }`}
          />
        </div>
        <button
          type="submit"
          data-testid="analyze-url-submit"
          disabled={!url.trim()}
          className={`touch-target shrink-0 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 font-semibold text-white transition hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 ${
            isLarge ? "px-6 py-3 text-sm" : "min-h-[2.75rem] px-4 py-2 text-xs"
          }`}
        >
          Analyze live price
        </button>
      </div>
    </form>
  );
}

import { ExternalLink } from "lucide-react";
import type { RetailerSearchLink } from "@/lib/live-search";
import { APP_NAME } from "@/lib/brand";
import { RETAILER_COLORS } from "@/data/retailers";

interface RetailerSearchLinksProps {
  links: RetailerSearchLink[];
  query: string;
}

export function RetailerSearchLinks({ links, query }: RetailerSearchLinksProps) {
  if (!query.trim()) return null;

  return (
    <section
      data-testid="retailer-search-links"
      className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5"
    >
      <h2 className="text-sm font-semibold text-white">
        Search live on Australian retailers
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        {APP_NAME} matches our catalog + daily price snapshots. Open a retailer
        to compare live listings for &ldquo;{query}&rdquo;.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {links.map(({ retailer, retailerName, searchUrl }) => (
          <a
            key={retailer}
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-teal-500/30 hover:text-white"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: RETAILER_COLORS[retailer] }}
            />
            {retailerName}
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        ))}
      </div>
    </section>
  );
}

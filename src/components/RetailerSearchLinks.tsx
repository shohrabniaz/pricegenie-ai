import { ExternalLink } from "lucide-react";
import type { RetailerSearchLink } from "@/lib/live-search";
import { APP_NAME } from "@/lib/brand";
import { RETAILER_COLORS } from "@/data/retailers";

interface RetailerSearchLinksProps {
  links: RetailerSearchLink[];
  query: string;
  prominent?: boolean;
}

export function RetailerSearchLinks({
  links,
  query,
  prominent = false,
}: RetailerSearchLinksProps) {
  if (!query.trim()) return null;

  return (
    <section
      data-testid="retailer-search-links"
      className={`mt-6 rounded-2xl border p-5 ${
        prominent
          ? "border-teal-500/25 bg-teal-500/5"
          : "border-white/10 bg-white/[0.02]"
      }`}
    >
      <h2 className="text-sm font-semibold text-white">
        {prominent ? "Check live prices on retailers" : "Search on retailers"}
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        {prominent
          ? `Open each store to see today's listings for "${query}". For one-click live price from a product page, use Analyze.`
          : `${APP_NAME} surfaces retailer search for "${query}" — confirm price on the store.`}
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

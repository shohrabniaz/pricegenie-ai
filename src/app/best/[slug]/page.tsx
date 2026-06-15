import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { RetailerSearchLinks } from "@/components/RetailerSearchLinks";
import { APP_NAME } from "@/lib/brand";
import { getSeoGuide, SEO_GUIDES } from "@/data/seo-guides";
import { unifiedSearch } from "@/lib/live-search";
import { getBestOffer } from "@/lib/pricing";

interface BestGuidePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return SEO_GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: BestGuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getSeoGuide(slug);
  if (!guide) return {};

  return {
    title: guide.title,
    description: guide.description,
    openGraph: {
      title: guide.title,
      description: guide.description,
      type: "article",
    },
  };
}

export default async function BestGuidePage({ params }: BestGuidePageProps) {
  const { slug } = await params;
  const guide = getSeoGuide(slug);
  if (!guide) notFound();

  const { products, retailerLinks } = unifiedSearch(guide.searchQuery, {
    category: guide.category,
  });

  const picks = products
    .filter((product) => {
      if (!guide.maxPrice) return true;
      const best = getBestOffer(product.offers, false, product);
      return best && best.breakdown.listPrice <= guide.maxPrice;
    })
    .slice(0, 9);

  return (
    <article className="mx-auto max-w-6xl px-4 py-8">
      <nav className="text-sm text-slate-500">
        <Link href="/" className="hover:text-teal-400">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-400">Buying guides</span>
      </nav>

      <header className="mt-4 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {guide.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-400">
          {guide.intro}
        </p>
      </header>

      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <h2 className="text-sm font-semibold text-white">Quick tips</h2>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-slate-400">
          {guide.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-white">Top picks</h2>
        <p className="mt-1 text-sm text-slate-500">
          Store prices from {APP_NAME} catalog + daily refresh where available.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {picks.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {picks.length === 0 && (
          <p className="mt-4 text-sm text-slate-500">
            No matches in our catalog right now —{" "}
            <Link href="/search" className="text-teal-400 hover:underline">
              search all products
            </Link>
            .
          </p>
        )}
      </section>

      <RetailerSearchLinks links={retailerLinks} query={guide.searchQuery} />

      <p className="mt-10 text-xs text-slate-600">
        Last updated {new Date().toLocaleDateString("en-AU")}. Prices change —
        verify on the retailer site or use{" "}
        <Link href="/analyze" className="text-teal-400 hover:underline">
          Paste URL
        </Link>
        .
      </p>
    </article>
  );
}

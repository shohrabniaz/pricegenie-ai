"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  GraduationCap,
  Shield,
  Sparkles,
  TrendingDown,
  Zap,
} from "lucide-react";
import { HeroBadge } from "@/components/Header";
import { AnalyzeUrlBar } from "@/components/AnalyzeUrlBar";
import { SearchBar } from "@/components/SearchBar";
import { ProductCard } from "@/components/ProductCard";
import { useStudentMode } from "@/context/StudentModeContext";
import { AI_ASSISTANT_NAME, APP_NAME } from "@/lib/brand";
import { getFeaturedProducts } from "@/lib/search";

const FEATURES = [
  {
    icon: TrendingDown,
    title: "True Price",
    desc: "Final cost after coupons, student discounts, cashback & shipping.",
  },
  {
    icon: GraduationCap,
    title: "Student Mode",
    desc: "Auto-applies education pricing from Apple, Samsung, JB Hi-Fi & more.",
  },
  {
    icon: BadgePercent,
    title: "Coupon Finder",
    desc: "Working codes with success rates from Australian retailers.",
  },
  {
    icon: Sparkles,
    title: `${AI_ASSISTANT_NAME} AI`,
    desc: `Chat with ${AI_ASSISTANT_NAME} — personalised picks, wait-or-buy advice, and budget help.`,
  },
  {
    icon: Zap,
    title: "Price Alerts",
    desc: "Get notified when products drop below your target price.",
  },
  {
    icon: Shield,
    title: "Australia First",
    desc: "JB Hi-Fi, Harvey Norman, Kmart, Amazon AU, The Good Guys & more.",
  },
];

export default function HomePage() {
  const { studentMode } = useStudentMode();
  const featured = getFeaturedProducts(studentMode).slice(0, 4);

  return (
    <>
      <section className="relative overflow-hidden px-4 pb-12 pt-10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-teal-500/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-3xl text-center">
          <HeroBadge />
          <h1
            data-testid="hero-title"
            className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl"
          >
            Your wish for the best price
            <span className="block bg-gradient-to-r from-violet-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
              granted
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-400 sm:text-lg">
            Paste any product link for a live price check, or search to compare
            coupons and true checkout cost across Australian retailers.
          </p>

          <div className="mx-auto mt-8 max-w-2xl text-left">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-violet-300">
              Best accuracy — analyze a URL
            </p>
            <AnalyzeUrlBar size="large" />
          </div>

          <div className="mx-auto mt-6 max-w-2xl text-left">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              Or search any product
            </p>
            <SearchBar size="large" />
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-slate-600">
            {["iPhone 17 Pro", "gaming laptop", "MacBook Air", "OLED TV"].map(
              (term) => (
                <Link
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="rounded-full border border-white/10 px-3 py-1 transition hover:border-teal-500/30 hover:text-teal-400"
                >
                  {term}
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-2 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Sample comparisons</h2>
            <p className="mt-1 text-xs text-slate-500">
              Buying-guide picks — prices may be estimates until verified
            </p>
          </div>
          <Link
            href="/search"
            className="flex shrink-0 items-center gap-1 text-sm text-teal-400 hover:text-teal-300"
          >
            Search <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="border-t border-white/5 bg-white/[0.02] px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold text-white">
            Why {APP_NAME} beats manual searching
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-slate-500">
            Paste a link, search any product, or ask Genie — coupons and true
            price in one place.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="mb-3 inline-flex rounded-xl bg-teal-500/15 p-2.5 text-teal-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="mt-1 text-sm text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-2xl rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-purple-500/5 p-8 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-violet-400" />
          <h2 className="mt-4 text-2xl font-bold text-white">
            Not sure what to buy?
          </h2>
          <p className="mt-2 text-slate-400">
            Ask our AI: &ldquo;Best gaming laptop under $2,000?&rdquo; or
            &ldquo;Should I wait for Black Friday?&rdquo;
          </p>
          <Link
            href="/advisor"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:from-violet-500 hover:to-purple-500"
          >
            Chat with {AI_ASSISTANT_NAME} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { AI_ASSISTANT_NAME, APP_NAME, APP_TAGLINE } from "@/lib/brand";
import { AUTHOR_NAME } from "@/lib/author";
import { APP_VERSION } from "@/lib/version";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#080D18]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Logo testId="footer-logo" />
            <p className="mt-2 text-sm text-slate-500">{APP_TAGLINE}</p>
            <p className="mt-2 text-xs text-slate-600">
              © {new Date().getFullYear()} {AUTHOR_NAME} · v{APP_VERSION}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <Link href="/search" className="hover:text-teal-400">
              Search
            </Link>
            <Link href="/coupons" className="hover:text-teal-400">
              Coupons
            </Link>
            <Link href="/student" className="hover:text-teal-400">
              Student Deals
            </Link>
            <Link href="/advisor" className="hover:text-teal-400">
              {AI_ASSISTANT_NAME}
            </Link>
            <Link href="/analyze" className="hover:text-teal-400">
              Analyze URL
            </Link>
            <Link href="/best/best-laptops-under-1000-australia" className="hover:text-teal-400">
              Buying guides
            </Link>
          </div>
        </div>
        <p className="mt-6 text-xs text-slate-700">
          Affiliate disclosure: {APP_NAME} may earn commission when you purchase
          through retailer links. Guide prices are estimates unless marked
          Verified — use Analyze for a live price from the retailer page.
        </p>
      </div>
    </footer>
  );
}

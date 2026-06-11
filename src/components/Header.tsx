"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Bot,
  GraduationCap,
  Home,
  Search,
  Tag,
  TrendingDown,
} from "lucide-react";
import { useStudentMode } from "@/context/StudentModeContext";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/coupons", label: "Coupons", icon: Tag },
  { href: "/student", label: "Student", icon: GraduationCap },
  { href: "/advisor", label: "Niaz", icon: Bot },
  { href: "/alerts", label: "Alerts", icon: Bell },
];

export function Header() {
  const pathname = usePathname();
  const { studentMode, toggleStudentMode, hydrated } = useStudentMode();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B1220]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-teal-500 text-lg font-bold text-white shadow-lg shadow-violet-500/20">
            G
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold tracking-tight text-white">
              PriceGenie AI
            </p>
            <p className="text-[10px] font-medium text-violet-300/90">
              Your wish for the best price granted
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-teal-500/20 text-teal-300"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          data-testid="student-mode-toggle"
          onClick={toggleStudentMode}
          disabled={!hydrated}
          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
            studentMode
              ? "border-amber-400/50 bg-amber-400/15 text-amber-300 shadow-sm shadow-amber-400/10"
              : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white"
          }`}
          aria-pressed={studentMode}
        >
          <GraduationCap className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Student Mode</span>
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] ${
              studentMode ? "bg-amber-400/30" : "bg-white/10"
            }`}
          >
            {studentMode ? "ON" : "OFF"}
          </span>
        </button>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-white/5 px-4 py-2 md:hidden">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium ${
                active
                  ? "bg-teal-500/20 text-teal-300"
                  : "text-slate-400"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

export function HeroBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
      <TrendingDown className="h-3.5 w-3.5" />
      PriceGenie AI — true lowest price, coupons, cashback & student discounts
    </div>
  );
}

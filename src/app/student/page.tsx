import { ExternalLink, GraduationCap } from "lucide-react";
import { STUDENT_DISCOUNTS } from "@/data/student-discounts";

export default function StudentPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-500/20 p-3">
            <GraduationCap className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Student Deals Hub</h1>
            <p className="text-slate-400">
              Verified student discounts for Australian uni students. Toggle
              Student Mode in the header to auto-apply at checkout comparison.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {STUDENT_DISCOUNTS.map((deal) => (
          <a
            key={deal.id}
            href={deal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-amber-500/30 hover:bg-white/[0.06]"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {deal.brand}
                </p>
                <h3 className="mt-1 font-semibold text-white group-hover:text-amber-300">
                  {deal.title}
                </h3>
                <p className="mt-2 text-lg font-bold text-amber-400">
                  {deal.discount}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  {deal.description}
                </p>
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-slate-600 group-hover:text-amber-400" />
            </div>
            <span className="mt-4 inline-block rounded-full bg-white/10 px-3 py-1 text-xs text-slate-400">
              Verify via {deal.verification}
            </span>
          </a>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="font-bold text-white">New Student in Australia?</h2>
        <p className="mt-2 text-sm text-slate-400">
          Ask Niaz to build your student survival pack — laptop, SIM,
          internet, and grocery savings in one conversation.
        </p>
        <a
          href="/advisor"
          className="mt-4 inline-block rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-500"
        >
          Chat with Niaz
        </a>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mail, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";
import { AI_ASSISTANT_NAME, APP_NAME } from "@/lib/brand";
import {
  getAuthErrorMessage,
  signInWithEmail,
  signUpWithEmail,
} from "@/lib/firebase/auth-actions";
import { isAuthRequired } from "@/lib/auth-config";

type Mode = "sign-in" | "sign-up";

export default function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const authRequired = isAuthRequired();

  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "sign-up") {
        const user = await signUpWithEmail(email, password);
        if (!user.emailVerified) {
          router.replace("/verify-email");
          return;
        }
      } else {
        const user = await signInWithEmail(email, password);
        if (!user.emailVerified) {
          router.replace("/verify-email");
          return;
        }
      }
      router.replace(next.startsWith("/") ? next : "/");
    } catch (err: unknown) {
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code: string }).code)
          : "";
      setError(getAuthErrorMessage(code));
    } finally {
      setLoading(false);
    }
  }

  if (!authRequired) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
          <h1 className="text-lg font-semibold text-amber-200">
            Auth not configured
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Add Firebase environment variables to enable email sign-in. See{" "}
            <code className="text-teal-300">.env.example</code>.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm text-teal-400 hover:underline"
          >
            Continue without sign-in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-teal-500/10 via-transparent to-transparent" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex justify-center">
            <Logo testId="login-logo" layout="stacked" />
          </Link>
          <p className="mt-4 text-sm text-slate-500">
            Sign in with email to access {AI_ASSISTANT_NAME} and price tools
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl">
          <div className="mb-6 flex rounded-xl bg-white/[0.04] p-1">
            {(["sign-in", "sign-up"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setMode(tab);
                  setError(null);
                }}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                  mode === tab
                    ? "bg-teal-500/20 text-teal-300"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab === "sign-in" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-slate-400">
              Email
              <div className="relative mt-2">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-base text-white placeholder:text-slate-600 focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500/30"
                />
              </div>
            </label>

            <label className="block text-sm font-medium text-slate-400">
              Password
              <input
                type="password"
                required
                minLength={6}
                autoComplete={
                  mode === "sign-up" ? "new-password" : "current-password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base text-white placeholder:text-slate-600 focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500/30"
              />
            </label>

            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 py-3 text-sm font-semibold text-[#0B1220] transition hover:bg-teal-400 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Please wait…
                </>
              ) : mode === "sign-up" ? (
                "Create account & send verification"
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {mode === "sign-up" && (
            <p className="mt-4 flex items-start gap-2 text-xs text-slate-500">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-400" />
              We&apos;ll email you a verification link. You must verify before
              accessing {APP_NAME}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MailCheck } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { resendVerificationEmail } from "@/lib/firebase/auth-actions";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, refreshUser, signOut } = useAuth();
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleResend() {
    if (!user) return;
    setSending(true);
    setError(null);
    setMessage(null);
    try {
      await resendVerificationEmail(user);
      setMessage("Verification email sent. Check your inbox and spam folder.");
    } catch {
      setError("Could not send email. Wait a minute and try again.");
    } finally {
      setSending(false);
    }
  }

  async function handleCheckVerified() {
    setChecking(true);
    setError(null);
    setMessage(null);
    try {
      const refreshed = await refreshUser();
      if (refreshed?.emailVerified) {
        router.replace("/");
        return;
      }
      setMessage("Not verified yet. Click the link in your email, then try again.");
    } catch {
      setError("Could not refresh status. Try again.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-500/10 via-transparent to-transparent" />

      <div className="relative w-full max-w-md text-center">
        <Link href="/" className="inline-flex justify-center">
          <Logo testId="verify-logo" layout="stacked" />
        </Link>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-500/15 text-teal-300">
            <MailCheck className="h-7 w-7" />
          </div>

          <h1 className="mt-4 text-xl font-bold text-white">
            Verify your email
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            We sent a verification link to{" "}
            <span className="font-medium text-slate-200">
              {user?.email ?? "your email"}
            </span>
            . Click it, then return here.
          </p>

          {message && (
            <p className="mt-4 rounded-lg border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-sm text-teal-200">
              {message}
            </p>
          )}
          {error && (
            <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleCheckVerified}
              disabled={checking}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 py-3 text-sm font-semibold text-[#0B1220] hover:bg-teal-400 disabled:opacity-50"
            >
              {checking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking…
                </>
              ) : (
                "I've verified my email"
              )}
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={sending}
              className="w-full rounded-xl border border-white/10 py-3 text-sm font-medium text-slate-300 hover:bg-white/5 disabled:opacity-50"
            >
              {sending ? "Sending…" : "Resend verification email"}
            </button>
            <button
              type="button"
              onClick={() => signOut().then(() => router.replace("/login"))}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Use a different email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

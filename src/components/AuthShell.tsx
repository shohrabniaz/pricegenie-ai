"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { isAuthPublicPath } from "@/lib/auth-config";

export function AuthShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, authRequired } = useAuth();
  const isPublic = isAuthPublicPath(pathname);

  useEffect(() => {
    if (!authRequired || loading) return;

    if (!user && pathname === "/verify-email") {
      router.replace("/login");
      return;
    }

    if (!user && !isPublic) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (user && !user.emailVerified && pathname !== "/verify-email") {
      router.replace("/verify-email");
      return;
    }

    if (user?.emailVerified && isPublic) {
      router.replace("/");
    }
  }, [authRequired, loading, user, isPublic, pathname, router]);

  if (!authRequired) {
    return (
      <>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
        <p className="text-sm">Loading…</p>
      </div>
    );
  }

  if (isPublic) {
    return <main className="flex min-h-screen flex-1 flex-col">{children}</main>;
  }

  if (!user || !user.emailVerified) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
        <p className="text-sm">Redirecting…</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

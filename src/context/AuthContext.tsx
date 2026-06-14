"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { isAuthRequired } from "@/lib/auth-config";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { signOut as authSignOut } from "@/lib/firebase/auth-actions";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  authRequired: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authRequired = isAuthRequired();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(authRequired);

  useEffect(() => {
    if (!authRequired) return;

    const auth = getFirebaseAuth();
    if (!auth) {
      const id = window.setTimeout(() => setLoading(false), 0);
      return () => window.clearTimeout(id);
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, [authRequired]);

  const signOut = useCallback(async () => {
    await authSignOut();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    const auth = getFirebaseAuth();
    if (auth?.currentUser) {
      await auth.currentUser.reload();
      setUser(auth.currentUser);
      return auth.currentUser;
    }
    return null;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, authRequired, signOut, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useSyncExternalStore,
} from "react";

interface StudentModeContextValue {
  studentMode: boolean;
  toggleStudentMode: () => void;
  hydrated: boolean;
}

const StudentModeContext = createContext<StudentModeContextValue | null>(null);

const STORAGE_KEY = "pricegenie-student-mode";

export function StudentModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [studentMode, setStudentMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const toggleStudentMode = useCallback(() => {
    setStudentMode((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return (
    <StudentModeContext.Provider
      value={{ studentMode, toggleStudentMode, hydrated }}
    >
      {children}
    </StudentModeContext.Provider>
  );
}

export function useStudentMode() {
  const ctx = useContext(StudentModeContext);
  if (!ctx) {
    throw new Error("useStudentMode must be used within StudentModeProvider");
  }
  return ctx;
}

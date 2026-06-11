"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
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
  const [studentMode, setStudentMode] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") setStudentMode(true);
    setHydrated(true);
  }, []);

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

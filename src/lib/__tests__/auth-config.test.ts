import { describe, expect, it } from "vitest";
import { isAuthPublicPath, isAuthRequired } from "@/lib/auth-config";

describe("auth-config", () => {
  it("marks login and verify paths as public", () => {
    expect(isAuthPublicPath("/login")).toBe(true);
    expect(isAuthPublicPath("/verify-email")).toBe(true);
    expect(isAuthPublicPath("/search")).toBe(false);
  });

  it("disables auth when NEXT_PUBLIC_AUTH_DISABLED is true", () => {
    const prev = process.env.NEXT_PUBLIC_AUTH_DISABLED;
    process.env.NEXT_PUBLIC_AUTH_DISABLED = "true";
    expect(isAuthRequired()).toBe(false);
    process.env.NEXT_PUBLIC_AUTH_DISABLED = prev;
  });

  it("requires explicit NEXT_PUBLIC_AUTH_ENABLED for auth gate", () => {
    const prevDisabled = process.env.NEXT_PUBLIC_AUTH_DISABLED;
    const prevEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED;
    const prevKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    process.env.NEXT_PUBLIC_AUTH_DISABLED = "false";
    process.env.NEXT_PUBLIC_AUTH_ENABLED = "false";
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-key";
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "test.firebaseapp.com";
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test";
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID = "1:123:web:abc";

    expect(isAuthRequired()).toBe(false);

    process.env.NEXT_PUBLIC_AUTH_ENABLED = "true";
    expect(isAuthRequired()).toBe(true);

    process.env.NEXT_PUBLIC_AUTH_DISABLED = prevDisabled;
    process.env.NEXT_PUBLIC_AUTH_ENABLED = prevEnabled;
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = prevKey;
    delete process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
    delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    delete process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  });
});

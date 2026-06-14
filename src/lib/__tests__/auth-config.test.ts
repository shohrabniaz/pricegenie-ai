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
});

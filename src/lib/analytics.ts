import { track as vercelTrack } from "@vercel/analytics";

type EventProps = Record<string, string | number | boolean | null>;

/** Fire a custom analytics event (no-op outside the browser). */
export function trackEvent(name: string, props?: EventProps) {
  if (typeof window === "undefined") return;
  vercelTrack(name, props);
}

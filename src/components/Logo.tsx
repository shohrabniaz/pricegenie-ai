"use client";

import { useId } from "react";
import {
  BRAND_GOLD,
  BRAND_GOLD_LIGHT,
  BRAND_INK,
  BRAND_INK_SOFT,
} from "@/lib/brand";

interface LogoProps {
  variant?: "full" | "icon";
  layout?: "horizontal" | "stacked";
  className?: string;
  showWordmark?: boolean;
  testId?: string;
}

function LogoMark({ className = "h-8 w-8 sm:h-9 sm:w-9" }: { className?: string }) {
  const gradId = useId();

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={`shrink-0 select-none ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="26" y1="8" x2="36" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor={BRAND_GOLD_LIGHT} />
          <stop offset="1" stopColor={BRAND_GOLD} />
        </linearGradient>
      </defs>

      {/* P */}
      <path
        fill={BRAND_INK}
        fillRule="evenodd"
        d="M8 7h12.5c5.8 0 10 4.1 10 9.3S26.3 25.5 20.5 25.5H14v7.5H8V7zm6 5.5v8h6.3c2.9 0 4.7-1.7 4.7-4.2S23.2 12.5 20.3 12.5H14z"
      />

      {/* Lamp — soft silhouette inside the P bowl */}
      <path
        d="M20.5 20.2c0-2.6 2.3-4.6 5.2-4.6 2.4 0 4.4 1.4 5 3.4.5 1.5-.1 3.1-1.5 3.9l-1.6.8c-1 .5-2.2.2-2.8-.6l-1.3-2.1z"
        fill={BRAND_INK_SOFT}
        fillOpacity={0.42}
      />

      {/* Price tags */}
      <path
        d="M28.2 11.2 33.8 8.6 35.6 12.8 30 15.4z"
        fill={`url(#${gradId})`}
      />
      <path
        d="M31.6 16.8 34.4 15.4 35.6 18.2 32.8 19.6z"
        fill={BRAND_GOLD}
        fillOpacity={0.55}
      />

      {/* Sparkle on primary tag */}
      <path
        d="M31.4 11.4l0.4 0.8 0.8 0.4-0.8 0.4-0.4 0.8-0.4-0.8-0.8-0.4 0.8-0.4z"
        fill={BRAND_INK}
        fillOpacity={0.92}
      />
    </svg>
  );
}

function LogoWordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-baseline gap-1.5 leading-none ${className}`}
      aria-label="PriceGenie AI"
    >
      <span className="font-medium tracking-[-0.02em] text-slate-50/95">
        PriceGenie
      </span>
      <span
        className="text-[0.68em] font-semibold uppercase tracking-[0.14em]"
        style={{ color: BRAND_GOLD }}
      >
        AI
      </span>
    </span>
  );
}

export function Logo({
  variant = "full",
  layout = "horizontal",
  className = "",
  showWordmark = true,
  testId = "logo",
}: LogoProps) {
  if (variant === "icon") {
    return (
      <span data-testid={testId} className={`inline-flex ${className}`}>
        <LogoMark />
      </span>
    );
  }

  if (layout === "stacked") {
    return (
      <span
        data-testid={testId}
        className={`inline-flex flex-col items-center gap-3 ${className}`}
      >
        <LogoMark className="h-12 w-12 sm:h-14 sm:w-14" />
        {showWordmark && <LogoWordmark className="text-lg sm:text-xl" />}
      </span>
    );
  }

  return (
    <span
      data-testid={testId}
      className={`inline-flex items-center gap-2.5 ${className}`}
    >
      <LogoMark />
      {showWordmark && <LogoWordmark className="text-[15px] sm:text-base" />}
    </span>
  );
}

/** Official brand palette. */
const BRAND_GOLD = "#D4AF37";

interface LogoProps {
  variant?: "full" | "icon";
  layout?: "horizontal" | "stacked";
  className?: string;
  showWordmark?: boolean;
  testId?: string;
}

function LogoMark({ className = "h-8 w-8 sm:h-9 sm:w-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      className={`shrink-0 ${className}`}
      aria-hidden
    >
      <path
        d="M6 5h12c6.2 0 10 3.8 10 9.2S24.2 23.5 18 23.5h-5.5V31H6V5zm11.5 14c3.4 0 5.5-1.8 5.5-4.8S20.9 9.5 17.5 9.5H11v9.5h6.5z"
        fill="#E8EEF4"
      />
      <path
        d="M19.5 21.5c-.8-4.2 2.8-7.8 7-7.8 3.2 0 5.8 1.8 6.5 4.5l5 1.5c1 .3 1.6 1.3 1.3 2.3l-2 5c-.4 1-1.4 1.5-2.4 1.2l-4.5-1.5c-1.5 3.2-5.2 4.8-9 3.5-2.5-.9-4.2-3.2-3.9-5.7l-3-3.5z"
        fill="#E8EEF4"
        opacity="0.95"
      />
      <path d="M27.5 10.5l4.5-3 2.5 3.5-4.5 3-2.5-3.5z" fill={BRAND_GOLD} />
      <path
        d="M31 17.5l3.5-2.5 2 3-3.5 2.5-2-3z"
        fill={BRAND_GOLD}
        opacity="0.9"
      />
      <path d="M24 14.5l3-2 1.8 2.5-3 2-1.8-2.5z" fill="#1B2D4A" opacity="0.85" />
    </svg>
  );
}

function LogoWordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-semibold tracking-tight leading-none ${className}`}
      aria-label="PriceGenie AI"
    >
      <span className="text-slate-100">PriceGenie</span>
      <span style={{ color: BRAND_GOLD }}> AI</span>
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
        className={`inline-flex flex-col items-center gap-2.5 ${className}`}
      >
        <LogoMark className="h-12 w-12 sm:h-14 sm:w-14" />
        {showWordmark && (
          <LogoWordmark className="text-lg sm:text-xl" />
        )}
      </span>
    );
  }

  return (
    <span
      data-testid={testId}
      className={`inline-flex items-center gap-2 ${className}`}
    >
      <LogoMark />
      {showWordmark && (
        <LogoWordmark className="text-[15px] sm:text-base" />
      )}
    </span>
  );
}

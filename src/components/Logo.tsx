interface LogoProps {
  variant?: "full" | "icon";
  className?: string;
  showWordmark?: boolean;
  testId?: string;
}

function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      className={`shrink-0 text-slate-200 ${className}`}
      aria-hidden
    >
      <path
        d="M6 5h12c6.2 0 10 3.8 10 9.2S24.2 23.5 18 23.5h-5.5V31H6V5zm11.5 14c3.4 0 5.5-1.8 5.5-4.8S20.9 9.5 17.5 9.5H11v9.5h6.5z"
        fill="currentColor"
      />
      <path
        d="M19.5 21.5c-.8-4.2 2.8-7.8 7-7.8 3.2 0 5.8 1.8 6.5 4.5l5 1.5c1 .3 1.6 1.3 1.3 2.3l-2 5c-.4 1-1.4 1.5-2.4 1.2l-4.5-1.5c-1.5 3.2-5.2 4.8-9 3.5-2.5-.9-4.2-3.2-3.9-5.7l-3-3.5z"
        fill="currentColor"
        opacity="0.92"
      />
      <path
        d="M27.5 10.5l4.5-3 2.5 3.5-4.5 3-2.5-3.5z"
        fill="#2dd4bf"
      />
      <path
        d="M31 17.5l3.5-2.5 2 3-3.5 2.5-2-3z"
        fill="#fbbf24"
        opacity="0.85"
      />
    </svg>
  );
}

function LogoWordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`text-[15px] font-semibold tracking-tight leading-none ${className}`}
    >
      <span className="text-slate-100">PriceGenie</span>
      <span className="text-teal-400"> AI</span>
    </span>
  );
}

export function Logo({
  variant = "full",
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

  return (
    <span
      data-testid={testId}
      className={`inline-flex items-center gap-2 ${className}`}
    >
      <LogoMark className="h-7 w-7 sm:h-8 sm:w-8" />
      {showWordmark && <LogoWordmark />}
    </span>
  );
}

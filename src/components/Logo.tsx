import Image from "next/image";

/** Official brand palette (logo artwork). */
const BRAND_NAVY = "#1B2D4A";
const BRAND_GOLD = "#C9A227";

interface LogoProps {
  /** `full` = mark + wordmark, `icon` = mark only */
  variant?: "full" | "icon";
  /** `horizontal` for header/footer, `stacked` for login / verify */
  layout?: "horizontal" | "stacked";
  className?: string;
  showWordmark?: boolean;
  testId?: string;
  priority?: boolean;
}

function LogoWordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-bold tracking-tight leading-none ${className}`}
      aria-label="PriceGenie AI"
    >
      <span style={{ color: BRAND_NAVY }}>PriceGenie</span>
      <span style={{ color: BRAND_GOLD }}> AI</span>
    </span>
  );
}

function LogoMark({
  className = "h-9 w-9 sm:h-10 sm:w-10",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo.png"
      alt=""
      width={512}
      height={512}
      priority={priority}
      className={`shrink-0 object-cover object-top ${className}`}
      aria-hidden
    />
  );
}

export function Logo({
  variant = "full",
  layout = "horizontal",
  className = "",
  showWordmark = true,
  testId = "logo",
  priority = false,
}: LogoProps) {
  if (variant === "icon") {
    return (
      <span
        data-testid={testId}
        className={`inline-flex rounded-lg bg-white p-1 shadow-sm ${className}`}
      >
        <LogoMark className="h-8 w-8" priority={priority} />
      </span>
    );
  }

  if (layout === "stacked") {
    return (
      <span
        data-testid={testId}
        className={`inline-flex flex-col items-center gap-3 rounded-2xl bg-white px-6 py-5 shadow-lg shadow-black/20 ${className}`}
      >
        <LogoMark className="h-16 w-16 sm:h-20 sm:w-20" priority={priority} />
        {showWordmark && (
          <LogoWordmark className="text-lg sm:text-xl" />
        )}
      </span>
    );
  }

  return (
    <span
      data-testid={testId}
      className={`inline-flex items-center gap-2.5 rounded-xl bg-white px-2 py-1.5 shadow-sm sm:gap-3 sm:px-2.5 sm:py-2 ${className}`}
    >
      <LogoMark priority={priority} />
      {showWordmark && (
        <LogoWordmark className="text-[15px] sm:text-base" />
      )}
    </span>
  );
}

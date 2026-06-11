import Image from "next/image";

interface LogoProps {
  variant?: "full" | "icon";
  className?: string;
  priority?: boolean;
}

export function Logo({
  variant = "full",
  className = "",
  priority = false,
}: LogoProps) {
  if (variant === "icon") {
    return (
      <Image
        src="/logo-icon.svg"
        alt="PriceGenie AI"
        width={36}
        height={36}
        className={className}
        data-testid="logo"
        priority={priority}
      />
    );
  }

  return (
    <Image
      src="/logo.png"
      alt="PriceGenie AI"
      width={160}
      height={64}
      className={`h-10 w-auto ${className}`}
      data-testid="logo"
      priority={priority}
    />
  );
}

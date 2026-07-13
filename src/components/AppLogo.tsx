import { useId } from "react";
import { cn } from "@/lib/utils";

const SIZES = { xs: 20, sm: 24, md: 32, lg: 40 } as const;

export type AppLogoMarkProps = {
  size?: keyof typeof SIZES | number;
  className?: string;
  /** Show soft glow behind arcs */
  glow?: boolean;
};

export function AppLogoMark({ size = "md", className, glow = false }: AppLogoMarkProps) {
  const gradId = useId();
  const px = typeof size === "number" ? size : SIZES[size];

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB" />
          <stop stopColor="#38BDF8" />
        </linearGradient>
        {glow && (
          <filter id={`${gradId}-glow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>
      {glow && (
        <circle cx="16" cy="16" r="10" fill={`url(#${gradId})`} opacity="0.12" />
      )}
      <circle
        cx="16"
        cy="16"
        r="14"
        stroke={`url(#${gradId})`}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeDasharray="52 34"
        opacity="0.45"
        transform="rotate(12 16 16)"
        filter={glow ? `url(#${gradId}-glow)` : undefined}
      />
      <circle
        cx="16"
        cy="16"
        r="10.5"
        stroke={`url(#${gradId})`}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="38 24"
        opacity="0.72"
        transform="rotate(-18 16 16)"
        filter={glow ? `url(#${gradId}-glow)` : undefined}
      />
      <circle
        cx="16"
        cy="16"
        r="7"
        stroke={`url(#${gradId})`}
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeDasharray="28 16"
        opacity="0.95"
        transform="rotate(-42 16 16)"
        filter={glow ? `url(#${gradId}-glow)` : undefined}
      />
      <circle cx="16" cy="16" r="1.75" fill="white" opacity="0.95" />
      <circle cx="16" cy="16" r="1.75" fill={`url(#${gradId})`} opacity="0.35" />
    </svg>
  );
}

export type AppLogoProps = {
  subtitle?: string;
  variant?: "sidebar" | "header" | "splash";
  className?: string;
};

export function AppLogo({ subtitle, variant = "sidebar", className }: AppLogoProps) {
  const isSidebar = variant === "sidebar";
  const isSplash = variant === "splash";
  const markSize = isSplash ? "lg" : variant === "header" ? "sm" : "md";

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-3",
        isSplash && "flex-col gap-3.5 text-center",
        className,
      )}
    >
      <div
        className={cn(
          "grid shrink-0 place-items-center rounded-[11px] ring-1",
          isSidebar && "h-9 w-9 bg-[#121212] ring-white/10 lg:h-8 lg:w-8",
          isSplash && "h-12 w-12 rounded-2xl bg-[#121212]/80 ring-white/10 sm:h-14 sm:w-14",
          !isSidebar && !isSplash && "h-8 w-8 bg-[var(--min-surface)] ring-[var(--min-border)]",
        )}
      >
        <AppLogoMark size={markSize} glow={isSplash || isSidebar} />
      </div>
      <div className={cn("min-w-0", isSplash && "space-y-1")}>
        <p
          className={cn(
            "truncate font-display font-semibold tracking-tight",
            isSidebar && "text-[13px] text-white lg:text-xs",
            isSplash && "max-w-[min(100%,18rem)] text-base text-white sm:text-lg",
            !isSidebar && !isSplash && "text-[15px] text-theme",
          )}
        >
          Swotify{" "}
          <span
            className={cn(
              "font-medium",
              (isSidebar || isSplash) ? "text-[#38BDF8]" : "text-[var(--min-accent)]",
            )}
          >
            Plus
          </span>
        </p>
        {subtitle && (
          <p
            className={cn(
              "truncate text-[10px] lg:text-[9px]",
              isSidebar && "text-white/40",
              isSplash && "text-[10px] sm:text-[11px] text-white/45",
              !isSidebar && !isSplash && "text-theme-muted",
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

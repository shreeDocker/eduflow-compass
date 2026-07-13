import { cn } from "@/lib/utils";

type ProgressBarProps = {
  value: number;
  accent?: string;
  size?: "sm" | "md";
  className?: string;
};

export function ProgressBar({
  value,
  accent = "var(--sw-sapphire-500)",
  size = "sm",
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      className={cn(
        "overflow-hidden rounded-full bg-[var(--min-track)]",
        size === "sm" ? "h-2 sm:h-1.5" : "h-2.5",
        className,
      )}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{
          width: `${clamped}%`,
          background:
            accent.startsWith("var(") || accent.startsWith("#")
              ? accent
              : `linear-gradient(90deg, ${accent}, ${accent})`,
        }}
      />
    </div>
  );
}

type ProgressBadgeProps = {
  value: number;
  tone?: "sapphire" | "gold" | "emerald" | "coral";
  label?: string;
};

const toneMap = {
  sapphire: {
    bg: "color-mix(in oklab, var(--min-accent) 14%, var(--min-surface))",
    text: "var(--min-text-accent)",
  },
  gold: {
    bg: "color-mix(in oklab, var(--min-orange) 14%, var(--min-surface))",
    text: "var(--min-text-warning)",
  },
  emerald: {
    bg: "color-mix(in oklab, var(--min-green) 14%, var(--min-surface))",
    text: "var(--min-text-success)",
  },
  coral: {
    bg: "color-mix(in oklab, var(--min-text-danger) 14%, var(--min-surface))",
    text: "var(--min-text-danger)",
  },
};

export function ProgressBadge({ value, tone = "sapphire", label }: ProgressBadgeProps) {
  const resolvedTone =
    value >= 90 ? "emerald" : value >= 70 ? "sapphire" : value >= 50 ? "gold" : "coral";
  const c = toneMap[tone === "sapphire" ? resolvedTone : tone];

  const badge = (
    <span
      className="rounded-full px-2.5 py-1 font-mono text-[13px] font-medium sm:px-2 sm:py-0.5 sm:text-[10px] lg:text-[9px]"
      style={{ backgroundColor: c.bg, color: c.text }}
      data-metric
    >
      {value}%
    </span>
  );

  if (!label) {
    return <span className="shrink-0">{badge}</span>;
  }

  return (
    <div className="flex shrink-0 flex-col items-center">
      {badge}
      <p className="mt-0.5 whitespace-nowrap text-center text-[10px] font-medium text-theme-muted">
        {label}
      </p>
    </div>
  );
}

export function progressTone(value: number): "emerald" | "sapphire" | "gold" | "coral" {
  if (value >= 90) return "emerald";
  if (value >= 70) return "sapphire";
  if (value >= 50) return "gold";
  return "coral";
}

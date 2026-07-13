import { cn } from "@/lib/utils";

type ProgressRingProps = {
  value: number;
  label: string;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  className?: string;
  suffix?: string;
  displayValue?: string;
};

export function ProgressRing({
  value,
  label,
  size = 88,
  stroke = 7,
  color = "var(--min-accent)",
  trackColor = "var(--min-track)",
  className,
  suffix,
  displayValue,
}: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={trackColor}
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="font-mono text-base font-semibold text-theme sm:text-sm" data-metric>
            {displayValue ?? `${value}${suffix ?? "%"}`}
          </span>
        </div>
      </div>
      <span className="text-[13px] text-theme-muted sm:text-[11px]">{label}</span>
    </div>
  );
}

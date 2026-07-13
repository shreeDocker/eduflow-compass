import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type ProgressSliderProps = {
  value: number;
  onChange: (value: number) => void;
  accent?: string;
  className?: string;
  "aria-label"?: string;
  disabled?: boolean;
};

export function ProgressSlider({
  value,
  onChange,
  accent = "var(--min-accent)",
  className,
  "aria-label": ariaLabel,
  disabled,
}: ProgressSliderProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn("progress-slider", className)}
      style={{ "--slider-accent": accent } as CSSProperties}
    >
      <div className="progress-slider__track" aria-hidden>
        <div className="progress-slider__fill" style={{ width: `${clamped}%` }} />
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={clamped}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="progress-slider__input"
        aria-label={ariaLabel}
      />
    </div>
  );
}

import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ProgressSlider } from "@/components/ProgressSlider";
import { SwipeToComplete } from "@/components/SwipeToComplete";

type TopicProgressCardProps = {
  label: string;
  progress: number;
  onProgressChange: (value: number) => void;
  onComplete?: () => void;
  editable?: boolean;
  isCurrent?: boolean;
  /** Tracker layout: wider slider + swipe-to-complete row */
  variant?: "compact" | "tracker";
  footer?: ReactNode;
};

export function TopicProgressCard({
  label,
  progress,
  onProgressChange,
  onComplete,
  editable = true,
  isCurrent = false,
  variant = "compact",
  footer,
}: TopicProgressCardProps) {
  const done = progress >= 100;
  const isTracker = variant === "tracker";
  const accent = done ? "var(--min-green)" : "var(--min-accent)";

  function handleSlider(v: number) {
    if (!editable) return;
    const prev = progress;
    onProgressChange(v);
    if (v >= 100 && prev < 100) onComplete?.();
  }

  function markComplete() {
    if (!editable || done) return;
    onProgressChange(100);
    onComplete?.();
  }

  if (isTracker) {
    return (
      <div
        className={cn(
          "rounded-xl border bg-[var(--min-surface)] p-4 transition-colors max-lg:border-none",
          isCurrent
            ? "border-[var(--min-orange)] ring-1 ring-[color-mix(in_oklab,var(--min-orange)_35%,transparent)]"
            : "border-[var(--min-border)]",
          done && "topic-done-card",
        )}
        style={
          done
            ? { borderLeftWidth: 3, borderLeftColor: "var(--min-green)" }
            : !isCurrent
              ? { borderLeftWidth: 3, borderLeftColor: "var(--min-border-strong, var(--min-border))" }
              : undefined
        }
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-2">
            {done && (
              <span className="topic-done-check mt-0.5" aria-hidden>
                <Check className="h-3 w-3" strokeWidth={2.5} />
              </span>
            )}
            <p
              className={cn(
                "min-w-0 flex-1 text-[17px] font-medium leading-snug",
                done ? "topic-done-label" : "text-theme",
              )}
            >
              {label}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {!done && editable && (
              <button
                type="button"
                onClick={markComplete}
                className="rounded-full bg-[var(--min-green)] px-3 py-1.5 text-[13px] font-semibold text-[var(--min-bg)] transition-opacity active:opacity-80"
              >
                Done
              </button>
            )}
            <span
              className={cn(
                "tabular-nums text-[15px] font-medium",
                done ? "text-theme-success" : "text-theme-muted",
              )}
              data-metric
            >
              {progress}%
            </span>
          </div>
        </div>

        {editable && !done && (
          <ProgressSlider
            value={progress}
            onChange={handleSlider}
            accent={accent}
            className="mt-3"
            aria-label={`${label} completion`}
          />
        )}

        {editable && !done && (
          <div className="mt-3">
            <SwipeToComplete done={done} onComplete={markComplete} />
          </div>
        )}

        {footer}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-row flex items-center gap-3 py-3 transition-colors",
        done && "opacity-95",
      )}
    >
      <button
        type="button"
        disabled={!editable || done}
        onClick={markComplete}
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-full text-[var(--min-bg)] transition-colors sm:h-8 sm:w-8",
          done ? "bg-[var(--min-green)]" : "bg-[var(--min-surface-hover)] text-theme active:bg-[var(--min-accent)]",
          !editable && "cursor-default opacity-60",
        )}
        aria-label={done ? "Completed" : `Mark ${label} complete`}
      >
        {done ? (
          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
        ) : (
          <span className="h-2.5 w-2.5 rounded-full border-2 border-[var(--min-text-faint)]" />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-[17px] sm:text-base",
            done ? "topic-done-label" : "text-theme",
          )}
        >
          {label}
        </p>
        {editable && !done && (
          <ProgressSlider
            value={progress}
            onChange={handleSlider}
            accent={accent}
            className="mt-2 max-w-full"
            aria-label={`${label} completion`}
          />
        )}
      </div>

      <span
        className={cn(
          "w-10 shrink-0 text-right tabular-nums text-[13px] font-medium sm:w-9",
          done ? "text-theme-success" : "text-theme-muted",
        )}
        data-metric
      >
        {progress}%
      </span>
    </div>
  );
}

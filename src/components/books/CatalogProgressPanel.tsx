import { User } from "lucide-react";
import { ProgressBar, ProgressBadge, progressTone } from "@/components/syllabus/ProgressBar";
import type { CatalogProgressRow } from "@/lib/syllabus-utils";
import { formatTeachingSpot } from "@/lib/syllabus-utils";
import { cn } from "@/lib/utils";

type CatalogProgressPanelProps = {
  title: string;
  hint: string;
  rows: CatalogProgressRow[];
  highlightGradeId?: string;
  className?: string;
};

export function CatalogProgressPanel({
  title,
  hint,
  rows,
  highlightGradeId,
  className,
}: CatalogProgressPanelProps) {
  if (rows.length === 0) return null;

  const multi = rows.length > 1;

  return (
    <div
      className={cn(
        "rounded-[8px] border border-[var(--sw-sapphire-200)] bg-[var(--sw-sapphire-50)]/60 p-3",
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--sw-sapphire-700)]">
        {title}
      </p>
      <p className="mt-0.5 text-[11px] text-theme-muted">{hint}</p>

      <ul className="mt-2.5 space-y-2">
        {rows.map((row) => {
          const tone = progressTone(row.progress);
          const accent =
            tone === "emerald"
              ? "var(--sw-emerald-500)"
              : tone === "sapphire"
                ? "var(--sw-sapphire-500)"
                : tone === "gold"
                  ? "var(--sw-gold-500)"
                  : "var(--sw-coral-500)";
          const isCurrent = highlightGradeId === row.gradeId;

          return (
            <li
              key={`${row.gradeId}-${row.teacherId}`}
              className={cn(
                "rounded-[8px] border border-[var(--min-border)] bg-[var(--min-surface)] px-3 py-2.5",
                isCurrent
                  ? "border-[var(--sw-sapphire-300)] ring-1 ring-[var(--sw-sapphire-200)]"
                  : "border-[var(--min-border)]",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-theme">
                    {row.displayName}
                    {isCurrent && multi && (
                      <span className="ml-1.5 text-[10px] font-normal text-[var(--sw-sapphire-600)]">
                        (this class)
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[10px] text-theme-muted">
                    <User className="h-3 w-3 shrink-0" />
                    {row.teacherName}
                  </p>
                  {row.currentSpot && (
                    <p className="mt-1 truncate text-[10px] text-[var(--sw-gold-700)]">
                      {row.currentSpot.isLive ? "Now" : "Next"}: {formatTeachingSpot(row.currentSpot)}
                    </p>
                  )}
                </div>
                <ProgressBadge value={row.progress} />
              </div>
              <ProgressBar value={row.progress} accent={accent} size="sm" className="mt-2" />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

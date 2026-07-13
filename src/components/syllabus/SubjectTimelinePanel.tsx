import { Calendar, Flag } from "lucide-react";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { useSyllabusTimeline, timelineSetByLabel } from "@/lib/syllabus-timeline-context";
import type { SubjectPath } from "@/lib/syllabus-timeline-keys";
import {
  daysRemaining,
  formatLongDate,
  statusLabel,
  statusTone,
  timelineElapsedPercent,
  timelineStatus,
} from "@/lib/syllabus-timeline-utils";
import { cn } from "@/lib/utils";

type SubjectTimelinePanelProps = {
  path: SubjectPath;
  subjectName: string;
  progress: number;
  className?: string;
  embedded?: boolean;
};

export function SubjectTimelinePanel({
  path,
  subjectName,
  progress,
  className,
  embedded = false,
}: SubjectTimelinePanelProps) {
  const { getSubjectTimeline, setSubjectTimeline } = useSyllabusTimeline();
  const entry = getSubjectTimeline(path);
  const dueDate = entry?.dueDate;
  const status = timelineStatus(dueDate, progress);
  const tone = statusTone(status);
  const elapsed = entry ? timelineElapsedPercent(entry) : 0;
  const setBy = timelineSetByLabel(entry);

  if (embedded && progress >= 100) return null;

  return (
    <div className={cn(embedded ? "" : "timeline-glass mx-3 mb-3 p-4 sm:mx-4", className)}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium text-theme-muted">
        <Flag className="h-4 w-4 shrink-0 text-theme-accent" strokeWidth={2} />
        <span className="min-w-0">Timeline</span>
        {setBy && (
          <span className="ml-auto max-w-full truncate rounded-full bg-[color-mix(in_oklab,var(--min-accent)_12%,transparent)] px-2 py-0.5 text-[11px] text-theme-accent">
            {setBy}
          </span>
        )}
      </div>

      {!embedded && <p className="mt-1 text-[15px] font-medium text-theme">{subjectName}</p>}

      {progress < 100 && (
        <label
          className={cn(
            "timeline-field flex flex-wrap items-center gap-x-3 gap-y-2",
            embedded ? "mt-2" : "mt-3",
          )}
        >
          <Calendar className="h-4 w-4 shrink-0 text-theme-muted" strokeWidth={2} />
          <span className="shrink-0 text-[13px] text-theme-muted">Complete by</span>
          <input
            type="date"
            value={dueDate ?? ""}
            onChange={(e) => setSubjectTimeline(path, e.target.value || null)}
            className="timeline-date-input min-w-0 flex-1"
            aria-label={`${subjectName} completion date`}
          />
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
            style={{
              color: tone,
              backgroundColor: `color-mix(in oklab, ${tone} 14%, transparent)`,
            }}
          >
            {statusLabel(status, dueDate)}
          </span>
        </label>
      )}

      {embedded ? (
        dueDate && status !== "complete" && daysRemaining(dueDate) >= 0 && (
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-[var(--min-track)]">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${elapsed}%`, backgroundColor: tone }}
            />
          </div>
        )
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <ProgressRing
              value={dueDate ? elapsed : progress}
              label={dueDate ? "Time used" : "Progress"}
              size={72}
              stroke={5}
              color={tone}
              displayValue={dueDate ? `${elapsed}%` : `${progress}%`}
              className="shrink-0"
            />

            <div className="min-w-0 flex-1 space-y-2">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-theme-faint">Status</p>
                <p className="text-[15px] font-semibold" style={{ color: tone }}>
                  {statusLabel(status, dueDate)}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-theme-faint">Progress</p>
                <p className="text-[15px] font-medium text-theme">{progress}% complete</p>
              </div>
              {dueDate && (
                <p className="text-[12px] text-theme-muted">{formatLongDate(dueDate)}</p>
              )}
              {!dueDate && (
                <p className="text-[12px] leading-relaxed text-theme-muted">
                  Set a target date for this class to finish the subject.
                </p>
              )}
            </div>
          </div>

          {dueDate && status !== "complete" && daysRemaining(dueDate) >= 0 && (
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--min-track)]">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{ width: `${elapsed}%`, backgroundColor: tone }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

import { Calendar } from "lucide-react";
import { useSyllabusTimeline, timelineSetByLabel } from "@/lib/syllabus-timeline-context";
import {
  statusLabel,
  statusTone,
  timelineElapsedPercent,
  timelineStatus,
} from "@/lib/syllabus-timeline-utils";
import { cn } from "@/lib/utils";

type TopicDeadlineFieldProps = {
  path: {
    gradeId: string;
    subjectId: string;
    chapterId: string;
    topicId: string;
  };
  progress: number;
  className?: string;
  variant?: "panel" | "inline";
};

export function TopicDeadlineField({
  path,
  progress,
  className,
  variant = "panel",
}: TopicDeadlineFieldProps) {
  const { getTopicTimeline, setTopicTimeline } = useSyllabusTimeline();
  const entry = getTopicTimeline(path);
  const dueDate = entry?.dueDate;
  const status = timelineStatus(dueDate, progress);
  const tone = statusTone(status);
  const elapsed = entry ? timelineElapsedPercent(entry) : 0;
  const setBy = timelineSetByLabel(entry);

  const isInline = variant === "inline";

  if (progress >= 100) return null;

  if (isInline) {
    return (
      <div className={cn("flex flex-wrap items-center gap-x-2 gap-y-1", className)}>
        <label className="inline-flex max-w-full flex-wrap items-center gap-1.5">
          <Calendar className="h-3 w-3 shrink-0 text-theme-muted" strokeWidth={2} />
          <span className="text-[11px] text-theme-muted">Due</span>
          <input
            type="date"
            value={dueDate ?? ""}
            onChange={(e) => setTopicTimeline(path, e.target.value || null)}
            className="timeline-date-input timeline-date-input--compact"
            aria-label="Topic due date"
          />
        </label>
        <span
          className="rounded-full px-1.5 py-px text-[10px] font-medium leading-tight"
          style={{
            color: tone,
            backgroundColor: `color-mix(in oklab, ${tone} 14%, transparent)`,
          }}
        >
          {statusLabel(status, dueDate, undefined, true)}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("timeline-glass-subtle mt-2 px-3 py-2.5", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <Calendar className="h-3.5 w-3.5 shrink-0 text-theme-muted" strokeWidth={2} />
          <span className="shrink-0 text-[12px] text-theme-muted">Due</span>
          <input
            type="date"
            value={dueDate ?? ""}
            onChange={(e) => setTopicTimeline(path, e.target.value || null)}
            className="timeline-date-input min-w-0 flex-1 text-[13px]"
            aria-label="Topic due date"
          />
        </label>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
          style={{
            color: tone,
            backgroundColor: `color-mix(in oklab, ${tone} 14%, transparent)`,
          }}
        >
          {statusLabel(status, dueDate)}
        </span>
        {setBy && <span className="text-[10px] text-theme-faint">{setBy}</span>}
      </div>

      {dueDate && progress < 100 && (
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--min-track)]">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${elapsed}%`, backgroundColor: tone }}
            />
          </div>
          <span className="font-mono text-[10px] text-theme-faint" data-metric>
            {elapsed}%
          </span>
        </div>
      )}
    </div>
  );
}

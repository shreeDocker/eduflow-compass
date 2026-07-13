import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { SyllabusGrade } from "@/lib/syllabus-data";
import { buildDailyTeachingLogs } from "@/lib/syllabus-utils";

type DailyTeachingLogsProps = {
  grades: SyllabusGrade[];
  teacherId?: string;
  className?: string;
};

const statusLabel = {
  done: "Logged",
  current: "In progress",
  upcoming: "Scheduled",
} as const;

export function DailyTeachingLogs({ grades, teacherId, className }: DailyTeachingLogsProps) {
  const logs = useMemo(() => {
    const all = buildDailyTeachingLogs(grades);
    return teacherId ? all.filter((l) => l.teacherId === teacherId) : all;
  }, [grades, teacherId]);
  const dateLabel = logs[0]?.date ?? "Today";
  const logged = logs.filter((l) => l.hasCoverage).length;

  if (logs.length === 0) {
    return (
      <section className={cn(className)}>
        <p className="min-card px-4 py-6 text-center text-sm text-theme-muted">
          No classes scheduled today.
        </p>
      </section>
    );
  }

  return (
    <section className={cn(className)}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[15px] font-medium text-theme">{dateLabel}</p>
        <span className="font-mono text-[13px] text-theme-muted sm:text-[11px]" data-metric>
          {logged}/{logs.length} with topics
        </span>
      </div>

      <ul className="space-y-2">
        {logs.map((log) => (
          <li key={log.id} className="min-row p-3">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--min-surface-hover)] font-mono text-[11px] font-semibold text-theme-muted">
                P{log.period}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {!teacherId && <p className="text-sm font-medium text-theme">{log.teacherName}</p>}
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium",
                      log.status === "done" && "bg-[var(--min-green)]/15 text-theme-success",
                      log.status === "current" && "bg-[var(--min-orange)]/15 text-theme-warning",
                      log.status === "upcoming" && "bg-white/5 text-theme-faint",
                    )}
                  >
                    {statusLabel[log.status]}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-theme-muted">
                  {log.timeRange} · {log.classLabel}
                </p>
                <p className="mt-1 text-xs text-theme">
                  <span className="text-theme-muted">Chapter:</span> {log.chapterTitle}
                </p>
                {log.topicsCovered.length > 0 ? (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {log.topicsCovered.map((topic) => (
                      <li
                        key={topic}
                        className="rounded-md bg-[color-mix(in_oklab,var(--min-accent)_12%,var(--min-surface))] px-2 py-0.5 text-[11px] text-theme-accent"
                      >
                        {topic}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-[11px] italic text-theme-faint">No topics logged yet</p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

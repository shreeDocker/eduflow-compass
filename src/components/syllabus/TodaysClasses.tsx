import { Link } from "@tanstack/react-router";
import { Clock, ChevronRight } from "lucide-react";
import type { ClassSession } from "@/lib/mock-data";
import { statusMeta } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type TodaysClassesProps = {
  sessions: ClassSession[];
  className?: string;
};

const statusLabel: Record<ClassSession["status"], string> = {
  current: "Now",
  upcoming: "Upcoming",
  done: "Done",
};

export function TodaysClasses({ sessions, className }: TodaysClassesProps) {
  if (sessions.length === 0) return null;

  return (
    <section className={cn("mb-5", className)}>
      <p className="sw-section-label mb-3">Today&apos;s classes</p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {sessions.map((cls) => {
          const accent =
            cls.status === "current"
              ? "var(--sw-emerald-500)"
              : cls.status === "done"
                ? "var(--sw-surface-300)"
                : "var(--sw-sapphire-500)";

          return (
            <li key={cls.id}>
              <Link
                to="/class/$id"
                params={{ id: cls.id }}
                className={cn(
                  "card-elevated card-elevated-hover flex items-center gap-3 p-4 transition-colors",
                  cls.status === "current" && "ring-1 ring-[var(--sw-emerald-200)]",
                )}
                style={{ borderLeft: `3px solid ${accent}` }}
              >
                <div
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] font-mono text-xs font-semibold"
                  style={{
                    backgroundColor: `color-mix(in oklab, ${accent} 12%, var(--min-bg))`,
                    color: accent,
                  }}
                >
                  <Clock className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-semibold text-theme">
                    Grade {cls.grade}
                    {cls.section} · {cls.subject}
                  </p>
                  <p className="mt-0.5 text-[11px] text-theme-muted">
                    {cls.time}
                    {cls.attendance && (
                      <span>
                        {" "}
                        · {cls.attendance.present}/{cls.attendance.total} present
                      </span>
                    )}
                  </p>
                </div>
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                  style={{
                    backgroundColor: `color-mix(in oklab, ${statusMeta[cls.status === "done" ? "completed" : cls.status === "current" ? "teaching" : "planned"].token} 12%, var(--min-bg))`,
                    color: statusMeta[cls.status === "done" ? "completed" : cls.status === "current" ? "teaching" : "planned"].token,
                  }}
                >
                  {statusLabel[cls.status]}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-theme-muted" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

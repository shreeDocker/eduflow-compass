import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { SyllabusGrade } from "@/lib/syllabus-data";
import {
  findCurrentTeachingSpot,
  findSubjectInGrade,
  formatTeachingSpot,
  type TeacherAssignmentRow,
  type TeacherProgressSummary,
} from "@/lib/syllabus-utils";
import { statusMeta } from "@/lib/mock-data";
import { subjectLineColors } from "@/lib/metro-utils";
import { DailyTeachingLogs } from "@/components/admin/DailyTeachingLogs";
import { CurrentTopicChip } from "@/components/books/CurrentTopicChip";
import { ProgressBadge, ProgressBar } from "@/components/syllabus/ProgressBar";
import { cn } from "@/lib/utils";

type TeacherDetailViewProps = {
  teacher: TeacherProgressSummary;
  grades: SyllabusGrade[];
};

export function TeacherDetailView({ teacher, grades }: TeacherDetailViewProps) {
  const tone =
    teacher.status === "ahead"
      ? statusMeta.completed.token
      : teacher.status === "delayed"
        ? statusMeta.delayed.token
        : statusMeta.planned.token;
  const StatusIcon =
    teacher.status === "ahead" ? TrendingUp : teacher.status === "delayed" ? TrendingDown : Minus;

  const totalChapters = teacher.assignments.reduce((n, a) => n + a.chapters.total, 0);
  const doneChapters = teacher.assignments.reduce((n, a) => n + a.chapters.completed, 0);
  const totalTopics = teacher.assignments.reduce((n, a) => n + a.topics.total, 0);
  const doneTopics = teacher.assignments.reduce((n, a) => n + a.topics.completed, 0);

  const liveSpot = teacher.assignments
    .map((a) => {
      const subject = findSubjectInGrade(grades, a.gradeId, a.subjectId);
      return subject ? findCurrentTeachingSpot(subject) : null;
    })
    .find((s) => s?.isLive);

  return (
    <div className="space-y-5">
      <section className="min-card p-4">
        <div className="flex items-start gap-3">
          <div
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-sm font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, var(--sw-sapphire-600), var(--sw-violet-600))",
            }}
          >
            {teacher.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-[20px] font-semibold text-theme">{teacher.name}</h2>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium capitalize"
                style={{
                  backgroundColor: `color-mix(in oklab, ${tone} 12%, var(--min-bg))`,
                  color: tone,
                }}
              >
                <StatusIcon className="h-3 w-3" />
                {teacher.status.replace("-", " ")}
              </span>
            </div>
            <p className="mt-1 text-[13px] text-theme-muted">
              {teacher.subjects.join(", ")} · Sections {teacher.sections.join(", ")}
            </p>
          </div>
          <ProgressBadge value={teacher.progress} label="Overall progress" />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <ProgressBar value={teacher.progress} accent="var(--sw-gold-500)" className="flex-1" />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <StatPill label="Classes" value={`${teacher.assignments.length}`} />
          <StatPill label="Chapters" value={`${doneChapters}/${totalChapters}`} />
          <StatPill label="Topics" value={`${doneTopics}/${totalTopics}`} />
        </div>

        {liveSpot && (
          <div className="mt-4 rounded-xl border border-[var(--min-border)] bg-[var(--min-surface)] px-3 py-2.5">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-theme-muted">
              Teaching now
            </p>
            <CurrentTopicChip spot={liveSpot} />
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-theme-label">Classes handled</h3>
        {teacher.assignments.length === 0 ? (
          <p className="min-card px-4 py-6 text-center text-sm text-theme-muted">
            No classes assigned yet.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {teacher.assignments.map((a) => {
              const subject = findSubjectInGrade(grades, a.gradeId, a.subjectId);
              const spot = subject ? findCurrentTeachingSpot(subject) : null;

              return (
                <li key={`${a.gradeId}-${a.subjectId}`}>
                  <TeacherClassCard assignment={a} spot={spot} />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-theme-label">Today&apos;s logs</h3>
        <DailyTeachingLogs grades={grades} teacherId={teacher.id} />
      </section>
    </div>
  );
}

function TeacherClassCard({
  assignment: a,
  spot,
}: {
  assignment: TeacherAssignmentRow;
  spot: ReturnType<typeof findCurrentTeachingSpot>;
}) {
  const colors = subjectLineColors(a.subjectName);
  const classBadge = `${a.className.replace("Grade ", "")}${a.section}`;

  return (
    <Link
      to="/books/$gradeId/$subjectId"
      params={{ gradeId: a.gradeId, subjectId: a.subjectId }}
      className="block rounded-[8px] border border-[var(--min-border)] bg-[var(--min-surface)] px-2.5 py-2 transition-colors active:bg-[var(--min-surface-hover)]"
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-[10px] font-semibold uppercase tracking-wide"
          style={{ color: colors.color }}
        >
          {classBadge}
        </span>
        <span
          className="font-mono text-[12px] font-semibold"
          style={{ color: colors.color }}
          data-metric
        >
          {a.progress}%
        </span>
      </div>

      <p className="mt-0.5 truncate text-[13px] font-semibold text-theme">{a.subjectName}</p>
      <p className="truncate text-[10px] text-theme-muted">
        {a.className} · Sec {a.section}
      </p>

      <ProgressBar value={a.progress} accent={colors.color} size="sm" className="mt-1.5" />

      <div className="mt-1.5 grid grid-cols-2 gap-2">
        <div>
          <p className="text-[9px] font-medium uppercase tracking-wide text-theme-faint">
            Chapters covered
          </p>
          <p className="font-mono text-[11px] font-semibold text-theme" data-metric>
            {a.chapters.completed}/{a.chapters.total}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-medium uppercase tracking-wide text-theme-faint">
            Topics covered
          </p>
          <p className="font-mono text-[11px] font-semibold text-theme" data-metric>
            {a.topics.completed}/{a.topics.total}
          </p>
        </div>
      </div>

      {spot && (
        <div className="mt-1.5 border-t border-[var(--min-border)] pt-1.5">
          <p className="text-[9px] font-medium uppercase tracking-wide text-theme-faint">
            {spot.isLive ? "Current topic" : "Up next"}
          </p>
          <p className="mt-0.5 truncate text-[10px] font-medium text-theme" title={formatTeachingSpot(spot)}>
            {formatTeachingSpot(spot)}
          </p>
        </div>
      )}
    </Link>
  );
}

function StatPill({
  label,
  value,
  accent,
  className,
}: {
  label: string;
  value: string;
  accent?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg bg-[var(--min-bg)] px-2 py-2 text-center", className)}>
      <p className="text-[10px] font-medium uppercase tracking-wide text-theme-muted">{label}</p>
      <p
        className="mt-0.5 font-mono text-sm font-semibold text-theme"
        style={accent ? { color: accent } : undefined}
        data-metric
      >
        {value}
      </p>
    </div>
  );
}

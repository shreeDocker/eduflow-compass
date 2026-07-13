import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import type { SyllabusGrade } from "@/lib/syllabus-data";
import { subjectProgress } from "@/lib/syllabus-utils";
import { ProgressBadge } from "./ProgressBar";

type TeacherTopicTrackerProps = {
  grades: SyllabusGrade[];
};

function buildRows(grades: SyllabusGrade[]) {
  return grades.flatMap((grade) =>
    grade.subjects.map((subject) => ({
      key: `${grade.id}-${subject.id}`,
      gradeId: grade.id,
      subjectId: subject.id,
      label: `${grade.label} ${grade.section} · ${subject.name}`,
      chapterCount: subject.chapters.length,
      progress: subjectProgress(subject),
    })),
  );
}

export function TeacherTopicTracker({ grades }: TeacherTopicTrackerProps) {
  const rows = useMemo(() => buildRows(grades), [grades]);

  if (rows.length === 0) {
    return (
      <div className="card-elevated space-y-3 p-6 text-left">
        <p className="text-[15px] text-theme-muted">No syllabus assigned to your account yet.</p>
        <p className="text-[13px] text-theme-faint">
          Check back after your admin assigns classes, or open Profile to confirm your account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-left">
      {rows.map((row) => (
        <Link
          key={row.key}
          to="/books/$gradeId/$subjectId"
          params={{ gradeId: row.gradeId, subjectId: row.subjectId }}
          className="tracker-class-card block w-full text-left"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-display text-[17px] font-semibold leading-snug text-theme">
                {row.label}
              </p>
              <p className="mt-1 text-[15px] text-theme-muted">
                {row.chapterCount} chapter{row.chapterCount === 1 ? "" : "s"}
              </p>
            </div>
            <ProgressBadge value={row.progress} />
          </div>
        </Link>
      ))}
    </div>
  );
}

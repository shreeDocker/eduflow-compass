import { Link } from "@tanstack/react-router";
import type { SyllabusGrade } from "@/lib/syllabus-data";
import { teacherDirectory } from "@/lib/syllabus-data";
import {
  listTeacherSummaries,
  type TeacherProgressSummary,
} from "@/lib/syllabus-utils";
import { ProgressBadge } from "@/components/syllabus/ProgressBar";

type TeacherProgressViewProps = {
  grades: SyllabusGrade[];
  teachers?: TeacherProgressSummary[];
  linkToDetail?: boolean;
};

export function TeacherProgressView({
  grades,
  teachers: teachersProp,
  linkToDetail = true,
}: TeacherProgressViewProps) {
  const teachers =
    teachersProp ??
    listTeacherSummaries(grades, teacherDirectory)
      .filter((t) => t.assignments.length > 0)
      .sort((a, b) => b.progress - a.progress);

  if (teachers.length === 0) {
    return (
      <p className="rounded-[10px] border border-dashed border-[var(--min-border)] px-4 py-8 text-center text-sm text-theme-muted">
        No teacher assignments found.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {teachers.map((teacher) => (
        <li key={teacher.id}>
          <TeacherRow teacher={teacher} linkToDetail={linkToDetail} />
        </li>
      ))}
    </ul>
  );
}

function TeacherRow({
  teacher,
  linkToDetail,
}: {
  teacher: TeacherProgressSummary;
  linkToDetail: boolean;
}) {
  const content = (
    <>
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--min-surface-hover)] text-xs font-semibold text-theme-muted">
        {teacher.initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-theme sm:text-sm">{teacher.name}</p>
        <p className="mt-0.5 text-[13px] text-theme-muted sm:text-[11px]">
          {teacher.assignments.length} class{teacher.assignments.length !== 1 ? "es" : ""}
        </p>
      </div>
      <ProgressBadge value={teacher.progress} label="Overall progress" />
    </>
  );

  if (linkToDetail) {
    return (
      <Link
        to="/admin/teachers/$teacherId"
        params={{ teacherId: teacher.id }}
        className="min-row flex items-center gap-3 py-3 text-theme transition-colors active:bg-[var(--min-surface-hover)]"
      >
        {content}
      </Link>
    );
  }

  return <div className="min-row flex items-center gap-3 py-3">{content}</div>;
}

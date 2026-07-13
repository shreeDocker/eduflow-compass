import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import type { SyllabusGrade } from "@/lib/syllabus-data";
import { teacherDirectory } from "@/lib/syllabus-data";
import {
  hasExplicitSubjectAssignment,
  listTeachersForGradeSubject,
} from "@/lib/syllabus-utils";
import {
  subjectAssignmentKey,
  type SubjectAssignmentsMap,
} from "@/lib/subject-assignments-context";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type SubjectAssignPickerProps = {
  gradeLabel: string;
  subjectId: string;
  subjectName?: string;
  grades: SyllabusGrade[];
  assignments: SubjectAssignmentsMap;
  onAssign: (assignedTeacherIds: string[] | null) => void;
  className?: string;
  compact?: boolean;
  inline?: boolean;
};

function selectionSummary(
  selectedIds: string[],
  teachers: ReturnType<typeof listTeachersForGradeSubject>,
): string {
  if (selectedIds.length === 0) return "No teachers selected";
  if (selectedIds.length === teachers.length && teachers.length > 1) {
    return "All teachers";
  }
  if (selectedIds.length === 1) {
    const teacher = teachers.find((t) => t.teacherId === selectedIds[0]);
    return teacher?.teacherName ?? "1 teacher";
  }
  const names = selectedIds
    .map((id) => teachers.find((t) => t.teacherId === id)?.teacherName)
    .filter(Boolean) as string[];
  if (names.length <= 2) return names.join(", ");
  return `${names[0]} +${names.length - 1} more`;
}

export function SubjectAssignPicker({
  gradeLabel,
  subjectId,
  subjectName,
  grades,
  assignments,
  onAssign,
  className,
  compact = false,
  inline = false,
}: SubjectAssignPickerProps) {
  const teachers = useMemo(
    () => listTeachersForGradeSubject(grades, gradeLabel, subjectId),
    [grades, gradeLabel, subjectId],
  );

  const assignEnabled = hasExplicitSubjectAssignment(gradeLabel, subjectId, assignments);
  const key = subjectAssignmentKey(gradeLabel, subjectId);
  const selectedIds = assignEnabled ? (assignments[key] ?? []) : [];

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredTeachers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter((t) => {
      const haystack = `${t.teacherName} ${t.sections.join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [teachers, query]);

  if (teachers.length === 0) return null;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setQuery("");
  }

  function toggleTeacher(teacherId: string, checked: boolean) {
    const base = assignEnabled ? selectedIds : [];
    const next = checked
      ? [...new Set([...base, teacherId])]
      : base.filter((id) => id !== teacherId);
    onAssign(next);
  }

  function selectAll() {
    onAssign(teachers.map((t) => t.teacherId));
  }

  function clearAll() {
    onAssign([]);
  }

  function clearAssignment() {
    onAssign(null);
    setOpen(false);
    setQuery("");
  }

  const statusLabel = assignEnabled
    ? selectionSummary(selectedIds, teachers)
    : "Not assigned";

  function popoverBody() {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="px-0.5">
          <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-theme-muted">
            {subjectName ? `${subjectName}` : "Assign teachers"}
          </p>
          <p className="truncate text-[10px] text-theme-faint">{statusLabel}</p>
        </div>

        <label className="flex items-center gap-1.5 rounded-md border border-[var(--min-border)] bg-[var(--min-bg)] px-2 py-1">
          <Search className="h-3 w-3 shrink-0 text-theme-faint" strokeWidth={2} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search staff…"
            className="min-w-0 flex-1 border-none bg-transparent text-[11px] text-theme outline-none placeholder:text-theme-faint"
            aria-label="Search teachers"
          />
        </label>

        <div className="flex items-center justify-between px-0.5 text-[10px]">
          <span className="text-theme-faint">
            {filteredTeachers.length}/{teachers.length}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="font-medium text-[var(--min-accent)] active:opacity-70"
              onClick={selectAll}
            >
              All
            </button>
            <button
              type="button"
              className="text-theme-muted active:opacity-70"
              onClick={clearAll}
            >
              None
            </button>
          </div>
        </div>

        <ul className="max-h-[min(11rem,calc(100dvh-12rem))] space-y-0.5 overflow-y-auto">
          {filteredTeachers.length === 0 ? (
            <li className="px-1 py-2 text-center text-[10px] text-theme-muted">No matches</li>
          ) : (
            filteredTeachers.map((t) => {
              const checked = assignEnabled && selectedIds.includes(t.teacherId);
              const initials = teacherDirectory[t.teacherId]?.initials ?? t.teacherName[0];
              const sectionLabel =
                t.sections.length > 0 ? `Sec ${t.sections.join(", ")}` : "Staff";

              return (
                <li key={t.teacherId}>
                  <label className="flex cursor-pointer items-center gap-1.5 rounded-md px-1 py-1 active:bg-[color-mix(in_oklab,var(--min-accent)_6%,transparent)]">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) => toggleTeacher(t.teacherId, value === true)}
                      className="h-3.5 w-3.5"
                    />
                    <span
                      className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[color-mix(in_oklab,var(--min-accent)_12%,var(--min-surface))] text-[8px] font-semibold text-[var(--min-accent)]"
                      aria-hidden
                    >
                      {initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-medium leading-tight text-theme">
                        {t.teacherName}
                      </span>
                      <span className="block truncate text-[9px] text-theme-muted">{sectionLabel}</span>
                    </span>
                  </label>
                </li>
              );
            })
          )}
        </ul>

        {assignEnabled && (
          <div className="border-t border-[var(--min-border)] pt-1">
            <button
              type="button"
              className="w-full px-0.5 py-0.5 text-left text-[10px] font-medium text-[var(--min-accent)] active:opacity-70"
              onClick={clearAssignment}
            >
              Clear assignment
            </button>
          </div>
        )}
      </div>
    );
  }

  const trigger = (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-0.5 font-medium text-[var(--min-accent)] active:opacity-70",
        compact ? "text-[11px]" : "text-[15px]",
      )}
    >
      Assign
      <ChevronDown
        className={cn(
          "shrink-0 transition-transform duration-200",
          compact ? "h-3 w-3" : "h-3.5 w-3.5",
          open && "rotate-180",
        )}
      />
    </button>
  );

  const popover = (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="start" side="bottom" className="w-[min(15rem,calc(100vw-1.5rem))] p-1.5">
        {popoverBody()}
      </PopoverContent>
    </Popover>
  );

  if (inline) {
    return <div className={cn("shrink-0", className)}>{popover}</div>;
  }

  return <div className={cn("flex flex-wrap items-center gap-x-2 gap-y-1", className)}>{popover}</div>;
}

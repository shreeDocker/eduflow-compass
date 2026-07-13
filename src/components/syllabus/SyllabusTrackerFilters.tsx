import { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { teacherDirectory } from "@/lib/syllabus-data";
import type { SyllabusGrade } from "@/lib/syllabus-data";
import {
  applyTrackerFilter,
  defaultTrackerFilterValue,
  formatClassName,
  listUniqueGradeLabels,
  type TrackerFilter,
  type TrackerFilterMode,
} from "@/lib/syllabus-utils";
import { cn } from "@/lib/utils";

type SyllabusTrackerFiltersProps = {
  grades: SyllabusGrade[];
  isAdmin: boolean;
  onChange: (filtered: SyllabusGrade[], filter: TrackerFilter) => void;
  className?: string;
};

const triggerClass =
  "h-9 rounded-lg border-[var(--min-border)] bg-[var(--min-surface)] text-xs text-theme shadow-none focus:ring-2 focus:ring-[color-mix(in_oklab,var(--min-accent)_25%,transparent)]";

export function SyllabusTrackerFilters({
  grades,
  isAdmin,
  onChange,
  className,
}: SyllabusTrackerFiltersProps) {
  const teachers = useMemo(() => {
    const ids = new Set<string>();
    for (const g of grades) {
      for (const s of g.subjects) ids.add(s.teacherId);
    }
    return [...ids]
      .map((id) => ({ id, name: teacherDirectory[id]?.name ?? id }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [grades]);

  const gradeLabels = useMemo(() => listUniqueGradeLabels(grades), [grades]);

  const modeOptions = useMemo(() => {
    const opts: { value: TrackerFilterMode; label: string }[] = [
      { value: "all", label: isAdmin ? "All school" : "All my classes" },
      { value: "class", label: "By class" },
    ];
    if (gradeLabels.length > 1 || (gradeLabels.length === 1 && grades.length > 1)) {
      opts.push({ value: "grade", label: "By grade" });
    }
    if (isAdmin && teachers.length > 0) {
      opts.push({ value: "teacher", label: "By teacher" });
    }
    return opts;
  }, [gradeLabels.length, grades.length, isAdmin, teachers.length]);

  const [filter, setFilter] = useState<TrackerFilter>({ mode: "all", value: "" });
  const gradeKey = grades.map((g) => g.id).join("|");

  useEffect(() => {
    setFilter((prev) => {
      if (prev.mode === "all") return prev;
      const stillValid =
        prev.mode === "class"
          ? grades.some((g) => g.id === prev.value)
          : prev.mode === "grade"
            ? gradeLabels.includes(prev.value)
            : prev.mode === "teacher"
              ? teachers.some((t) => t.id === prev.value)
              : false;
      if (stillValid) return prev;
      return {
        mode: prev.mode,
        value: defaultTrackerFilterValue(prev.mode, grades, teachers),
      };
    });
  }, [gradeKey, gradeLabels, grades, teachers]);

  useEffect(() => {
    onChange(applyTrackerFilter(grades, filter), filter);
  }, [grades, filter, onChange]);

  function setMode(mode: TrackerFilterMode) {
    setFilter({
      mode,
      value: mode === "all" ? "" : defaultTrackerFilterValue(mode, grades, teachers),
    });
  }

  function setValue(value: string) {
    setFilter((prev) => ({ ...prev, value }));
  }

  const valueOptions = useMemo(() => {
    switch (filter.mode) {
      case "class":
        return grades.map((g) => ({
          value: g.id,
          label: formatClassName(g),
        }));
      case "grade":
        return gradeLabels.map((label) => ({ value: label, label }));
      case "teacher":
        return teachers.map((t) => ({ value: t.id, label: t.name }));
      default:
        return [];
    }
  }, [filter.mode, gradeLabels, grades, teachers]);

  return (
    <div
      className={cn(
        "mb-4 flex flex-col gap-3 rounded-[10px] border border-[var(--min-border)] bg-[var(--min-bg)] p-3 sm:flex-row sm:items-end sm:gap-4",
        className,
      )}
    >
      <FilterField label="View by">
        <Select value={filter.mode} onValueChange={(v) => setMode(v as TrackerFilterMode)}>
          <SelectTrigger className={cn(triggerClass, "w-full min-w-0 sm:min-w-[140px]")}>
            <SelectValue placeholder="View by" />
          </SelectTrigger>
          <SelectContent>
            {modeOptions.map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      {filter.mode !== "all" && valueOptions.length > 0 && (
        <FilterField
          label={
            filter.mode === "class"
              ? "Class"
              : filter.mode === "grade"
                ? "Grade"
                : "Teacher"
          }
        >
          <Select value={filter.value} onValueChange={setValue}>
            <SelectTrigger className={cn(triggerClass, "w-full min-w-0 sm:min-w-[200px]")}>
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              {valueOptions.map((o) => (
                <SelectItem key={o.value} value={o.value} className="text-xs">
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
      )}
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 flex-1 sm:flex-none">
      <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wide text-theme-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

export function trackerFilterLabel(
  filter: TrackerFilter,
  grades: SyllabusGrade[],
): string {
  if (filter.mode === "all") return "All";
  switch (filter.mode) {
    case "class": {
      const g = grades.find((x) => x.id === filter.value);
      return g ? formatClassName(g) : "Class";
    }
    case "grade":
      return filter.value;
    case "teacher":
      return teacherDirectory[filter.value]?.name ?? "Teacher";
    default:
      return "";
  }
}

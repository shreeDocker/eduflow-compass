import { useMemo, useState } from "react";
import { MetroMap } from "@/components/MetroMap";
import type { SyllabusGrade } from "@/lib/syllabus-data";
import { buildMetroLinesFromGrade } from "@/lib/metro-utils";
import { formatClassName, listClassProgress } from "@/lib/syllabus-utils";
import { cn } from "@/lib/utils";

type MinimalTrendMapProps = {
  grades: SyllabusGrade[];
};

export function MinimalTrendMap({ grades }: MinimalTrendMapProps) {
  const classes = useMemo(() => listClassProgress(grades), [grades]);
  const [classId, setClassId] = useState("");

  const effectiveId =
    classId && classes.some((c) => c.id === classId) ? classId : (classes[0]?.id ?? "");

  const activeGrade = useMemo(
    () => grades.find((g) => g.id === effectiveId),
    [grades, effectiveId],
  );

  const lines = useMemo(
    () => (activeGrade ? buildMetroLinesFromGrade(activeGrade) : []),
    [activeGrade],
  );

  if (classes.length === 0) {
    return null;
  }

  return (
    <section className="min-card mb-4 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-theme-label">Journey map</h2>
        {classes.length > 1 && (
          <span className="text-[13px] text-theme-muted">{lines.length} subjects</span>
        )}
      </div>

      {classes.length > 1 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {classes.map((c) => {
            const grade = grades.find((g) => g.id === c.id);
            const active = c.id === effectiveId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setClassId(c.id)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-[var(--min-accent)] text-[var(--min-bg)]"
                    : "bg-[var(--min-surface)] text-theme-muted active:bg-[var(--min-surface-hover)]",
                )}
              >
                {grade ? formatClassName(grade) : `${c.label} ${c.section}`}
              </button>
            );
          })}
        </div>
      )}

      {lines.length === 0 ? (
        <p className="text-[15px] text-theme-muted">No subjects to map yet.</p>
      ) : (
        <div className="space-y-3">
          {lines.map((line) => (
            <MetroMap key={line.id} line={line} compact className="!p-3 max-lg:border-none" />
          ))}
        </div>
      )}
    </section>
  );
}

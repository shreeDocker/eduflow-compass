import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { SyllabusGrade } from "@/lib/syllabus-data";
import { listGradeProgress, subjectProgress } from "@/lib/syllabus-utils";
import { ProgressBadge, ProgressBar, progressTone } from "@/components/syllabus/ProgressBar";
import { subjectLineColors } from "@/lib/metro-utils";
import { treeChevronClass, treeContentSlotClass, treeNestedCardClass, treePanelClass, treeRowButtonClass, treeRowStyle } from "@/lib/tree-layout";

type SectionProgressViewProps = {
  grades: SyllabusGrade[];
};

export function SectionProgressView({ grades }: SectionProgressViewProps) {
  const gradeRows = listGradeProgress(grades);
  const [expanded, setExpanded] = useState<string | null>(null);

  if (gradeRows.length === 0) {
    return (
      <p className="rounded-[10px] border border-dashed border-[var(--min-border)] px-4 py-8 text-center text-sm text-theme-muted">
        No grade data available.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {gradeRows.map((grade) => {
        const open = expanded === grade.gradeLabel;
        const tone = progressTone(grade.progress);
        const accent =
          tone === "emerald"
            ? "var(--sw-emerald-500)"
            : tone === "sapphire"
              ? "var(--sw-sapphire-500)"
              : tone === "gold"
                ? "var(--sw-gold-500)"
                : "var(--sw-coral-500)";

        return (
          <div key={grade.gradeLabel} className="card-elevated">
            <button
              type="button"
              onClick={() => setExpanded(open ? null : grade.gradeLabel)}
              className={treeRowButtonClass("transition-colors hover:bg-[var(--min-surface-hover)]")}
              style={treeRowStyle(0, accent)}
            >
              <ChevronRight className={treeChevronClass(open, "lg")} />
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold text-theme">{grade.gradeLabel}</p>
                <p className="text-xs text-theme-muted">
                  {grade.classCount} section{grade.classCount !== 1 ? "s" : ""}
                </p>
              </div>
              <ProgressBadge value={grade.progress} />
            </button>

            {open && (
              <div className={treePanelClass()}>
                <div className={treeContentSlotClass("pb-3 pt-1")}>
                  <ProgressBar value={grade.progress} accent={accent} className="mb-3" />
                </div>
                <div className={treeContentSlotClass("space-y-2 pb-3")}>
                  {grade.classes.map((c) => {
                    const cTone = progressTone(c.progress);
                    const cAccent =
                      cTone === "emerald"
                        ? "var(--sw-emerald-500)"
                        : cTone === "sapphire"
                          ? "var(--sw-sapphire-500)"
                          : cTone === "gold"
                            ? "var(--sw-gold-500)"
                            : "var(--sw-coral-500)";
                    const row = grades.find((g) => g.id === c.id);

                    return (
                      <div key={c.id} className={treeNestedCardClass()}>
                        <div
                          className="flex items-center justify-between gap-2 px-3 py-3"
                          style={{ borderLeft: `3px solid ${cAccent}` }}
                        >
                          <p className="text-sm font-medium text-theme">Section {c.section}</p>
                          <ProgressBadge value={c.progress} />
                        </div>
                        {row && row.subjects.length > 0 && (
                          <ul className="divide-y divide-[var(--sw-surface-100)] border-t border-[var(--min-border)]">
                            {row.subjects.map((s) => {
                              const colors = subjectLineColors(s.name);
                              const sPct = subjectProgress(s);
                              return (
                                <li
                                  key={s.id}
                                  className="flex items-center justify-between gap-3 px-3 py-2.5 text-xs"
                                >
                                  <span className="min-w-0 truncate text-theme-muted">{s.name}</span>
                                  <div className="flex shrink-0 items-center gap-2">
                                    <ProgressBar
                                      value={sPct}
                                      accent={colors.color}
                                      size="sm"
                                      className="hidden w-16 sm:block"
                                    />
                                    <span
                                      className="font-mono text-xs font-semibold"
                                      style={{ color: colors.color }}
                                      data-metric
                                    >
                                      {sPct}%
                                    </span>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

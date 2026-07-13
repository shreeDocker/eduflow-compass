import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { ProgressBadge, ProgressBar, progressTone } from "@/components/syllabus/ProgressBar";
import type { SectionBoardClass, SectionBoardColumn } from "@/lib/syllabus-utils";
import { subjectLineColors } from "@/lib/metro-utils";
import { cn } from "@/lib/utils";

type SectionSubjectCompletionProps = {
  board: SectionBoardColumn[];
  className?: string;
  embedded?: boolean;
};

export function SectionSubjectCompletion({ board, className, embedded }: SectionSubjectCompletionProps) {
  if (board.length === 0) {
    return (
      <p className="rounded-[10px] border border-dashed border-[var(--min-border)] px-4 py-8 text-center text-sm text-theme-muted">
        No grade data available.
      </p>
    );
  }

  return (
    <section
      className={cn(!embedded && "card-elevated p-5 sm:p-6", className)}
      style={embedded ? undefined : { borderLeft: "3px solid var(--sw-violet-500)" }}
    >
      {!embedded && (
        <header className="mb-5 flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="sw-section-label">Grade board</p>
            <h2 className="font-display text-base font-semibold text-theme">
              Section & subject completion by grade
            </h2>
            <p className="mt-1 max-w-2xl text-xs text-theme-muted">
              Each column is a grade. Cards show every section in that grade with per-subject syllabus %.
            </p>
          </div>
          <Link
            to="/books"
            search={{ view: "catalog", layout: "overview" }}
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--sw-sapphire-600)] hover:underline"
          >
            Full breakdown <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </header>
      )}

      <div className={cn("-mx-1 overflow-x-auto pb-2", embedded && "mx-0")}>
        <div className="flex min-w-max gap-4 px-1">
          {board.map((column) => (
            <GradeBoardColumn key={column.gradeLabel} column={column} />
          ))}
        </div>
      </div>
    </section>
  );
}

function GradeBoardColumn({ column }: { column: SectionBoardColumn }) {
  return (
    <div className="flex w-[min(100%,300px)] min-w-[260px] shrink-0 flex-col rounded-[12px] border border-[var(--min-border)] bg-[var(--sw-surface-100)]">
      <div className="border-b border-[var(--min-border)] bg-[var(--min-surface)] px-4 py-3 rounded-t-[12px]">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-display text-sm font-semibold text-theme">{column.gradeLabel}</p>
            <p className="mt-0.5 text-[10px] text-theme-muted">
              {column.classes.length} section{column.classes.length !== 1 ? "s" : ""} ·{" "}
              {column.classes.reduce((n, c) => n + c.subjects.length, 0)} subject slots
            </p>
          </div>
          <ProgressBadge value={column.overallProgress} />
        </div>
        <ProgressBar value={column.overallProgress} accent="var(--sw-violet-500)" size="sm" className="mt-2.5" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3">
        {column.classes.length === 0 ? (
          <p className="py-6 text-center text-xs text-theme-muted">No sections</p>
        ) : (
          column.classes.map((cls) => <ClassBoardCard key={cls.id} cls={cls} />)
        )}
      </div>
    </div>
  );
}

function ClassBoardCard({ cls }: { cls: SectionBoardClass }) {
  const tone = progressTone(cls.progress);
  const accent =
    tone === "emerald"
      ? "var(--sw-emerald-500)"
      : tone === "sapphire"
        ? "var(--sw-sapphire-500)"
        : tone === "gold"
          ? "var(--sw-gold-500)"
          : "var(--sw-coral-500)";

  return (
    <Link
      to="/books"
      search={{ view: "catalog" }}
      className="block rounded-[10px] border border-[var(--min-border)] bg-[var(--min-surface)] p-3 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sw-sapphire-400)]"
    >
      <div className="flex items-start justify-between gap-2 border-b border-[var(--min-border)] pb-2.5">
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold text-theme">Section {cls.section}</p>
          <p className="text-[11px] text-theme-muted">{cls.displayName}</p>
        </div>
        <span className="shrink-0 font-mono text-xs font-bold" style={{ color: accent }} data-metric>
          {cls.progress}%
        </span>
      </div>

      <ul className="mt-2.5 space-y-1.5">
        {cls.subjects.map((sub) => {
          const colors = subjectLineColors(sub.name);
          const subTone = progressTone(sub.progress);
          const subAccent =
            subTone === "emerald"
              ? "var(--sw-emerald-500)"
              : subTone === "sapphire"
                ? colors.color
                : subTone === "gold"
                  ? "var(--sw-gold-500)"
                  : "var(--sw-coral-500)";

          return (
            <li
              key={sub.name}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-[6px] bg-[var(--min-bg)] px-2 py-1.5"
            >
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium text-theme">{sub.name}</p>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-[var(--sw-surface-200)]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${sub.progress}%`, backgroundColor: subAccent }}
                  />
                </div>
              </div>
              <span
                className="font-mono text-[10px] font-semibold tabular-nums"
                style={{ color: subAccent }}
                data-metric
              >
                {sub.progress}%
              </span>
            </li>
          );
        })}
      </ul>
    </Link>
  );
}

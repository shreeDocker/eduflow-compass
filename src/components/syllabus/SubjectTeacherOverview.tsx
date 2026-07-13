import { useState } from "react";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { ProgressBar, progressTone } from "@/components/syllabus/ProgressBar";
import type { SubjectTeacherGroup } from "@/lib/syllabus-utils";
import { subjectLineColors } from "@/lib/metro-utils";
import { cn } from "@/lib/utils";

type SubjectTeacherOverviewProps = {
  groups: SubjectTeacherGroup[];
  className?: string;
};

export function SubjectTeacherOverview({ groups, className }: SubjectTeacherOverviewProps) {
  const [selected, setSelected] = useState<string | null>(null);

  if (groups.length === 0) {
    return (
      <p className="rounded-[10px] border border-dashed border-[var(--min-border)] px-4 py-8 text-center text-sm text-theme-muted">
        No subject data for this filter.
      </p>
    );
  }

  const active = selected ? groups.find((g) => g.subjectName === selected) : undefined;

  return (
    <div className={cn("space-y-4", className)}>
      <p className="text-[13px] text-theme-muted">
        Pick a subject to compare teachers and sections side by side.
      </p>

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {groups.map((group) => {
          const colors = subjectLineColors(group.subjectName);
          const isActive = group.subjectName === selected;
          const tone = progressTone(group.avgProgress);
          const accent =
            tone === "emerald"
              ? "var(--sw-emerald-500)"
              : tone === "sapphire"
                ? colors.color
                : tone === "gold"
                  ? "var(--sw-gold-500)"
                  : "var(--sw-coral-500)";

          return (
            <button
              key={group.subjectName}
              type="button"
              onClick={() => setSelected(isActive ? null : group.subjectName)}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors",
                isActive
                  ? "border-[color-mix(in_oklab,var(--min-accent)_45%,var(--min-border))] bg-[var(--min-surface)] shadow-[var(--min-shadow)]"
                  : "border-[var(--min-border)] bg-[var(--min-bg)] active:bg-[var(--min-surface-hover)]",
              )}
            >
              <span
                className="h-8 w-1 shrink-0 rounded-full"
                style={{ backgroundColor: colors.color }}
              />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-theme">{group.subjectName}</p>
                <p className="text-[10px] text-theme-muted">
                  {group.teacherCount} teacher{group.teacherCount !== 1 ? "s" : ""} ·{" "}
                  {group.classCount} section{group.classCount !== 1 ? "s" : ""}
                </p>
              </div>
              <span
                className="ml-1 shrink-0 font-mono text-xs font-semibold tabular-nums"
                style={{ color: accent }}
                data-metric
              >
                {group.avgProgress}%
              </span>
            </button>
          );
        })}
      </div>

      {active ? (
        <SubjectDetailPanel group={active} />
      ) : (
        <p className="rounded-xl border border-dashed border-[var(--min-border)] px-4 py-6 text-center text-[13px] text-theme-muted">
          Select a subject above to see teacher and section breakdown.
        </p>
      )}
    </div>
  );
}

function SubjectDetailPanel({ group }: { group: SubjectTeacherGroup }) {
  const colors = subjectLineColors(group.subjectName);
  const tone = progressTone(group.avgProgress);
  const accent =
    tone === "emerald"
      ? "var(--sw-emerald-500)"
      : tone === "sapphire"
        ? colors.color
        : tone === "gold"
          ? "var(--sw-gold-500)"
          : "var(--sw-coral-500)";

  return (
    <section
      className="overflow-hidden rounded-xl border border-[var(--min-border)] bg-[var(--min-surface)]"
      style={{ borderTop: `3px solid ${colors.color}` }}
    >
      <header className="flex flex-wrap items-center gap-4 border-b border-[var(--min-border)] px-4 py-4 sm:px-5">
        <ProgressRing
          value={group.avgProgress}
          label=""
          size={64}
          stroke={5}
          color={accent}
          className="gap-0"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-semibold text-theme">{group.subjectName}</h3>
          <p className="mt-0.5 text-[12px] text-theme-muted">
            School average across {group.classCount} section{group.classCount !== 1 ? "s" : ""} ·{" "}
            {group.teacherCount} teacher{group.teacherCount !== 1 ? "s" : ""}
          </p>
        </div>
        <ProgressBar value={group.avgProgress} accent={accent} size="md" className="w-full sm:w-40" />
      </header>

      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
        {group.leaders.map((leader) => (
          <TeacherCompareCard
            key={leader.teacherId}
            leader={leader}
            subjectName={group.subjectName}
            accent={colors.color}
          />
        ))}
      </div>
    </section>
  );
}

function TeacherCompareCard({
  leader,
  subjectName,
  accent,
}: {
  leader: SubjectTeacherGroup["leaders"][number];
  subjectName: string;
  accent: string;
}) {
  const tone = progressTone(leader.avgProgress);
  const barAccent =
    tone === "emerald"
      ? "var(--sw-emerald-500)"
      : tone === "sapphire"
        ? accent
        : tone === "gold"
          ? "var(--sw-gold-500)"
          : "var(--sw-coral-500)";

  return (
    <article className="rounded-xl border border-[var(--min-border)] bg-[var(--min-bg)] p-3.5">
      <div className="flex items-center gap-3">
        <div
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
          style={{ background: `linear-gradient(135deg, ${accent}, var(--sw-violet-600))` }}
        >
          {leader.teacherInitials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-theme">{leader.teacherName}</p>
          <p className="text-[10px] text-theme-muted">
            {subjectName} · {leader.classCount} section{leader.classCount !== 1 ? "s" : ""}
          </p>
        </div>
        <span className="shrink-0 font-mono text-sm font-semibold" style={{ color: barAccent }} data-metric>
          {leader.avgProgress}%
        </span>
      </div>

      <ProgressBar value={leader.avgProgress} accent={barAccent} size="sm" className="mt-3" />

      <ul className="mt-3 space-y-1.5">
        {leader.slots.map((slot) => {
          const slotTone = progressTone(slot.progress);
          const slotAccent =
            slotTone === "emerald"
              ? "var(--sw-emerald-500)"
              : slotTone === "sapphire"
                ? accent
                : slotTone === "gold"
                  ? "var(--sw-gold-500)"
                  : "var(--sw-coral-500)";

          return (
            <li
              key={slot.gradeId}
              className="flex items-center justify-between gap-2 rounded-lg bg-[var(--min-surface)] px-2.5 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium text-theme">{slot.displayName}</p>
                <p className="text-[10px] text-theme-muted">
                  Section {slot.section}
                </p>
              </div>
              <span
                className="shrink-0 font-mono text-[11px] font-semibold tabular-nums"
                style={{ color: slotAccent }}
                data-metric
              >
                {slot.progress}%
              </span>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

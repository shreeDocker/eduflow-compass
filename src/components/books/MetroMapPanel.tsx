import { useMemo, useState } from "react";
import { AlertTriangle, MapPin, Zap } from "lucide-react";
import { MetroMapGrid } from "@/components/MetroMap";
import { ProgressBadge, ProgressBar } from "@/components/syllabus/ProgressBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SyllabusGrade } from "@/lib/syllabus-data";
import {
  aggregateMetroStats,
  buildMetroLinesFromGrade,
  classOverallFromGrade,
} from "@/lib/metro-utils";
import { formatClassName, listClassProgress } from "@/lib/syllabus-utils";

type MetroMapPanelProps = {
  grades: SyllabusGrade[];
  isAdmin?: boolean;
};

export function MetroMapPanel({ grades, isAdmin = false }: MetroMapPanelProps) {
  const availableClasses = useMemo(() => listClassProgress(grades), [grades]);

  const [classId, setClassId] = useState<string>("");

  const effectiveClassId =
    classId && availableClasses.some((c) => c.id === classId)
      ? classId
      : (availableClasses[0]?.id ?? "");

  const activeGrade = useMemo(
    () => grades.find((g) => g.id === effectiveClassId),
    [grades, effectiveClassId],
  );

  const lines = useMemo(
    () => (activeGrade ? buildMetroLinesFromGrade(activeGrade) : []),
    [activeGrade],
  );

  const aggregate = useMemo(() => aggregateMetroStats(lines), [lines]);
  const overall = activeGrade ? classOverallFromGrade(activeGrade) : 0;
  const liveLines = lines.filter((l) => l.currentSpotLive && l.currentSpotLabel);

  if (availableClasses.length === 0) {
    return (
      <p className="rounded-[10px] border border-dashed border-[var(--min-border)] px-4 py-8 text-center text-sm text-theme-muted">
        No classes assigned to your syllabus yet.
      </p>
    );
  }

  return (
    <>
      <section
        className="card-elevated mb-5 p-4 sm:p-5"
        style={{ borderLeft: "3px solid var(--sw-violet-500)" }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="sw-section-label text-[var(--sw-violet-600)]">Class journey</p>
            <p className="mt-1 text-xs text-theme-muted">
              Tap any stop for topic detail. Rings show chapter progress; pulsing = where you are now.
            </p>
          </div>

          <div className="w-full sm:w-[220px]">
            <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wide text-theme-muted">
              Class
            </label>
            <Select value={effectiveClassId} onValueChange={setClassId}>
              <SelectTrigger className="h-9 rounded-[8px] border-[var(--min-border)] bg-[var(--min-surface)] text-xs shadow-none">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {availableClasses.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">
                    {c.label} {c.section} · {c.progress}%
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {activeGrade && (
          <div className="mt-4 flex flex-col gap-3 border-t border-[var(--min-border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-theme">
                {formatClassName(activeGrade)}
              </p>
              <p className="text-xs text-theme-muted">
                {lines.length} subject{lines.length !== 1 ? "s" : ""} · {aggregate.chaptersComplete}/
                {aggregate.chaptersTotal} chapters · {aggregate.topicsDone}/{aggregate.topicsTotal}{" "}
                topics
                {aggregate.delayed > 0 && (
                  <span className="ml-1 font-medium text-[var(--sw-coral-600)]">
                    · {aggregate.delayed} delayed
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ProgressBadge value={overall} />
              <div className="w-36">
                <ProgressBar value={overall} accent="var(--sw-violet-500)" size="md" />
              </div>
            </div>
          </div>
        )}
      </section>

      {lines.length > 0 && (
        <section className="card-elevated mb-5 p-4 sm:p-5">
          <p className="sw-section-label mb-3">Where teaching is now</p>
          {liveLines.length > 0 ? (
            <ul className="space-y-2">
              {liveLines.map((line) => (
                <li
                  key={line.id}
                  className="flex items-start gap-2 rounded-[8px] bg-[var(--sw-gold-50)] px-3 py-2.5 text-sm"
                >
                  <Zap className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sw-gold-600)]" />
                  <div className="min-w-0">
                    <span className="font-medium text-theme">{line.name}</span>
                    <span className="text-theme-muted"> — </span>
                    <span className="text-theme-muted">{line.currentSpotLabel}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-2">
              {lines
                .filter((l) => l.currentSpotLabel)
                .map((line) => (
                  <li
                    key={line.id}
                    className="flex items-start gap-2 rounded-[8px] bg-[var(--min-bg)] px-3 py-2.5 text-sm"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sw-sapphire-500)]" />
                    <div className="min-w-0">
                      <span className="font-medium text-theme">{line.name}</span>
                      <span className="text-theme-muted"> — next up: </span>
                      <span className="text-theme-muted">{line.currentSpotLabel}</span>
                    </div>
                  </li>
                ))}
            </ul>
          )}

          {aggregate.delayed > 0 && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-[var(--sw-coral-700)]">
              <AlertTriangle className="h-3.5 w-3.5" />
              {aggregate.delayed} chapter{aggregate.delayed !== 1 ? "s" : ""} behind schedule in this
              class
            </p>
          )}
        </section>
      )}

      <MetroMapGrid lines={lines} showTeachers={isAdmin} />
    </>
  );
}

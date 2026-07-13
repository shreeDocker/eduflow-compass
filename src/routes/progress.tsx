import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { MinimalTrendMap } from "@/components/trend/MinimalTrendMap";
import { useRole } from "@/lib/role-context";
import { useSyllabusProgress } from "@/lib/syllabus-progress-context";
import { currentUserId } from "@/lib/syllabus-data";
import {
  filterGradesForTeacher,
  formatClassName,
  gradeProgress,
  subjectProgress,
  teacherStats,
} from "@/lib/syllabus-utils";

const MOCK_HISTORY = [
  { date: "10 Jul 2026 (Fri)", from: 60, to: 61 },
  { date: "03 Jul 2026 (Fri)", from: 54, to: 60 },
  { date: "26 Jun 2026 (Fri)", from: 37, to: 54 },
  { date: "19 Jun 2026 (Fri)", from: 34, to: 37 },
];

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress trend — Swotify Plus" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const { isAdmin } = useRole();
  const { grades } = useSyllabusProgress();

  const myGrades = useMemo(
    () => (isAdmin ? grades : filterGradesForTeacher(grades, currentUserId)),
    [grades, isAdmin],
  );
  const stats = useMemo(() => teacherStats(grades, currentUserId), [grades]);

  const progressPct = isAdmin
    ? Math.round(myGrades.reduce((s, g) => s + gradeProgress(g), 0) / Math.max(myGrades.length, 1))
    : stats.progress;

  const subjects = useMemo(() => {
    const rows: { id: string; label: string; progress: number }[] = [];
    for (const grade of myGrades) {
      for (const subject of grade.subjects) {
        rows.push({
          id: `${grade.id}-${subject.id}`,
          label: `${formatClassName(grade)} · ${subject.name}`,
          progress: subjectProgress(subject),
        });
      }
    }
    return rows;
  }, [myGrades]);

  const chartPoints = [12, 18, 22, 28, 34, 37, 54, 60, progressPct];
  const chartW = 280;
  const chartH = 80;
  const path = chartPoints
    .map((p, i) => {
      const x = (i / (chartPoints.length - 1)) * chartW;
      const y = chartH - (p / 100) * chartH;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
  const areaPath = `${path} L${chartW},${chartH} L0,${chartH} Z`;

  return (
    <AppShell title="Trend">
      <section className="min-card mb-4 p-4">
        <div className="flex items-center gap-4">
          <ProgressRing value={progressPct} label="" size={88} stroke={7} color="var(--min-orange)" />
          <div>
            <p className="font-mono text-3xl font-semibold text-theme" data-metric>
              {progressPct}%
            </p>
            <p className="text-xs text-theme-muted">Overall syllabus covered</p>
            <p className="mt-1 font-mono text-[11px] text-theme-success" data-metric>
              +{progressPct - MOCK_HISTORY[1].to}% this month
            </p>
          </div>
        </div>
        <Link
          to="/books"
          className="mt-3 inline-block text-xs font-medium text-theme-accent hover:underline"
        >
          Update topics in tracker →
        </Link>
      </section>

      <MinimalTrendMap grades={myGrades} />

      <section className="min-card mb-4 p-4">
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" aria-hidden>
          {[20, 40, 60, 80].map((tick) => (
            <line
              key={tick}
              x1={0}
              y1={chartH - (tick / 100) * chartH}
              x2={chartW}
              y2={chartH - (tick / 100) * chartH}
              stroke="var(--min-border)"
              strokeWidth={1}
            />
          ))}
          <path d={areaPath} fill="var(--min-accent)" fillOpacity={0.12} />
          <path d={path} fill="none" stroke="var(--min-accent)" strokeWidth={2} strokeLinecap="round" />
        </svg>
        <p className="mt-2 text-center text-[10px] text-theme-faint">Dec 2024 — Jul 2026</p>
      </section>

      <section className="mb-4">
        <h2 className="mb-2 text-theme-label">Recent updates</h2>
        <ul className="space-y-1">
          {MOCK_HISTORY.map((row) => (
            <li
              key={row.date}
              className="min-row grid grid-cols-[1fr_auto_auto] items-center gap-2 py-2.5 text-sm"
            >
              <span className="text-theme-muted">{row.date}</span>
              <span className="font-mono text-xs text-theme" data-metric>
                {row.from}% → {row.to}%
              </span>
              <span className="rounded-full bg-[var(--min-pink)]/20 px-2 py-0.5 font-mono text-[10px] text-[var(--min-pink)]">
                +{row.to - row.from}%
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-theme-label">By subject</h2>
        <ul className="space-y-2">
          {subjects.map((row) => (
            <li key={row.id} className="min-row flex items-center gap-3 py-3">
              <span className="min-w-0 flex-1 truncate text-sm text-theme">{row.label}</span>
              <div className="flex w-24 items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--min-track)]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${row.progress}%`,
                      background: row.progress >= 100 ? "var(--min-green)" : "var(--min-orange)",
                    }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-[11px] text-theme-muted" data-metric>
                  {row.progress}%
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}

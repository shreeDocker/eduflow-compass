import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { SubjectHeatmap } from "@/components/admin/SubjectHeatmap";
import { TeacherProgressView } from "@/components/books/TeacherProgressView";
import { useRole } from "@/lib/role-context";
import { useSyllabusProgress } from "@/lib/syllabus-progress-context";
import { teacherDirectory } from "@/lib/syllabus-data";
import {
  buildSubjectHeatmap,
  listTeacherSummaries,
  schoolProgress,
  schoolTeacherStatusCounts,
} from "@/lib/syllabus-utils";

export const Route = createFileRoute("/principal")({
  head: () => ({
    meta: [{ title: "Dashboard — Swotify Plus" }],
  }),
  component: PrincipalDashboard,
});

function PrincipalDashboard() {
  const { isAdmin } = useRole();
  const { grades } = useSyllabusProgress();

  const overall = useMemo(() => schoolProgress(grades), [grades]);
  const teachers = useMemo(
    () =>
      listTeacherSummaries(grades, teacherDirectory)
        .filter((t) => t.assignments.length > 0)
        .sort((a, b) => b.progress - a.progress),
    [grades],
  );
  const previewTeachers = teachers.slice(0, 5);
  const teacherCounts = useMemo(() => schoolTeacherStatusCounts(teachers), [teachers]);
  const heatmap = useMemo(() => buildSubjectHeatmap(grades), [grades]);

  if (!isAdmin) return <Navigate to="/today" replace />;

  return (
    <AppShell title="Dashboard" wide>
      <section className="min-card mb-4 p-4">
        <div className="flex items-center justify-around gap-2">
          <ProgressRing value={overall} label="Overall" color="var(--min-orange)" />
          <ProgressRing
            value={teacherCounts.onTrack + teacherCounts.ahead}
            label="On track"
            displayValue={`${teacherCounts.onTrack + teacherCounts.ahead}`}
            suffix=""
            color="var(--min-green)"
          />
          <ProgressRing
            value={teacherCounts.delayed}
            label="Delayed"
            displayValue={`${teacherCounts.delayed}`}
            suffix=""
            color="var(--min-text-danger)"
          />
        </div>
      </section>

      <SubjectHeatmap rows={heatmap.rows} classKeys={heatmap.classKeys} className="mb-4" />

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-theme-label">Teachers</h2>
          <Link
            to="/admin/teachers"
            className="shrink-0 text-[15px] font-medium text-theme-accent"
          >
            View all →
          </Link>
        </div>

        <TeacherProgressView grades={grades} teachers={previewTeachers} />
      </section>
    </AppShell>
  );
}

import { createFileRoute, Navigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TeacherProgressView } from "@/components/books/TeacherProgressView";
import { useRole } from "@/lib/role-context";
import { useSyllabusProgress } from "@/lib/syllabus-progress-context";
import { teacherDirectory } from "@/lib/syllabus-data";
import { listTeacherSummaries } from "@/lib/syllabus-utils";
import { useMemo } from "react";

export const Route = createFileRoute("/admin/teachers/")({
  head: () => ({
    meta: [
      { title: "Teachers — Swotify Plus" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminTeachersPage,
});

function AdminTeachersPage() {
  const { isAdmin } = useRole();
  const { grades } = useSyllabusProgress();

  const teachers = useMemo(
    () =>
      listTeacherSummaries(grades, teacherDirectory)
        .filter((t) => t.assignments.length > 0)
        .sort((a, b) => b.progress - a.progress),
    [grades],
  );

  if (!isAdmin) return <Navigate to="/today" replace />;

  return (
    <AppShell title="Teachers" showBack backTo="/principal" wide>
      <TeacherProgressView grades={grades} teachers={teachers} linkToDetail />
    </AppShell>
  );
}

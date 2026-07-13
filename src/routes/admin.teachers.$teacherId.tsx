import { createFileRoute, Navigate, notFound } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { TeacherDetailView } from "@/components/admin/TeacherDetailView";
import { useRole } from "@/lib/role-context";
import { useSyllabusProgress } from "@/lib/syllabus-progress-context";
import { teacherDirectory } from "@/lib/syllabus-data";
import { listTeacherSummaries } from "@/lib/syllabus-utils";

export const Route = createFileRoute("/admin/teachers/$teacherId")({
  head: ({ params }) => ({
    meta: [
      { title: `Teacher — Swotify Plus` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TeacherDetailPage,
  notFoundComponent: () => (
    <AppShell title="Not found" showBack backTo="/admin/teachers">
      <p className="text-center text-theme-muted">Teacher not found.</p>
    </AppShell>
  ),
});

function TeacherDetailPage() {
  const { teacherId } = Route.useParams();
  const { isAdmin } = useRole();
  const { grades } = useSyllabusProgress();

  const teacher = useMemo(() => {
    return listTeacherSummaries(grades, teacherDirectory).find((t) => t.id === teacherId);
  }, [grades, teacherId]);

  if (!isAdmin) return <Navigate to="/today" replace />;
  if (!teacher) throw notFound();

  return (
    <AppShell title={teacher.name} showBack backTo="/principal" wide>
      <TeacherDetailView teacher={teacher} grades={grades} />
    </AppShell>
  );
}

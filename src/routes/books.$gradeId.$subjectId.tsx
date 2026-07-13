import { createFileRoute, Link, Navigate, notFound } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { SubjectTopicTracker } from "@/components/syllabus/SubjectTopicTracker";
import { useRole } from "@/lib/role-context";
import { useSyllabusProgress } from "@/lib/syllabus-progress-context";
import { currentUserId } from "@/lib/syllabus-data";
import {
  filterGradesForTeacher,
  formatClassName,
  subjectProgress,
} from "@/lib/syllabus-utils";

export const Route = createFileRoute("/books/$gradeId/$subjectId")({
  head: ({ params }) => ({
    meta: [
      { title: `Topic tracker — Swotify Plus` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SubjectTrackerPage,
  notFoundComponent: () => (
    <AppShell title="Not found" showBack backTo="/books">
      <p className="text-center text-theme-muted">Subject not found.</p>
    </AppShell>
  ),
});

function SubjectTrackerPage() {
  const { gradeId, subjectId } = Route.useParams();
  const { isAdmin } = useRole();
  const { grades: allGrades } = useSyllabusProgress();

  const accessibleGrades = useMemo(
    () => (isAdmin ? allGrades : filterGradesForTeacher(allGrades, currentUserId)),
    [allGrades, isAdmin],
  );

  const grade = accessibleGrades.find((g) => g.id === gradeId);
  const subject = grade?.subjects.find((s) => s.id === subjectId);

  if (!grade || !subject) {
    if (!isAdmin && allGrades.find((g) => g.id === gradeId)) {
      return <Navigate to="/today" replace />;
    }
    throw notFound();
  }

  const title = `${formatClassName(grade)} · ${subject.name}`;
  const progress = subjectProgress(subject);

  return (
    <AppShell title={title} showBack backTo="/books" backSearch={{ view: "catalog" }}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] text-theme-muted">Topic tracker</p>
          <p className="mt-0.5 text-[15px] font-medium text-theme">{progress}% complete</p>
        </div>
        <Link
          to="/books"
          search={{ view: "catalog" }}
          className="shrink-0 text-[13px] font-medium text-theme-accent"
        >
          All classes
        </Link>
      </div>

      <SubjectTopicTracker grade={grade} subject={subject} />
    </AppShell>
  );
}

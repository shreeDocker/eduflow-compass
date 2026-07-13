import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { RoleSwitch } from "@/components/RoleSwitch";
import { ProgressBadge } from "@/components/syllabus/ProgressBar";
import { currentTeacher } from "@/lib/mock-data";
import { useRole } from "@/lib/role-context";
import { useSyllabusProgress } from "@/lib/syllabus-progress-context";
import { currentUserId } from "@/lib/syllabus-data";
import {
  filterGradesForTeacher,
  formatClassName,
  subjectProgress,
} from "@/lib/syllabus-utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Swotify Plus" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { isAdmin } = useRole();
  const { grades } = useSyllabusProgress();
  const assignments = useMemo(
    () => (isAdmin ? [] : filterGradesForTeacher(grades, currentUserId)),
    [grades, isAdmin],
  );
  const initials = isAdmin
    ? "AU"
    : currentTeacher.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

  return (
    <AppShell title="Profile">
      <div className="min-card flex items-center gap-4 p-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[var(--min-accent)] text-lg font-semibold text-[var(--min-bg)]">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-theme">
            {isAdmin ? "Admin" : currentTeacher.name}
          </p>
          <p className="truncate text-xs text-theme-muted">{currentTeacher.school}</p>
        </div>
      </div>

      <section className="mt-4">
        <p className="mb-2 text-theme-label">Switch view</p>
        <RoleSwitch variant="navbar" className="inline-flex" />
      </section>

      <section className="mt-4 min-card divide-y divide-[var(--min-border)] overflow-hidden">
        <Link
          to="/books"
          search={{ view: "catalog" }}
          className="flex items-center justify-between px-4 py-3.5 text-sm text-theme transition-colors active:bg-[var(--min-surface-hover)]"
        >
          <span>Topics tracker</span>
          <span className="text-theme-muted">→</span>
        </Link>
        <Link
          to="/admin/notes"
          className="flex items-center justify-between px-4 py-3.5 text-sm text-theme transition-colors active:bg-[var(--min-surface-hover)]"
        >
          <span>Add notes</span>
          <span className="text-theme-muted">→</span>
        </Link>
      </section>

      {!isAdmin && assignments.length > 0 && (
        <section className="mt-4">
          <h2 className="mb-2 text-theme-label">Your classes</h2>
          <ul className="space-y-2">
            {assignments.map((grade) =>
              grade.subjects.map((subject) => (
                <li key={`${grade.id}-${subject.id}`}>
                  <Link
                    to="/books/$gradeId/$subjectId"
                    params={{ gradeId: grade.id, subjectId: subject.id }}
                    className="min-row flex items-center gap-3 py-3 text-sm text-theme"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {formatClassName(grade)} · {subject.name}
                      </p>
                    </div>
                    <ProgressBadge value={subjectProgress(subject)} />
                  </Link>
                </li>
              )),
            )}
          </ul>
        </section>
      )}
    </AppShell>
  );
}

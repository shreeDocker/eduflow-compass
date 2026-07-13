import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { CurrentTopicChip } from "@/components/books/CurrentTopicChip";
import { ProgressBadge } from "@/components/syllabus/ProgressBar";
import { useRole } from "@/lib/role-context";
import { useSyllabusProgress } from "@/lib/syllabus-progress-context";
import { currentUserId } from "@/lib/syllabus-data";
import { todaysClasses } from "@/lib/mock-data";
import {
  filterGradesForTeacher,
  findCurrentTeachingSpot,
  formatClassName,
  gradeProgress,
  listTodaysClassesForTeacher,
  teacherStats,
} from "@/lib/syllabus-utils";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/today")({
  head: () => ({
    meta: [
      { title: "Today — Swotify Plus" },
      { name: "description", content: "Today's classes and quick progress updates." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TodayPage,
});

function TodayPage() {
  const { isAdmin } = useRole();
  const { grades } = useSyllabusProgress();

  const myGrades = useMemo(
    () => (isAdmin ? grades : filterGradesForTeacher(grades, currentUserId)),
    [grades, isAdmin],
  );
  const stats = useMemo(() => teacherStats(grades, currentUserId), [grades]);
  const sessions = useMemo(
    () => (isAdmin ? todaysClasses : listTodaysClassesForTeacher(todaysClasses, grades, currentUserId)),
    [grades, isAdmin],
  );

  const classes = useMemo(() => {
    return myGrades
      .map((grade) => {
        let spot = null as ReturnType<typeof findCurrentTeachingSpot>;
        let subjectId = grade.subjects[0]?.id ?? "";

        for (const subject of grade.subjects) {
          const candidate = findCurrentTeachingSpot(subject);
          if (!candidate) continue;
          if (candidate.isLive) {
            spot = candidate;
            subjectId = subject.id;
            break;
          }
          if (!spot) {
            spot = candidate;
            subjectId = subject.id;
          }
        }

        return {
          id: grade.id,
          gradeId: grade.id,
          subjectId,
          label: formatClassName(grade),
          progress: gradeProgress(grade),
          spot,
        };
      })
      .sort((a, b) => b.progress - a.progress);
  }, [myGrades]);

  const progressPct = isAdmin
    ? Math.round(myGrades.reduce((s, g) => s + gradeProgress(g), 0) / Math.max(myGrades.length, 1))
    : stats.progress;

  return (
    <AppShell title="Today">
      <section className="min-card mb-5 p-5 sm:p-4">
        <div className="flex items-center justify-around gap-2">
          <ProgressRing value={progressPct} label="Progress" color="var(--min-orange)" />
          <ProgressRing
            value={stats.chaptersDone}
            label="Chapters"
            displayValue={`${stats.chaptersDone}/${stats.chapters}`}
            color="var(--min-green)"
          />
          <ProgressRing
            value={stats.grades}
            label="Classes"
            displayValue={`${stats.grades}`}
            suffix=""
            color="var(--min-text-faint)"
          />
        </div>
      </section>

      {sessions.length === 0 && (
        <section className="mb-4">
          <h2 className="mb-2 text-theme-label">Today&apos;s classes</h2>
          <div className="min-card px-4 py-5">
            <p className="text-[15px] text-theme-muted">No classes on your schedule today.</p>
            <Link
              to="/books"
              search={{ view: "catalog" }}
              className="mt-3 inline-block text-[15px] font-medium text-theme-accent"
            >
              Open syllabus tracker →
            </Link>
          </div>
        </section>
      )}

      {sessions.length > 0 && (
        <section className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-theme-label">Today&apos;s classes</h2>
            <span className="font-mono text-[13px] text-theme-faint sm:text-[10px]" data-metric>
              {sessions.filter((s) => s.status === "done").length}/{sessions.length} done
            </span>
          </div>
          <ul className="space-y-2">
            {sessions.map((cls) => (
              <li key={cls.id}>
                <Link
                  to="/class/$id"
                  params={{ id: cls.id }}
                  className={cn(
                    "min-row flex items-center gap-3 text-theme",
                    cls.status === "current" && "ring-1 ring-[var(--min-green)]/40",
                  )}
                >
                  <div className="min-w-0 flex-1 py-1">
                    <p className="truncate text-[17px] font-medium text-theme sm:text-sm">
                      Grade {cls.grade}
                      {cls.section} · {cls.subject}
                    </p>
                    <p className="mt-0.5 text-[15px] text-theme-muted sm:text-[11px]">{cls.time}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1 text-[13px] font-medium sm:px-2 sm:py-0.5 sm:text-[10px]",
                      cls.status === "current" && "bg-[var(--min-green)]/15 text-theme-success",
                      cls.status === "upcoming" && "bg-[var(--min-orange)]/15 text-theme-warning",
                      cls.status === "done" && "bg-white/5 text-theme-faint",
                    )}
                  >
                    {cls.status === "current" ? "Now" : cls.status === "done" ? "Done" : "Next"}
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-theme-faint sm:h-4 sm:w-4" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-theme-label">Your classes</h2>
        {classes.length === 0 ? (
          <div className="min-card px-4 py-5">
            <p className="text-[15px] text-theme-muted">No classes assigned yet.</p>
            <Link
              to="/profile"
              className="mt-3 inline-block text-[15px] font-medium text-theme-accent"
            >
              View profile →
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {classes.map((row) => (
              <li key={row.id}>
                <Link
                  to="/books/$gradeId/$subjectId"
                  params={{ gradeId: row.gradeId, subjectId: row.subjectId }}
                  className="tracker-class-card block w-full text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-[17px] font-semibold leading-snug text-theme">
                        {row.label}
                      </p>
                      {row.spot && (
                        <div className="mt-2">
                          <CurrentTopicChip spot={row.spot} compact />
                        </div>
                      )}
                    </div>
                    <ProgressBadge value={row.progress} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}

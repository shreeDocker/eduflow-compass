import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Upload } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { BooksOutline } from "@/components/books/BooksOutline";
import { SyllabusBlueprint } from "@/components/books/SyllabusBlueprint";
import { useRole } from "@/lib/role-context";
import { useNotes } from "@/lib/notes-context";
import { useBooks } from "@/lib/books-context";
import { useSubjectAssignments } from "@/lib/subject-assignments-context";
import { useSyllabusProgress } from "@/lib/syllabus-progress-context";
import { currentUserId } from "@/lib/syllabus-data";
import { filterBooksForViewer, filterGradesForTeacher, filterNotesForViewer } from "@/lib/syllabus-utils";
import { cn } from "@/lib/utils";

type LibraryTab = "uploads" | "outline";

export const Route = createFileRoute("/library")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab:
      search.tab === "outline" || search.tab === "uploads"
        ? (search.tab as LibraryTab)
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Books — Swotify Plus" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const { isAdmin } = useRole();
  const { notes } = useNotes();
  const { books } = useBooks();
  const { assignments } = useSubjectAssignments();
  const { grades: allGrades } = useSyllabusProgress();
  const { tab: searchTab } = Route.useSearch();
  const navigate = Route.useNavigate();

  const visibleGrades = useMemo(
    () => (isAdmin ? allGrades : filterGradesForTeacher(allGrades, currentUserId)),
    [allGrades, isAdmin],
  );

  const visibleNotes = useMemo(
    () =>
      filterNotesForViewer(notes, allGrades, {
        isAdmin,
        teacherId: currentUserId,
      }, assignments),
    [notes, allGrades, isAdmin, assignments],
  );

  const visibleBooks = useMemo(
    () =>
      filterBooksForViewer(books, allGrades, {
        isAdmin,
        teacherId: currentUserId,
      }, assignments),
    [books, allGrades, isAdmin, assignments],
  );

  const tab: LibraryTab = searchTab ?? "uploads";

  function setTab(next: LibraryTab) {
    navigate({ search: next === "outline" ? { tab: next } : {}, replace: true });
  }

  return (
    <AppShell title="Books" wide>
      <section className="min-card mb-4 p-3 sm:p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-theme-label">
              {isAdmin ? "School library" : "Your subjects"}
            </p>
            <p className="mt-1 text-[15px] leading-relaxed text-theme-muted">
              {isAdmin
                ? "Uploads and curriculum outline for every grade and subject."
                : "Uploads and outline for the subjects you teach."}
            </p>
          </div>
          <Link
            to="/admin/notes"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[var(--min-accent)] px-3 py-2 text-[12px] font-semibold text-[var(--min-bg)]"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload
          </Link>
        </div>
      </section>

      <LibraryTabSwitch tab={tab} onChange={setTab} />

      {tab === "uploads" ? (
        <BooksOutline
          notes={visibleNotes}
          grades={visibleGrades}
          allGrades={allGrades}
          isAdmin={isAdmin}
        />
      ) : (
        <SyllabusBlueprint
          grades={visibleGrades}
          allGrades={allGrades}
          books={visibleBooks}
          isAdmin={isAdmin}
        />
      )}
    </AppShell>
  );
}

function LibraryTabSwitch({
  tab,
  onChange,
}: {
  tab: LibraryTab;
  onChange: (tab: LibraryTab) => void;
}) {
  const tabs: { id: LibraryTab; label: string }[] = [
    { id: "uploads", label: "Uploads" },
    { id: "outline", label: "Outline" },
  ];

  return (
    <div className="mb-4 flex gap-1 rounded-xl border border-[var(--min-border)] bg-[var(--min-bg)] p-1">
      {tabs.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "flex-1 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors sm:text-xs",
            tab === id
              ? "bg-[var(--min-surface)] text-theme shadow-[var(--min-shadow)]"
              : "text-theme-muted active:text-theme",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

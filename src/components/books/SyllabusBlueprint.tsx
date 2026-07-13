import { useMemo, useState } from "react";
import { BookOpen, ChevronRight, FileText, Trash2 } from "lucide-react";
import type { SyllabusChapter, SyllabusGrade, UploadedBook } from "@/lib/syllabus-data";
import { bookDisplayTitle, currentUserId } from "@/lib/syllabus-data";
import { useBooks } from "@/lib/books-context";
import { useSubjectAssignments } from "@/lib/subject-assignments-context";
import {
  canManageSubjectAssignment,
  isSubjectTeacherForGrade,
  listGradeProgress,
  primaryGradeForLabel,
} from "@/lib/syllabus-utils";
import { subjectLineColors } from "@/lib/metro-utils";
import { SubjectAssignPicker } from "@/components/books/SubjectAssignPicker";
import { BookAnalysisBadge, SubjectBookUpload } from "@/components/books/SubjectBookUpload";
import {
  treeBranchDividerClass,
  treeChevronClass,
  treeContentSlotClass,
  treePanelClass,
  treeRowButtonClass,
  treeRowStyle,
  treeSubjectActionsClass,
  treeSubjectRowClass,
} from "@/lib/tree-layout";
import { cn } from "@/lib/utils";

type SyllabusBlueprintProps = {
  grades: SyllabusGrade[];
  allGrades: SyllabusGrade[];
  books: UploadedBook[];
  isAdmin?: boolean;
};

export function SyllabusBlueprint({
  grades,
  allGrades,
  books,
  isAdmin = false,
}: SyllabusBlueprintProps) {
  const { removeBook } = useBooks();
  const { assignments, setSubjectAssignment } = useSubjectAssignments();
  const [expandedGrade, setExpandedGrade] = useState<string | null>(null);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [selectedBookBySubject, setSelectedBookBySubject] = useState<Record<string, string>>({});

  const gradeRows = useMemo(() => listGradeProgress(grades), [grades]);

  const booksByGradeSubject = useMemo(() => {
    const map = new Map<string, UploadedBook[]>();
    for (const book of books) {
      const key = `${book.gradeLabel}::${book.subjectId}`;
      const list = map.get(key) ?? [];
      list.push(book);
      map.set(key, list);
    }
    for (const [, list] of map) {
      list.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    }
    return map;
  }, [books]);

  function subjectVisible(gradeLabel: string, subjectId: string): boolean {
    if (isAdmin) return true;
    return isSubjectTeacherForGrade(allGrades, gradeLabel, subjectId, currentUserId);
  }

  function showAssignPicker(gradeLabel: string, subjectId: string): boolean {
    return canManageSubjectAssignment(allGrades, gradeLabel, subjectId, {
      isAdmin,
      teacherId: currentUserId,
    });
  }

  function canUploadBook(gradeLabel: string, subjectId: string): boolean {
    if (isAdmin) return true;
    return isSubjectTeacherForGrade(allGrades, gradeLabel, subjectId, currentUserId);
  }

  if (grades.length === 0) {
    return (
      <p className="rounded-[10px] border border-dashed border-[var(--min-border)] px-4 py-8 text-center text-sm text-theme-muted">
        No curriculum outline for your subjects yet.
      </p>
    );
  }

  const visibleGradeRows = gradeRows.filter((row) => {
    const grade = primaryGradeForLabel(grades, row.gradeLabel);
    if (!grade) return false;
    return grade.subjects.some((s) => subjectVisible(row.gradeLabel, s.id));
  });

  if (visibleGradeRows.length === 0) {
    return (
      <p className="rounded-[10px] border border-dashed border-[var(--min-border)] px-4 py-8 text-center text-sm text-theme-muted">
        {isAdmin
          ? "No curriculum outline available."
          : "No outline assigned to your subjects yet."}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {visibleGradeRows.map((row) => {
        const grade = primaryGradeForLabel(grades, row.gradeLabel);
        if (!grade) return null;

        const visibleSubjects = grade.subjects.filter((s) =>
          subjectVisible(row.gradeLabel, s.id),
        );
        const gradeOpen = expandedGrade === row.gradeLabel;
        const topicCount = visibleSubjects.reduce(
          (n, s) => n + s.chapters.reduce((m, c) => m + c.topics.length, 0),
          0,
        );
        const chapterCount = visibleSubjects.reduce((n, s) => n + s.chapters.length, 0);

        return (
          <div key={row.gradeLabel} className="card-elevated overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandedGrade(gradeOpen ? null : row.gradeLabel)}
              className={treeRowButtonClass("transition-colors hover:bg-[var(--min-surface-hover)]")}
              style={treeRowStyle(0, "var(--sw-gold-500)")}
            >
              <ChevronRight className={treeChevronClass(gradeOpen, "lg")} />
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold text-theme">{row.gradeLabel}</p>
                <p className="text-xs text-theme-muted">
                  {visibleSubjects.length} subjects · {chapterCount} chapters · {topicCount} topics
                </p>
              </div>
            </button>

            {gradeOpen && (
              <div className={treePanelClass()}>
                {visibleSubjects.map((subject) => {
                  const colors = subjectLineColors(subject.name);
                  const subjectKey = `${row.gradeLabel}-${subject.id}`;
                  const subjectOpen = expandedSubject === subjectKey;
                  const bookKey = `${row.gradeLabel}::${subject.id}`;
                  const subjectBooks = booksByGradeSubject.get(bookKey) ?? [];
                  const analyzedBooks = subjectBooks.filter(
                    (b) => b.status === "analyzed" && b.analyzedChapters?.length,
                  );
                  const selectedBookId =
                    selectedBookBySubject[subjectKey] ??
                    analyzedBooks[0]?.id ??
                    null;
                  const selectedBook = analyzedBooks.find((b) => b.id === selectedBookId);
                  const outlineChapters: SyllabusChapter[] =
                    selectedBook?.analyzedChapters ?? subject.chapters;
                  const outlineSource = selectedBook
                    ? `From ${bookDisplayTitle(selectedBook)}`
                    : "School curriculum";

                  return (
                    <div key={subjectKey} className={treeBranchDividerClass()}>
                      <div className={treeSubjectRowClass()} style={treeRowStyle(1, colors.color)}>
                        <button
                          type="button"
                          onClick={() => {
                            setExpandedSubject(subjectOpen ? null : subjectKey);
                            if (subjectOpen) setExpandedChapter(null);
                          }}
                          className="flex min-w-0 flex-1 items-center gap-3 py-2 text-left transition-colors active:bg-[var(--min-surface-hover)] sm:gap-2.5 sm:py-3"
                        >
                          <BookOpen className="h-4 w-4 shrink-0" style={{ color: colors.color }} />
                          <ChevronRight className={treeChevronClass(subjectOpen, "md")} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-display text-sm font-medium text-theme">
                              {subject.name}
                            </p>
                            <p className="mt-0.5 text-[11px] text-theme-muted">
                              {subjectBooks.length > 0
                                ? `${subjectBooks.length} book${subjectBooks.length !== 1 ? "s" : ""} · `
                                : ""}
                              {outlineChapters.length} chapter
                              {outlineChapters.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </button>
                        <div className={treeSubjectActionsClass()}>
                        {canUploadBook(row.gradeLabel, subject.id) && (
                          <SubjectBookUpload
                            gradeLabel={row.gradeLabel}
                            gradeId={grade.id}
                            subjectId={subject.id}
                            subjectName={subject.name}
                            compact
                          />
                        )}
                        {showAssignPicker(row.gradeLabel, subject.id) && (
                          <SubjectAssignPicker
                            gradeLabel={row.gradeLabel}
                            subjectId={subject.id}
                            subjectName={subject.name}
                            grades={allGrades}
                            assignments={assignments}
                            inline
                            compact
                            onAssign={(assignedTeacherIds) =>
                              setSubjectAssignment(row.gradeLabel, subject.id, assignedTeacherIds)
                            }
                          />
                        )}
                        </div>
                      </div>

                      {subjectOpen && (
                        <>
                          <div
                            className={treeContentSlotClass("space-y-2 border-b border-[var(--min-border)] py-3")}
                          >
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-theme-muted">
                              Uploaded books
                            </p>
                            {subjectBooks.length === 0 ? (
                              <p className="text-[13px] text-theme-muted">
                                No books yet. Upload a PDF to generate an outline.
                              </p>
                            ) : (
                              subjectBooks.map((book) => {
                                const isSelected = book.id === selectedBookId;
                                const canSelect =
                                  book.status === "analyzed" && !!book.analyzedChapters?.length;

                                return (
                                  <div
                                    key={book.id}
                                    className={cn(
                                      "flex items-center gap-2 rounded-xl border border-[var(--min-border)] bg-[var(--min-surface)] p-3",
                                      isSelected && canSelect && "ring-1 ring-[var(--min-accent)]",
                                    )}
                                    style={{ borderLeftWidth: 3, borderLeftColor: colors.color }}
                                  >
                                    <FileText className="h-4 w-4 shrink-0 text-theme-muted" />
                                    <button
                                      type="button"
                                      disabled={!canSelect}
                                      onClick={() =>
                                        canSelect &&
                                        setSelectedBookBySubject((prev) => ({
                                          ...prev,
                                          [subjectKey]: book.id,
                                        }))
                                      }
                                      className={cn(
                                        "min-w-0 flex-1 text-left",
                                        canSelect && "hover:opacity-90",
                                        !canSelect && "cursor-default",
                                      )}
                                    >
                                      <p className="truncate text-sm font-medium text-theme">
                                        {bookDisplayTitle(book)}
                                      </p>
                                      <p className="mt-0.5 truncate text-[11px] text-theme-muted">
                                        {book.fileName} · {book.uploadedAt}
                                      </p>
                                    </button>
                                    <BookAnalysisBadge status={book.status} />
                                    <button
                                      type="button"
                                      onClick={() => removeBook(book.id)}
                                      className="shrink-0 rounded-md p-1.5 text-theme-faint hover:text-[var(--min-pink)]"
                                      aria-label={`Delete ${bookDisplayTitle(book)}`}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          <div className={treeContentSlotClass("py-2")}>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-theme-muted">
                              Outline · {outlineSource}
                            </p>
                          </div>

                          {outlineChapters.map((ch, chIdx) => {
                            const chapterKey = `${subjectKey}-${ch.id}`;
                            const chapterOpen = expandedChapter === chapterKey;

                            return (
                              <div key={chapterKey} className={treeBranchDividerClass()}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedChapter(chapterOpen ? null : chapterKey)
                                  }
                                  className={treeRowButtonClass("bg-[var(--min-bg)]")}
                                  style={treeRowStyle(2, colors.color)}
                                >
                                  <ChevronRight className={treeChevronClass(chapterOpen, "sm")} />
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-theme">
                                      {ch.title}
                                    </p>
                                    <p className="text-[10px] text-theme-muted">
                                      {ch.topics.length === 0
                                        ? "Single unit"
                                        : `${ch.topics.length} topic${ch.topics.length !== 1 ? "s" : ""}`}
                                    </p>
                                  </div>
                                  <span
                                    className="shrink-0 font-mono text-[10px] font-semibold text-theme-muted"
                                    data-metric
                                  >
                                    {chIdx + 1}
                                  </span>
                                </button>

                                {chapterOpen && (
                                  <div className={treeContentSlotClass("space-y-2 py-3")}>
                                    {ch.topics.length === 0 ? (
                                      <p className="text-[13px] text-theme-muted">
                                        Single unit — no topic split.
                                      </p>
                                    ) : (
                                      ch.topics.map((topic, tIdx) => (
                                        <div
                                          key={topic.id}
                                          className="rounded-xl border border-[var(--min-border)] bg-[var(--min-surface)] p-4"
                                          style={{
                                            borderLeftWidth: 3,
                                            borderLeftColor: colors.color,
                                          }}
                                        >
                                          <p className="text-[17px] font-medium leading-snug text-theme sm:text-sm">
                                            {topic.title}
                                          </p>
                                          <p className="mt-0.5 font-mono text-[10px] text-theme-muted">
                                            {chIdx + 1}.{tIdx + 1}
                                          </p>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

import { useMemo, useState } from "react";
import { BookOpen, ChevronRight, FileText, Sparkles, Trash2 } from "lucide-react";
import type { SyllabusGrade, UploadedNote } from "@/lib/syllabus-data";
import { noteDisplayBody, noteDisplayTitle } from "@/lib/syllabus-data";
import { currentUserId } from "@/lib/syllabus-data";
import { useNotes } from "@/lib/notes-context";
import { useSubjectAssignments } from "@/lib/subject-assignments-context";
import {
  canManageSubjectAssignment,
  isSubjectTeacherForGrade,
  listGradeProgress,
  primaryGradeForLabel,
  resolveNoteContext,
  resolveNoteGradeLabel,
} from "@/lib/syllabus-utils";
import { subjectLineColors } from "@/lib/metro-utils";
import { SubjectAssignPicker } from "@/components/books/SubjectAssignPicker";
import { SubjectNoteUpload } from "@/components/books/SubjectNoteUpload";
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

type BooksOutlineProps = {
  notes: UploadedNote[];
  grades: SyllabusGrade[];
  allGrades: SyllabusGrade[];
  isAdmin?: boolean;
};

export function BooksOutline({
  notes,
  grades,
  allGrades,
  isAdmin = false,
}: BooksOutlineProps) {
  const { removeNote } = useNotes();
  const { assignments, setSubjectAssignment } = useSubjectAssignments();
  const [expandedGrade, setExpandedGrade] = useState<string | null>(null);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [expandedNote, setExpandedNote] = useState<string | null>(null);

  const gradeRows = useMemo(() => listGradeProgress(grades), [grades]);

  const notesByGradeSubject = useMemo(() => {
    const map = new Map<string, UploadedNote[]>();
    for (const note of notes) {
      const label = resolveNoteGradeLabel(note, grades);
      if (!label) continue;
      const grade = primaryGradeForLabel(grades, label);
      if (!grade?.subjects.some((s) => s.id === note.subjectId)) continue;
      const key = `${label}::${note.subjectId}`;
      const list = map.get(key) ?? [];
      list.push(note);
      map.set(key, list);
    }
    return map;
  }, [notes, grades]);

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

  const hasManageableSubjects = useMemo(() => {
    if (!isAdmin) return false;
    for (const row of gradeRows) {
      const grade = primaryGradeForLabel(grades, row.gradeLabel);
      if (!grade) continue;
      for (const subject of grade.subjects) {
        if (showAssignPicker(row.gradeLabel, subject.id)) return true;
      }
    }
    return false;
  }, [gradeRows, grades, isAdmin]);

  const totalNotes = useMemo(() => {
    let count = 0;
    for (const row of gradeRows) {
      const grade = primaryGradeForLabel(grades, row.gradeLabel);
      if (!grade) continue;
      for (const subject of grade.subjects) {
        if (!subjectVisible(row.gradeLabel, subject.id)) continue;
        count += notesByGradeSubject.get(`${row.gradeLabel}::${subject.id}`)?.length ?? 0;
      }
    }
    return count;
  }, [gradeRows, grades, notesByGradeSubject, isAdmin, assignments, allGrades]);

  if (grades.length === 0) {
    return (
      <p className="rounded-[10px] border border-dashed border-[var(--min-border)] px-4 py-8 text-center text-sm text-theme-muted">
        No classes available.
      </p>
    );
  }

  const visibleGradeRows = gradeRows.filter((row) => {
    const grade = primaryGradeForLabel(grades, row.gradeLabel);
    if (!grade) return false;
    return grade.subjects.some((s) => subjectVisible(row.gradeLabel, s.id));
  });

  if (!isAdmin && totalNotes === 0 && !hasManageableSubjects) {
    return (
      <p className="rounded-[10px] border border-dashed border-[var(--min-border)] px-4 py-8 text-center text-sm text-theme-muted">
        Nothing assigned to your subjects yet.
      </p>
    );
  }

  if (visibleGradeRows.length === 0) {
    return (
      <p className="rounded-[10px] border border-dashed border-[var(--min-border)] px-4 py-8 text-center text-sm text-theme-muted">
        {isAdmin
          ? "Nothing uploaded yet. Tap Add notes above."
          : "Nothing assigned to your subjects yet."}
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
                  {visibleSubjects.length} subject{visibleSubjects.length !== 1 ? "s" : ""}
                </p>
              </div>
            </button>

            {gradeOpen && (
              <div className={treePanelClass()}>
                {visibleSubjects.map((subject) => {
                  const colors = subjectLineColors(subject.name);
                  const subjectKey = `${row.gradeLabel}::${subject.id}`;
                  const panelKey = `${row.gradeLabel}-${subject.id}`;
                  const subjectOpen = expandedSubject === panelKey;
                  const subjectNotes = notesByGradeSubject.get(subjectKey) ?? [];

                  return (
                    <div key={panelKey} className={treeBranchDividerClass()}>
                      <div className={treeSubjectRowClass()} style={treeRowStyle(1, colors.color)}>
                        <button
                          type="button"
                          onClick={() => setExpandedSubject(subjectOpen ? null : panelKey)}
                          className="flex min-w-0 flex-1 items-center gap-3 py-2 text-left transition-colors active:bg-[var(--min-surface-hover)] sm:gap-2.5 sm:py-3"
                        >
                          <BookOpen className="h-4 w-4 shrink-0" style={{ color: colors.color }} />
                          <ChevronRight className={treeChevronClass(subjectOpen, "md")} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-display text-sm font-medium text-theme">
                              {subject.name}
                            </p>
                            {subjectNotes.length > 0 && (
                              <p className="mt-0.5 text-[11px] text-theme-muted">
                                {subjectNotes.length} upload{subjectNotes.length !== 1 ? "s" : ""}
                              </p>
                            )}
                          </div>
                        </button>
                        <div className={treeSubjectActionsClass()}>
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
                        {(isAdmin ||
                          isSubjectTeacherForGrade(
                            allGrades,
                            row.gradeLabel,
                            subject.id,
                            currentUserId,
                          )) && (
                          <SubjectNoteUpload
                            gradeLabel={row.gradeLabel}
                            gradeId={grade.id}
                            subjectId={subject.id}
                            compact
                          />
                        )}
                        </div>
                      </div>

                      {subjectOpen && (
                        <div className={treeContentSlotClass("space-y-2 py-3")}>
                          {subjectNotes.length === 0 ? (
                            <p className="text-[13px] text-theme-muted">Nothing here yet.</p>
                          ) : (
                            subjectNotes.map((note) => {
                              const ctx = resolveNoteContext(grades, note);
                              const open = expandedNote === note.id;

                              return (
                                <div
                                  key={note.id}
                                  className="rounded-xl border border-[var(--min-border)] bg-[var(--min-surface)] p-4"
                                  style={{ borderLeftWidth: 3, borderLeftColor: colors.color }}
                                >
                                  <div className="flex items-start gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setExpandedNote(open ? null : note.id)}
                                      className="flex min-w-0 flex-1 items-start gap-2 text-left"
                                    >
                                      <FileText
                                        className="mt-0.5 h-4 w-4 shrink-0 text-theme-muted"
                                        strokeWidth={2}
                                      />
                                      <div className="min-w-0 flex-1">
                                        <p className="text-[17px] font-medium leading-snug text-theme sm:text-sm">
                                          {noteDisplayTitle(note)}
                                        </p>
                                        <p className="mt-0.5 text-[11px] text-theme-muted">
                                          {ctx.chapterTitle} · {ctx.topicTitle}
                                        </p>
                                      </div>
                                      <ChevronRight
                                        className={cn(
                                          "mt-1 h-3.5 w-3.5 shrink-0 text-theme-muted transition-transform",
                                          open && "rotate-90",
                                        )}
                                      />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removeNote(note.id)}
                                      className="shrink-0 rounded-md p-1.5 text-theme-faint hover:text-[var(--min-pink)]"
                                      aria-label={`Delete ${noteDisplayTitle(note)}`}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>

                                  {open && (
                                    <div className="mt-3 space-y-2 border-t border-[var(--min-border)] pt-3">
                                      <p className="text-[11px] text-theme-muted">
                                        {note.uploadedAt}
                                        {note.fileName && (
                                          <Sparkles className="ml-1 inline h-3 w-3 text-theme-accent" />
                                        )}
                                      </p>
                                      <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-theme-muted sm:text-sm">
                                        {noteDisplayBody(note)}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
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

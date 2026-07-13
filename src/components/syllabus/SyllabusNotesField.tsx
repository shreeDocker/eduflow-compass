import { useMemo, useState, type ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import { noteDisplayBody, noteDisplayTitle, currentUserId } from "@/lib/syllabus-data";
import { useNotes } from "@/lib/notes-context";
import type { SyllabusGrade } from "@/lib/syllabus-data";
import { isNoteVisibleToTeacher } from "@/lib/syllabus-utils";
import { useSubjectAssignments } from "@/lib/subject-assignments-context";
import { useRole } from "@/lib/role-context";
import { cn } from "@/lib/utils";

type SyllabusNotesFieldProps = {
  grades: SyllabusGrade[];
  gradeId: string;
  subjectId: string;
  chapterId?: string;
  topicId?: string;
  subjectName: string;
  chapterTitle?: string;
  topicTitle?: string;
  className?: string;
  variant?: "block" | "inline";
  /** Renders on the same row as notes (e.g. due date), left side */
  leadingSlot?: ReactNode;
};

export function SyllabusNotesField({
  grades,
  gradeId,
  subjectId,
  chapterId,
  topicId,
  className,
  variant = "block",
  leadingSlot,
}: SyllabusNotesFieldProps) {
  const { isAdmin } = useRole();
  const { assignments } = useSubjectAssignments();
  const { notes, addNote, removeNote } = useNotes();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const scopeChapterId = chapterId ?? "_subject";
  const scopeTopicId = topicId ?? (chapterId ? "_chapter" : "_subject");
  const isInline = variant === "inline";
  const gradeLabel = grades.find((g) => g.id === gradeId)?.label;

  const matched = useMemo(
    () =>
      notes.filter(
        (n) =>
          n.subjectId === subjectId &&
          n.chapterId === scopeChapterId &&
          n.topicId === scopeTopicId &&
          (n.gradeId === gradeId || (!!gradeLabel && n.gradeLabel === gradeLabel)) &&
          (isAdmin || isNoteVisibleToTeacher(n, currentUserId, grades, assignments)),
      ),
    [notes, gradeId, gradeLabel, subjectId, scopeChapterId, scopeTopicId, isAdmin, grades, assignments],
  );

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (!trimmedTitle || !trimmedBody) return;

    const grade = grades.find((g) => g.id === gradeId);

    addNote({
      id: `n-${Date.now()}`,
      title: trimmedTitle,
      body: trimmedBody,
      gradeLabel: grade?.label ?? "",
      uploadedAt: new Date().toISOString().slice(0, 10),
      gradeId,
      subjectId,
      chapterId: scopeChapterId,
      topicId: scopeTopicId,
      uploadedBy: "teacher",
    });

    setTitle("");
    setBody("");
    setOpen(false);
  }

  const notesTrigger = (
    <div className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1 text-[11px] font-medium text-theme-accent",
          !isInline && "ml-auto",
        )}
      >
        <Plus className="h-3 w-3" />
        Add notes
      </button>
      {matched.length > 0 && (
        <span className="rounded-full bg-[var(--min-surface-hover)] px-1.5 py-px text-[10px] font-medium text-theme-muted">
          {matched.length}
        </span>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        isInline ? "mt-2 border-t border-[var(--min-border)] pt-2" : "border-t border-[var(--min-border)] pt-2.5",
        className,
      )}
    >
      {isInline && leadingSlot ? (
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-2">
          <div className="min-w-0 max-w-full">{leadingSlot}</div>
          <div className="shrink-0">{notesTrigger}</div>
        </div>
      ) : (
        <div className="flex w-full items-center gap-2">{notesTrigger}</div>
      )}

      {matched.length > 0 && (
        <ul className={cn("space-y-1.5", isInline ? "mt-2" : "mt-2")}>
          {matched.map((n) => (
            <li
              key={n.id}
              className="flex items-start gap-2 rounded-lg border border-[var(--min-border)] bg-[var(--min-bg)] px-2.5 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium text-theme">
                  {noteDisplayTitle(n)}
                </p>
                <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-theme-muted">
                  {noteDisplayBody(n)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeNote(n.id)}
                className="shrink-0 rounded-md p-1 text-theme-faint transition-colors hover:bg-[var(--min-surface-hover)] hover:text-[var(--min-pink)]"
                aria-label={`Delete ${noteDisplayTitle(n)}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <form onSubmit={handleAdd} className="mt-2 space-y-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full rounded-lg border border-[var(--min-border)] bg-[var(--min-bg)] px-2.5 py-1.5 text-[12px] text-theme outline-none focus:border-[var(--min-accent)]"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write here…"
            rows={3}
            className="w-full resize-none rounded-lg border border-[var(--min-border)] bg-[var(--min-bg)] px-2.5 py-1.5 text-[12px] leading-relaxed text-theme outline-none focus:border-[var(--min-accent)]"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setTitle("");
                setBody("");
              }}
              className="rounded-lg px-3 py-1.5 text-[12px] font-medium text-theme-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !body.trim()}
              className="rounded-lg bg-[var(--min-accent)] px-3 py-1.5 text-[12px] font-semibold text-[var(--min-bg)] disabled:opacity-40"
            >
              Save
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

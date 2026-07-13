import { useMemo, useState } from "react";
import { ChevronRight, Sparkles, Trash2 } from "lucide-react";
import { noteDisplayBody, noteDisplayTitle } from "@/lib/syllabus-data";
import { useNotes } from "@/lib/notes-context";
import type { SyllabusGrade, UploadedNote } from "@/lib/syllabus-data";
import { resolveNoteContext } from "@/lib/syllabus-utils";
import { ProgressBadge, ProgressBar } from "@/components/syllabus/ProgressBar";
import { cn } from "@/lib/utils";

type NotesOverviewProps = {
  notes: UploadedNote[];
  grades: SyllabusGrade[];
};

export function NotesOverview({ notes, grades }: NotesOverviewProps) {
  const { removeNote } = useNotes();
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return notes.filter((note) => {
      const grade = grades.find((g) => g.id === note.gradeId);
      if (!grade) return false;
      return grade.subjects.some((s) => s.id === note.subjectId);
    });
  }, [notes, grades]);

  if (filtered.length === 0) {
    return (
      <p className="rounded-[10px] border border-dashed border-[var(--min-border)] px-4 py-8 text-center text-sm text-theme-muted">
        No notes for this view yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {filtered.map((note) => {
        const ctx = resolveNoteContext(grades, note);
        const open = expanded === note.id;

        return (
          <div key={note.id} className="card-elevated overflow-hidden">
            <button
              type="button"
              onClick={() => setExpanded(open ? null : note.id)}
              className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-[var(--min-surface-hover)]"
              style={{ borderLeft: "3px solid var(--sw-violet-400)" }}
            >
              <ChevronRight
                className={cn(
                  "h-4 w-4 shrink-0 text-theme-muted transition-transform",
                  open && "rotate-90",
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-display text-sm font-semibold text-theme">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-[var(--sw-violet-500)]" />
                  <span className="truncate">{noteDisplayTitle(note)}</span>
                </p>
                <p className="mt-0.5 text-[11px] text-theme-muted">
                  {ctx.gradeLabel} · {ctx.subjectName} · {ctx.chapterTitle}
                </p>
              </div>
              {ctx.topicProgress !== null && <ProgressBadge value={ctx.topicProgress} />}
            </button>

            {open && (
              <div className="space-y-3 border-t border-[var(--min-border)] bg-[var(--min-bg)] p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[11px] text-theme-muted">
                    {note.uploadedAt}
                    {ctx.teacherName && ` · ${ctx.teacherName}`} · {ctx.topicTitle}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeNote(note.id)}
                    className="shrink-0 rounded-md p-1 text-theme-faint transition-colors hover:bg-[var(--min-surface-hover)] hover:text-[var(--min-pink)]"
                    aria-label={`Delete ${noteDisplayTitle(note)}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  {ctx.topicProgress !== null && (
                    <MiniProgress label="Topic" value={ctx.topicProgress} accent="var(--sw-violet-500)" />
                  )}
                  {ctx.chapterProgress !== null && (
                    <MiniProgress label="Chapter" value={ctx.chapterProgress} accent="var(--sw-sapphire-500)" />
                  )}
                  {ctx.subjectProgress !== null && (
                    <MiniProgress label="Subject" value={ctx.subjectProgress} accent="var(--sw-gold-500)" />
                  )}
                </div>

                <p className="whitespace-pre-wrap text-sm leading-relaxed text-theme-muted">
                  {noteDisplayBody(note)}
                </p>

                {note.keyPoints && note.keyPoints.length > 0 && (
                  <ul className="flex flex-wrap gap-1.5">
                    {note.keyPoints.map((pt) => (
                      <li
                        key={pt}
                        className="rounded-full bg-[var(--min-surface)] px-2.5 py-1 text-[10px] font-medium text-[var(--sw-violet-700)] ring-1 ring-[var(--sw-violet-100)]"
                      >
                        {pt}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MiniProgress({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-[8px] border border-[var(--min-border)] bg-[var(--min-surface)] px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-theme-muted">{label}</span>
        <span className="font-mono text-xs font-semibold" data-metric>
          {value}%
        </span>
      </div>
      <ProgressBar value={value} accent={accent} size="sm" className="mt-1.5" />
    </div>
  );
}

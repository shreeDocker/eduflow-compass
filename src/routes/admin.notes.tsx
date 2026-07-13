import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Sparkles, Upload, CheckCircle2, Trash2, ChevronRight } from "lucide-react";
import { noteDisplayBody, noteDisplayTitle, demoUploadPrefill } from "@/lib/syllabus-data";
import { useNotes } from "@/lib/notes-context";
import { useRole } from "@/lib/role-context";
import { currentUserId } from "@/lib/syllabus-data";
import { useSyllabusProgress } from "@/lib/syllabus-progress-context";
import { filterGradesForTeacher, listGradeProgress, mockAiSummary, primaryGradeForLabel } from "@/lib/syllabus-utils";

export const Route = createFileRoute("/admin/notes")({
  head: () => ({
    meta: [
      { title: "Add notes — Swotify Plus Admin" },
      { name: "description", content: "Upload syllabus notes — AI maps and summarises by grade, subject, chapter, topic." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminNotesPage,
});

function AdminNotesPage() {
  const { isAdmin } = useRole();
  const { notes, addNote, removeNote } = useNotes();
  const { grades: allGrades } = useSyllabusProgress();
  const availableGrades = useMemo(
    () => (isAdmin ? allGrades : filterGradesForTeacher(allGrades, currentUserId)),
    [allGrades, isAdmin],
  );

  const gradeOptions = useMemo(() => listGradeProgress(availableGrades), [availableGrades]);

  const [fileName, setFileName] = useState(demoUploadPrefill.fileName);
  const [noteTitle, setNoteTitle] = useState(demoUploadPrefill.noteTitle);
  const [noteBody, setNoteBody] = useState(demoUploadPrefill.noteBody);
  const [gradeLabel, setGradeLabel] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [processing, setProcessing] = useState(false);
  const [lastUploaded, setLastUploaded] = useState<string | null>(null);

  const primaryGrade = useMemo(
    () => (gradeLabel ? primaryGradeForLabel(availableGrades, gradeLabel) : undefined),
    [availableGrades, gradeLabel],
  );

  useEffect(() => {
    if (gradeOptions.length === 0) return;
    setGradeLabel((prev) =>
      prev && gradeOptions.some((g) => g.gradeLabel === prev)
        ? prev
        : gradeOptions.find((g) => g.gradeLabel === "Grade 9")?.gradeLabel ?? gradeOptions[0].gradeLabel,
    );
  }, [gradeOptions]);

  useEffect(() => {
    if (!primaryGrade || subjectId) return;
    const science = primaryGrade.subjects.find((s) => s.id === "science");
    const motion = science?.chapters.find((c) => c.id === "sci-motion");
    const velocity = motion?.topics.find((t) => t.id === "t3");
    if (!science || !motion || !velocity) return;
    setSubjectId(science.id);
    setChapterId(motion.id);
    setTopicId(velocity.id);
  }, [primaryGrade, subjectId]);

  const subjects = primaryGrade?.subjects ?? [];
  const selectedSubject = subjects.find((s) => s.id === subjectId);
  const chapters = selectedSubject?.chapters ?? [];
  const selectedChapter = chapters.find((c) => c.id === chapterId);
  const topics = selectedChapter?.topics ?? [];

  function handleGradeChange(next: string) {
    setGradeLabel(next);
    setSubjectId("");
    setChapterId("");
    setTopicId("");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      if (!noteTitle.trim()) {
        setNoteTitle(file.name.replace(/\.[^.]+$/, ""));
      }
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const title = noteTitle.trim();
    const body = noteBody.trim();
    if (!title || !body || !gradeLabel || !primaryGrade || !subjectId || !chapterId || !topicId) return;

    setProcessing(true);
    let summary = body;
    let keyPoints: string[] | undefined;
    const grade = primaryGrade;
    const subject = grade.subjects.find((s) => s.id === subjectId)!;
    const chapter = subject.chapters.find((c) => c.id === chapterId)!;
    const topic = chapter.topics.find((t) => t.id === topicId)!;

    if (fileName) {
      await new Promise((r) => setTimeout(r, 1200));
      const ai = mockAiSummary(
        fileName,
        `${grade.label} ${grade.section}`,
        subject.name,
        chapter.title,
        topic.title,
      );
      summary = body || ai.summary;
      keyPoints = ai.keyPoints;
    }

    const note = {
      id: `n-${Date.now()}`,
      title,
      body: summary,
      gradeLabel,
      fileName: fileName || undefined,
      uploadedAt: new Date().toISOString().slice(0, 10),
      gradeId: grade.id,
      subjectId,
      chapterId,
      topicId,
      uploadedBy: isAdmin ? ("admin" as const) : ("teacher" as const),
      aiSummary: fileName ? summary : undefined,
      keyPoints,
    };

    addNote(note);
    setProcessing(false);
    setLastUploaded(topic.title);
    setFileName("");
    setNoteTitle("");
    setNoteBody("");
  }

  const recentUploads = useMemo(
    () =>
      [...notes].sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
      ),
    [notes],
  );

  const canSubmit =
    !processing && noteTitle.trim() && noteBody.trim() && gradeLabel && topicId;

  return (
    <AppShell title="Add notes" showBack backTo="/library">
      <form onSubmit={handleUpload} className="space-y-6">
        <section>
          <p className="ios-section-title">Document</p>
          <div className="ios-group">
            <label className="ios-row-btn cursor-pointer">
              <span className="ios-icon-tile">
                <Upload className="h-4 w-4 text-[var(--min-accent)]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[17px] text-theme">
                  {fileName || "Choose file"}
                </p>
                <p className="mt-0.5 text-[13px] text-theme-muted">PDF, DOCX, or TXT · 10 MB max</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-theme-faint" />
              <input
                type="file"
                className="sr-only"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
              />
            </label>
          </div>
          <p className="ios-section-footnote">
            Optional. AI summarises when a file is attached.
          </p>
        </section>

        <section>
          <div className="ios-group">
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Title"
              className="ios-field"
              required
            />
            <div className="ios-sep" />
            <textarea
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder="Write your notes…"
              rows={4}
              className="ios-field min-h-[7rem] resize-none"
              required
            />
          </div>
        </section>

        <section>
          <p className="ios-section-title">Syllabus</p>
          <div className="ios-group">
            <PickerRow label="Grade">
              <select
                value={gradeLabel}
                onChange={(e) => handleGradeChange(e.target.value)}
                className="ios-field ios-field-select ios-picker-value"
                required
              >
                {gradeOptions.map((g) => (
                  <option key={g.gradeLabel} value={g.gradeLabel}>
                    {g.gradeLabel}
                  </option>
                ))}
              </select>
            </PickerRow>
            <div className="ios-sep-inset" />
            <PickerRow label="Subject">
              <select
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value);
                  setChapterId("");
                  setTopicId("");
                }}
                className="ios-field ios-field-select ios-picker-value"
                required
              >
                <option value="">Select</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </PickerRow>
            <div className="ios-sep-inset" />
            <PickerRow label="Chapter">
              <select
                value={chapterId}
                onChange={(e) => {
                  setChapterId(e.target.value);
                  setTopicId("");
                }}
                className="ios-field ios-field-select ios-picker-value"
                required
                disabled={!subjectId}
              >
                <option value="">Select</option>
                {chapters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </PickerRow>
            <div className="ios-sep-inset" />
            <PickerRow label="Topic">
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="ios-field ios-field-select ios-picker-value"
                required
                disabled={!chapterId}
              >
                <option value="">Select</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </PickerRow>
          </div>
          <p className="ios-section-footnote">
            Admins assign access per subject in Books after upload.
          </p>
        </section>

        <button type="submit" disabled={!canSubmit} className="ios-btn-primary">
          {processing ? (
            <>
              <Sparkles className="h-4 w-4 animate-pulse" />
              AI summarising…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Add notes
            </>
          )}
        </button>

        {lastUploaded && (
          <div className="flex items-center gap-2 rounded-[12px] bg-[color-mix(in_oklab,var(--min-green)_14%,var(--min-surface))] px-4 py-3 text-[15px] text-theme-success">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Saved for {gradeLabel} — visible in Books.
          </div>
        )}
      </form>

      <section className="mt-8">
        <p className="ios-section-title">Recent uploads</p>
        {recentUploads.length === 0 ? (
          <p className="rounded-[12px] bg-[var(--min-surface)] px-4 py-6 text-center text-[15px] text-theme-muted">
            No uploads yet.
          </p>
        ) : (
          <div className="ios-group">
            {recentUploads.map((n, idx) => (
              <div key={n.id}>
                {idx > 0 && <div className="ios-sep-inset" />}
                <div className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[17px] text-theme">{noteDisplayTitle(n)}</p>
                      <p className="mt-0.5 text-[13px] text-theme-muted">
                        {n.gradeLabel} · {n.uploadedAt}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {n.fileName && <Sparkles className="h-4 w-4 text-theme-accent" />}
                      <button
                        type="button"
                        onClick={() => removeNote(n.id)}
                        className="rounded-md p-1.5 text-theme-faint active:text-[var(--min-pink)]"
                        aria-label={`Delete ${noteDisplayTitle(n)}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-theme-muted">
                    {noteDisplayBody(n)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

function PickerRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="ios-picker-row ios-picker-row--stacked">
      <span className="ios-picker-label">{label}</span>
      {children}
    </div>
  );
}

import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { useRole } from "@/lib/role-context";
import { useNotes } from "@/lib/notes-context";
import { cn } from "@/lib/utils";

type SubjectNoteUploadProps = {
  gradeLabel: string;
  gradeId: string;
  subjectId: string;
  compact?: boolean;
  className?: string;
};

export function SubjectNoteUpload({
  gradeLabel,
  gradeId,
  subjectId,
  compact = false,
  className,
}: SubjectNoteUploadProps) {
  const { isAdmin } = useRole();
  const { addNote } = useNotes();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    const title = file.name.replace(/\.[^.]+$/, "");
    setBusy(true);
    await new Promise((r) => setTimeout(r, 600));

    addNote({
      id: `n-${Date.now()}`,
      title,
      body: `Uploaded document: ${file.name}. Content will be summarized when AI processing is enabled.`,
      gradeLabel,
      gradeId,
      subjectId,
      chapterId: "_subject",
      topicId: "_subject",
      uploadedAt: new Date().toISOString().slice(0, 10),
      uploadedBy: isAdmin ? "admin" : "teacher",
      fileName: file.name,
    });

    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  }

  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "inline-flex shrink-0 items-center gap-1 rounded-lg border border-[var(--min-border)] bg-[var(--min-surface)] font-medium text-theme-accent transition-colors hover:bg-[var(--min-surface-hover)] disabled:opacity-60",
          compact ? "px-2 py-1 text-[11px]" : "px-2.5 py-1.5 text-[12px]",
          className,
        )}
      >
        {busy ? (
          <Loader2 className={cn("animate-spin", compact ? "h-3 w-3" : "h-3.5 w-3.5")} />
        ) : (
          <Upload className={cn(compact ? "h-3 w-3" : "h-3.5 w-3.5")} />
        )}
        {busy ? "Uploading…" : "Upload"}
      </button>
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept=".pdf,.doc,.docx,.txt"
        onChange={onChange}
      />
    </>
  );
}

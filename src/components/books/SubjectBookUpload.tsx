import { useRef, useState } from "react";
import { Loader2, Sparkles, Upload } from "lucide-react";
import { useRole } from "@/lib/role-context";
import { useBooks } from "@/lib/books-context";
import type { UploadedBook } from "@/lib/syllabus-data";
import { mockBookOutline } from "@/lib/syllabus-utils";
import { cn } from "@/lib/utils";

type SubjectBookUploadProps = {
  gradeLabel: string;
  gradeId: string;
  subjectId: string;
  subjectName: string;
  compact?: boolean;
  className?: string;
};

export function SubjectBookUpload({
  gradeLabel,
  gradeId,
  subjectId,
  subjectName,
  compact = false,
  className,
}: SubjectBookUploadProps) {
  const { isAdmin } = useRole();
  const { addBook, updateBook } = useBooks();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    const id = `book-${Date.now()}`;
    const title = file.name.replace(/\.[^.]+$/, "");
    const book: UploadedBook = {
      id,
      fileName: file.name,
      title,
      gradeLabel,
      gradeId,
      subjectId,
      uploadedAt: new Date().toISOString().slice(0, 10),
      uploadedBy: isAdmin ? "admin" : "teacher",
      status: "analyzing",
    };

    addBook(book);
    setBusy(true);

    await new Promise((r) => setTimeout(r, 1400));

    updateBook(id, {
      status: "analyzed",
      analyzedChapters: mockBookOutline(file.name, subjectName),
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
        {busy ? "Analyzing…" : "Upload book"}
      </button>
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept=".pdf,.epub,.doc,.docx,.txt"
        onChange={onChange}
      />
    </>
  );
}

export function BookAnalysisBadge({ status }: { status: UploadedBook["status"] }) {
  if (status === "analyzed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_oklab,var(--min-green)_12%,var(--min-surface))] px-2 py-0.5 text-[10px] font-medium text-theme-success">
        <Sparkles className="h-3 w-3" />
        Outline ready
      </span>
    );
  }
  if (status === "analyzing" || status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--min-surface-hover)] px-2 py-0.5 text-[10px] font-medium text-theme-muted">
        <Loader2 className="h-3 w-3 animate-spin" />
        Analyzing…
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="rounded-full bg-[color-mix(in_oklab,var(--min-pink)_12%,var(--min-surface))] px-2 py-0.5 text-[10px] font-medium text-[var(--min-pink)]">
        Analysis failed
      </span>
    );
  }
  return null;
}

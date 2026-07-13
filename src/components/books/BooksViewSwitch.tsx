import { cn } from "@/lib/utils";
import type { AdminBooksView, BooksView } from "@/lib/books-view-types";

export type { AdminBooksView, BooksView, TeacherBooksView } from "@/lib/books-view-types";

type BooksViewSwitchProps = {
  view: BooksView;
  onChange: (view: BooksView) => void;
  className?: string;
};

const ADMIN_TABS: { id: AdminBooksView; label: string }[] = [
  { id: "catalog", label: "Track" },
  { id: "logs", label: "Logs" },
];

export function BooksViewSwitch({ view, onChange, className }: BooksViewSwitchProps) {
  return (
    <div
      className={cn(
        "mb-4 flex gap-1 overflow-x-auto rounded-xl border border-[var(--min-border)] bg-[var(--min-bg)] p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {ADMIN_TABS.map(({ id, label }) => {
        const active = view === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              "shrink-0 rounded-lg px-4 py-2.5 text-[15px] font-medium transition-colors sm:px-3 sm:py-2 sm:text-xs",
              active
                ? "bg-[var(--min-surface)] text-theme shadow-[var(--min-shadow)]"
                : "text-theme-muted active:text-theme",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

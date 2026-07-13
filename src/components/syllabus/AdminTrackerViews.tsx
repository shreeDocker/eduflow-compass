import { cn } from "@/lib/utils";

export type AdminTrackerView = "tree" | "catalog" | "subjects" | "overview";

type AdminTrackerViewSwitchProps = {
  view: AdminTrackerView;
  onChange: (view: AdminTrackerView) => void;
  className?: string;
};

const ADMIN_LAYOUT_TABS: { id: AdminTrackerView; label: string }[] = [
  { id: "catalog", label: "Sections" },
  { id: "subjects", label: "Subjects" },
  { id: "overview", label: "Overview" },
];

/** Legacy layout values still accepted in URLs. */
export function normalizeAdminTrackerView(view: AdminTrackerView | undefined): AdminTrackerView {
  if (view === "tree") return "catalog";
  if (view === "subjects" || view === "overview") return view;
  return "catalog";
}

export function AdminTrackerViewSwitch({
  view,
  onChange,
  className,
}: AdminTrackerViewSwitchProps) {
  const active = normalizeAdminTrackerView(view);

  return (
    <div
      className={cn(
        "mb-4 flex gap-1 overflow-x-auto rounded-xl border border-[var(--min-border)] bg-[var(--min-bg)] p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {ADMIN_LAYOUT_TABS.map(({ id, label }) => {
        const selected = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              "shrink-0 rounded-lg px-4 py-2.5 text-[15px] font-medium transition-colors sm:px-3 sm:py-2 sm:text-xs",
              selected
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

import { Bell, Menu, Search, Sparkles } from "lucide-react";
import { currentTeacher } from "@/lib/mock-data";
import { useRole } from "@/lib/role-context";
import { RoleSwitch } from "@/components/RoleSwitch";
import { SHELL_GUTTER, SHELL_MAX } from "@/components/layout/shell-layout";
import { cn } from "@/lib/utils";

type AppNavbarProps = {
  onMenuClick: () => void;
  pageTitle?: string;
};

export function AppNavbar({ onMenuClick, pageTitle }: AppNavbarProps) {
  const { isAdmin } = useRole();
  const firstName = isAdmin
    ? "Admin"
    : currentTeacher.name.replace(/^Mrs\.?\s|^Mr\.?\s|^Ms\.?\s/i, "").split(" ")[0];

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--min-border)] bg-[var(--sw-surface-0)]">
      <div
        className={cn(
          "mx-auto flex h-[var(--header-h)] w-full items-center gap-2 sm:gap-3",
          SHELL_MAX,
          SHELL_GUTTER,
        )}
      >
        <button
          type="button"
          onClick={onMenuClick}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-[var(--min-border)] text-theme-muted transition-colors hover:bg-[var(--min-surface-hover)] lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-[17px] w-[17px]" />
        </button>

        <div className="min-w-0 flex-1">
          {pageTitle ? (
            <h1 className="truncate font-display text-base font-semibold text-theme lg:text-[15px]">
              {pageTitle}
            </h1>
          ) : (
            <>
              <p className="hidden text-[11px] text-theme-muted sm:block">
                {isAdmin ? "School-wide overview" : currentTeacher.greeting}
              </p>
              <h1 className="truncate font-display text-[15px] font-semibold lg:text-sm">
                <span className="text-theme">
                  {isAdmin ? "Welcome, " : "Hello, "}
                </span>
                <span className="text-[var(--sw-gold-600)]">{firstName}</span>
              </h1>
            </>
          )}
        </div>

        <RoleSwitch variant="navbar" className="hidden shrink-0 sm:flex" />

        <div className="hidden min-w-0 md:block">
          <label className="relative block">
            <span className="sr-only">Search syllabus</span>
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-theme-muted" />
            <input
              type="search"
              placeholder="Search…"
              className="h-8 w-[160px] rounded-[8px] border border-[var(--min-border)] bg-[var(--min-bg)] pl-8 pr-2.5 font-sans text-xs text-theme outline-none transition-all placeholder:text-theme-muted focus:border-[var(--sw-sapphire-400)] focus:bg-[var(--min-surface)] focus:ring-2 focus:ring-[rgba(107,137,171,0.12)] lg:w-[180px]"
            />
          </label>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            className="relative grid h-8 w-8 place-items-center rounded-[8px] border border-[var(--min-border)] text-theme-muted transition-colors hover:bg-[var(--min-surface-hover)]"
            aria-label="AI insights"
          >
            <Sparkles className="h-4 w-4 text-[var(--sw-violet-600)]" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 animate-ai-pulse rounded-full bg-[var(--sw-violet-500)]" />
          </button>

          <button
            type="button"
            className="relative grid h-8 w-8 place-items-center rounded-[8px] border border-[var(--min-border)] text-theme-muted transition-colors hover:bg-[var(--min-surface-hover)]"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full border border-white bg-[var(--sw-coral-500)]" />
          </button>
        </div>
      </div>
    </header>
  );
}

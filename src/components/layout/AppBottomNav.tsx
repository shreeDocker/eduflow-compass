import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/role-context";
import { getNavItems, isNavActive } from "@/lib/nav-config";

export function AppBottomNav() {
  const { role } = useRole();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = getNavItems(role);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--min-border)] bg-[var(--min-bg)]/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl supports-[backdrop-filter]:bg-[var(--min-bg)]/78"
    >
      <ul
        className="mx-auto grid max-w-lg"
        style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)`, minHeight: "var(--nav-h)" }}
      >
        {items.map((item) => {
          const active = isNavActive(pathname, item);
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={cn(
                  "flex h-full min-h-[var(--touch-min)] flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium transition-colors duration-200",
                  active ? "text-theme-accent" : "text-theme-muted active:text-theme",
                )}
              >
                <Icon className="h-[26px] w-[26px]" strokeWidth={active ? 2.2 : 1.75} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

import { Link, useRouterState } from "@tanstack/react-router";
import { Home, BookOpen, BarChart3, User } from "lucide-react";

const items = [
  { to: "/", label: "Today", icon: Home },
  { to: "/books", label: "Books", icon: BookOpen },
  { to: "/progress", label: "Progress", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {items.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <li key={to}>
              <Link
                to={to}
                className="big-tap flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium"
                style={{ color: active ? "var(--primary)" : "var(--muted-foreground)" }}
              >
                <Icon className="h-6 w-6" strokeWidth={active ? 2.4 : 1.8} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

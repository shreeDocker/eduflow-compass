import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { currentTeacher } from "@/lib/mock-data";
import { useRole } from "@/lib/role-context";
import { RoleSwitch } from "@/components/RoleSwitch";
import {
  getNavItems,
  isNavActive,
  isNavChildActive,
  navChildToSearch,
  type NavSearch,
} from "@/lib/nav-config";
import { currentUserId, teacherDirectory } from "@/lib/syllabus-data";
import { AppLogo } from "@/components/AppLogo";

function parseBooksSearch(searchStr: string): NavSearch {
  const params = new URLSearchParams(searchStr);
  const view = params.get("view");
  return view ? { view: view as NavSearch["view"] } : {};
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { role, isAdmin } = useRole();
  const { pathname, searchStr } = useRouterState({
    select: (s) => ({
      pathname: s.location.pathname,
      searchStr: s.location.searchStr,
    }),
  });
  const currentSearch = parseBooksSearch(searchStr);
  const items = getNavItems(role);

  const user = isAdmin
    ? { name: "Admin User", initials: "AU", subtitle: "Administrator" }
    : {
        name: currentTeacher.name,
        initials: teacherDirectory[currentUserId]?.initials ?? "T",
        subtitle: `Teacher · ${currentTeacher.school}`,
      };

  return (
    <div className="flex h-full flex-col text-left text-[13px] lg:text-[12.5px]">
      <div className="px-4 pb-5 pt-4 lg:px-4 lg:pb-4 lg:pt-3.5">
        <AppLogo
          variant="sidebar"
          subtitle={isAdmin ? "Admin command center" : "Student success OS"}
        />
      </div>

      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const active = isNavActive(pathname, item);
            const Icon = item.icon;

            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={onNavigate}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13.5px] font-medium transition-all duration-150",
                    active
                      ? "bg-white/10 text-white"
                      : "text-white/55 hover:bg-white/[0.06] hover:text-white/80",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-[17px] w-[17px] shrink-0 transition-colors",
                      active ? "text-[var(--sw-gold-500)]" : "text-white/45 group-hover:text-white/65",
                    )}
                    strokeWidth={active ? 2.2 : 1.8}
                  />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span className="rounded-full bg-[var(--sw-gold-500)]/20 px-2 py-0.5 font-mono text-[10px] font-medium text-[var(--sw-gold-400)]">
                      {item.badge}
                    </span>
                  )}
                </Link>

                {item.children && item.children.length > 0 && (
                  <ul className="ml-[22px] mt-0.5 space-y-0.5 border-l border-white/10 pl-2.5 pb-1">
                    {item.children.map((child) => {
                      const childActive = isNavChildActive(
                        pathname,
                        item.to,
                        child.search,
                        currentSearch,
                      );
                      const ChildIcon = child.icon;

                      return (
                        <li key={child.label}>
                          <Link
                            to={item.to}
                            search={navChildToSearch(child.search)}
                            onClick={onNavigate}
                            className={cn(
                              "flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] font-medium transition-colors",
                              childActive
                                ? "bg-white/10 text-white"
                                : "text-white/45 hover:bg-white/[0.06] hover:text-white/75",
                            )}
                          >
                            {ChildIcon && (
                              <ChildIcon
                                className={cn(
                                  "h-3.5 w-3.5 shrink-0",
                                  childActive ? "text-[var(--sw-gold-400)]" : "text-white/35",
                                )}
                                strokeWidth={childActive ? 2.2 : 1.8}
                              />
                            )}
                            <span className="truncate">{child.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-3 lg:p-2.5">
        <RoleSwitch variant="sidebar" onSwitch={onNavigate} />
        <Link
          to="/profile"
          onClick={onNavigate}
          className="mt-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.06]"
        >
          <div
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
            style={{
              background: isAdmin
                ? "linear-gradient(135deg, var(--sw-gold-600), var(--sw-gold-500))"
                : "linear-gradient(135deg, var(--sw-sapphire-600), var(--sw-violet-600))",
            }}
          >
            {user.initials}
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-[13px] font-medium text-white">{user.name}</p>
            <p className="truncate text-[11px] text-white/40">{user.subtitle}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

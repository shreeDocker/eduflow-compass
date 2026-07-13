import { useNavigate, useRouterState } from "@tanstack/react-router";
import { GraduationCap, Shield } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useRole } from "@/lib/role-context";
import { cn } from "@/lib/utils";

type RoleSwitchProps = {
  variant?: "navbar" | "sidebar";
  className?: string;
  /** Called after role change (e.g. close mobile drawer) */
  onSwitch?: () => void;
};

const ADMIN_ONLY_PREFIXES = ["/principal", "/admin"];
const TEACHER_HOME_ROUTES = ["/today", "/progress"];

function isAdminOnlyPath(pathname: string) {
  return ADMIN_ONLY_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function RoleSwitch({ variant = "navbar", className, onSwitch }: RoleSwitchProps) {
  const { isAdmin, setRole } = useRole();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  function handleToggle(checked: boolean) {
    const next = checked ? "admin" : "teacher";
    setRole(next);
    onSwitch?.();

    if (checked) {
      if (TEACHER_HOME_ROUTES.includes(pathname) || pathname.startsWith("/class/")) {
        navigate({ to: "/principal" });
      }
      return;
    }

    if (isAdminOnlyPath(pathname)) {
      navigate({ to: "/today" });
    }
  }

  const isSidebar = variant === "sidebar";

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-[10px]",
        isSidebar
          ? "mx-2 mb-2 border border-white/10 bg-white/[0.06] px-3 py-2.5"
          : "border border-[var(--min-border)] bg-[var(--min-surface)] px-2.5 py-1.5",
        className,
      )}
      title={isAdmin ? "Switch to teacher view" : "Switch to admin view"}
    >
      <span
        className={cn(
          "flex items-center gap-1 font-display text-[10px] font-medium transition-colors",
          !isAdmin
            ? isSidebar
              ? "text-white"
              : "text-theme"
            : isSidebar
              ? "text-white/40"
              : "text-theme-muted",
        )}
      >
        <GraduationCap className="h-3 w-3" />
        <span className="hidden sm:inline">Teacher</span>
      </span>

      <Switch
        checked={isAdmin}
        onCheckedChange={handleToggle}
        aria-label={isAdmin ? "Switch to teacher view" : "Switch to admin view"}
        className={cn(
          "h-5 w-9 shrink-0 data-[state=checked]:bg-[var(--min-orange)] data-[state=unchecked]:bg-[var(--min-track)]",
          isSidebar && "data-[state=unchecked]:bg-white/20",
        )}
      />

      <span
        className={cn(
          "flex items-center gap-1 font-display text-[10px] font-medium transition-colors",
          isAdmin
            ? isSidebar
              ? "text-[var(--min-orange)]"
              : "text-theme-warning"
            : isSidebar
              ? "text-white/40"
              : "text-theme-muted",
        )}
      >
        <Shield className="h-3 w-3" />
        <span className="hidden sm:inline">Admin</span>
      </span>
    </div>
  );
}

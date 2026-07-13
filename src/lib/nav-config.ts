import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  User,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "./role-context";

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  roles?: UserRole[];
};

const teacherNav: NavItem[] = [
  { to: "/today", label: "Today", icon: CalendarDays, roles: ["teacher"] },
  { to: "/books", label: "Track", icon: ClipboardList, roles: ["teacher"] },
  { to: "/library", label: "Books", icon: BookOpen, roles: ["teacher"] },
  { to: "/progress", label: "Trend", icon: BarChart3, roles: ["teacher"] },
  { to: "/profile", label: "Profile", icon: User, roles: ["teacher"] },
];

const adminNav: NavItem[] = [
  { to: "/principal", label: "Dashboard", icon: LayoutDashboard, roles: ["admin"] },
  { to: "/books", label: "Track", icon: ClipboardList, roles: ["admin"] },
  { to: "/library", label: "Books", icon: BookOpen, roles: ["admin"] },
  { to: "/profile", label: "Profile", icon: User, roles: ["admin"] },
];

export function getNavItems(role: UserRole): NavItem[] {
  const items = role === "admin" ? adminNav : teacherNav;
  return items.filter((item) => !item.roles || item.roles.includes(role));
}

export function isNavActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.to;
  if (item.to === "/") return pathname === "/";
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

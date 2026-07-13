import type { TimelineEntry } from "./syllabus-timeline-keys";

const DAY_MS = 86_400_000;

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatShortDate(iso: string): string {
  return parseDate(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function formatLongDate(iso: string): string {
  return parseDate(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function daysBetween(startIso: string, endIso: string): number {
  const start = startOfDay(parseDate(startIso)).getTime();
  const end = startOfDay(parseDate(endIso)).getTime();
  return Math.round((end - start) / DAY_MS);
}

export function timelineElapsedPercent(entry: TimelineEntry, today = todayIso()): number {
  const total = daysBetween(entry.startDate, entry.dueDate);
  if (total <= 0) return 100;
  const elapsed = daysBetween(entry.startDate, today);
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}

export function daysRemaining(dueIso: string, today = todayIso()): number {
  return daysBetween(today, dueIso);
}

export type TimelineStatus = "none" | "on-track" | "due-soon" | "overdue" | "complete";

export function timelineStatus(
  dueIso: string | undefined,
  progress: number,
  today = todayIso(),
): TimelineStatus {
  if (progress >= 100) return "complete";
  if (!dueIso) return "none";
  const left = daysRemaining(dueIso, today);
  if (left < 0) return "overdue";
  if (left <= 3) return "due-soon";
  return "on-track";
}

export function statusTone(status: TimelineStatus): string {
  switch (status) {
    case "complete":
      return "var(--min-green)";
    case "overdue":
      return "var(--min-pink)";
    case "due-soon":
      return "var(--min-orange)";
    case "on-track":
      return "var(--min-accent)";
    default:
      return "var(--min-text-faint)";
  }
}

export function statusLabel(
  status: TimelineStatus,
  dueIso?: string,
  today = todayIso(),
  compact = false,
): string {
  if (status === "complete") return compact ? "Done" : "Completed";
  if (!dueIso) return compact ? "Unset" : "Not set";
  const left = daysRemaining(dueIso, today);
  if (left < 0) return compact ? `${Math.abs(left)}d late` : `${Math.abs(left)}d overdue`;
  if (left === 0) return "Today";
  if (left === 1) return compact ? "1d" : "1 day left";
  return compact ? `${left}d` : `${left} days left`;
}

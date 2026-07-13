import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

const ROW_BASE = 10;
const ROW_STEP = 14;

/** Left padding for accordion row headers — content panels stay full width. */
export function treeRowIndent(depth: number): number {
  return ROW_BASE + depth * ROW_STEP;
}

export function treeRowStyle(depth: number, accentColor?: string): CSSProperties {
  return {
    paddingLeft: treeRowIndent(depth),
    ...(accentColor ? { borderLeft: `3px solid ${accentColor}` } : {}),
  };
}

export function treePanelClass(className?: string) {
  return cn("border-t border-[var(--min-border)] bg-[var(--min-bg)]", className);
}

/** Single horizontal inset layer for progress bars, topic cards, admin panels. */
export function treeContentSlotClass(className?: string) {
  return cn("px-3 sm:px-4", className);
}

export function treeRowButtonClass(className?: string) {
  return cn(
    "flex w-full min-h-[var(--touch-min)] items-center gap-3 py-4 pr-4 text-left text-[17px] transition-colors active:bg-[var(--min-surface-hover)] sm:gap-2.5 sm:py-3 sm:pr-3 sm:text-base",
    className,
  );
}

export function treeBranchDividerClass(className?: string) {
  return cn("border-b border-[var(--min-border)] last:border-b-0", className);
}

/** Subject row: stacks action buttons below title on narrow screens. */
export function treeSubjectRowClass(className?: string) {
  return cn(
    "flex flex-col gap-2 bg-[var(--min-surface)] py-2 pr-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2 sm:gap-y-1 sm:py-0 sm:pr-4",
    className,
  );
}

export function treeSubjectActionsClass(className?: string) {
  return cn(
    "flex w-full flex-wrap items-center gap-1.5 sm:w-auto sm:shrink-0 sm:justify-end",
    className,
  );
}

export function treeChevronClass(open: boolean, size: "lg" | "md" | "sm" = "md") {
  const sizes = { lg: "h-5 w-5 sm:h-4 sm:w-4", md: "h-4 w-4 sm:h-3.5 sm:w-3.5", sm: "h-3.5 w-3.5 sm:h-3 sm:w-3" };
  return cn(
    sizes[size],
    "shrink-0 text-theme-muted transition-transform duration-200",
    open && "rotate-90",
  );
}

/** Nested card without horizontal margin — avoids width shrink at depth. */
export function treeNestedCardClass(className?: string) {
  return cn(
    "overflow-hidden rounded-[10px] border border-[var(--min-border)] bg-[var(--min-surface)]",
    className,
  );
}

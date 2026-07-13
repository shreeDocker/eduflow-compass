/** Shared shell layout — tighter on desktop, mobile-first touch targets preserved */

export const SHELL_GUTTER = "px-4 sm:px-6 lg:px-5";
export const SHELL_PY = "py-4 sm:py-5 lg:py-4";

/** Safe-area aware sticky header padding */
export const HEADER_SAFE =
  "min-h-[calc(var(--header-h)+env(safe-area-inset-top,0px))] pt-[env(safe-area-inset-top,0px)]";

/** Outer cap for navbar + main (sidebar sits outside this) */
export const SHELL_MAX = "max-w-5xl xl:max-w-6xl";

/** Teacher / focused flows — narrow readable column */
export const CONTENT_DEFAULT = "mx-auto w-full max-w-lg sm:max-w-xl lg:max-w-2xl";

/** Admin dashboards, syllabus tree, tables */
export const CONTENT_WIDE = "mx-auto w-full max-w-3xl lg:max-w-4xl";

/** Forms, upload flows */
export const CONTENT_FORM = "mx-auto w-full max-w-md sm:max-w-lg lg:max-w-xl";

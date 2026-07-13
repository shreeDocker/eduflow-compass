/**
 * Demo seed data for Mrs. Meena (t-meena) — keeps Today, class pages, and syllabus
 * tracker aligned for presentations. Bump DEMO_DATA_VERSION to reset saved progress.
 */

export const DEMO_DATA_VERSION = 2;

export const DEMO_PROGRESS_STORAGE_KEY = "swotify_syllabus_progress";
export const DEMO_TIMELINE_STORAGE_KEY = "swotify_syllabus_timelines";
export const DEMO_VERSION_STORAGE_KEY = "swotify_demo_data_version";

/** Fresh demo uses syllabus-data teacherProgress only — no topic overrides. */
export const DEMO_PROGRESS_SEED = {
  topics: {} as Record<string, never>,
  chapters: {} as Record<string, never>,
};

/** Subject completion + topic due dates for the primary demo class (Grade 9A Science). */
export const DEMO_TIMELINE_SEED = {
  subjects: {
    "g9a:science": {
      dueDate: "2026-11-28",
      startDate: "2026-07-01",
      setBy: "teacher" as const,
      updatedAt: "2026-07-01T08:00:00.000Z",
    },
    "g9b:science": {
      dueDate: "2026-11-28",
      startDate: "2026-07-01",
      setBy: "teacher" as const,
      updatedAt: "2026-07-01T08:00:00.000Z",
    },
    "g8c:science": {
      dueDate: "2026-12-10",
      startDate: "2026-07-01",
      setBy: "admin" as const,
      updatedAt: "2026-07-01T08:00:00.000Z",
    },
  },
  topics: {
    "g9a:science:sci-motion:t3": {
      dueDate: "2026-07-10",
      startDate: "2026-07-08",
      setBy: "teacher" as const,
      updatedAt: "2026-07-08T09:00:00.000Z",
    },
    "g9a:science:sci-motion:t4": {
      dueDate: "2026-07-15",
      startDate: "2026-07-10",
      setBy: "teacher" as const,
      updatedAt: "2026-07-10T09:00:00.000Z",
    },
    "g9a:science:sci-motion:t5": {
      dueDate: "2026-07-18",
      startDate: "2026-07-10",
      setBy: "teacher" as const,
      updatedAt: "2026-07-10T09:00:00.000Z",
    },
    "g9a:science:sci-matter:t1": {
      dueDate: "2026-06-20",
      startDate: "2026-06-01",
      setBy: "teacher" as const,
      updatedAt: "2026-06-20T14:00:00.000Z",
    },
    "g9a:science:sci-matter:t2": {
      dueDate: "2026-06-25",
      startDate: "2026-06-01",
      setBy: "teacher" as const,
      updatedAt: "2026-06-25T14:00:00.000Z",
    },
  },
};

export function ensureDemoDataVersion(): boolean {
  if (typeof localStorage === "undefined") return false;
  try {
    const stored = Number(localStorage.getItem(DEMO_VERSION_STORAGE_KEY));
    if (stored === DEMO_DATA_VERSION) return false;
    localStorage.setItem(DEMO_VERSION_STORAGE_KEY, String(DEMO_DATA_VERSION));
    localStorage.setItem(DEMO_PROGRESS_STORAGE_KEY, JSON.stringify(DEMO_PROGRESS_SEED));
    localStorage.setItem(DEMO_TIMELINE_STORAGE_KEY, JSON.stringify(DEMO_TIMELINE_SEED));
    return true;
  } catch {
    return false;
  }
}

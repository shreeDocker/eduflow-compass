import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRole } from "./role-context";
import {
  subjectPathKey,
  topicTimelineKey,
  type SubjectPath,
  type TimelineEntry,
} from "./syllabus-timeline-keys";
import { todayIso } from "./syllabus-timeline-utils";
import {
  DEMO_TIMELINE_SEED,
  DEMO_TIMELINE_STORAGE_KEY,
  ensureDemoDataVersion,
} from "./demo-seed";

const STORAGE_KEY = DEMO_TIMELINE_STORAGE_KEY;

type StoredTimelines = {
  subjects: Record<string, TimelineEntry>;
  topics: Record<string, TimelineEntry>;
};

type TopicTimelinePath = {
  gradeId: string;
  subjectId: string;
  chapterId: string;
  topicId: string;
};

type SyllabusTimelineContextValue = {
  getSubjectTimeline: (path: SubjectPath) => TimelineEntry | undefined;
  getTopicTimeline: (path: TopicTimelinePath) => TimelineEntry | undefined;
  setSubjectTimeline: (path: SubjectPath, dueDate: string | null) => void;
  setTopicTimeline: (path: TopicTimelinePath, dueDate: string | null) => void;
};

const SyllabusTimelineContext = createContext<SyllabusTimelineContextValue | null>(null);

function loadStored(): StoredTimelines {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StoredTimelines;
  } catch {
    /* ignore */
  }
  return DEMO_TIMELINE_SEED;
}

function saveStored(data: StoredTimelines) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function buildEntry(dueDate: string, setBy: "teacher" | "admin"): TimelineEntry {
  const today = todayIso();
  return {
    dueDate,
    startDate: today,
    setBy,
    updatedAt: new Date().toISOString(),
  };
}

export function SyllabusTimelineProvider({ children }: { children: ReactNode }) {
  const { isAdmin } = useRole();
  const [stored, setStored] = useState<StoredTimelines>({ subjects: {}, topics: {} });

  useEffect(() => {
    ensureDemoDataVersion();
    setStored(loadStored());
  }, []);

  const actor = isAdmin ? "admin" : "teacher";

  const setSubjectTimeline = useCallback(
    (path: SubjectPath, dueDate: string | null) => {
      const key = subjectPathKey(path);
      setStored((prev) => {
        const subjects = { ...prev.subjects };
        if (!dueDate) {
          delete subjects[key];
        } else {
          const existing = subjects[key];
          subjects[key] = {
            dueDate,
            startDate: existing?.startDate ?? todayIso(),
            setBy: actor,
            updatedAt: new Date().toISOString(),
          };
        }
        const next = { ...prev, subjects };
        saveStored(next);
        return next;
      });
    },
    [actor],
  );

  const setTopicTimeline = useCallback(
    (path: TopicTimelinePath, dueDate: string | null) => {
      const key = topicTimelineKey(path);
      setStored((prev) => {
        const topics = { ...prev.topics };
        if (!dueDate) {
          delete topics[key];
        } else {
          const existing = topics[key];
          topics[key] = {
            dueDate,
            startDate: existing?.startDate ?? todayIso(),
            setBy: actor,
            updatedAt: new Date().toISOString(),
          };
        }
        const next = { ...prev, topics };
        saveStored(next);
        return next;
      });
    },
    [actor],
  );

  const getSubjectTimeline = useCallback(
    (path: SubjectPath) => stored.subjects[subjectPathKey(path)],
    [stored.subjects],
  );

  const getTopicTimeline = useCallback(
    (path: TopicTimelinePath) => stored.topics[topicTimelineKey(path)],
    [stored.topics],
  );

  const value = useMemo(
    () => ({
      getSubjectTimeline,
      getTopicTimeline,
      setSubjectTimeline,
      setTopicTimeline,
    }),
    [getSubjectTimeline, getTopicTimeline, setSubjectTimeline, setTopicTimeline],
  );

  return (
    <SyllabusTimelineContext.Provider value={value}>{children}</SyllabusTimelineContext.Provider>
  );
}

export function useSyllabusTimeline() {
  const ctx = useContext(SyllabusTimelineContext);
  if (!ctx) {
    throw new Error("useSyllabusTimeline must be used within SyllabusTimelineProvider");
  }
  return ctx;
}

/** For display — who set the deadline */
export function timelineSetByLabel(entry: TimelineEntry | undefined): string | null {
  if (!entry) return null;
  return entry.setBy === "admin" ? "Admin" : "Teacher";
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { TopicStatus } from "./mock-data";
import { syllabusGrades } from "./syllabus-data";
import {
  DEMO_PROGRESS_STORAGE_KEY,
  ensureDemoDataVersion,
} from "./demo-seed";
import {
  chapterPathKey,
  mergeProgressIntoGrades,
  progressToStatus,
  topicPathKey,
  type ChapterOverride,
  type TopicOverride,
  type TopicPath,
} from "./syllabus-progress-keys";

const STORAGE_KEY = DEMO_PROGRESS_STORAGE_KEY;

type StoredProgress = {
  topics: Record<string, TopicOverride>;
  chapters: Record<string, ChapterOverride>;
};

type SyllabusProgressContextValue = {
  grades: ReturnType<typeof mergeProgressIntoGrades>;
  setTopicProgress: (path: TopicPath, progress: number) => void;
  setChapterProgress: (path: Omit<TopicPath, "topicId">, progress: number) => void;
  getTopicProgress: (path: TopicPath) => number | undefined;
};

const SyllabusProgressContext = createContext<SyllabusProgressContextValue | null>(null);

function loadStored(): StoredProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StoredProgress;
  } catch {
    /* ignore */
  }
  return { topics: {}, chapters: {} };
}

function saveStored(data: StoredProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function SyllabusProgressProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<StoredProgress>({ topics: {}, chapters: {} });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    ensureDemoDataVersion();
    setStored(loadStored());
    setHydrated(true);
  }, []);

  const setTopicProgress = useCallback((path: TopicPath, progress: number) => {
    const clamped = Math.min(100, Math.max(0, Math.round(progress)));
    const override: TopicOverride = {
      teacherProgress: clamped,
      status: progressToStatus(clamped),
    };
    setStored((prev) => {
      const next = {
        ...prev,
        topics: { ...prev.topics, [topicPathKey(path)]: override },
      };
      saveStored(next);
      return next;
    });
  }, []);

  const setChapterProgress = useCallback(
    (path: Omit<TopicPath, "topicId">, progress: number) => {
      const clamped = Math.min(100, Math.max(0, Math.round(progress)));
      const override: ChapterOverride = {
        teacherProgress: clamped,
        status: progressToStatus(clamped),
      };
      setStored((prev) => {
        const next = {
          ...prev,
          chapters: { ...prev.chapters, [chapterPathKey(path)]: override },
        };
        saveStored(next);
        return next;
      });
    },
    [],
  );

  const getTopicProgress = useCallback(
    (path: TopicPath) => stored.topics[topicPathKey(path)]?.teacherProgress,
    [stored.topics],
  );

  const grades = useMemo(
    () => mergeProgressIntoGrades(syllabusGrades, stored.topics, stored.chapters),
    [stored],
  );

  const value = useMemo(
    () => ({
      grades: hydrated ? grades : syllabusGrades,
      setTopicProgress,
      setChapterProgress,
      getTopicProgress,
    }),
    [grades, hydrated, setTopicProgress, setChapterProgress, getTopicProgress],
  );

  return (
    <SyllabusProgressContext.Provider value={value}>{children}</SyllabusProgressContext.Provider>
  );
}

export function useSyllabusProgress() {
  const ctx = useContext(SyllabusProgressContext);
  if (!ctx) throw new Error("useSyllabusProgress must be used within SyllabusProgressProvider");
  return ctx;
}

/** Sync legacy mock topic status with syllabus progress */
export function topicStatusFromProgress(progress: number): TopicStatus {
  return progressToStatus(progress);
}

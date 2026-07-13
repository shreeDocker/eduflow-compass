import type { TopicStatus } from "./mock-data";
import type { Subject } from "./mock-data";
import type { SyllabusGrade, SyllabusSubject } from "./syllabus-data";
import {
  chapterProgress,
  findCurrentTeachingSpot,
  formatClassName,
  formatTeachingSpot,
  gradeProgress,
  subjectProgress,
  topicProgress,
} from "./syllabus-utils";
import { progressToStatus } from "./syllabus-progress-keys";

export type MetroTopicSnapshot = {
  id: string;
  title: string;
  progress: number;
  status: TopicStatus;
};

export type MetroStation = {
  id: string;
  title: string;
  status: TopicStatus;
  progress: number;
  topicCount: number;
  topicsCompleted: number;
  index: number;
  /** Topic actively being taught in this chapter, if any */
  activeTopicTitle: string | null;
  topics: MetroTopicSnapshot[];
};

export type MetroLineStats = {
  chaptersTotal: number;
  chaptersComplete: number;
  topicsTotal: number;
  topicsDone: number;
  delayed: number;
  teaching: number;
};

export type MetroLine = {
  id: string;
  name: string;
  color: string;
  trackColor: string;
  classLabel?: string;
  gradeId?: string;
  subjectId?: string;
  teacherId?: string;
  teacherName?: string;
  progress: number;
  currentSpotLabel: string | null;
  currentSpotLive: boolean;
  stats: MetroLineStats;
  stations: MetroStation[];
};

const SUBJECT_COLORS: Record<string, { color: string; track: string }> = {
  Science: { color: "var(--sw-emerald-500)", track: "var(--sw-emerald-400)" },
  Mathematics: { color: "var(--sw-gold-500)", track: "var(--sw-gold-400)" },
  Math: { color: "var(--sw-gold-500)", track: "var(--sw-gold-400)" },
  English: { color: "var(--sw-violet-500)", track: "var(--sw-violet-400)" },
  Tamil: { color: "var(--sw-coral-500)", track: "var(--sw-coral-400)" },
};

export function subjectLineColors(name: string) {
  return SUBJECT_COLORS[name] ?? { color: "var(--sw-sapphire-500)", track: "var(--sw-sapphire-400)" };
}

function chapterToStation(ch: SyllabusSubject["chapters"][number], index: number): MetroStation {
  const progress = chapterProgress(ch);
  const topicsCompleted = ch.topics.filter((t) => topicProgress(t) >= 100).length;
  const activeTopic =
    ch.topics.find((t) => t.status === "teaching" || t.status === "revision") ??
    ch.topics.find((t) => t.status === "delayed") ??
    ch.topics.find((t) => topicProgress(t) > 0 && topicProgress(t) < 100) ??
    null;

  return {
    id: ch.id,
    title: ch.title,
    status: ch.topics.length > 0 ? progressToStatus(progress) : ch.status,
    progress,
    topicCount: ch.topics.length,
    topicsCompleted,
    index: index + 1,
    activeTopicTitle: activeTopic?.title ?? null,
    topics: ch.topics.map((t) => ({
      id: t.id,
      title: t.title,
      progress: topicProgress(t),
      status: t.status,
    })),
  };
}

function lineStats(stations: MetroStation[]): MetroLineStats {
  let topicsTotal = 0;
  let topicsDone = 0;
  let delayed = 0;
  let teaching = 0;

  for (const s of stations) {
    topicsTotal += s.topicCount;
    topicsDone += s.topicsCompleted;
    if (s.status === "delayed") delayed++;
    if (s.status === "teaching" || s.status === "revision") teaching++;
  }

  return {
    chaptersTotal: stations.length,
    chaptersComplete: stations.filter((s) => s.progress >= 100).length,
    topicsTotal,
    topicsDone,
    delayed,
    teaching,
  };
}

export function buildMetroLinesFromGrade(grade: SyllabusGrade): MetroLine[] {
  return grade.subjects.map((subject) => {
    const colors = subjectLineColors(subject.name);
    const stations = subject.chapters.map((ch, i) => chapterToStation(ch, i));
    const spot = findCurrentTeachingSpot(subject);
    return {
      id: `${grade.id}-${subject.id}`,
      name: subject.name,
      color: colors.color,
      trackColor: colors.track,
      classLabel: formatClassName(grade),
      gradeId: grade.id,
      subjectId: subject.id,
      teacherId: subject.teacherId,
      teacherName: subject.teacherName,
      progress: subjectProgress(subject),
      currentSpotLabel: spot ? formatTeachingSpot(spot) : null,
      currentSpotLive: spot?.isLive ?? false,
      stats: lineStats(stations),
      stations,
    };
  });
}

export function buildMetroLinesFromGrades(grades: SyllabusGrade[]): MetroLine[] {
  return grades.flatMap((g) => buildMetroLinesFromGrade(g));
}

/** Legacy mock-data adapter */
export function subjectToMetroLine(subject: Subject, classLabel?: string): MetroLine {
  const colors = subjectLineColors(subject.name);
  const stations: MetroStation[] = subject.chapters.map((ch, i) => {
    const pct =
      ch.topics.length > 0
        ? Math.round(
            ch.topics.reduce((s, t) => {
              if (t.status === "completed") return s + 100;
              if (t.status === "teaching") return s + 55;
              if (t.status === "planned") return s + 15;
              return s;
            }, 0) / ch.topics.length,
          )
        : ch.status === "completed"
          ? 100
          : ch.status === "teaching"
            ? 55
            : 0;
    return {
      id: ch.id,
      title: ch.title,
      status: ch.status,
      progress: pct,
      topicCount: ch.topics.length,
      topicsCompleted: ch.topics.filter((t) => t.status === "completed").length,
      index: i + 1,
      activeTopicTitle: ch.topics.find((t) => t.status === "teaching")?.title ?? null,
      topics: ch.topics.map((t) => ({
        id: t.id,
        title: t.title,
        progress: t.status === "completed" ? 100 : t.status === "teaching" ? 55 : 0,
        status: t.status,
      })),
    };
  });
  const progress = stations.length
    ? Math.round(stations.reduce((s, st) => s + st.progress, 0) / stations.length)
    : 0;

  return {
    id: subject.id,
    name: subject.name,
    color: colors.color,
    trackColor: colors.track,
    classLabel,
    progress,
    currentSpotLabel: null,
    currentSpotLive: false,
    stats: lineStats(stations),
    stations,
  };
}

export function findCurrentStationIndex(stations: MetroStation[]): number {
  const teaching = stations.findIndex((s) => s.status === "teaching");
  if (teaching >= 0) return teaching;
  const delayed = stations.findIndex((s) => s.status === "delayed");
  if (delayed >= 0) return delayed;
  const firstOpen = stations.findIndex((s) => s.progress < 100);
  return firstOpen >= 0 ? firstOpen : Math.max(0, stations.length - 1);
}

export function classOverallFromLines(lines: MetroLine[]): number {
  if (lines.length === 0) return 0;
  return Math.round(lines.reduce((s, l) => s + l.progress, 0) / lines.length);
}

export function classOverallFromGrade(grade: SyllabusGrade): number {
  return gradeProgress(grade);
}

export function aggregateMetroStats(lines: MetroLine[]) {
  return lines.reduce(
    (acc, line) => ({
      chaptersTotal: acc.chaptersTotal + line.stats.chaptersTotal,
      chaptersComplete: acc.chaptersComplete + line.stats.chaptersComplete,
      topicsTotal: acc.topicsTotal + line.stats.topicsTotal,
      topicsDone: acc.topicsDone + line.stats.topicsDone,
      delayed: acc.delayed + line.stats.delayed,
      teaching: acc.teaching + line.stats.teaching,
    }),
    {
      chaptersTotal: 0,
      chaptersComplete: 0,
      topicsTotal: 0,
      topicsDone: 0,
      delayed: 0,
      teaching: 0,
    },
  );
}

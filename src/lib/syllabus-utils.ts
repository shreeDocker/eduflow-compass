import type { SyllabusChapter, SyllabusGrade, SyllabusSubject, SyllabusTopic, UploadedBook, UploadedNote } from "./syllabus-data";
import type { ClassSession, TopicStatus } from "./mock-data";
import { schoolDailySchedule, statusMeta } from "./mock-data";
import { teacherDirectory } from "./syllabus-data";
import { classToSyllabusPath } from "./syllabus-progress-keys";

export function topicProgress(topic: SyllabusTopic): number {
  if (topic.teacherProgress > 0) return topic.teacherProgress;
  if (topic.status === "completed") return 100;
  if (topic.status === "teaching") return 55;
  if (topic.status === "planned") return 15;
  if (topic.status === "delayed") return 30;
  if (topic.status === "revision") return 85;
  return 0;
}

export function chapterProgress(chapter: SyllabusChapter & { teacherProgress?: number }): number {
  if (chapter.topics.length === 0) {
    if (chapter.teacherProgress !== undefined && chapter.teacherProgress > 0) {
      return chapter.teacherProgress;
    }
    if (chapter.status === "completed") return 100;
    if (chapter.status === "teaching") return 55;
    if (chapter.status === "planned") return 20;
    if (chapter.status === "delayed") return 35;
    return 0;
  }
  const total = chapter.topics.reduce((sum, t) => sum + topicProgress(t), 0);
  return Math.round(total / chapter.topics.length);
}

export function subjectProgress(subject: SyllabusSubject): number {
  if (subject.chapters.length === 0) return 0;
  const total = subject.chapters.reduce((sum, c) => sum + chapterProgress(c), 0);
  return Math.round(total / subject.chapters.length);
}

export type CurrentTeachingSpot = {
  chapterId: string;
  chapterTitle: string;
  topicId: string | null;
  topicTitle: string | null;
  status: TopicStatus;
  progress: number;
  /** Actively being taught (teaching / revision), not just next up. */
  isLive: boolean;
};

function spotFromTopic(ch: SyllabusChapter, topic: SyllabusTopic, isLive: boolean): CurrentTeachingSpot {
  return {
    chapterId: ch.id,
    chapterTitle: ch.title,
    topicId: topic.id,
    topicTitle: topic.title,
    status: topic.status,
    progress: topicProgress(topic),
    isLive,
  };
}

function spotFromChapter(ch: SyllabusChapter, isLive: boolean): CurrentTeachingSpot {
  return {
    chapterId: ch.id,
    chapterTitle: ch.title,
    topicId: null,
    topicTitle: null,
    status: ch.status,
    progress: chapterProgress(ch),
    isLive,
  };
}

/** Where the teacher is right now in a subject syllabus. */
export function findCurrentTeachingSpot(subject: SyllabusSubject): CurrentTeachingSpot | null {
  if (subject.chapters.length === 0) return null;

  for (const ch of subject.chapters) {
    const teachingTopic = ch.topics.find((t) => t.status === "teaching");
    if (teachingTopic) return spotFromTopic(ch, teachingTopic, true);
  }
  for (const ch of subject.chapters) {
    if (ch.topics.length === 0 && ch.status === "teaching") return spotFromChapter(ch, true);
  }
  for (const ch of subject.chapters) {
    const delayedTopic = ch.topics.find((t) => t.status === "delayed");
    if (delayedTopic) return spotFromTopic(ch, delayedTopic, false);
  }
  for (const ch of subject.chapters) {
    if (ch.topics.length === 0 && ch.status === "delayed") return spotFromChapter(ch, false);
  }
  for (const ch of subject.chapters) {
    const openTopic = ch.topics.find((t) => topicProgress(t) < 100);
    if (openTopic) {
      const live = openTopic.status === "teaching" || openTopic.status === "revision";
      return spotFromTopic(ch, openTopic, live);
    }
    if (ch.topics.length === 0 && chapterProgress(ch) < 100) {
      const live = ch.status === "teaching" || ch.status === "revision";
      return spotFromChapter(ch, live);
    }
  }

  const lastCh = subject.chapters[subject.chapters.length - 1];
  const lastTopic = lastCh.topics[lastCh.topics.length - 1];
  if (lastTopic) return spotFromTopic(lastCh, lastTopic, false);
  return spotFromChapter(lastCh, false);
}

export function formatTeachingSpot(spot: CurrentTeachingSpot): string {
  if (spot.topicTitle) return `${spot.chapterTitle} → ${spot.topicTitle}`;
  return spot.chapterTitle;
}

export function findSubjectInGrade(
  grades: SyllabusGrade[],
  gradeId: string,
  subjectId: string,
): SyllabusSubject | undefined {
  return grades.find((g) => g.id === gradeId)?.subjects.find((s) => s.id === subjectId);
}

export function gradeProgress(grade: SyllabusGrade): number {
  if (grade.subjects.length === 0) return 0;
  const total = grade.subjects.reduce((sum, s) => sum + subjectProgress(s), 0);
  return Math.round(total / grade.subjects.length);
}

export function schoolProgress(grades: SyllabusGrade[]): number {
  if (grades.length === 0) return 0;
  const total = grades.reduce((sum, g) => sum + gradeProgress(g), 0);
  return Math.round(total / grades.length);
}

export function formatClassName(grade: SyllabusGrade): string {
  return `${grade.label} ${grade.section}`;
}

/** First section row for a grade level — used for curriculum pickers and outline. */
export function primaryGradeForLabel(
  grades: SyllabusGrade[],
  gradeLabel: string,
): SyllabusGrade | undefined {
  return grades
    .filter((g) => g.label === gradeLabel)
    .sort((a, b) => a.section.localeCompare(b.section))[0];
}

export function resolveNoteGradeLabel(note: UploadedNote, grades: SyllabusGrade[]): string {
  if (note.gradeLabel) return note.gradeLabel;
  return grades.find((g) => g.id === note.gradeId)?.label ?? "";
}

export type ClassProgressRow = {
  id: string;
  label: string;
  section: string;
  progress: number;
  subjectCount: number;
  topics: { total: number; completed: number };
};

export function listClassProgress(grades: SyllabusGrade[]): ClassProgressRow[] {
  return grades
    .map((g) => ({
      id: g.id,
      label: g.label,
      section: g.section,
      progress: gradeProgress(g),
      subjectCount: g.subjects.length,
      topics: countTopics(g),
    }))
    .sort((a, b) => a.label.localeCompare(b.label) || a.section.localeCompare(b.section));
}

export type SectionProgressRow = {
  section: string;
  progress: number;
  classCount: number;
  classes: ClassProgressRow[];
};

export type GradeProgressRow = {
  gradeLabel: string;
  progress: number;
  classCount: number;
  classes: ClassProgressRow[];
};

function gradeSortKey(label: string): number {
  const match = label.match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : 0;
}

export function listGradeProgress(grades: SyllabusGrade[]): GradeProgressRow[] {
  const byGrade = new Map<string, SyllabusGrade[]>();
  for (const g of grades) {
    const list = byGrade.get(g.label) ?? [];
    list.push(g);
    byGrade.set(g.label, list);
  }
  return [...byGrade.entries()]
    .map(([gradeLabel, classes]) => ({
      gradeLabel,
      progress: classes.length
        ? Math.round(classes.reduce((s, c) => s + gradeProgress(c), 0) / classes.length)
        : 0,
      classCount: classes.length,
      classes: listClassProgress(classes),
    }))
    .sort(
      (a, b) =>
        gradeSortKey(a.gradeLabel) - gradeSortKey(b.gradeLabel) ||
        a.gradeLabel.localeCompare(b.gradeLabel),
    );
}

export function listSectionProgress(grades: SyllabusGrade[]): SectionProgressRow[] {
  const bySection = new Map<string, SyllabusGrade[]>();
  for (const g of grades) {
    const list = bySection.get(g.section) ?? [];
    list.push(g);
    bySection.set(g.section, list);
  }
  return [...bySection.entries()]
    .map(([section, classes]) => ({
      section,
      progress: classes.length
        ? Math.round(classes.reduce((s, c) => s + gradeProgress(c), 0) / classes.length)
        : 0,
      classCount: classes.length,
      classes: listClassProgress(classes),
    }))
    .sort((a, b) => a.section.localeCompare(b.section));
}

export type SectionSubjectRow = {
  name: string;
  progress: number;
  classCount: number;
};

export type SectionSubjectProgress = {
  section: string;
  overallProgress: number;
  classCount: number;
  subjects: SectionSubjectRow[];
};

/** Per section (A/B/C…), average completion for each subject across classes in that section. */
export function listSectionSubjectProgress(grades: SyllabusGrade[]): SectionSubjectProgress[] {
  const bySection = new Map<string, SyllabusGrade[]>();
  for (const g of grades) {
    const list = bySection.get(g.section) ?? [];
    list.push(g);
    bySection.set(g.section, list);
  }

  return [...bySection.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([section, sectionGrades]) => {
      const subjectMap = new Map<string, number[]>();
      for (const g of sectionGrades) {
        for (const s of g.subjects) {
          const list = subjectMap.get(s.name) ?? [];
          list.push(subjectProgress(s));
          subjectMap.set(s.name, list);
        }
      }
      const subjects: SectionSubjectRow[] = [...subjectMap.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, pcts]) => ({
          name,
          progress: Math.round(pcts.reduce((sum, p) => sum + p, 0) / pcts.length),
          classCount: pcts.length,
        }));
      const overallProgress = subjects.length
        ? Math.round(subjects.reduce((sum, s) => sum + s.progress, 0) / subjects.length)
        : 0;
      return {
        section,
        overallProgress,
        classCount: sectionGrades.length,
        subjects,
      };
    });
}

export type SectionBoardSubject = {
  name: string;
  progress: number;
};

export type SectionBoardClass = {
  id: string;
  gradeLabel: string;
  section: string;
  displayName: string;
  progress: number;
  subjects: SectionBoardSubject[];
};

export type SectionBoardColumn = {
  gradeLabel: string;
  overallProgress: number;
  classes: SectionBoardClass[];
};

/** Board data: columns = grades, cards = sections within each grade with subject breakdown. */
export function buildSectionBoard(grades: SyllabusGrade[]): SectionBoardColumn[] {
  const byGrade = new Map<string, SyllabusGrade[]>();
  for (const g of grades) {
    const list = byGrade.get(g.label) ?? [];
    list.push(g);
    byGrade.set(g.label, list);
  }

  return [...byGrade.entries()]
    .sort(
      ([a], [b]) => gradeSortKey(a) - gradeSortKey(b) || a.localeCompare(b),
    )
    .map(([gradeLabel, gradeClasses]) => {
      const classes: SectionBoardClass[] = gradeClasses
        .sort((a, b) => a.section.localeCompare(b.section))
        .map((g) => ({
          id: g.id,
          gradeLabel: g.label,
          section: g.section,
          displayName: formatClassName(g),
          progress: gradeProgress(g),
          subjects: g.subjects
            .map((s) => ({ name: s.name, progress: subjectProgress(s) }))
            .sort((a, b) => a.name.localeCompare(b.name)),
        }));
      const overallProgress = classes.length
        ? Math.round(classes.reduce((sum, c) => sum + c.progress, 0) / classes.length)
        : 0;
      return { gradeLabel, overallProgress, classes };
    });
}

export type SubjectTeacherSlot = {
  teacherId: string;
  teacherName: string;
  teacherInitials: string;
  gradeId: string;
  className: string;
  section: string;
  displayName: string;
  progress: number;
};

export type SubjectTeacherLeader = {
  teacherId: string;
  teacherName: string;
  teacherInitials: string;
  avgProgress: number;
  classCount: number;
  slots: SubjectTeacherSlot[];
};

export type SubjectTeacherGroup = {
  subjectName: string;
  avgProgress: number;
  teacherCount: number;
  classCount: number;
  leaders: SubjectTeacherLeader[];
};

/** Same subject across classes — grouped by teacher for admin clarity. */
export function buildSubjectTeacherOverview(grades: SyllabusGrade[]): SubjectTeacherGroup[] {
  const subjectSlots = new Map<string, SubjectTeacherSlot[]>();

  for (const g of grades) {
    for (const s of g.subjects) {
      const list = subjectSlots.get(s.name) ?? [];
      list.push({
        teacherId: s.teacherId,
        teacherName: s.teacherName,
        teacherInitials: s.teacherName.replace(/^Mrs\.?\s|^Mr\.?\s|^Ms\.?\s/i, "").trim()[0]?.toUpperCase() ?? "?",
        gradeId: g.id,
        className: g.label,
        section: g.section,
        displayName: formatClassName(g),
        progress: subjectProgress(s),
      });
      subjectSlots.set(s.name, list);
    }
  }

  return [...subjectSlots.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([subjectName, slots]) => {
      const byTeacher = new Map<string, SubjectTeacherSlot[]>();
      for (const slot of slots) {
        const t = byTeacher.get(slot.teacherId) ?? [];
        t.push(slot);
        byTeacher.set(slot.teacherId, t);
      }
      const leaders: SubjectTeacherLeader[] = [...byTeacher.entries()]
        .map(([teacherId, tSlots]) => ({
          teacherId,
          teacherName: tSlots[0]!.teacherName,
          teacherInitials: tSlots[0]!.teacherInitials,
          avgProgress: Math.round(tSlots.reduce((sum, x) => sum + x.progress, 0) / tSlots.length),
          classCount: tSlots.length,
          slots: tSlots.sort(
            (a, b) => a.className.localeCompare(b.className) || a.section.localeCompare(b.section),
          ),
        }))
        .sort((a, b) => b.avgProgress - a.avgProgress);

      return {
        subjectName,
        avgProgress: Math.round(slots.reduce((sum, x) => sum + x.progress, 0) / slots.length),
        teacherCount: leaders.length,
        classCount: slots.length,
        leaders,
      };
    });
}

export type TeacherAssignmentRow = {
  teacherId: string;
  teacherName: string;
  teacherInitials: string;
  gradeId: string;
  className: string;
  section: string;
  subjectId: string;
  subjectName: string;
  progress: number;
  topics: { total: number; completed: number };
  chapters: { total: number; completed: number };
};

export function listTeacherAssignments(
  grades: SyllabusGrade[],
  directory: Record<string, { name: string; initials: string; subjects: string[] }>,
): TeacherAssignmentRow[] {
  const rows: TeacherAssignmentRow[] = [];
  for (const g of grades) {
    for (const s of g.subjects) {
      const info = directory[s.teacherId];
      let chaptersTotal = 0;
      let chaptersDone = 0;
      let topicsTotal = 0;
      let topicsDone = 0;
      for (const c of s.chapters) {
        chaptersTotal++;
        if (chapterProgress(c) >= 100) chaptersDone++;
        for (const t of c.topics) {
          topicsTotal++;
          if (topicProgress(t) >= 100) topicsDone++;
        }
      }
      rows.push({
        teacherId: s.teacherId,
        teacherName: info?.name ?? s.teacherName,
        teacherInitials: info?.initials ?? s.teacherName[0] ?? "?",
        gradeId: g.id,
        className: g.label,
        section: g.section,
        subjectId: s.id,
        subjectName: s.name,
        progress: subjectProgress(s),
        topics: { total: topicsTotal, completed: topicsDone },
        chapters: { total: chaptersTotal, completed: chaptersDone },
      });
    }
  }
  return rows;
}

export function teacherTrackingStatus(progress: number): "ahead" | "on-track" | "delayed" {
  if (progress >= 85) return "ahead";
  if (progress >= 65) return "on-track";
  return "delayed";
}

export type TeacherProgressSummary = {
  id: string;
  name: string;
  initials: string;
  subjects: string[];
  progress: number;
  status: "ahead" | "on-track" | "delayed";
  assignments: TeacherAssignmentRow[];
  sections: string[];
};

export function listTeacherSummaries(
  grades: SyllabusGrade[],
  directory: Record<string, { name: string; initials: string; subjects: string[] }>,
): TeacherProgressSummary[] {
  const assignments = listTeacherAssignments(grades, directory);
  const byTeacher = new Map<string, TeacherAssignmentRow[]>();
  for (const a of assignments) {
    const list = byTeacher.get(a.teacherId) ?? [];
    list.push(a);
    byTeacher.set(a.teacherId, list);
  }

  return Object.entries(directory).map(([id, info]) => {
    const mine = byTeacher.get(id) ?? [];
    const progress = mine.length
      ? Math.round(mine.reduce((s, a) => s + a.progress, 0) / mine.length)
      : 0;
    return {
      id,
      ...info,
      progress,
      status: teacherTrackingStatus(progress),
      assignments: mine.sort(
        (a, b) =>
          a.className.localeCompare(b.className) ||
          a.section.localeCompare(b.section) ||
          a.subjectName.localeCompare(b.subjectName),
      ),
      sections: [...new Set(mine.map((a) => a.section))].sort(),
    };
  });
}

export function pctToTopicStatus(pct: number): TopicStatus {
  if (pct >= 100) return "completed";
  if (pct >= 75) return "revision";
  if (pct >= 50) return "teaching";
  if (pct > 0) return "delayed";
  return "not-started";
}

export type HeatmapCell = {
  classKey: string;
  gradeId: string;
  pct: number | null;
  status: TopicStatus;
};

export type HeatmapRow = { subject: string; cells: HeatmapCell[] };

export function buildSubjectHeatmap(grades: SyllabusGrade[]): {
  rows: HeatmapRow[];
  classKeys: { key: string; gradeId: string; label: string }[];
} {
  const classMeta = grades
    .map((g) => ({
      key: `${g.label.replace("Grade ", "")}${g.section}`,
      gradeId: g.id,
      label: formatClassName(g),
      order: `${g.label}-${g.section}`,
    }))
    .sort((a, b) => a.order.localeCompare(b.order));

  const uniqueClasses = classMeta.filter(
    (c, i, arr) => arr.findIndex((x) => x.key === c.key) === i,
  );

  const subjectMap = new Map<string, Map<string, number>>();
  for (const g of grades) {
    const key = `${g.label.replace("Grade ", "")}${g.section}`;
    for (const s of g.subjects) {
      if (!subjectMap.has(s.name)) subjectMap.set(s.name, new Map());
      subjectMap.get(s.name)!.set(key, subjectProgress(s));
    }
  }

  const rows: HeatmapRow[] = [...subjectMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([subject, cells]) => ({
      subject,
      cells: uniqueClasses.map(({ key, gradeId }) => {
        const pct = cells.get(key) ?? null;
        return {
          classKey: key,
          gradeId,
          pct,
          status: pct !== null ? pctToTopicStatus(pct) : "not-started",
        };
      }),
    }));

  return { rows, classKeys: uniqueClasses };
}

export function schoolTeacherStatusCounts(summaries: TeacherProgressSummary[]) {
  return {
    teachers: summaries.length,
    ahead: summaries.filter((t) => t.status === "ahead").length,
    onTrack: summaries.filter((t) => t.status === "on-track").length,
    delayed: summaries.filter((t) => t.status === "delayed").length,
  };
}

export function filterGradesForTeacher(grades: SyllabusGrade[], teacherId: string): SyllabusGrade[] {
  return grades
    .map((grade) => ({
      ...grade,
      subjects: grade.subjects.filter((s) => s.teacherId === teacherId),
    }))
    .filter((grade) => grade.subjects.length > 0);
}

/** Demo schedule: only classes this teacher actually teaches in the syllabus tree. */
export function listTodaysClassesForTeacher(
  sessions: ClassSession[],
  grades: SyllabusGrade[],
  teacherId: string,
): ClassSession[] {
  const mine = filterGradesForTeacher(grades, teacherId);
  const mineById = new Map(mine.map((g) => [g.id, g]));

  return sessions.filter((cls) => {
    const path = classToSyllabusPath(cls.grade, cls.section, cls.subject);
    if (!path) return false;
    const grade = mineById.get(path.gradeId);
    return grade?.subjects.some((s) => s.id === path.subjectId) ?? false;
  });
}

export function isClassSessionForTeacher(
  cls: ClassSession,
  grades: SyllabusGrade[],
  teacherId: string,
): boolean {
  return listTodaysClassesForTeacher([cls], grades, teacherId).length > 0;
}

export function filterGradesByClassId(grades: SyllabusGrade[], classId: string): SyllabusGrade[] {
  return grades.filter((g) => g.id === classId);
}

export function filterGradesByGradeLabel(grades: SyllabusGrade[], label: string): SyllabusGrade[] {
  return grades.filter((g) => g.label === label);
}

export function listUniqueGradeLabels(grades: SyllabusGrade[]): string[] {
  return [...new Set(grades.map((g) => g.label))].sort((a, b) => a.localeCompare(b));
}

export type TrackerFilterMode = "all" | "class" | "grade" | "teacher";

export type TrackerFilter = {
  mode: TrackerFilterMode;
  value: string;
};

export function applyTrackerFilter(grades: SyllabusGrade[], filter: TrackerFilter): SyllabusGrade[] {
  if (filter.mode === "all" || !filter.value) return grades;
  switch (filter.mode) {
    case "class":
      return filterGradesByClassId(grades, filter.value);
    case "grade":
      return filterGradesByGradeLabel(grades, filter.value);
    case "teacher":
      return filterGradesForTeacher(grades, filter.value);
    default:
      return grades;
  }
}

export function defaultTrackerFilterValue(
  mode: TrackerFilterMode,
  grades: SyllabusGrade[],
  teachers: { id: string }[],
): string {
  if (mode === "all") return "";
  if (mode === "class") return grades[0]?.id ?? "";
  if (mode === "grade") return listUniqueGradeLabels(grades)[0] ?? "";
  if (mode === "teacher") return teachers[0]?.id ?? "";
  return "";
}

export function countTopics(grade: SyllabusGrade): { total: number; completed: number } {
  let total = 0;
  let completed = 0;
  for (const subject of grade.subjects) {
    for (const ch of subject.chapters) {
      for (const t of ch.topics) {
        total++;
        if (topicProgress(t) >= 100 || t.status === "completed") completed++;
      }
    }
  }
  return { total, completed };
}

export function teacherStats(grades: SyllabusGrade[], teacherId: string) {
  const mine = filterGradesForTeacher(grades, teacherId);
  const progress = mine.length ? Math.round(mine.reduce((s, g) => s + gradeProgress(g), 0) / mine.length) : 0;
  let chapters = 0;
  let chaptersDone = 0;
  for (const g of mine) {
    for (const s of g.subjects) {
      for (const c of s.chapters) {
        chapters++;
        if (chapterProgress(c) >= 100) chaptersDone++;
      }
    }
  }
  return { progress, grades: mine.length, chapters, chaptersDone };
}

export function statusColor(status: TopicStatus): string {
  return statusMeta[status].token;
}

export type DailyTeachingLog = {
  id: string;
  date: string;
  period: number;
  timeRange: string;
  teacherId: string;
  teacherName: string;
  teacherInitials: string;
  classLabel: string;
  chapterTitle: string;
  topicsCovered: string[];
  status: "done" | "current" | "upcoming";
  hasCoverage: boolean;
};

function findSyllabusChapter(
  grades: SyllabusGrade[],
  gradeLabel: string,
  section: string,
  subjectName: string,
  chapterId: string,
) {
  const grade = grades.find(
    (g) => g.label === `Grade ${gradeLabel}` && g.section === section,
  );
  const subject = grade?.subjects.find((s) => s.name === subjectName);
  return subject?.chapters.find((c) => c.id === chapterId) ?? null;
}

function topicsCoveredToday(chapter: SyllabusChapter | null): string[] {
  if (!chapter) return [];
  return chapter.topics
    .filter(
      (t) =>
        t.status === "completed" ||
        t.status === "teaching" ||
        t.teacherProgress > 0,
    )
    .map((t) => t.title);
}

/** Admin view: who taught what class, which period, and topics covered today. */
export function buildDailyTeachingLogs(grades: SyllabusGrade[]): DailyTeachingLog[] {
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return schoolDailySchedule
    .map((slot) => {
      const teacher = teacherDirectory[slot.teacherId];
      const chapter = findSyllabusChapter(
        grades,
        slot.grade,
        slot.section,
        slot.subject,
        slot.chapterId,
      );
      const topics = topicsCoveredToday(chapter);

      return {
        id: slot.id,
        period: slot.period,
        timeRange: `${slot.startTime}–${slot.endTime}`,
        teacherId: slot.teacherId,
        teacherName: teacher?.name ?? slot.teacherId,
        teacherInitials: teacher?.initials ?? "?",
        classLabel: `Grade ${slot.grade}${slot.section} · ${slot.subject}`,
        chapterTitle: chapter?.title ?? "—",
        topicsCovered: topics,
        status: slot.status,
        hasCoverage: topics.length > 0,
        date: today,
      };
    })
    .sort((a, b) => a.period - b.period);
}

export type CatalogProgressRow = {
  gradeId: string;
  displayName: string;
  gradeLabel: string;
  section: string;
  teacherId: string;
  teacherName: string;
  progress: number;
  currentSpot: CurrentTeachingSpot | null;
};

/** All classes teaching a subject name — for admin catalog comparison. */
export function listSubjectCatalogProgress(
  grades: SyllabusGrade[],
  subjectName: string,
): CatalogProgressRow[] {
  const rows: CatalogProgressRow[] = [];
  for (const g of grades) {
    for (const s of g.subjects) {
      if (s.name !== subjectName) continue;
      rows.push({
        gradeId: g.id,
        displayName: formatClassName(g),
        gradeLabel: g.label,
        section: g.section,
        teacherId: s.teacherId,
        teacherName: s.teacherName,
        progress: subjectProgress(s),
        currentSpot: findCurrentTeachingSpot(s),
      });
    }
  }
  return rows.sort(
    (a, b) => a.gradeLabel.localeCompare(b.gradeLabel) || a.section.localeCompare(b.section),
  );
}

/** Same chapter (by id) across classes — for admin catalog comparison. */
export function listChapterCatalogProgress(
  grades: SyllabusGrade[],
  chapterId: string,
): CatalogProgressRow[] {
  const rows: CatalogProgressRow[] = [];
  for (const g of grades) {
    for (const s of g.subjects) {
      const ch = s.chapters.find((c) => c.id === chapterId);
      if (!ch) continue;
      rows.push({
        gradeId: g.id,
        displayName: formatClassName(g),
        gradeLabel: g.label,
        section: g.section,
        teacherId: s.teacherId,
        teacherName: s.teacherName,
        progress: chapterProgress(ch),
        currentSpot: findCurrentTeachingSpot(s),
      });
    }
  }
  return rows.sort(
    (a, b) => a.gradeLabel.localeCompare(b.gradeLabel) || a.section.localeCompare(b.section),
  );
}

/** Teachers who teach a subject in a standard grade across all sections. */
export type GradeSubjectTeacher = {
  teacherId: string;
  teacherName: string;
  sections: string[];
};

export function listTeachersForGradeSubject(
  grades: SyllabusGrade[],
  gradeLabel: string,
  subjectId: string,
): GradeSubjectTeacher[] {
  const map = new Map<string, GradeSubjectTeacher>();
  for (const g of grades) {
    if (g.label !== gradeLabel) continue;
    const subject = g.subjects.find((s) => s.id === subjectId);
    if (!subject) continue;
    const existing = map.get(subject.teacherId);
    if (existing) {
      if (!existing.sections.includes(g.section)) {
        existing.sections.push(g.section);
      }
    } else {
      map.set(subject.teacherId, {
        teacherId: subject.teacherId,
        teacherName: subject.teacherName,
        sections: [g.section],
      });
    }
  }

  let subjectName: string | undefined;
  for (const g of grades) {
    const subject = g.subjects.find((s) => s.id === subjectId);
    if (subject) {
      subjectName = subject.name;
      break;
    }
  }
  if (!subjectName) {
    const fallback: Record<string, string> = {
      science: "Science",
      math: "Mathematics",
      english: "English",
    };
    subjectName = fallback[subjectId];
  }

  if (subjectName) {
    for (const [teacherId, entry] of Object.entries(teacherDirectory)) {
      if (!entry.subjects.includes(subjectName)) continue;
      const existing = map.get(teacherId);
      if (existing) {
        existing.teacherName = entry.name;
      } else {
        map.set(teacherId, {
          teacherId,
          teacherName: entry.name,
          sections: [],
        });
      }
    }
  }

  return [...map.values()].sort((a, b) => a.teacherName.localeCompare(b.teacherName));
}

/** True when the teacher teaches this subject in any section of the grade. */
export function isSubjectTeacherForGrade(
  grades: SyllabusGrade[],
  gradeLabel: string,
  subjectId: string,
  teacherId: string,
): boolean {
  return grades.some(
    (g) =>
      g.label === gradeLabel &&
      g.subjects.some((s) => s.id === subjectId && s.teacherId === teacherId),
  );
}

/** Admin or a teacher who teaches this subject can assign notes to subject teachers. */
export function canManageSubjectAssignment(
  _grades: SyllabusGrade[],
  _gradeLabel: string,
  _subjectId: string,
  viewer: { isAdmin: boolean; teacherId: string },
): boolean {
  return viewer.isAdmin;
}

export function subjectAssignmentStorageKey(gradeLabel: string, subjectId: string): string {
  return `${gradeLabel}::${subjectId}`;
}

export function hasExplicitSubjectAssignment(
  gradeLabel: string,
  subjectId: string,
  storedAssignments?: Record<string, string[]>,
): boolean {
  if (!storedAssignments) return false;
  return Object.prototype.hasOwnProperty.call(
    storedAssignments,
    subjectAssignmentStorageKey(gradeLabel, subjectId),
  );
}

export function resolveSubjectAssignedTeacherIds(
  gradeLabel: string,
  subjectId: string,
  grades: SyllabusGrade[],
  storedAssignments?: Record<string, string[]>,
): string[] {
  const key = subjectAssignmentStorageKey(gradeLabel, subjectId);

  if (!storedAssignments || !(key in storedAssignments)) {
    return [];
  }

  return storedAssignments[key] ?? [];
}

export function isSubjectAssignedToTeacher(
  gradeLabel: string,
  subjectId: string,
  teacherId: string,
  grades: SyllabusGrade[],
  storedAssignments?: Record<string, string[]>,
): boolean {
  return resolveSubjectAssignedTeacherIds(
    gradeLabel,
    subjectId,
    grades,
    storedAssignments,
  ).includes(teacherId);
}

/** @deprecated Use resolveSubjectAssignedTeacherIds — notes inherit subject assignment. */
export function resolveAssignedTeacherIds(
  note: Pick<UploadedNote, "gradeLabel" | "subjectId">,
  grades: SyllabusGrade[],
  storedAssignments?: Record<string, string[]>,
): string[] {
  return resolveSubjectAssignedTeacherIds(
    note.gradeLabel,
    note.subjectId,
    grades,
    storedAssignments,
  );
}

export function isNoteVisibleToTeacher(
  note: UploadedNote,
  teacherId: string,
  grades: SyllabusGrade[],
  storedAssignments?: Record<string, string[]>,
): boolean {
  const gradeLabel = note.gradeLabel || grades.find((g) => g.id === note.gradeId)?.label || "";
  if (!gradeLabel) return false;

  if (note.uploadedBy === "teacher") {
    return isSubjectTeacherForGrade(grades, gradeLabel, note.subjectId, teacherId);
  }

  if (!hasExplicitSubjectAssignment(gradeLabel, note.subjectId, storedAssignments)) {
    return false;
  }

  return isSubjectAssignedToTeacher(
    gradeLabel,
    note.subjectId,
    teacherId,
    grades,
    storedAssignments,
  );
}

export function filterNotesForViewer(
  notes: UploadedNote[],
  grades: SyllabusGrade[],
  viewer: { isAdmin: boolean; teacherId?: string },
  storedAssignments?: Record<string, string[]>,
): UploadedNote[] {
  if (viewer.isAdmin) return notes;
  if (!viewer.teacherId) return [];
  return notes.filter((n) =>
    isNoteVisibleToTeacher(n, viewer.teacherId!, grades, storedAssignments),
  );
}

export function formatSubjectAssignmentLabel(
  gradeLabel: string,
  subjectId: string,
  grades: SyllabusGrade[],
  storedAssignments?: Record<string, string[]>,
): string {
  const allForSubject = listTeachersForGradeSubject(grades, gradeLabel, subjectId);

  if (!hasExplicitSubjectAssignment(gradeLabel, subjectId, storedAssignments)) {
    return "Not assigned to teachers";
  }

  const key = subjectAssignmentStorageKey(gradeLabel, subjectId);
  const ids = storedAssignments?.[key] ?? [];
  if (ids.length === 0) return "Assigned — no teachers selected";

  if (
    allForSubject.length > 1 &&
    ids.length === allForSubject.length &&
    allForSubject.every((t) => ids.includes(t.teacherId))
  ) {
    return "All section teachers";
  }

  const names = ids.map((id) => {
    const fromGrade = allForSubject.find((t) => t.teacherId === id);
    if (fromGrade) return fromGrade.teacherName;
    return teacherDirectory[id]?.name ?? id;
  });

  return names.join(", ");
}

/** @deprecated Use formatSubjectAssignmentLabel */
export function formatAssignedTeachersLabel(
  note: UploadedNote,
  grades: SyllabusGrade[],
  storedAssignments?: Record<string, string[]>,
): string {
  return formatSubjectAssignmentLabel(
    note.gradeLabel,
    note.subjectId,
    grades,
    storedAssignments,
  );
}

export function assignTargetFromTeacherIds(
  assignedTeacherIds: string[],
  teachers: GradeSubjectTeacher[],
): string {
  if (teachers.length === 0) return "";
  if (
    teachers.length > 1 &&
    assignedTeacherIds.length === teachers.length &&
    teachers.every((t) => assignedTeacherIds.includes(t.teacherId))
  ) {
    return "__all__";
  }
  const match = teachers.find((t) => assignedTeacherIds.includes(t.teacherId));
  return match?.teacherId ?? (teachers.length === 1 ? teachers[0].teacherId : "");
}

export function assignedTeacherIdsFromTarget(
  target: string,
  teachers: GradeSubjectTeacher[],
): string[] {
  if (!teachers.length) return [];
  if (target === "__all__") return teachers.map((t) => t.teacherId);
  return target ? [target] : [];
}

/** Resolve syllabus location labels and progress for an uploaded note. */
export function resolveNoteContext(grades: SyllabusGrade[], note: {
  gradeId: string;
  subjectId: string;
  chapterId: string;
  topicId: string;
}) {
  const grade = grades.find((g) => g.id === note.gradeId);
  const subject = grade?.subjects.find((s) => s.id === note.subjectId);
  const chapter = subject?.chapters.find((c) => c.id === note.chapterId);
  const topic = chapter?.topics.find((t) => t.id === note.topicId);
  const isSubjectNote = note.chapterId === "_subject";
  const isChapterNote = note.topicId === "_chapter";
  return {
    gradeLabel: grade ? formatClassName(grade) : note.gradeId,
    section: grade?.section ?? "",
    subjectName: subject?.name ?? note.subjectId,
    teacherName: subject?.teacherName ?? "",
    chapterTitle: isSubjectNote
      ? "Subject"
      : chapter?.title ?? note.chapterId,
    topicTitle: isSubjectNote
      ? "General"
      : isChapterNote
        ? "Chapter"
        : topic?.title ?? note.topicId,
    topicProgress: topic ? topicProgress(topic) : null,
    chapterProgress: chapter ? chapterProgress(chapter) : null,
    subjectProgress: subject ? subjectProgress(subject) : null,
  };
}

export function mockAiSummary(fileName: string, grade: string, subject: string, chapter: string, topic: string) {
  return {
    summary: `AI extracted syllabus content from "${fileName}" for ${grade} ${subject} → ${chapter} → ${topic}. Key concepts identified and mapped to curriculum standards.`,
    keyPoints: [
      "Core definitions and formulas highlighted",
      "Prerequisite links to prior chapters detected",
      "Suggested 2-period teaching sequence generated",
      "Assessment checkpoints auto-tagged",
    ],
  };
}

export function mockBookOutline(fileName: string, subjectName: string): SyllabusChapter[] {
  const base = fileName.replace(/\.[^.]+$/, "");
  const slug = base.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24);
  return [
    {
      id: `${slug}-ch-1`,
      title: `Unit 1 — Foundations (${subjectName})`,
      status: "planned",
      topics: [
        {
          id: `${slug}-t-1`,
          title: "Key definitions and terminology",
          status: "planned",
          teacherProgress: 0,
        },
        {
          id: `${slug}-t-2`,
          title: "Core concepts from text",
          status: "planned",
          teacherProgress: 0,
        },
      ],
    },
    {
      id: `${slug}-ch-2`,
      title: `Unit 2 — ${base}`,
      status: "planned",
      topics: [
        {
          id: `${slug}-t-3`,
          title: "Worked examples and illustrations",
          status: "planned",
          teacherProgress: 0,
        },
        {
          id: `${slug}-t-4`,
          title: "Practice problems and summaries",
          status: "planned",
          teacherProgress: 0,
        },
      ],
    },
    {
      id: `${slug}-ch-3`,
      title: "Review & assessment",
      status: "planned",
      topics: [
        {
          id: `${slug}-t-5`,
          title: "Chapter-end exercises",
          status: "planned",
          teacherProgress: 0,
        },
      ],
    },
  ];
}

export function isBookVisibleToTeacher(
  book: UploadedBook,
  teacherId: string,
  grades: SyllabusGrade[],
  storedAssignments?: Record<string, string[]>,
): boolean {
  const gradeLabel = book.gradeLabel || grades.find((g) => g.id === book.gradeId)?.label || "";
  if (!gradeLabel) return false;

  if (book.uploadedBy === "teacher") {
    return isSubjectTeacherForGrade(grades, gradeLabel, book.subjectId, teacherId);
  }

  if (!hasExplicitSubjectAssignment(gradeLabel, book.subjectId, storedAssignments)) {
    return false;
  }

  return isSubjectAssignedToTeacher(
    gradeLabel,
    book.subjectId,
    teacherId,
    grades,
    storedAssignments,
  );
}

export function filterBooksForViewer(
  books: UploadedBook[],
  grades: SyllabusGrade[],
  viewer: { isAdmin: boolean; teacherId?: string },
  storedAssignments?: Record<string, string[]>,
): UploadedBook[] {
  if (viewer.isAdmin) return books;
  if (!viewer.teacherId) return [];
  return books.filter((b) =>
    isBookVisibleToTeacher(b, viewer.teacherId!, grades, storedAssignments),
  );
}

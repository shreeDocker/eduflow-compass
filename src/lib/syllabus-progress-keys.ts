import type { TopicStatus } from "./mock-data";
import type { SyllabusGrade, SyllabusTopic } from "./syllabus-data";

export type TopicPath = {
  gradeId: string;
  subjectId: string;
  chapterId: string;
  topicId: string;
};

export type TopicOverride = {
  teacherProgress: number;
  status: TopicStatus;
};

export type ChapterOverride = {
  teacherProgress: number;
  status: TopicStatus;
};

export function topicPathKey(path: TopicPath): string {
  return `${path.gradeId}:${path.subjectId}:${path.chapterId}:${path.topicId}`;
}

export function chapterPathKey(path: Omit<TopicPath, "topicId">): string {
  return `${path.gradeId}:${path.subjectId}:${path.chapterId}`;
}

export function progressToStatus(progress: number): TopicStatus {
  if (progress >= 100) return "completed";
  if (progress >= 50) return "teaching";
  if (progress > 0) return "planned";
  return "not-started";
}

export function applyTopicOverride(topic: SyllabusTopic, override?: TopicOverride): SyllabusTopic {
  if (!override) return topic;
  return { ...topic, teacherProgress: override.teacherProgress, status: override.status };
}

export function mergeProgressIntoGrades(
  grades: SyllabusGrade[],
  topicOverrides: Record<string, TopicOverride>,
  chapterOverrides: Record<string, ChapterOverride>,
): SyllabusGrade[] {
  return grades.map((grade) => ({
    ...grade,
    subjects: grade.subjects.map((subject) => ({
      ...subject,
      chapters: subject.chapters.map((chapter) => {
        const chKey = chapterPathKey({
          gradeId: grade.id,
          subjectId: subject.id,
          chapterId: chapter.id,
        });
        const chOverride = chapterOverrides[chKey];
        const topics = chapter.topics.map((topic) => {
          const tKey = topicPathKey({
            gradeId: grade.id,
            subjectId: subject.id,
            chapterId: chapter.id,
            topicId: topic.id,
          });
          return applyTopicOverride(topic, topicOverrides[tKey]);
        });
        if (topics.length === 0 && chOverride) {
          return { ...chapter, topics, status: chOverride.status, teacherProgress: chOverride.teacherProgress } as SyllabusChapterWithProgress;
        }
        return { ...chapter, topics };
      }),
    })),
  }));
}

type SyllabusChapterWithProgress = SyllabusGrade["subjects"][0]["chapters"][0] & {
  teacherProgress?: number;
};

/** Map today's class session to syllabus tree path */
export function classToSyllabusPath(
  grade: string,
  section: string,
  subjectName: string,
): { gradeId: string; subjectId: string } | null {
  const gradeId = `g${grade}${section.toLowerCase()}`;
  const subjectId = subjectName.toLowerCase().replace(/\s+/g, "-");
  const map: Record<string, string> = {
    science: "science",
    mathematics: "math",
    math: "math",
    english: "english",
  };
  const sid = map[subjectId] ?? subjectId;
  return { gradeId, subjectId: sid };
}

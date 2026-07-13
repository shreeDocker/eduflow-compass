export type SubjectPath = {
  gradeId: string;
  subjectId: string;
};

export type TimelineEntry = {
  dueDate: string;
  startDate: string;
  setBy: "teacher" | "admin";
  updatedAt: string;
};

export function subjectPathKey(path: SubjectPath): string {
  return `${path.gradeId}:${path.subjectId}`;
}

export function topicTimelineKey(path: {
  gradeId: string;
  subjectId: string;
  chapterId: string;
  topicId: string;
}): string {
  return `${path.gradeId}:${path.subjectId}:${path.chapterId}:${path.topicId}`;
}

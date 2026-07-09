// Mock data for ClassPulse. Replace with Lovable Cloud in a later pass.

export type TopicStatus =
  | "not-started"
  | "planned"
  | "teaching"
  | "completed"
  | "revision"
  | "delayed";

export interface Topic {
  id: string;
  title: string;
  status: TopicStatus;
}

export interface Chapter {
  id: string;
  title: string;
  topics: Topic[];
  status: TopicStatus;
}

export interface Subject {
  id: string;
  name: string;
  color: string; // metro line color token
  chapters: Chapter[];
}

export interface ClassSession {
  id: string;
  time: string;
  subject: string;
  grade: string;
  section: string;
  chapterId: string;
  status: "upcoming" | "current" | "done";
  attendance?: { present: number; total: number };
}

export interface TeacherSummary {
  id: string;
  name: string;
  avatarInitials: string;
  completion: number;
  status: "ahead" | "on-track" | "delayed";
}

// ---------- current teacher ----------

export const currentTeacher = {
  id: "t-meena",
  name: "Mrs. Meena",
  greeting: "Good Morning",
  school: "Swotify Academy",
  classesToday: 4,
  homeworkPending: 2,
  topicsRemaining: 3,
};

// ---------- today's classes ----------

export const todaysClasses: ClassSession[] = [
  {
    id: "c1",
    time: "09:00",
    subject: "Science",
    grade: "9",
    section: "A",
    chapterId: "sci-motion",
    status: "current",
    attendance: { present: 40, total: 42 },
  },
  {
    id: "c2",
    time: "10:00",
    subject: "Science",
    grade: "9",
    section: "B",
    chapterId: "sci-motion",
    status: "upcoming",
  },
  {
    id: "c3",
    time: "11:30",
    subject: "Science",
    grade: "8",
    section: "C",
    chapterId: "sci-force",
    status: "upcoming",
  },
  {
    id: "c4",
    time: "14:00",
    subject: "Science",
    grade: "9",
    section: "A",
    chapterId: "sci-heat",
    status: "upcoming",
  },
];

// ---------- subjects / chapters / topics ----------

export const subjects: Subject[] = [
  {
    id: "science",
    name: "Science",
    color: "var(--status-completed)",
    chapters: [
      {
        id: "sci-matter",
        title: "Matter",
        status: "completed",
        topics: [
          { id: "t1", title: "States of matter", status: "completed" },
          { id: "t2", title: "Properties", status: "completed" },
        ],
      },
      {
        id: "sci-motion",
        title: "Motion",
        status: "teaching",
        topics: [
          { id: "t3", title: "Velocity", status: "teaching" },
          { id: "t4", title: "Acceleration", status: "planned" },
          { id: "t5", title: "Distance-time graph", status: "planned" },
          { id: "t6", title: "Activity: rolling ball", status: "planned" },
        ],
      },
      {
        id: "sci-force",
        title: "Force",
        status: "planned",
        topics: [
          { id: "t7", title: "Newton's laws", status: "not-started" },
          { id: "t8", title: "Friction", status: "not-started" },
        ],
      },
      {
        id: "sci-heat",
        title: "Heat",
        status: "delayed",
        topics: [
          { id: "t9", title: "Temperature", status: "not-started" },
          { id: "t10", title: "Conduction", status: "not-started" },
        ],
      },
      {
        id: "sci-light",
        title: "Light",
        status: "not-started",
        topics: [
          { id: "t11", title: "Reflection", status: "not-started" },
          { id: "t12", title: "Refraction", status: "not-started" },
        ],
      },
      {
        id: "sci-exam",
        title: "Term Exam",
        status: "not-started",
        topics: [],
      },
    ],
  },
  {
    id: "math",
    name: "Mathematics",
    color: "var(--status-delayed)",
    chapters: [
      { id: "m1", title: "Number system", status: "completed", topics: [] },
      { id: "m2", title: "Polynomials", status: "delayed", topics: [] },
      { id: "m3", title: "Coordinate geometry", status: "teaching", topics: [] },
      { id: "m4", title: "Linear equations", status: "planned", topics: [] },
      { id: "m5", title: "Triangles", status: "not-started", topics: [] },
    ],
  },
  {
    id: "english",
    name: "English",
    color: "var(--status-planned)",
    chapters: [
      { id: "e1", title: "Prose I", status: "completed", topics: [] },
      { id: "e2", title: "Poetry I", status: "completed", topics: [] },
      { id: "e3", title: "Grammar", status: "teaching", topics: [] },
      { id: "e4", title: "Prose II", status: "planned", topics: [] },
    ],
  },
];

export function findChapter(chapterId: string) {
  for (const s of subjects) {
    const c = s.chapters.find((c) => c.id === chapterId);
    if (c) return { subject: s, chapter: c };
  }
  return null;
}

export function findClass(classId: string) {
  return todaysClasses.find((c) => c.id === classId) ?? null;
}

// ---------- principal dashboard ----------

export const schoolStats = {
  overallProgress: 92,
  teachers: 46,
  delayed: 3,
  onTrack: 38,
  ahead: 5,
  predictedFinish: "Dec 10",
  targetFinish: "Nov 28",
};

export const heatmap: {
  subject: string;
  cells: { section: string; status: TopicStatus }[];
}[] = [
  {
    subject: "Science",
    cells: [
      { section: "6A", status: "completed" },
      { section: "6B", status: "completed" },
      { section: "6C", status: "teaching" },
      { section: "7A", status: "completed" },
      { section: "7B", status: "completed" },
      { section: "8A", status: "teaching" },
    ],
  },
  {
    subject: "Math",
    cells: [
      { section: "6A", status: "delayed" },
      { section: "6B", status: "teaching" },
      { section: "6C", status: "completed" },
      { section: "7A", status: "completed" },
      { section: "7B", status: "delayed" },
      { section: "8A", status: "completed" },
    ],
  },
  {
    subject: "English",
    cells: [
      { section: "6A", status: "completed" },
      { section: "6B", status: "completed" },
      { section: "6C", status: "completed" },
      { section: "7A", status: "revision" },
      { section: "7B", status: "completed" },
      { section: "8A", status: "completed" },
    ],
  },
  {
    subject: "Tamil",
    cells: [
      { section: "6A", status: "completed" },
      { section: "6B", status: "teaching" },
      { section: "6C", status: "completed" },
      { section: "7A", status: "completed" },
      { section: "7B", status: "planned" },
      { section: "8A", status: "completed" },
    ],
  },
];

export const teacherComparison: TeacherSummary[] = [
  { id: "t1", name: "Meena", avatarInitials: "M", completion: 90, status: "ahead" },
  { id: "t2", name: "Ravi", avatarInitials: "R", completion: 62, status: "delayed" },
  { id: "t3", name: "Priya", avatarInitials: "P", completion: 96, status: "ahead" },
  { id: "t4", name: "Karthik", avatarInitials: "K", completion: 78, status: "on-track" },
  { id: "t5", name: "Divya", avatarInitials: "D", completion: 84, status: "on-track" },
];

export const statusMeta: Record<
  TopicStatus,
  { label: string; token: string; dot: string }
> = {
  "not-started": { label: "Not started", token: "var(--status-not-started)", dot: "⚪" },
  planned: { label: "Planned", token: "var(--status-planned)", dot: "🔵" },
  teaching: { label: "Teaching", token: "var(--status-teaching)", dot: "🟡" },
  completed: { label: "Completed", token: "var(--status-completed)", dot: "🟢" },
  revision: { label: "Revision", token: "var(--status-revision)", dot: "🟣" },
  delayed: { label: "Delayed", token: "var(--status-delayed)", dot: "🔴" },
};

export function chapterProgress(chapter: Chapter): number {
  if (chapter.topics.length === 0) {
    if (chapter.status === "completed") return 100;
    if (chapter.status === "teaching") return 55;
    if (chapter.status === "planned") return 20;
    if (chapter.status === "delayed") return 35;
    return 0;
  }
  const done = chapter.topics.filter((t) => t.status === "completed").length;
  const half = chapter.topics.filter((t) => t.status === "teaching").length * 0.5;
  return Math.round(((done + half) / chapter.topics.length) * 100);
}

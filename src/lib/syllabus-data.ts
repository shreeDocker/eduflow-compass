import type { TopicStatus } from "./mock-data";

export type SyllabusTopic = {
  id: string;
  title: string;
  status: TopicStatus;
  /** Teacher-marked completion 0–100 */
  teacherProgress: number;
};

export type SyllabusChapter = {
  id: string;
  title: string;
  status: TopicStatus;
  topics: SyllabusTopic[];
};

export type SyllabusSubject = {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  chapters: SyllabusChapter[];
};

export type SyllabusGrade = {
  id: string;
  label: string;
  section: string;
  subjects: SyllabusSubject[];
};

export type UploadedNote = {
  id: string;
  title: string;
  body: string;
  uploadedAt: string;
  /** Grade level e.g. "Grade 8" — used for library grouping */
  gradeLabel: string;
  gradeId: string;
  subjectId: string;
  chapterId: string;
  topicId: string;
  uploadedBy?: "admin" | "teacher";
  /** Legacy file uploads — optional */
  fileName?: string;
  aiSummary?: string;
  keyPoints?: string[];
};

export function noteDisplayTitle(note: UploadedNote): string {
  return note.title || note.fileName || "Untitled note";
}

export function noteDisplayBody(note: UploadedNote): string {
  return note.body || note.aiSummary || "";
}

export type BookAnalysisStatus = "pending" | "analyzing" | "analyzed" | "failed";

/** Textbook upload — AI will extract chapter/topic outline when analyzed. */
export type UploadedBook = {
  id: string;
  fileName: string;
  title: string;
  gradeLabel: string;
  gradeId: string;
  subjectId: string;
  uploadedAt: string;
  uploadedBy?: "admin" | "teacher";
  status: BookAnalysisStatus;
  /** Chapters/topics extracted from the book (populated after analysis). */
  analyzedChapters?: SyllabusChapter[];
  analysisError?: string;
};

export function bookDisplayTitle(book: UploadedBook): string {
  return book.title || book.fileName.replace(/\.[^.]+$/, "") || "Untitled book";
}

/** Bump to reset demo notes/assignments in localStorage for fresh mock data. */
export const DEMO_DATA_VERSION = 5;

export const demoUploadPrefill = {
  fileName: "velocity-lesson-demo.pdf",
  noteTitle: "Velocity & motion — demo lesson notes",
  noteBody:
    "Velocity is displacement per unit time (v = Δs/Δt). Cover scalar vs vector quantities, uniform motion, and how to read distance-time graphs. Include the rolling-ball activity steps.",
};

export type SeedSubjectAssignments = Record<string, string[]>;

/** Demo subject-level teacher assignments — notes visible only to listed teachers. */
export const seedSubjectAssignments: SeedSubjectAssignments = {
  "Grade 9::science": ["t-meena", "t-anita"],
  "Grade 9::math": ["t-karthik", "t-lakshmi"],
  "Grade 9::english": ["t-priya", "t-divya"],
  "Grade 8::science": ["t-meena", "t-karthik"],
  "Grade 8::math": ["t-ravi", "t-suresh"],
  "Grade 7::science": ["t-karthik", "t-venkat"],
  "Grade 7::math": ["t-ravi"],
  "Grade 7::english": ["t-priya", "t-arun"],
};

export const currentUserId = "t-meena";

export const teacherDirectory: Record<
  string,
  { name: string; initials: string; subjects: string[] }
> = {
  "t-meena": { name: "Mrs. Meena", initials: "MM", subjects: ["Science"] },
  "t-ravi": { name: "Mr. Ravi", initials: "RV", subjects: ["Mathematics"] },
  "t-priya": { name: "Ms. Priya", initials: "PR", subjects: ["English"] },
  "t-karthik": { name: "Mr. Karthik", initials: "KK", subjects: ["Science", "Mathematics"] },
  "t-anita": { name: "Ms. Anita", initials: "AN", subjects: ["Science"] },
  "t-suresh": { name: "Mr. Suresh", initials: "SR", subjects: ["Mathematics"] },
  "t-divya": { name: "Mrs. Divya", initials: "DV", subjects: ["English"] },
  "t-arun": { name: "Mr. Arun", initials: "AR", subjects: ["English", "Science"] },
  "t-lakshmi": { name: "Ms. Lakshmi", initials: "LK", subjects: ["Mathematics"] },
  "t-venkat": { name: "Mr. Venkat", initials: "VK", subjects: ["Science"] },
};

function topic(
  id: string,
  title: string,
  status: TopicStatus,
  teacherProgress: number,
): SyllabusTopic {
  return { id, title, status, teacherProgress };
}

function chapter(
  id: string,
  title: string,
  status: TopicStatus,
  topics: SyllabusTopic[],
): SyllabusChapter {
  return { id, title, status, topics };
}

/** School-wide syllabus tree: Grade → Subject → Chapter → Topic */
export const syllabusGrades: SyllabusGrade[] = [
  {
    id: "g8a",
    label: "Grade 8",
    section: "A",
    subjects: [
      {
        id: "science",
        name: "Science",
        teacherId: "t-meena",
        teacherName: "Mrs. Meena",
        chapters: [
          chapter("sci-matter", "Matter", "completed", [
            topic("t1", "States of matter", "completed", 100),
            topic("t2", "Properties", "completed", 100),
          ]),
          chapter("sci-force", "Force", "teaching", [
            topic("t7", "Newton's laws", "teaching", 60),
            topic("t8", "Friction", "planned", 0),
          ]),
        ],
      },
      {
        id: "math",
        name: "Mathematics",
        teacherId: "t-ravi",
        teacherName: "Mr. Ravi",
        chapters: [
          chapter("m1", "Number system", "completed", []),
          chapter("m3", "Coordinate geometry", "teaching", [
            topic("m3t1", "Plotting points", "completed", 100),
            topic("m3t2", "Distance formula", "teaching", 40),
          ]),
        ],
      },
    ],
  },
  {
    id: "g9a",
    label: "Grade 9",
    section: "A",
    subjects: [
      {
        id: "science",
        name: "Science",
        teacherId: "t-meena",
        teacherName: "Mrs. Meena",
        chapters: [
          chapter("sci-matter", "Matter", "completed", [
            topic("t1", "States of matter", "completed", 100),
            topic("t2", "Properties", "completed", 100),
          ]),
          chapter("sci-motion", "Motion", "teaching", [
            topic("t3", "Velocity", "teaching", 75),
            topic("t4", "Acceleration", "planned", 0),
            topic("t5", "Distance-time graph", "planned", 0),
            topic("t6", "Activity: rolling ball", "planned", 0),
          ]),
          chapter("sci-heat", "Heat", "delayed", [
            topic("t9", "Temperature", "not-started", 0),
            topic("t10", "Conduction", "not-started", 0),
          ]),
        ],
      },
      {
        id: "math",
        name: "Mathematics",
        teacherId: "t-karthik",
        teacherName: "Mr. Karthik",
        chapters: [
          chapter("m2", "Polynomials", "delayed", [
            topic("m2t1", "Degree of polynomial", "teaching", 30),
          ]),
          chapter("m4", "Linear equations", "planned", []),
        ],
      },
      {
        id: "english",
        name: "English",
        teacherId: "t-priya",
        teacherName: "Ms. Priya",
        chapters: [
          chapter("e3", "Grammar", "teaching", [
            topic("e3t1", "Tenses", "teaching", 50),
            topic("e3t2", "Active & passive voice", "planned", 0),
          ]),
          chapter("e4", "Prose II", "planned", []),
        ],
      },
    ],
  },
  {
    id: "g9b",
    label: "Grade 9",
    section: "B",
    subjects: [
      {
        id: "science",
        name: "Science",
        teacherId: "t-meena",
        teacherName: "Mrs. Meena",
        chapters: [
          chapter("sci-matter", "Matter", "completed", [
            topic("t1", "States of matter", "completed", 100),
            topic("t2", "Properties", "completed", 100),
          ]),
          chapter("sci-motion", "Motion", "teaching", [
            topic("t3", "Velocity", "completed", 100),
            topic("t4", "Acceleration", "teaching", 50),
            topic("t5", "Distance-time graph", "planned", 0),
            topic("t6", "Activity: rolling ball", "planned", 0),
          ]),
        ],
      },
    ],
  },
  {
    id: "g8b",
    label: "Grade 8",
    section: "B",
    subjects: [
      {
        id: "science",
        name: "Science",
        teacherId: "t-karthik",
        teacherName: "Mr. Karthik",
        chapters: [
          chapter("sci-matter", "Matter", "teaching", [
            topic("t1", "States of matter", "completed", 100),
            topic("t2", "Properties", "teaching", 45),
          ]),
          chapter("sci-force", "Force", "planned", [
            topic("t7", "Newton's laws", "not-started", 0),
          ]),
        ],
      },
      {
        id: "math",
        name: "Mathematics",
        teacherId: "t-ravi",
        teacherName: "Mr. Ravi",
        chapters: [
          chapter("m1", "Number system", "teaching", []),
          chapter("m3", "Coordinate geometry", "planned", []),
        ],
      },
    ],
  },
  {
    id: "g8c",
    label: "Grade 8",
    section: "C",
    subjects: [
      {
        id: "science",
        name: "Science",
        teacherId: "t-meena",
        teacherName: "Mrs. Meena",
        chapters: [
          chapter("sci-force", "Force", "teaching", [
            topic("t7", "Newton's laws", "teaching", 55),
            topic("t8", "Friction", "planned", 0),
          ]),
        ],
      },
    ],
  },
  {
    id: "g7a",
    label: "Grade 7",
    section: "A",
    subjects: [
      {
        id: "science",
        name: "Science",
        teacherId: "t-karthik",
        teacherName: "Mr. Karthik",
        chapters: [
          chapter("sci-intro", "Introduction", "completed", [
            topic("t1", "Scientific method", "completed", 100),
            topic("t2", "Lab safety", "completed", 100),
          ]),
        ],
      },
      {
        id: "math",
        name: "Mathematics",
        teacherId: "t-ravi",
        teacherName: "Mr. Ravi",
        chapters: [
          chapter("m1", "Integers", "teaching", []),
          chapter("m2", "Fractions", "planned", []),
        ],
      },
      {
        id: "english",
        name: "English",
        teacherId: "t-priya",
        teacherName: "Ms. Priya",
        chapters: [
          chapter("e1", "Reading", "teaching", []),
          chapter("e2", "Writing", "planned", []),
        ],
      },
    ],
  },
];

export const seedBooks: UploadedBook[] = [
  {
    id: "book-seed-1",
    fileName: "ncert-science-grade9-motion.pdf",
    title: "NCERT Science — Motion & Force",
    gradeLabel: "Grade 9",
    gradeId: "g9a",
    subjectId: "science",
    uploadedAt: "2026-07-01",
    uploadedBy: "admin",
    status: "analyzed",
    analyzedChapters: [
      {
        id: "book-ch-1",
        title: "Describing Motion",
        status: "planned",
        topics: [
          { id: "book-t-1", title: "Distance and displacement", status: "planned", teacherProgress: 0 },
          { id: "book-t-2", title: "Speed and velocity", status: "planned", teacherProgress: 0 },
        ],
      },
      {
        id: "book-ch-2",
        title: "Equations of Motion",
        status: "planned",
        topics: [
          { id: "book-t-3", title: "Uniform acceleration", status: "planned", teacherProgress: 0 },
          { id: "book-t-4", title: "Graphical analysis", status: "planned", teacherProgress: 0 },
        ],
      },
    ],
  },
];

export const seedNotes: UploadedNote[] = [
  {
    id: "n0",
    title: "Matter unit summary",
    body: "Covers solid, liquid, and gas states with particle model basics. Class activities on melting ice and evaporation.",
    fileName: "matter-unit-summary.pdf",
    uploadedAt: "2026-06-22",
    gradeLabel: "Grade 9",
    gradeId: "g9a",
    subjectId: "science",
    chapterId: "sci-matter",
    topicId: "t1",
    uploadedBy: "admin",
    aiSummary:
      "Covers solid, liquid, and gas states with particle model basics. Class activities on melting ice and evaporation.",
    keyPoints: ["Three states of matter", "Particle arrangement", "Changes of state"],
  },
  {
    id: "n1",
    title: "Motion chapter notes",
    body: "Velocity is defined as displacement per unit time. Covers scalar vs vector quantities, uniform motion, and graphical interpretation of v-t graphs.",
    fileName: "motion-chapter-notes.pdf",
    uploadedAt: "2026-07-08",
    gradeLabel: "Grade 9",
    gradeId: "g9a",
    subjectId: "science",
    chapterId: "sci-motion",
    topicId: "t3",
    uploadedBy: "admin",
    aiSummary:
      "Velocity is defined as displacement per unit time. Covers scalar vs vector quantities, uniform motion, and graphical interpretation of v-t graphs.",
    keyPoints: ["v = Δs/Δt", "Vector quantity", "SI unit: m/s", "Uniform vs non-uniform"],
  },
  {
    id: "n2",
    title: "Heat unit outline",
    body: "Introduction to temperature scales, thermal equilibrium, and thermometer types. Links to upcoming conduction topic.",
    fileName: "heat-unit-outline.docx",
    uploadedAt: "2026-07-05",
    gradeLabel: "Grade 9",
    gradeId: "g9a",
    subjectId: "science",
    chapterId: "sci-heat",
    topicId: "t9",
    uploadedBy: "admin",
    aiSummary:
      "Introduction to temperature scales, thermal equilibrium, and thermometer types. Links to upcoming conduction topic.",
    keyPoints: ["Celsius & Kelvin", "Thermal equilibrium", "Clinical vs lab thermometers"],
  },
  {
    id: "n3",
    title: "Polynomials revision sheet",
    body: "Degree of a polynomial, standard form, and zeroes. Practice problems on identifying coefficients and classifying expressions.",
    fileName: "polynomials-revision.pdf",
    uploadedAt: "2026-07-02",
    gradeLabel: "Grade 9",
    gradeId: "g9a",
    subjectId: "math",
    chapterId: "m2",
    topicId: "m2t1",
    uploadedBy: "admin",
    aiSummary:
      "Degree of a polynomial, standard form, and zeroes. Practice problems on identifying coefficients and classifying expressions.",
    keyPoints: ["Degree", "Coefficients", "Standard form", "Zeroes"],
  },
  {
    id: "n4",
    title: "Tenses quick reference",
    body: "Present, past, and future tense forms with examples. Active vs passive voice introduction for upcoming grammar unit.",
    uploadedAt: "2026-06-28",
    gradeLabel: "Grade 9",
    gradeId: "g9a",
    subjectId: "english",
    chapterId: "e3",
    topicId: "e3t1",
    uploadedBy: "teacher",
    keyPoints: ["Simple present", "Past continuous", "Future perfect"],
  },
  {
    id: "n5",
    title: "Newton's laws lab guide",
    body: "Demo setup for inertia cart, spring balance readings, and friction block experiment. Safety checklist for force chapter.",
    fileName: "newtons-laws-lab.pdf",
    uploadedAt: "2026-07-06",
    gradeLabel: "Grade 8",
    gradeId: "g8a",
    subjectId: "science",
    chapterId: "sci-force",
    topicId: "t7",
    uploadedBy: "admin",
    aiSummary:
      "Demo setup for inertia cart, spring balance readings, and friction block experiment. Safety checklist for force chapter.",
    keyPoints: ["First law — inertia", "F = ma", "Friction demo"],
  },
  {
    id: "n6",
    title: "Coordinate geometry basics",
    body: "Plotting points on the Cartesian plane, quadrants, and distance between two points. Worked examples for Section A.",
    uploadedAt: "2026-06-30",
    gradeLabel: "Grade 8",
    gradeId: "g8a",
    subjectId: "math",
    chapterId: "m3",
    topicId: "m3t1",
    uploadedBy: "teacher",
    keyPoints: ["x-y plane", "Quadrants", "Plotting"],
  },
  {
    id: "n7",
    title: "Scientific method poster notes",
    body: "Observation → hypothesis → experiment → conclusion. Lab safety rules and equipment handling for Grade 7 intro unit.",
    fileName: "scientific-method.docx",
    uploadedAt: "2026-06-18",
    gradeLabel: "Grade 7",
    gradeId: "g7a",
    subjectId: "science",
    chapterId: "sci-intro",
    topicId: "t1",
    uploadedBy: "admin",
    aiSummary:
      "Observation → hypothesis → experiment → conclusion. Lab safety rules and equipment handling for Grade 7 intro unit.",
    keyPoints: ["Hypothesis", "Variables", "Lab safety"],
  },
  {
    id: "n8",
    title: "Integers class worksheet",
    body: "Addition and subtraction of integers on a number line. Word problems on profit/loss and temperature changes.",
    uploadedAt: "2026-07-01",
    gradeLabel: "Grade 7",
    gradeId: "g7a",
    subjectId: "math",
    chapterId: "m1",
    topicId: "_chapter",
    uploadedBy: "teacher",
    keyPoints: ["Number line", "Sign rules", "Word problems"],
  },
  {
    id: "n9",
    title: "Friction extension reading",
    body: "Types of friction, factors affecting friction, and real-world examples. Optional reading before the friction topic.",
    uploadedAt: "2026-07-09",
    gradeLabel: "Grade 8",
    gradeId: "g8c",
    subjectId: "science",
    chapterId: "sci-force",
    topicId: "t8",
    uploadedBy: "admin",
    keyPoints: ["Static vs kinetic", "Rough surfaces", "Lubrication"],
  },
];

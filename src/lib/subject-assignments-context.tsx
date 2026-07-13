import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  DEMO_DATA_VERSION,
  seedSubjectAssignments,
} from "./syllabus-data";

const STORAGE_KEY = "swotify_subject_assignments";
const DEMO_VERSION_KEY = "swotify_demo_version";

export type SubjectAssignmentsMap = Record<string, string[]>;

export function subjectAssignmentKey(gradeLabel: string, subjectId: string): string {
  return `${gradeLabel}::${subjectId}`;
}

function loadAssignments(): SubjectAssignmentsMap {
  const storedVersion = Number(localStorage.getItem(DEMO_VERSION_KEY) || 0);
  if (storedVersion < DEMO_DATA_VERSION) {
    localStorage.removeItem(STORAGE_KEY);
    return { ...seedSubjectAssignments };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...seedSubjectAssignments };
    const parsed = JSON.parse(raw) as SubjectAssignmentsMap;
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    /* ignore */
  }
  return { ...seedSubjectAssignments };
}

function persistAssignments(map: SubjectAssignmentsMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

type SubjectAssignmentsContextValue = {
  assignments: SubjectAssignmentsMap;
  getSubjectAssignment: (gradeLabel: string, subjectId: string) => string[] | undefined;
  setSubjectAssignment: (
    gradeLabel: string,
    subjectId: string,
    assignedTeacherIds: string[] | null,
  ) => void;
};

const SubjectAssignmentsContext = createContext<SubjectAssignmentsContextValue | null>(null);

export function SubjectAssignmentsProvider({ children }: { children: ReactNode }) {
  const [assignments, setAssignments] = useState<SubjectAssignmentsMap>(() => ({
    ...seedSubjectAssignments,
  }));

  useEffect(() => {
    setAssignments(loadAssignments());
  }, []);

  const getSubjectAssignment = useCallback(
    (gradeLabel: string, subjectId: string) =>
      assignments[subjectAssignmentKey(gradeLabel, subjectId)],
    [assignments],
  );

  const setSubjectAssignment = useCallback(
    (gradeLabel: string, subjectId: string, assignedTeacherIds: string[] | null) => {
      setAssignments((prev) => {
        const key = subjectAssignmentKey(gradeLabel, subjectId);
        if (assignedTeacherIds === null) {
          const { [key]: _removed, ...rest } = prev;
          persistAssignments(rest);
          return rest;
        }
        const next = { ...prev, [key]: assignedTeacherIds };
        persistAssignments(next);
        return next;
      });
    },
    [],
  );

  const value = useMemo(
    () => ({ assignments, getSubjectAssignment, setSubjectAssignment }),
    [assignments, getSubjectAssignment, setSubjectAssignment],
  );

  return (
    <SubjectAssignmentsContext.Provider value={value}>
      {children}
    </SubjectAssignmentsContext.Provider>
  );
}

export function useSubjectAssignments() {
  const ctx = useContext(SubjectAssignmentsContext);
  if (!ctx) {
    throw new Error("useSubjectAssignments must be used within SubjectAssignmentsProvider");
  }
  return ctx;
}

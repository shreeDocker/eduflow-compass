import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEMO_DATA_VERSION, seedNotes, type UploadedNote } from "./syllabus-data";

const STORAGE_KEY = "swotify_notes";
const DEMO_VERSION_KEY = "swotify_demo_version";

type NotesStorage = {
  custom: UploadedNote[];
  deletedSeedIds: string[];
};

function normalizeNote(note: UploadedNote): UploadedNote {
  return {
    ...note,
    title: note.title || note.fileName || "Untitled note",
    body: note.body || note.aiSummary || "",
    gradeLabel: note.gradeLabel || "",
    uploadedBy: note.uploadedBy ?? "admin",
  };
}

function mergeStoredNotes(stored: NotesStorage): UploadedNote[] {
  const deleted = new Set(stored.deletedSeedIds);
  const customById = new Map(stored.custom.map((c) => [c.id, normalizeNote(c)]));
  const fromSeed = seedNotes
    .filter((s) => !deleted.has(s.id))
    .map((s) => customById.get(s.id) ?? normalizeNote(s));
  const customOnly = stored.custom
    .filter((c) => !seedNotes.some((s) => s.id === c.id))
    .map(normalizeNote);
  return [...fromSeed, ...customOnly];
}

function loadNotesFromStorage(): UploadedNote[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as NotesStorage | UploadedNote[];
    if (Array.isArray(parsed)) {
      return mergeStoredNotes({ custom: parsed.map(normalizeNote), deletedSeedIds: [] });
    }
    if (parsed && Array.isArray(parsed.custom) && Array.isArray(parsed.deletedSeedIds)) {
      return mergeStoredNotes(parsed);
    }
  } catch {
    /* ignore */
  }
  return null;
}

function isSeedOverride(note: UploadedNote): boolean {
  const seed = seedNotes.find((s) => s.id === note.id);
  if (!seed) return false;
  return (
    note.title !== seed.title ||
    note.body !== seed.body ||
    note.gradeLabel !== seed.gradeLabel
  );
}

function persistNotes(all: UploadedNote[]) {
  const custom = all.filter((n) => !seedNotes.some((s) => s.id === n.id) || isSeedOverride(n));
  const deletedSeedIds = seedNotes.filter((s) => !all.some((n) => n.id === s.id)).map((s) => s.id);
  const payload: NotesStorage = { custom, deletedSeedIds };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

type NotesContextValue = {
  notes: UploadedNote[];
  addNote: (note: UploadedNote) => void;
  updateNote: (id: string, patch: Partial<UploadedNote>) => void;
  removeNote: (id: string) => void;
};

const NotesContext = createContext<NotesContextValue | null>(null);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<UploadedNote[]>(seedNotes);

  useEffect(() => {
    const storedVersion = Number(localStorage.getItem(DEMO_VERSION_KEY) || 0);
    if (storedVersion < DEMO_DATA_VERSION) {
      localStorage.setItem(DEMO_VERSION_KEY, String(DEMO_DATA_VERSION));
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("swotify_subject_assignments");
      localStorage.removeItem("swotify_books");
      setNotes(seedNotes);
      return;
    }
    const loaded = loadNotesFromStorage();
    if (loaded) setNotes(loaded);
  }, []);

  const addNote = useCallback((note: UploadedNote) => {
    setNotes((prev) => {
      const next = [note, ...prev.filter((n) => n.id !== note.id)];
      persistNotes(next);
      return next;
    });
  }, []);

  const updateNote = useCallback((id: string, patch: Partial<UploadedNote>) => {
    setNotes((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, ...patch } : n));
      persistNotes(next);
      return next;
    });
  }, []);

  const removeNote = useCallback((id: string) => {
    setNotes((prev) => {
      const next = prev.filter((n) => n.id !== id);
      persistNotes(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ notes, addNote, updateNote, removeNote }),
    [notes, addNote, updateNote, removeNote],
  );

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotes must be used within NotesProvider");
  return ctx;
}


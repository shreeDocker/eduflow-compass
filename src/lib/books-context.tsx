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
  seedBooks,
  type UploadedBook,
} from "./syllabus-data";

const STORAGE_KEY = "swotify_books";
const DEMO_VERSION_KEY = "swotify_demo_version";

type BooksStorage = {
  custom: UploadedBook[];
  deletedSeedIds: string[];
};

function normalizeBook(book: UploadedBook): UploadedBook {
  return {
    ...book,
    title: book.title || book.fileName.replace(/\.[^.]+$/, "") || "Untitled book",
    gradeLabel: book.gradeLabel || "",
    uploadedBy: book.uploadedBy ?? "admin",
  };
}

function mergeStoredBooks(stored: BooksStorage): UploadedBook[] {
  const deleted = new Set(stored.deletedSeedIds);
  const customById = new Map(stored.custom.map((c) => [c.id, normalizeBook(c)]));
  const fromSeed = seedBooks
    .filter((s) => !deleted.has(s.id))
    .map((s) => customById.get(s.id) ?? normalizeBook(s));
  const customOnly = stored.custom
    .filter((c) => !seedBooks.some((s) => s.id === c.id))
    .map(normalizeBook);
  return [...fromSeed, ...customOnly];
}

function loadBooksFromStorage(): UploadedBook[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BooksStorage | UploadedBook[];
    if (Array.isArray(parsed)) {
      return mergeStoredBooks({ custom: parsed.map(normalizeBook), deletedSeedIds: [] });
    }
    if (parsed && Array.isArray(parsed.custom) && Array.isArray(parsed.deletedSeedIds)) {
      return mergeStoredBooks(parsed);
    }
  } catch {
    /* ignore */
  }
  return null;
}

function isSeedOverride(book: UploadedBook): boolean {
  const seed = seedBooks.find((s) => s.id === book.id);
  if (!seed) return false;
  return (
    book.title !== seed.title ||
    book.fileName !== seed.fileName ||
    book.status !== seed.status ||
    book.gradeLabel !== seed.gradeLabel
  );
}

function persistBooks(all: UploadedBook[]) {
  const custom = all.filter(
    (b) => !seedBooks.some((s) => s.id === b.id) || isSeedOverride(b),
  );
  const deletedSeedIds = seedBooks
    .filter((s) => !all.some((b) => b.id === s.id))
    .map((s) => s.id);
  const payload: BooksStorage = { custom, deletedSeedIds };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

type BooksContextValue = {
  books: UploadedBook[];
  addBook: (book: UploadedBook) => void;
  updateBook: (id: string, patch: Partial<UploadedBook>) => void;
  removeBook: (id: string) => void;
};

const BooksContext = createContext<BooksContextValue | null>(null);

export function BooksProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<UploadedBook[]>(seedBooks);

  useEffect(() => {
    const storedVersion = Number(localStorage.getItem(DEMO_VERSION_KEY) || 0);
    if (storedVersion < DEMO_DATA_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      setBooks(seedBooks);
      return;
    }
    const loaded = loadBooksFromStorage();
    if (loaded) setBooks(loaded);
  }, []);

  const addBook = useCallback((book: UploadedBook) => {
    setBooks((prev) => {
      const next = [book, ...prev.filter((b) => b.id !== book.id)];
      persistBooks(next);
      return next;
    });
  }, []);

  const updateBook = useCallback((id: string, patch: Partial<UploadedBook>) => {
    setBooks((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, ...patch } : b));
      persistBooks(next);
      return next;
    });
  }, []);

  const removeBook = useCallback((id: string) => {
    setBooks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      persistBooks(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ books, addBook, updateBook, removeBook }),
    [books, addBook, updateBook, removeBook],
  );

  return <BooksContext.Provider value={value}>{children}</BooksContext.Provider>;
}

export function useBooks() {
  const ctx = useContext(BooksContext);
  if (!ctx) throw new Error("useBooks must be used within BooksProvider");
  return ctx;
}

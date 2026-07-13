export type AdminBooksView = "catalog" | "logs";

export type TeacherBooksView = "catalog";

export type BooksView = AdminBooksView | TeacherBooksView;

export function normalizeBooksView(raw: string | undefined): BooksView | undefined {
  if (!raw) return undefined;
  if (raw === "metro" || raw === "progress") return "catalog";
  if (raw === "blueprint" || raw === "books" || raw === "notes" || raw === "teacher") {
    return "catalog";
  }
  if (raw === "catalog" || raw === "logs") {
    return raw;
  }
  return undefined;
}

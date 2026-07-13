import type { BooksView } from "@/lib/books-view-types";

export type BooksPageHeader = {
  pageTitle: string;
  sectionLabel: string;
  heading: string;
  description: string;
  showProgress: boolean;
};

export function getBooksPageHeader(view: BooksView, isAdmin: boolean): BooksPageHeader {
  if (isAdmin && view === "logs") {
    return {
      pageTitle: "Daily Logs",
      sectionLabel: "School timetable",
      heading: "Daily teaching logs",
      description:
        "Period-by-period coverage for today — who taught what, which chapter, and topics logged.",
      showProgress: false,
    };
  }

  if (isAdmin) {
    return {
      pageTitle: "Class tracker",
      sectionLabel: "School-wide",
      heading: "Books, chapters & topics",
      description:
        "Filter by class, grade, or teacher. Switch layout for drill-down, subject summary, or school overview.",
      showProgress: true,
    };
  }

  return {
    pageTitle: "Topic tracker",
    sectionLabel: "Your classes",
    heading: "Mark topics as you teach",
    description:
      "Your current chapter opens automatically. Use Done, the slider, or swipe to update progress.",
    showProgress: true,
  };
}

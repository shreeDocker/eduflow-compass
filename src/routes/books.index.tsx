import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { BooksCatalog } from "@/components/books/BooksCatalog";
import {
  BooksViewSwitch,
  type AdminBooksView,
  type BooksView,
} from "@/components/books/BooksViewSwitch";
import { normalizeBooksView } from "@/lib/books-view-types";
import { TeacherTopicTracker } from "@/components/syllabus/TeacherTopicTracker";
import {
  AdminTrackerViewSwitch,
  normalizeAdminTrackerView,
  type AdminTrackerView,
} from "@/components/syllabus/AdminTrackerViews";
import { AdminInsightsAccordion } from "@/components/admin/AdminInsightsAccordion";
import { SubjectTeacherOverview } from "@/components/syllabus/SubjectTeacherOverview";
import {
  SyllabusTrackerFilters,
  trackerFilterLabel,
} from "@/components/syllabus/SyllabusTrackerFilters";
import { DailyTeachingLogs } from "@/components/admin/DailyTeachingLogs";
import { useRole } from "@/lib/role-context";
import { useSyllabusProgress } from "@/lib/syllabus-progress-context";
import { currentUserId } from "@/lib/syllabus-data";
import {
  buildSubjectTeacherOverview,
  filterGradesForTeacher,
  gradeProgress,
  schoolProgress,
  teacherStats,
  type TrackerFilter,
} from "@/lib/syllabus-utils";
import type { SyllabusGrade } from "@/lib/syllabus-data";
import { getBooksPageHeader } from "@/lib/books-page-copy";
import { ProgressBadge, ProgressBar } from "@/components/syllabus/ProgressBar";

type BooksSearch = {
  view?: BooksView;
  layout?: AdminTrackerView;
};

const ADMIN_VIEWS: AdminBooksView[] = ["catalog", "logs"];

function resolveBooksView(v: string | undefined, isAdmin: boolean): BooksView | undefined {
  const normalized = normalizeBooksView(v);
  if (!normalized) return undefined;
  if (isAdmin && ADMIN_VIEWS.includes(normalized as AdminBooksView)) {
    return normalized as AdminBooksView;
  }
  if (!isAdmin && normalized === "catalog") return "catalog";
  return undefined;
}

function isFilterableView(v: BooksView): boolean {
  return v === "catalog";
}

export const Route = createFileRoute("/books/")({
  validateSearch: (search: Record<string, unknown>): BooksSearch => {
    const rawView = typeof search.view === "string" ? search.view : undefined;
    const view = normalizeBooksView(rawView);
    const layout =
      search.layout === "tree" ||
      search.layout === "catalog" ||
      search.layout === "subjects" ||
      search.layout === "overview"
        ? search.layout
        : undefined;
    return { view, layout };
  },
  head: () => ({
    meta: [
      { title: "Track — Swotify Plus" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BooksPage,
});

function BooksPage() {
  const { isAdmin } = useRole();
  const { grades: allGrades } = useSyllabusProgress();
  const { view: searchView, layout: searchLayout } = Route.useSearch();
  const navigate = Route.useNavigate();

  const baseGrades = useMemo(
    () => (isAdmin ? allGrades : filterGradesForTeacher(allGrades, currentUserId)),
    [allGrades, isAdmin],
  );

  const [filteredGrades, setFilteredGrades] = useState<SyllabusGrade[]>(baseGrades);
  const [activeFilter, setActiveFilter] = useState<TrackerFilter>({ mode: "all", value: "" });

  const defaultView: BooksView = "catalog";
  const view = resolveBooksView(searchView, isAdmin) ?? defaultView;

  const [catalogLayout, setCatalogLayout] = useState<AdminTrackerView>(
    normalizeAdminTrackerView(searchLayout),
  );

  useEffect(() => {
    setFilteredGrades(baseGrades);
    setActiveFilter({ mode: "all", value: "" });
  }, [baseGrades]);

  useEffect(() => {
    if (searchLayout) setCatalogLayout(normalizeAdminTrackerView(searchLayout));
  }, [searchLayout]);

  const handleFilterChange = useCallback((filtered: SyllabusGrade[], filter: TrackerFilter) => {
    setFilteredGrades(filtered);
    setActiveFilter(filter);
  }, []);

  const subjectGroups = useMemo(
    () => buildSubjectTeacherOverview(filteredGrades),
    [filteredGrades],
  );

  const overall = useMemo(() => {
    if (filteredGrades.length === 0) return 0;
    if (activeFilter.mode === "class" && filteredGrades.length === 1) {
      return gradeProgress(filteredGrades[0]);
    }
    if (activeFilter.mode === "teacher" && activeFilter.value) {
      return teacherStats(allGrades, activeFilter.value).progress;
    }
    return schoolProgress(filteredGrades);
  }, [activeFilter.mode, activeFilter.value, allGrades, filteredGrades]);

  function setBooksView(next: BooksView) {
    const search: BooksSearch = {};
    if (next !== defaultView) search.view = next;
    if (isAdmin && next === "catalog" && catalogLayout !== "catalog") search.layout = catalogLayout;
    navigate({ search, replace: true });
  }

  function setLayout(next: AdminTrackerView) {
    const layout = normalizeAdminTrackerView(next);
    setCatalogLayout(layout);
    navigate({
      search: {
        ...(view !== defaultView ? { view } : {}),
        ...(layout !== "catalog" ? { layout } : {}),
      },
      replace: true,
    });
  }

  const header = getBooksPageHeader(view, isAdmin);
  const showFilters = isFilterableView(view);
  const filterName = trackerFilterLabel(activeFilter, baseGrades);
  const isFiltered = activeFilter.mode !== "all";

  return (
    <AppShell title="Track" wide>
      <section className="min-card mb-4 p-5 sm:p-4">
        <p className="text-theme-label">{header.sectionLabel}</p>
        <p className="mt-1.5 text-[20px] font-semibold leading-snug text-theme sm:text-base">
          {header.heading}
        </p>
        <p className="mt-1.5 text-[15px] leading-relaxed text-theme-muted sm:text-xs">
          {showFilters && isFiltered
            ? `${filterName} · ${filteredGrades.length} class${filteredGrades.length !== 1 ? "es" : ""} — ${header.description}`
            : header.description}
        </p>
        {header.showProgress && (
          <div className="mt-3 flex items-center gap-3">
            <ProgressBadge value={overall} />
            <div className="flex-1">
              <ProgressBar
                value={overall}
                accent={isAdmin ? "var(--min-orange)" : "var(--min-accent)"}
              />
            </div>
          </div>
        )}
      </section>

      {isAdmin && <BooksViewSwitch view={view} onChange={setBooksView} />}

      {showFilters && (
        <SyllabusTrackerFilters grades={baseGrades} isAdmin={isAdmin} onChange={handleFilterChange} />
      )}

      {isAdmin && view === "catalog" && (
        <AdminTrackerViewSwitch view={catalogLayout} onChange={setLayout} />
      )}

      {view === "catalog" && filteredGrades.length === 0 && (
        <div className="min-card space-y-3 px-4 py-8 text-center">
          <p className="text-sm text-theme-muted">No class data for this filter.</p>
          {isFiltered && (
            <button
              type="button"
              onClick={() => handleFilterChange(baseGrades, { mode: "all", value: "" })}
              className="text-[15px] font-medium text-theme-accent"
            >
              Show all sections
            </button>
          )}
        </div>
      )}

      {view === "catalog" && filteredGrades.length > 0 && isAdmin && catalogLayout === "subjects" && (
        <SubjectTeacherOverview groups={subjectGroups} />
      )}

      {view === "catalog" && filteredGrades.length > 0 && isAdmin && catalogLayout === "overview" && (
        <AdminInsightsAccordion grades={filteredGrades} />
      )}

      {view === "catalog" &&
        filteredGrades.length > 0 &&
        isAdmin &&
        catalogLayout === "catalog" && (
          <BooksCatalog grades={filteredGrades} isAdmin={isAdmin} />
        )}

      {view === "catalog" && filteredGrades.length > 0 && !isAdmin && (
        <TeacherTopicTracker grades={filteredGrades} />
      )}

      {isAdmin && view === "logs" && <DailyTeachingLogs grades={allGrades} />}
    </AppShell>
  );
}

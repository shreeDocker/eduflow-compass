import { useState } from "react";
import { BookOpen, ChevronRight, FileText, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SyllabusGrade } from "@/lib/syllabus-data";
import {
  chapterProgress,
  findCurrentTeachingSpot,
  gradeProgress,
  listChapterCatalogProgress,
  listSubjectCatalogProgress,
  subjectProgress,
  topicProgress,
} from "@/lib/syllabus-utils";
import { statusMeta } from "@/lib/mock-data";
import { subjectLineColors } from "@/lib/metro-utils";
import {
  treeBranchDividerClass,
  treeChevronClass,
  treeContentSlotClass,
  treePanelClass,
  treeRowButtonClass,
  treeRowStyle,
} from "@/lib/tree-layout";
import { ProgressBadge, ProgressBar } from "@/components/syllabus/ProgressBar";
import { CatalogProgressPanel } from "@/components/books/CatalogProgressPanel";
import {
  CurrentTopicChip,
  isCurrentChapter,
  isCurrentTopic,
} from "@/components/books/CurrentTopicChip";
import { SubjectTimelinePanel } from "@/components/syllabus/SubjectTimelinePanel";
import { TopicDeadlineField } from "@/components/syllabus/TopicDeadlineField";

type BooksCatalogProps = {
  grades: SyllabusGrade[];
  isAdmin?: boolean;
};

export function BooksCatalog({ grades, isAdmin = false }: BooksCatalogProps) {
  const [expandedGrade, setExpandedGrade] = useState<string | null>(null);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  if (grades.length === 0) {
    return (
      <p className="rounded-[10px] border border-dashed border-[var(--min-border)] px-4 py-8 text-center text-sm text-theme-muted">
        No books assigned to this class yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {grades.map((grade) => {
        const gPct = gradeProgress(grade);
        const gradeOpen = expandedGrade === grade.id;
        const gradeKey = `${grade.label} · Section ${grade.section}`;
        const subjectCount = grade.subjects.length;

        return (
          <div key={grade.id} className="card-elevated overflow-x-clip">
            <button
              type="button"
              onClick={() => setExpandedGrade(gradeOpen ? null : grade.id)}
              className={treeRowButtonClass("transition-colors hover:bg-[var(--min-surface-hover)]")}
              style={treeRowStyle(0, "var(--sw-gold-500)")}
            >
              <ChevronRight className={treeChevronClass(gradeOpen, "lg")} />
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold text-theme">{gradeKey}</p>
                <p className="text-xs text-theme-muted">
                  {subjectCount} subject{subjectCount !== 1 ? "s" : ""} in this class
                </p>
              </div>
              <ProgressBadge value={gPct} />
            </button>

            {gradeOpen && (
              <div className={treePanelClass()}>
                {grade.subjects.map((subject) => {
                  const colors = subjectLineColors(subject.name);
                  const sPct = subjectProgress(subject);
                  const subjectKey = `${grade.id}-${subject.id}`;
                  const subjectOpen = expandedSubject === subjectKey;
                  const subjectRows = listSubjectCatalogProgress([grade], subject.name);
                  const showSubjectCompare = subjectRows.length > 1;
                  const chaptersTotal = subject.chapters.length;
                  const chaptersDone = subject.chapters.filter(
                    (ch) => chapterProgress(ch) >= 100,
                  ).length;
                  const currentSpot = findCurrentTeachingSpot(subject);

                  return (
                    <div key={subjectKey} className={treeBranchDividerClass()}>
                      <button
                        type="button"
                        onClick={() => {
                          setExpandedSubject(subjectOpen ? null : subjectKey);
                          if (subjectOpen) setExpandedChapter(null);
                        }}
                        className={treeRowButtonClass("bg-[var(--min-surface)]")}
                        style={treeRowStyle(1, colors.color)}
                      >
                        <BookOpen className="h-4 w-4 shrink-0" style={{ color: colors.color }} />
                        <ChevronRight className={treeChevronClass(subjectOpen, "md")} />
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-sm font-medium text-theme">
                            {subject.name}
                          </p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-theme-muted">
                            <span>
                              {chaptersDone}/{chaptersTotal} chapters done
                            </span>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {subject.teacherName}
                            </span>
                          </p>
                          {currentSpot && (
                            <div className="mt-1.5">
                              <CurrentTopicChip spot={currentSpot} compact />
                            </div>
                          )}
                        </div>
                        <ProgressBadge value={sPct} />
                      </button>

                      {subjectOpen && (
                        <>
                          <SubjectTimelinePanel
                            path={{ gradeId: grade.id, subjectId: subject.id }}
                            subjectName={subject.name}
                            progress={sPct}
                          />

                          {showSubjectCompare && subjectRows.length > 0 && (
                            <div className={treeContentSlotClass("pb-2 pt-1")}>
                              <CatalogProgressPanel
                                title={
                                  isAdmin
                                    ? "Subject progress by class & teacher"
                                    : "Your classes on this subject"
                                }
                                hint={
                                  isAdmin
                                    ? `How ${subject.name} is progressing across every class that teaches it.`
                                    : `How ${subject.name} is progressing across the classes you teach.`
                                }
                                rows={subjectRows}
                                highlightGradeId={grade.id}
                              />
                            </div>
                          )}

                          {subject.chapters.map((ch) => {
                            const cPct = chapterProgress(ch);
                            const chapterKey = `${subjectKey}-${ch.id}`;
                            const chapterOpen = expandedChapter === chapterKey;
                            const meta = statusMeta[ch.status];
                            const chapterRows = listChapterCatalogProgress([grade], ch.id);
                            const showChapterCompare = chapterRows.length > 1;
                            const isCurrentCh = isCurrentChapter(currentSpot, ch.id);

                            return (
                              <div
                                key={chapterKey}
                                className={cn(
                                  isCurrentCh && "bg-[var(--sw-gold-50)]/40",
                                )}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedChapter(chapterOpen ? null : chapterKey)
                                  }
                                  className={treeRowButtonClass("bg-[var(--min-bg)]")}
                                  style={treeRowStyle(2, meta.token)}
                                >
                                  <ChevronRight className={treeChevronClass(chapterOpen, "sm")} />
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-theme">
                                      {ch.title}
                                    </p>
                                    <p className="text-[10px] text-theme-muted">
                                      {ch.topics.length} topic{ch.topics.length !== 1 ? "s" : ""}
                                      {isCurrentCh && currentSpot?.isLive && (
                                        <span className="ml-1.5 font-medium text-[var(--sw-gold-700)]">
                                          · current chapter
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                  <span className="shrink-0 font-mono text-xs font-semibold" data-metric>
                                    {cPct}%
                                  </span>
                                </button>

                                {chapterOpen && (
                                  <div className={treeContentSlotClass("space-y-3 pb-3 pt-1")}>
                                    {showChapterCompare && chapterRows.length > 0 && (
                                      <CatalogProgressPanel
                                        title={
                                          isAdmin
                                            ? "Chapter progress by class & teacher"
                                            : "Your classes on this chapter"
                                        }
                                        hint={
                                          isAdmin
                                            ? `"${ch.title}" completion in each class that covers this chapter.`
                                            : `"${ch.title}" completion in each of your classes.`
                                        }
                                        rows={chapterRows}
                                        highlightGradeId={grade.id}
                                      />
                                    )}

                                    {ch.topics.length === 0 ? (
                                      <p className="rounded-[8px] bg-[var(--min-surface)] px-3 py-2.5 text-xs text-theme-muted">
                                        No topic breakdown — tracked at chapter level ({cPct}%).
                                      </p>
                                    ) : (
                                      <ul className="space-y-2">
                                        {ch.topics.map((topic) => {
                                          const tPct = topicProgress(topic);
                                          const tMeta = statusMeta[topic.status];
                                          const isNow = isCurrentTopic(currentSpot, ch.id, topic.id);
                                          return (
                                            <li
                                              key={topic.id}
                                              className={cn(
                                                "rounded-[8px] border border-[var(--min-border)] bg-[var(--min-surface)] p-3",
                                                isNow
                                                  ? "border-[var(--sw-gold-300)] ring-1 ring-[var(--sw-gold-200)]"
                                                  : "border-[var(--min-border)]",
                                              )}
                                              style={{ borderLeft: `3px solid ${tMeta.token}` }}
                                            >
                                              <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                  <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-theme">
                                                    <FileText className="h-3.5 w-3.5 shrink-0 text-theme-muted" />
                                                    {topic.title}
                                                    {isNow && currentSpot?.isLive && (
                                                      <span className="rounded-full bg-[var(--sw-gold-100)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[var(--sw-gold-800)]">
                                                        Now
                                                      </span>
                                                    )}
                                                  </p>
                                                  <p className="mt-0.5 text-[10px] text-theme-muted">
                                                    {tMeta.label}
                                                  </p>
                                                </div>
                                                <ProgressBadge value={tPct} />
                                              </div>
                                              <ProgressBar
                                                value={tPct}
                                                accent={tMeta.token}
                                                size="sm"
                                                className="mt-2"
                                              />
                                              <TopicDeadlineField
                                                path={{
                                                  gradeId: grade.id,
                                                  subjectId: subject.id,
                                                  chapterId: ch.id,
                                                  topicId: topic.id,
                                                }}
                                                progress={tPct}
                                              />
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

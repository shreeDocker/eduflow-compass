import { useCallback, useState } from "react";
import { ChevronRight } from "lucide-react";
import type { SyllabusGrade, SyllabusSubject } from "@/lib/syllabus-data";
import {
  chapterProgress,
  findCurrentTeachingSpot,
  subjectProgress,
  topicProgress,
} from "@/lib/syllabus-utils";
import { statusMeta } from "@/lib/mock-data";
import {
  treeBranchDividerClass,
  treeChevronClass,
  treePanelClass,
  treeRowButtonClass,
  treeRowStyle,
} from "@/lib/tree-layout";
import { ProgressBadge, ProgressBar } from "./ProgressBar";
import { TopicProgressCard } from "@/components/TopicProgressCard";
import { CompletionPopper } from "@/components/CompletionPopper";
import { isCurrentChapter, isCurrentTopic } from "@/components/books/CurrentTopicChip";
import { SubjectTimelinePanel } from "@/components/syllabus/SubjectTimelinePanel";
import { TopicDeadlineField } from "@/components/syllabus/TopicDeadlineField";
import { SyllabusNotesField } from "@/components/syllabus/SyllabusNotesField";
import { useSyllabusProgress } from "@/lib/syllabus-progress-context";
import { cn } from "@/lib/utils";

type SubjectTopicTrackerProps = {
  grade: SyllabusGrade;
  subject: SyllabusSubject;
};

export function SubjectTopicTracker({ grade, subject }: SubjectTopicTrackerProps) {
  const { setTopicProgress, setChapterProgress } = useSyllabusProgress();
  const progress = subjectProgress(subject);
  const currentSpot = findCurrentTeachingSpot(subject);
  const rowKey = `${grade.id}-${subject.id}`;

  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState<{
    show: boolean;
    message: string;
    sub?: string;
    fullScreen?: boolean;
  }>({
    show: false,
    message: "",
  });

  const dismissCelebrate = useCallback(() => {
    setCelebrate((c) => ({ ...c, show: false }));
  }, []);

  function triggerCelebrate(title: string, kind: "topic" | "chapter" = "topic") {
    setCelebrate({
      show: true,
      message: kind === "chapter" ? "Chapter complete!" : "Done",
      sub: kind === "chapter" ? chapterLabel(title) : title,
      fullScreen: kind === "chapter",
    });
  }

  function chapterLabel(title: string) {
    return title.length > 42 ? `${title.slice(0, 39)}…` : title;
  }

  return (
    <>
      <div className="min-card mb-4 overflow-x-clip p-4">
        <ProgressBar value={progress} accent="var(--min-accent)" />
        <p className="mt-2 text-[13px] text-theme-muted">
          {subject.chapters.filter((ch) => chapterProgress(ch) >= 100).length}/
          {subject.chapters.length} chapters completed
        </p>

        <SubjectTimelinePanel
          path={{ gradeId: grade.id, subjectId: subject.id }}
          subjectName={subject.name}
          progress={progress}
          className="mx-0 mt-4 border-t border-[var(--min-border)] pt-4"
          embedded
        />

        <SyllabusNotesField
          grades={[grade]}
          gradeId={grade.id}
          subjectId={subject.id}
          subjectName={subject.name}
        />
      </div>

      <h2 className="mb-2 text-theme-label">Chapters</h2>

      <div className="card-elevated overflow-hidden">
        {subject.chapters.map((ch) => {
          const cPct = chapterProgress(ch);
          const chapterKey = `${rowKey}-${ch.id}`;
          const chapterOpen = expandedChapter === chapterKey;
          const meta = statusMeta[ch.status];
          const isCurrentCh = isCurrentChapter(currentSpot, ch.id);
          const chPath = {
            gradeId: grade.id,
            subjectId: subject.id,
            chapterId: ch.id,
          };

          return (
            <div
              key={chapterKey}
              className={cn(
                treeBranchDividerClass(),
                isCurrentCh && "bg-[color-mix(in_oklab,var(--min-orange)_8%,transparent)]",
              )}
            >
              <button
                type="button"
                onClick={() => setExpandedChapter(chapterOpen ? null : chapterKey)}
                className={treeRowButtonClass("bg-[var(--min-surface)]")}
                style={treeRowStyle(0, meta.token)}
              >
                <ChevronRight className={treeChevronClass(chapterOpen, "md")} />
                <span className="min-w-0 flex-1 truncate text-[17px] font-medium text-theme sm:text-sm">
                  {ch.title}
                  {isCurrentCh && currentSpot?.isLive && (
                    <span className="ml-2 text-[13px] font-normal text-theme-warning">· now</span>
                  )}
                </span>
                <span
                  className="hidden shrink-0 rounded-full px-2.5 py-1 text-[13px] font-medium sm:inline sm:px-2 sm:py-0.5 sm:text-[10px]"
                  style={{
                    backgroundColor: `color-mix(in oklab, ${meta.token} 15%, var(--min-bg))`,
                    color: meta.token,
                  }}
                >
                  {meta.label}
                </span>
                <span
                  className="shrink-0 font-mono text-[15px] font-medium text-theme-muted sm:text-xs"
                  data-metric
                >
                  {cPct}%
                </span>
              </button>

              {chapterOpen && (
                <div className={treePanelClass()}>
                  <div className="space-y-2 py-2">
                    {ch.topics.length === 0 ? (
                      <TopicProgressCard
                        label={ch.title}
                        progress={cPct}
                        variant="tracker"
                        onProgressChange={(v) => setChapterProgress(chPath, v)}
                        onComplete={() => triggerCelebrate(ch.title, "chapter")}
                        footer={
                          <SyllabusNotesField
                            grades={[grade]}
                            gradeId={grade.id}
                            subjectId={subject.id}
                            chapterId={ch.id}
                            subjectName={subject.name}
                            chapterTitle={ch.title}
                          />
                        }
                      />
                    ) : (
                      <>
                        <p className="px-4 pb-1 pt-1 text-theme-label">Topics</p>
                        {ch.topics.map((t) => {
                        const tPct = topicProgress(t);
                        const tPath = { ...chPath, topicId: t.id };
                        const isNow = isCurrentTopic(currentSpot, ch.id, t.id);

                        return (
                          <TopicProgressCard
                            key={t.id}
                            label={t.title}
                            progress={tPct}
                            variant="tracker"
                            isCurrent={isNow && !!currentSpot?.isLive}
                            onProgressChange={(v) => setTopicProgress(tPath, v)}
                            onComplete={() => triggerCelebrate(t.title)}
                            footer={
                              <SyllabusNotesField
                                grades={[grade]}
                                gradeId={grade.id}
                                subjectId={subject.id}
                                chapterId={ch.id}
                                topicId={t.id}
                                subjectName={subject.name}
                                chapterTitle={ch.title}
                                topicTitle={t.title}
                                variant="inline"
                                leadingSlot={
                                  tPct < 100 ? (
                                    <TopicDeadlineField
                                      path={tPath}
                                      progress={tPct}
                                      variant="inline"
                                    />
                                  ) : undefined
                                }
                              />
                            }
                          />
                        );
                      })}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <CompletionPopper
        show={celebrate.show}
        message={celebrate.message}
        submessage={celebrate.sub}
        onDone={dismissCelebrate}
        fullScreen={celebrate.fullScreen}
      />
    </>
  );
}

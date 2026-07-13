import { useState, useCallback } from "react";
import { ChevronRight, User } from "lucide-react";
import type { SyllabusGrade } from "@/lib/syllabus-data";
import {
  chapterProgress,
  gradeProgress,
  subjectProgress,
  topicProgress,
} from "@/lib/syllabus-utils";
import { statusMeta } from "@/lib/mock-data";
import {
  treeBranchDividerClass,
  treeChevronClass,
  treeContentSlotClass,
  treePanelClass,
  treeRowButtonClass,
  treeRowStyle,
} from "@/lib/tree-layout";
import { ProgressBadge, ProgressBar } from "./ProgressBar";
import { TopicProgressCard } from "@/components/TopicProgressCard";
import { CompletionPopper } from "@/components/CompletionPopper";
import { useSyllabusProgress } from "@/lib/syllabus-progress-context";

type SyllabusTreeProps = {
  grades: SyllabusGrade[];
  showTeachers?: boolean;
  editable?: boolean;
  defaultExpandedGrade?: string;
};

export function SyllabusTree({
  grades,
  showTeachers = false,
  editable = false,
  defaultExpandedGrade,
}: SyllabusTreeProps) {
  const { setTopicProgress, setChapterProgress } = useSyllabusProgress();
  const [expandedGrade, setExpandedGrade] = useState<string | null>(
    defaultExpandedGrade ?? null,
  );
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState<{ show: boolean; message: string; sub?: string }>({
    show: false,
    message: "",
  });

  const dismissCelebrate = useCallback(() => {
    setCelebrate((c) => ({ ...c, show: false }));
  }, []);

  function triggerCelebrate(title: string, kind: "topic" | "chapter" = "topic") {
    setCelebrate({
      show: true,
      message: kind === "chapter" ? "Chapter complete!" : "Topic completed!",
      sub: `"${title}" marked done`,
    });
  }

  if (grades.length === 0) {
    return (
      <div className="card-elevated p-8 text-left text-sm text-theme-muted">
        No syllabus assigned to your account yet.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 text-left">
        {grades.map((grade) => {
          const gPct = gradeProgress(grade);
          const gradeOpen = expandedGrade === grade.id;
          const gradeKey = `${grade.label} ${grade.section}`;

          return (
            <div key={grade.id} className="card-elevated overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedGrade(gradeOpen ? null : grade.id)}
                className={treeRowButtonClass("transition-colors hover:bg-[var(--min-surface-hover)]")}
                style={treeRowStyle(0, "var(--sw-gold-500)")}
              >
                <ChevronRight className={treeChevronClass(gradeOpen, "lg")} />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-semibold text-theme">
                    {gradeKey}
                  </p>
                  <p className="text-xs text-theme-muted">
                    {grade.subjects.length} subject{grade.subjects.length === 1 ? "" : "s"}
                  </p>
                </div>
                <ProgressBadge value={gPct} />
              </button>

              {gradeOpen && (
                <div className={treePanelClass()}>
                  <div className={treeContentSlotClass("pb-2 pt-3")}>
                    <ProgressBar value={gPct} accent="var(--sw-gold-500)" />
                  </div>

                  {grade.subjects.map((subject) => {
                    const sPct = subjectProgress(subject);
                    const subjectKey = `${grade.id}-${subject.id}`;
                    const subjectOpen = expandedSubject === subjectKey;

                    return (
                      <div key={subjectKey} className={treeBranchDividerClass()}>
                        <button
                          type="button"
                          onClick={() => setExpandedSubject(subjectOpen ? null : subjectKey)}
                          className={treeRowButtonClass("bg-[var(--min-surface)]")}
                          style={treeRowStyle(1, "var(--sw-sapphire-500)")}
                        >
                          <ChevronRight className={treeChevronClass(subjectOpen, "md")} />
                          <div className="min-w-0 flex-1">
                            <p className="font-display text-sm font-medium text-theme">
                              {subject.name}
                            </p>
                            {showTeachers && (
                              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-theme-muted">
                                <User className="h-3 w-3" />
                                {subject.teacherName}
                              </p>
                            )}
                          </div>
                          <ProgressBadge value={sPct} />
                        </button>

                        {subjectOpen &&
                          subject.chapters.map((ch) => {
                            const cPct = chapterProgress(ch);
                            const chapterKey = `${subjectKey}-${ch.id}`;
                            const chapterOpen = expandedChapter === chapterKey;
                            const meta = statusMeta[ch.status];
                            const chPath = {
                              gradeId: grade.id,
                              subjectId: subject.id,
                              chapterId: ch.id,
                            };

                            return (
                              <div key={chapterKey}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedChapter(chapterOpen ? null : chapterKey)
                                  }
                                  className={treeRowButtonClass("bg-[var(--min-bg)]")}
                                  style={treeRowStyle(2, meta.token)}
                                >
                                  <ChevronRight className={treeChevronClass(chapterOpen, "sm")} />
                                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                                    {ch.title}
                                  </span>
                                  <span
                                    className="hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium sm:inline"
                                    style={{
                                      backgroundColor: `color-mix(in oklab, ${meta.token} 15%, var(--min-bg))`,
                                      color: meta.token,
                                    }}
                                  >
                                    {meta.label}
                                  </span>
                                  <span className="shrink-0 font-mono text-xs font-medium" data-metric>
                                    {cPct}%
                                  </span>
                                </button>

                                {chapterOpen && (
                                  <div className={treeContentSlotClass("space-y-2 pb-3 pt-1")}>
                                    {ch.topics.length === 0 ? (
                                      editable ? (
                                        <TopicProgressCard
                                          label={ch.title}
                                          progress={cPct}
                                          onProgressChange={(v) => {
                                            setChapterProgress(chPath, v);
                                          }}
                                          onComplete={() => triggerCelebrate(ch.title, "chapter")}
                                        />
                                      ) : (
                                        <p className="py-2 text-xs text-theme-muted">
                                          No topics — tracked at chapter level ({cPct}%).
                                        </p>
                                      )
                                    ) : (
                                      ch.topics.map((t) => {
                                        const tPct = topicProgress(t);
                                        const tPath = { ...chPath, topicId: t.id };

                                        return (
                                          <div key={t.id}>
                                            {editable ? (
                                              <TopicProgressCard
                                                label={t.title}
                                                progress={tPct}
                                                onProgressChange={(v) => {
                                                  setTopicProgress(tPath, v);
                                                }}
                                                onComplete={() => triggerCelebrate(t.title)}
                                              />
                                            ) : (
                                              <div
                                                className="rounded-[8px] border border-[var(--min-border)] bg-[var(--min-surface)] p-3"
                                                style={{
                                                  borderLeft: `3px solid ${statusMeta[t.status].token}`,
                                                }}
                                              >
                                                <div className="flex items-start justify-between gap-2">
                                                  <div className="min-w-0">
                                                    <p className="text-sm font-medium text-theme">
                                                      {t.title}
                                                    </p>
                                                    <p className="mt-0.5 text-[11px] text-theme-muted">
                                                      {statusMeta[t.status].label}
                                                    </p>
                                                  </div>
                                                  <ProgressBadge value={tPct} />
                                                </div>
                                                <ProgressBar
                                                  value={tPct}
                                                  accent={statusMeta[t.status].token}
                                                  className="mt-2"
                                                />
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    );
                  })}
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
      />
    </>
  );
}

import { useMemo } from "react";
import type { SyllabusGrade } from "@/lib/syllabus-data";
import {
  chapterProgress,
  formatClassName,
  topicProgress,
} from "@/lib/syllabus-utils";
import { statusMeta } from "@/lib/mock-data";
import { ProgressBar } from "@/components/syllabus/ProgressBar";

type ChapterProgressOverviewProps = {
  grades: SyllabusGrade[];
  isAdmin?: boolean;
};

export function ChapterProgressOverview({ grades, isAdmin = false }: ChapterProgressOverviewProps) {
  const chapterCards = useMemo(() => {
    const cards: {
      key: string;
      className: string;
      subjectName: string;
      chapterTitle: string;
      pct: number;
      status: keyof typeof statusMeta;
      remaining: number;
      totalTopics: number;
    }[] = [];

    for (const grade of grades) {
      for (const subject of grade.subjects) {
        for (const ch of subject.chapters) {
          const pct = chapterProgress(ch);
          const remaining = ch.topics.filter((t) => topicProgress(t) < 100).length;
          cards.push({
            key: `${grade.id}-${subject.id}-${ch.id}`,
            className: formatClassName(grade),
            subjectName: subject.name,
            chapterTitle: ch.title,
            pct,
            status: ch.status,
            remaining,
            totalTopics: ch.topics.length,
          });
        }
      }
    }

    return cards.sort((a, b) => a.className.localeCompare(b.className) || a.pct - b.pct);
  }, [grades]);

  if (chapterCards.length === 0) {
    return (
      <p className="rounded-[10px] border border-dashed border-[var(--min-border)] px-4 py-8 text-center text-sm text-theme-muted">
        No syllabus assigned yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {chapterCards.map((card, i) => {
        const meta = statusMeta[card.status];
        return (
          <div
            key={card.key}
            className="card-elevated card-elevated-hover p-5 animate-rise-in"
            style={{ animationDelay: `${i * 30}ms`, borderLeft: `3px solid ${meta.token}` }}
          >
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <p className="sw-section-label">
                  {card.className} · {card.subjectName}
                </p>
                <p className="mt-1 truncate font-display text-base font-semibold text-theme">
                  {card.chapterTitle}
                </p>
              </div>
              <span
                className="rounded-full px-2.5 py-1 font-mono text-xs font-medium"
                style={{
                  backgroundColor: `color-mix(in oklab, ${meta.token} 15%, var(--min-bg))`,
                  color: meta.token,
                }}
                data-metric
              >
                {card.pct}%
              </span>
            </div>
            <div className="mt-4">
              <ProgressBar value={card.pct} accent={meta.token} size="sm" />
            </div>
            {card.totalTopics > 0 && (
              <p className="mt-3 text-xs text-theme-muted">
                {card.remaining} topic{card.remaining === 1 ? "" : "s"} left
                {isAdmin ? "" : " · switch to Catalog → Topic tracker to update"}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

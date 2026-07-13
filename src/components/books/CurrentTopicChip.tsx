import { statusMeta } from "@/lib/mock-data";
import type { CurrentTeachingSpot } from "@/lib/syllabus-utils";
import { formatTeachingSpot } from "@/lib/syllabus-utils";
import { cn } from "@/lib/utils";

type CurrentTopicChipProps = {
  spot: CurrentTeachingSpot;
  compact?: boolean;
  className?: string;
};

export function CurrentTopicChip({ spot, compact, className }: CurrentTopicChipProps) {
  const meta = statusMeta[spot.status];
  const label = spot.isLive ? "Now teaching" : "Up next";

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full font-medium",
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
        spot.isLive
          ? "bg-[var(--sw-gold-100)] text-[var(--sw-gold-800)]"
          : "bg-[var(--sw-surface-100)] text-theme-muted",
        className,
      )}
      title={`${label}: ${formatTeachingSpot(spot)} (${spot.progress}%)`}
    >
      {spot.isLive && (
        <span
          className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full"
          style={{ backgroundColor: meta.token }}
        />
      )}
      <span className="shrink-0 opacity-80">{label}:</span>
      <span className="truncate">{formatTeachingSpot(spot)}</span>
    </span>
  );
}

export function isCurrentChapter(spot: CurrentTeachingSpot | null, chapterId: string): boolean {
  return spot?.chapterId === chapterId;
}

export function isCurrentTopic(
  spot: CurrentTeachingSpot | null,
  chapterId: string,
  topicId: string,
): boolean {
  return spot?.chapterId === chapterId && spot?.topicId === topicId;
}

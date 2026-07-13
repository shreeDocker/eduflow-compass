import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, MapPin, User, Zap, AlertTriangle } from "lucide-react";
import { statusMeta } from "@/lib/mock-data";
import { findCurrentStationIndex, type MetroLine, type MetroStation } from "@/lib/metro-utils";
import { ProgressBadge, ProgressBar } from "@/components/syllabus/ProgressBar";
import { cn } from "@/lib/utils";

type MetroMapProps = {
  line: MetroLine;
  compact?: boolean;
  showTeacher?: boolean;
  className?: string;
};

export function MetroMap({ line, compact = false, showTeacher = false, className }: MetroMapProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const currentIdx = findCurrentStationIndex(line.stations);
  const completedCount = line.stations.filter((s) => s.progress >= 100).length;
  const selectedStation = line.stations.find((s) => s.id === selectedId) ?? null;
  const trackProgress =
    line.stations.length > 1
      ? (currentIdx / (line.stations.length - 1)) * 100
      : line.progress;

  return (
    <article
      className={cn(
        "card-elevated overflow-hidden",
        compact ? "p-4" : "p-5 sm:p-6",
        className,
      )}
      style={{ borderTop: `3px solid ${line.color}` }}
    >
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: line.color }}
              aria-hidden
            />
            <h3 className="font-display text-base font-semibold text-theme">
              {line.name}
            </h3>
            {line.classLabel && (
              <span className="rounded-full bg-[var(--sw-surface-100)] px-2 py-0.5 text-[10px] font-medium text-theme-muted">
                {line.classLabel}
              </span>
            )}
            {showTeacher && line.teacherName && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--sw-surface-100)] px-2 py-0.5 text-[10px] font-medium text-theme-muted">
                <User className="h-2.5 w-2.5" />
                {line.teacherName}
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-theme-muted">
            {completedCount}/{line.stations.length} chapters · {line.stats.topicsDone}/
            {line.stats.topicsTotal} topics done
          </p>

          {!compact && line.currentSpotLabel && (
            <p
              className={cn(
                "mt-2 inline-flex max-w-full flex-wrap items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-[11px]",
                line.currentSpotLive
                  ? "bg-[var(--sw-gold-50)] text-[var(--sw-gold-800)]"
                  : "bg-[var(--sw-surface-100)] text-theme-muted",
              )}
            >
              {line.currentSpotLive ? (
                <Zap className="h-3 w-3 shrink-0 text-[var(--sw-gold-600)]" />
              ) : (
                <MapPin className="h-3 w-3 shrink-0" />
              )}
              <span className="font-medium">Now:</span>
              <span className="truncate">{line.currentSpotLabel}</span>
            </p>
          )}

          {!compact && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {line.stats.chaptersComplete > 0 && (
                <StatChip label={`${line.stats.chaptersComplete} done`} color="var(--sw-emerald-500)" />
              )}
              {line.stats.teaching > 0 && (
                <StatChip label={`${line.stats.teaching} in progress`} color="var(--sw-gold-500)" />
              )}
              {line.stats.delayed > 0 && (
                <StatChip
                  label={`${line.stats.delayed} delayed`}
                  color="var(--sw-coral-500)"
                  icon={<AlertTriangle className="h-2.5 w-2.5" />}
                />
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <ProgressBadge value={line.progress} />
          {!compact && (
            <Link
              to="/books"
              search={{ view: "catalog" }}
              className="hidden items-center gap-1 text-[11px] font-medium text-[var(--sw-sapphire-600)] hover:underline sm:inline-flex"
            >
              Update <ChevronRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </header>

      {!compact && (
        <ProgressBar
          value={line.progress}
          accent={line.color}
          size="sm"
          className="mt-4 max-w-md"
        />
      )}

      <div
        className={cn(
          "relative mt-5 overflow-x-auto pb-2",
          compact ? "mt-4" : "mt-6",
        )}
        style={{ scrollbarWidth: "thin" }}
      >
        <div
          className={cn(
            "relative flex min-w-max items-start px-2",
            compact ? "gap-0 py-2" : "gap-0 py-4",
          )}
        >
          <div
            className="pointer-events-none absolute left-6 right-6 top-[22px] h-1.5 rounded-full bg-[var(--sw-surface-200)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-6 top-[22px] h-1.5 rounded-full transition-[width] duration-700"
            style={{
              width: `calc((100% - 3rem) * ${trackProgress / 100})`,
              maxWidth: "calc(100% - 3rem)",
              background: `linear-gradient(90deg, ${line.trackColor}, ${line.color})`,
            }}
            aria-hidden
          />

          {line.stations.map((station, i) => (
            <MetroStationNode
              key={station.id}
              station={station}
              line={line}
              isCurrent={i === currentIdx}
              isSelected={station.id === selectedId}
              isLast={i === line.stations.length - 1}
              compact={compact}
              onSelect={() =>
                setSelectedId((prev) => (prev === station.id ? null : station.id))
              }
            />
          ))}
        </div>
      </div>

      {!compact && selectedStation && (
        <MetroStationDetail station={selectedStation} line={line} onClose={() => setSelectedId(null)} />
      )}

      {!compact && !selectedStation && (
        <MetroLegend lineColor={line.color} currentStation={line.stations[currentIdx]} />
      )}
    </article>
  );
}

function StatChip({
  label,
  color,
  icon,
}: {
  label: string;
  color: string;
  icon?: React.ReactNode;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
      style={{
        backgroundColor: `color-mix(in oklab, ${color} 12%, var(--min-bg))`,
        color,
      }}
    >
      {icon}
      {label}
    </span>
  );
}

function MetroStationNode({
  station,
  line,
  isCurrent,
  isSelected,
  isLast,
  compact,
  onSelect,
}: {
  station: MetroStation;
  line: MetroLine;
  isCurrent: boolean;
  isSelected: boolean;
  isLast: boolean;
  compact: boolean;
  onSelect: () => void;
}) {
  const meta = statusMeta[station.status];
  const done = station.progress >= 100;

  return (
    <div className={cn("relative flex items-start", !isLast && "min-w-[88px] max-w-[120px] flex-1")}>
      <div className="relative z-10 flex w-[88px] shrink-0 flex-col items-center sm:w-[96px]">
        <button
          type="button"
          onClick={onSelect}
          className={cn(
            "group relative grid place-items-center rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sw-sapphire-400)]",
            compact ? "h-9 w-9" : "h-11 w-11",
            isCurrent && "animate-station-pulse",
            isSelected && "ring-2 ring-[var(--sw-sapphire-400)] ring-offset-2",
          )}
          style={
            {
              background: `conic-gradient(${meta.token} ${station.progress * 3.6}deg, var(--sw-surface-200) 0deg)`,
              boxShadow: isCurrent
                ? `0 0 0 3px color-mix(in oklab, ${line.color} 25%, var(--min-bg)), 0 0 0 5px ${line.color}`
                : done
                  ? `0 0 0 2px ${meta.token}`
                  : undefined,
            } as React.CSSProperties
          }
          title={`${station.title} — ${station.progress}% · ${meta.label}`}
          aria-label={`${station.title}, ${station.progress} percent, ${meta.label}`}
          aria-pressed={isSelected}
        >
          <span
            className={cn(
              "grid place-items-center rounded-full border-2 border-[var(--min-surface)] font-mono font-semibold text-[var(--min-bg)] shadow-sm",
              compact ? "h-6 w-6 text-[9px]" : "h-7 w-7 text-[10px]",
            )}
            style={{ backgroundColor: meta.token }}
          >
            {station.index}
          </span>
        </button>

        {isCurrent && !compact && (
          <span
            className="mt-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
            style={{
              backgroundColor: `color-mix(in oklab, ${line.color} 15%, var(--min-bg))`,
              color: line.color,
            }}
          >
            <MapPin className="h-2.5 w-2.5" />
            Now
          </span>
        )}

        <div className={cn("mt-2 w-full px-1 text-center", compact && "mt-1.5")}>
          <p
            className={cn(
              "font-medium leading-tight text-theme",
              compact ? "line-clamp-2 text-[10px]" : "line-clamp-2 text-xs",
              isCurrent && "font-semibold",
            )}
          >
            {station.title}
          </p>
          {!compact && (
            <>
              <span
                className="mt-1 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                style={{
                  backgroundColor: `color-mix(in oklab, ${meta.token} 12%, var(--min-bg))`,
                  color: meta.token,
                }}
              >
                {meta.label}
              </span>
              <p className="mt-0.5 text-[10px] text-theme-muted">
                {station.topicCount > 0
                  ? `${station.topicsCompleted}/${station.topicCount} topics`
                  : `${station.progress}% complete`}
              </p>
              {station.activeTopicTitle && (
                <p className="mt-0.5 line-clamp-1 text-[9px] font-medium text-[var(--sw-gold-700)]">
                  → {station.activeTopicTitle}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MetroStationDetail({
  station,
  line,
  onClose,
}: {
  station: MetroStation;
  line: MetroLine;
  onClose: () => void;
}) {
  const meta = statusMeta[station.status];

  return (
    <div
      className="mt-4 rounded-[10px] border border-[var(--min-border)] bg-[var(--min-bg)] p-4 animate-rise-in"
      style={{ borderLeft: `3px solid ${meta.token}` }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="sw-section-label">{line.name} · Chapter {station.index}</p>
          <h4 className="mt-0.5 font-display text-sm font-semibold text-theme">
            {station.title}
          </h4>
          <p className="mt-1 text-xs text-theme-muted">
            {meta.label}
            {station.activeTopicTitle && (
              <>
                {" "}
                · Active topic:{" "}
                <span className="font-medium text-theme-muted">
                  {station.activeTopicTitle}
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ProgressBadge value={station.progress} />
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] font-medium text-theme-muted hover:text-theme"
          >
            Close
          </button>
        </div>
      </div>

      <ProgressBar value={station.progress} accent={meta.token} size="sm" className="mt-3" />

      {station.topics.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {station.topics.map((topic) => {
            const tMeta = statusMeta[topic.status];
            return (
              <li
                key={topic.id}
                className="flex items-center gap-2 rounded-[8px] bg-[var(--min-surface)] px-3 py-2 text-xs"
                style={{ borderLeft: `2px solid ${tMeta.token}` }}
              >
                <span className="min-w-0 flex-1 truncate font-medium text-theme">
                  {topic.title}
                </span>
                <span
                  className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                  style={{
                    backgroundColor: `color-mix(in oklab, ${tMeta.token} 12%, var(--min-bg))`,
                    color: tMeta.token,
                  }}
                >
                  {tMeta.label}
                </span>
                <span className="shrink-0 font-mono text-[10px] font-semibold" data-metric>
                  {topic.progress}%
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-theme-muted">
          No topic breakdown — progress tracked at chapter level ({station.progress}%).
        </p>
      )}

      <Link
        to="/books"
        search={{ view: "catalog" }}
        className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--sw-sapphire-600)] hover:underline"
      >
        Update in Books & Chapters <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

function MetroLegend({
  lineColor,
  currentStation,
}: {
  lineColor: string;
  currentStation?: MetroStation;
}) {
  return (
    <footer className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--min-border)] pt-4">
      <span className="text-[10px] font-medium uppercase tracking-wide text-theme-muted">
        Tap a stop for topic details
      </span>
      {(["completed", "teaching", "planned", "delayed", "not-started"] as const).map((s) => (
        <span key={s} className="inline-flex items-center gap-1.5 text-[10px] text-theme-muted">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: statusMeta[s].token }} />
          {statusMeta[s].label}
        </span>
      ))}
      {currentStation && (
        <span className="ml-auto text-[10px] text-theme-muted">
          Current:{" "}
          <strong className="font-medium" style={{ color: lineColor }}>
            {currentStation.title}
          </strong>
        </span>
      )}
    </footer>
  );
}

type MetroMapGridProps = {
  lines: MetroLine[];
  compact?: boolean;
  showTeachers?: boolean;
  className?: string;
};

export function MetroMapGrid({ lines, compact, showTeachers = false, className }: MetroMapGridProps) {
  if (lines.length === 0) {
    return (
      <p className="rounded-[10px] border border-dashed border-[var(--min-border)] px-4 py-8 text-center text-sm text-theme-muted">
        No metro lines for this selection.
      </p>
    );
  }

  return (
    <div className={cn("space-y-5", className)}>
      {lines.map((line, i) => (
        <div key={line.id} className="animate-rise-in" style={{ animationDelay: `${i * 50}ms` }}>
          <MetroMap line={line} compact={compact} showTeacher={showTeachers} />
        </div>
      ))}
    </div>
  );
}

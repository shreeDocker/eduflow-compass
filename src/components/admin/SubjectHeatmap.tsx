import { statusMeta } from "@/lib/mock-data";
import type { TopicStatus } from "@/lib/mock-data";
import type { HeatmapRow } from "@/lib/syllabus-utils";
import { cn } from "@/lib/utils";

type ClassKey = { key: string; gradeId: string; label: string };

/** Bold heatmap colors — original statuses; revision uses blue instead of purple. */
const HEATMAP_COLORS: Record<TopicStatus, string> = {
  completed: "#22c55e",
  teaching: "#f59e0b",
  planned: "#3b82f6",
  revision: "#3b82f6",
  delayed: "#ef4444",
  "not-started": "#64748b",
};

const HEATMAP_LEGEND = ["completed", "teaching", "revision", "delayed"] as const;

type SubjectHeatmapProps = {
  rows: HeatmapRow[];
  classKeys: ClassKey[];
  className?: string;
  embedded?: boolean;
};

export function SubjectHeatmap({ rows, classKeys, className, embedded }: SubjectHeatmapProps) {
  const content = (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="p-1" />
              {classKeys.map((c) => (
                <th
                  key={c.key}
                  className="p-1 text-center text-xs font-semibold text-theme-muted"
                >
                  {c.key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.subject}>
                <th
                  scope="row"
                  className="pr-3 text-right text-sm font-semibold text-theme"
                >
                  {row.subject}
                </th>
                {row.cells.map((cell) => (
                  <td key={cell.classKey} className="p-0.5">
                    <HeatmapCell cell={cell} subject={row.subject} classKeys={classKeys} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <HeatmapLegend />
    </>
  );

  if (embedded) {
    return <div className={className}>{content}</div>;
  }

  return (
    <div
      className={cn("card-elevated p-5 sm:p-6", className)}
      style={{ borderLeft: "3px solid var(--sw-sapphire-500)" }}
    >
      <header className="mb-5">
        <h2 className="font-display text-lg font-semibold text-theme">Heat map</h2>
        <p className="mt-1 text-xs text-theme-muted">Subject × section coverage.</p>
      </header>
      {content}
    </div>
  );
}

function HeatmapCell({
  cell,
  subject,
  classKeys,
}: {
  cell: HeatmapRow["cells"][number];
  subject: string;
  classKeys: ClassKey[];
}) {
  const classLabel = classKeys.find((c) => c.key === cell.classKey)?.label ?? cell.classKey;

  if (cell.pct === null) {
    return (
      <div
        className="h-11 w-11 rounded-xl border border-dashed border-[var(--min-border)] bg-[var(--min-bg)]"
        title={`${subject} · ${classLabel} — not assigned`}
      />
    );
  }

  const color = HEATMAP_COLORS[cell.status];
  const label = statusMeta[cell.status].label;
  return (
    <div
      className="h-11 w-11 rounded-xl transition-transform hover:scale-110"
      style={{
        backgroundColor: color,
        boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${color} 40%, #000)`,
      }}
      title={`${subject} ${cell.classKey} — ${cell.pct}% · ${label}`}
    />
  );
}

function HeatmapLegend() {
  return (
    <div className="mt-5 flex flex-wrap gap-3 text-xs text-theme-muted">
      {HEATMAP_LEGEND.map((status) => (
        <span key={status} className="inline-flex items-center gap-1.5">
          <span
            className="h-3.5 w-3.5 rounded-sm"
            style={{ backgroundColor: HEATMAP_COLORS[status] }}
          />
          {statusMeta[status].label}
        </span>
      ))}
    </div>
  );
}

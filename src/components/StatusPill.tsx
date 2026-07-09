import { statusMeta, type TopicStatus } from "@/lib/mock-data";

export function StatusPill({ status }: { status: TopicStatus }) {
  const meta = statusMeta[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{
        backgroundColor: `color-mix(in oklab, ${meta.token} 18%, transparent)`,
        color: meta.token,
        border: `1px solid color-mix(in oklab, ${meta.token} 30%, transparent)`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.token }} />
      {meta.label}
    </span>
  );
}

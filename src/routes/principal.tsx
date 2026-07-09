import { createFileRoute, Link } from "@tanstack/react-router";
import {
  schoolStats,
  heatmap,
  teacherComparison,
  subjects,
  statusMeta,
  chapterProgress,
} from "@/lib/mock-data";
import { MetroMap } from "@/components/MetroMap";
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";

export const Route = createFileRoute("/principal")({
  head: () => ({
    meta: [
      { title: "Principal Dashboard — ClassPulse" },
      {
        name: "description",
        content: "Real-time academic progress across the whole school. Spot delays before exam time.",
      },
      { property: "og:title", content: "ClassPulse — Principal Dashboard" },
      { property: "og:description", content: "School-wide syllabus coverage, teacher comparison, and predictive completion." },
    ],
  }),
  component: PrincipalDashboard,
});

function PrincipalDashboard() {
  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/"
              aria-label="Back to teacher app"
              className="big-tap grid place-items-center rounded-xl"
              style={{ backgroundColor: "var(--surface-2)" }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--primary)" }}>
                Principal
              </p>
              <h1 className="truncate text-3xl font-black md:text-4xl">Swotify Academy</h1>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Predicted finish
            </p>
            <p className="text-lg font-bold">
              {schoolStats.predictedFinish}{" "}
              <span className="text-xs font-normal" style={{ color: "var(--muted-foreground)" }}>
                / target {schoolStats.targetFinish}
              </span>
            </p>
          </div>
        </header>

        {/* Big progress card */}
        <section className="mt-8 card-elevated overflow-hidden p-8">
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                School progress
              </p>
              <p className="mt-2 text-6xl font-black md:text-7xl">
                {schoolStats.overallProgress}%
              </p>
              <div
                className="mt-5 h-3 overflow-hidden rounded-full"
                style={{ backgroundColor: "var(--muted)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${schoolStats.overallProgress}%`,
                    background:
                      "linear-gradient(90deg, var(--status-completed), var(--primary))",
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat label="Teachers" value={schoolStats.teachers} />
              <Stat label="Ahead" value={schoolStats.ahead} tone={statusMeta.completed.token} icon={<TrendingUp className="h-4 w-4" />} />
              <Stat label="On track" value={schoolStats.onTrack} tone={statusMeta.planned.token} icon={<Minus className="h-4 w-4" />} />
              <Stat label="Delayed" value={schoolStats.delayed} tone={statusMeta.delayed.token} icon={<TrendingDown className="h-4 w-4" />} />
            </div>
          </div>
        </section>

        {/* Grid: heatmap + teacher comparison */}
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Heatmap */}
          <div className="card-elevated p-6">
            <h2 className="text-lg font-bold font-display">Heat map</h2>
            <p className="mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
              Subject × section coverage.
            </p>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[420px] border-separate border-spacing-1">
                <thead>
                  <tr>
                    <th></th>
                    {heatmap[0].cells.map((c) => (
                      <th
                        key={c.section}
                        className="text-xs font-semibold"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {c.section}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmap.map((row) => (
                    <tr key={row.subject}>
                      <th
                        scope="row"
                        className="pr-3 text-right text-sm font-semibold"
                      >
                        {row.subject}
                      </th>
                      {row.cells.map((c) => {
                        const meta = statusMeta[c.status];
                        return (
                          <td key={c.section}>
                            <div
                              className="h-11 w-11 rounded-xl transition-transform hover:scale-110"
                              style={{
                                backgroundColor: meta.token,
                                boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${meta.token} 60%, transparent)`,
                              }}
                              title={`${row.subject} ${c.section} — ${meta.label}`}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="mt-5 flex flex-wrap gap-3 text-xs">
              {(["completed", "teaching", "planned", "revision", "delayed"] as const).map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5">
                  <span
                    className="h-3 w-3 rounded"
                    style={{ backgroundColor: statusMeta[s].token }}
                  />
                  {statusMeta[s].label}
                </span>
              ))}
            </div>
          </div>

          {/* Teacher comparison */}
          <div className="card-elevated p-6">
            <h2 className="text-lg font-bold font-display">Teacher comparison</h2>
            <p className="mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
              Sorted by completion.
            </p>
            <ul className="mt-5 space-y-4">
              {[...teacherComparison]
                .sort((a, b) => b.completion - a.completion)
                .map((t) => {
                  const tone =
                    t.status === "ahead"
                      ? statusMeta.completed.token
                      : t.status === "delayed"
                        ? statusMeta.delayed.token
                        : statusMeta.planned.token;
                  return (
                    <li key={t.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                      <div
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-full font-bold"
                        style={{
                          backgroundColor: "var(--surface-2)",
                          color: "var(--foreground)",
                        }}
                      >
                        {t.avatarInitials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="truncate font-semibold">{t.name}</span>
                          <span className="text-sm font-bold" style={{ color: tone }}>
                            {t.completion}%
                          </span>
                        </div>
                        <div
                          className="mt-1.5 h-2 overflow-hidden rounded-full"
                          style={{ backgroundColor: "var(--muted)" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${t.completion}%`, backgroundColor: tone }}
                          />
                        </div>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </div>
        </section>

        {/* Metro maps */}
        <section className="mt-8">
          <h2 className="text-lg font-bold font-display">Academic Metro Map</h2>
          <p className="mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
            Every subject, every chapter, every class on the same map.
          </p>
          <div className="mt-5 space-y-5">
            {subjects.map((s) => (
              <MetroMap key={s.id} subject={s} />
            ))}
          </div>
        </section>

        {/* Analytics footer */}
        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <AnalyticCard title="Avg. completion" value="88%" hint="+3 vs last term" />
          <AnalyticCard title="Revision coverage" value="72%" hint="Grade 9 lowest" />
          <AnalyticCard title="Assessment coverage" value="69%" hint="Push in Nov" />
        </section>

        {/* Chapter grid drill-down */}
        <section className="mt-8">
          <h2 className="text-lg font-bold font-display">Chapters across school</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.flatMap((s) =>
              s.chapters.map((ch) => {
                const meta = statusMeta[ch.status];
                const pct = chapterProgress(ch);
                return (
                  <div key={`${s.id}-${ch.id}`} className="card-elevated p-4">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
                          {s.name}
                        </p>
                        <p className="truncate font-bold">{ch.title}</p>
                      </div>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                        style={{
                          backgroundColor: `color-mix(in oklab, ${meta.token} 20%, transparent)`,
                          color: meta.token,
                        }}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full" style={{ backgroundColor: "var(--muted)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: meta.token }}
                      />
                    </div>
                  </div>
                );
              }),
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ backgroundColor: "var(--surface-2)" }}
    >
      <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
        {icon && <span style={{ color: tone ?? "var(--primary)" }}>{icon}</span>}
        {label}
      </div>
      <p className="mt-1 text-2xl font-black" style={{ color: tone ?? "var(--foreground)" }}>
        {value}
      </p>
    </div>
  );
}

function AnalyticCard({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className="card-elevated p-5">
      <p className="text-xs uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
        {title}
      </p>
      <p className="mt-2 text-3xl font-black">{value}</p>
      <p className="mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
        {hint}
      </p>
    </div>
  );
}

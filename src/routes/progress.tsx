import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/AppShell";
import { subjects, chapterProgress, statusMeta } from "@/lib/mock-data";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "My Progress — ClassPulse" },
      { name: "description", content: "Your teaching progress across subjects, chapters and topics." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  return (
    <MobileShell>
      <header>
        <h1 className="text-3xl font-black">My Progress</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
          Cards, not tables. Easy to read at a glance.
        </p>
      </header>

      <div className="mt-6 space-y-4">
        {subjects.flatMap((s) =>
          s.chapters.map((ch, i) => {
            const meta = statusMeta[ch.status];
            const pct = chapterProgress(ch);
            const remaining =
              ch.topics.filter((t) => t.status !== "completed").length || 0;
            return (
              <div
                key={ch.id}
                className="card-elevated p-5 animate-rise-in"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
                      {s.name}
                    </p>
                    <p className="mt-1 truncate text-xl font-black">{ch.title}</p>
                  </div>
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-bold"
                    style={{
                      backgroundColor: `color-mix(in oklab, ${meta.token} 20%, transparent)`,
                      color: meta.token,
                    }}
                  >
                    {pct}%
                  </span>
                </div>
                <div
                  className="mt-4 h-2 overflow-hidden rounded-full"
                  style={{ backgroundColor: "var(--muted)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: meta.token }}
                  />
                </div>
                {ch.topics.length > 0 && (
                  <p className="mt-3 text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {remaining} topic{remaining === 1 ? "" : "s"} left
                  </p>
                )}
              </div>
            );
          }),
        )}
      </div>
    </MobileShell>
  );
}

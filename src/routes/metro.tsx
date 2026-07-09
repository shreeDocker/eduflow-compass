import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/AppShell";
import { MetroMap } from "@/components/MetroMap";
import { subjects } from "@/lib/mock-data";

export const Route = createFileRoute("/metro")({
  head: () => ({
    meta: [
      { title: "Academic Metro Map — ClassPulse" },
      { name: "description", content: "See the full syllabus as a metro line — every chapter, every station." },
    ],
  }),
  component: MetroPage,
});

function MetroPage() {
  return (
    <MobileShell>
      <header>
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--primary)" }}>
          Signature view
        </p>
        <h1 className="mt-1 text-3xl font-black">Academic Metro Map</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
          Each station is a chapter. Colour shows status. Tap to open.
        </p>
      </header>

      <div className="mt-6 space-y-6">
        {subjects.map((s, i) => (
          <div key={s.id} className="animate-rise-in" style={{ animationDelay: `${i * 60}ms` }}>
            <MetroMap subject={s} />
          </div>
        ))}
      </div>
    </MobileShell>
  );
}

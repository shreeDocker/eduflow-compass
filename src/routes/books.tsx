import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/AppShell";
import { subjects, chapterProgress, statusMeta } from "@/lib/mock-data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/books")({
  head: () => ({
    meta: [
      { title: "Books — ClassPulse" },
      { name: "description", content: "All subjects, chapters and topics for the term." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BooksPage,
});

function BooksPage() {
  return (
    <MobileShell>
      <header>
        <h1 className="text-3xl font-black">Books</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
          Tap a subject to expand chapters.
        </p>
      </header>

      <div className="mt-6 space-y-4">
        {subjects.map((s) => (
          <div key={s.id} className="card-elevated overflow-hidden">
            <Accordion type="single" collapsible>
              <AccordionItem value={s.id} className="border-none">
                <AccordionTrigger className="px-5 py-4 text-left hover:no-underline">
                  <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-bold">{s.name}</p>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        {s.chapters.length} chapters
                      </p>
                    </div>
                    <span
                      className="rounded-full px-2.5 py-1 text-xs font-bold"
                      style={{
                        backgroundColor: `color-mix(in oklab, ${s.color} 18%, transparent)`,
                        color: s.color,
                      }}
                    >
                      {Math.round(
                        s.chapters.reduce((a, c) => a + chapterProgress(c), 0) / s.chapters.length,
                      )}
                      %
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5">
                  <ul className="space-y-3">
                    {s.chapters.map((ch) => {
                      const meta = statusMeta[ch.status];
                      const pct = chapterProgress(ch);
                      return (
                        <li
                          key={ch.id}
                          className="rounded-xl p-3"
                          style={{ backgroundColor: "var(--surface-2)" }}
                        >
                          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-semibold">{ch.title}</p>
                              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                                {ch.topics.length} topics
                              </p>
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
                          <div
                            className="mt-2 h-1.5 overflow-hidden rounded-full"
                            style={{ backgroundColor: "var(--muted)" }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, backgroundColor: meta.token }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ))}
      </div>
    </MobileShell>
  );
}

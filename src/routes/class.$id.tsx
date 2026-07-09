import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell } from "@/components/AppShell";
import { SwipeToComplete } from "@/components/SwipeToComplete";
import { StatusPill } from "@/components/StatusPill";
import {
  chapterProgress,
  findChapter,
  findClass,
  statusMeta,
  type Topic,
} from "@/lib/mock-data";
import { ArrowLeft, Mic, Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/class/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Class ${params.id} — ClassPulse` },
      { name: "description", content: "Update today's class in under 20 seconds." },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ params }) => {
    const cls = findClass(params.id);
    if (!cls) throw notFound();
    return { classId: params.id };
  },
  component: StartClass,
  notFoundComponent: () => (
    <MobileShell>
      <p className="text-center">Class not found.</p>
    </MobileShell>
  ),
});

function StartClass() {
  const { classId } = Route.useLoaderData();
  const cls = findClass(classId)!;
  const info = findChapter(cls.chapterId)!;
  const router = useRouter();

  const [topics, setTopics] = useState<Topic[]>(
    info.chapter.topics.length > 0
      ? info.chapter.topics
      : [
          { id: "auto1", title: "Introduction", status: "planned" },
          { id: "auto2", title: "Core concept", status: "planned" },
          { id: "auto3", title: "Practice", status: "planned" },
        ],
  );
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const progress = Math.round(
    (topics.filter((t) => t.status === "completed").length / topics.length) * 100,
  );

  function complete(topicId: string) {
    setTopics((prev) => {
      const next = prev.map((t) =>
        t.id === topicId ? { ...t, status: "completed" as const } : t,
      );
      if (next.every((t) => t.status === "completed")) {
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 2200);
      }
      return next;
    });
  }

  function applyVoice() {
    // "Today completed velocity and acceleration" — fake AI fill.
    setTopics((prev) =>
      prev.map((t, i) => (i < 2 ? { ...t, status: "completed" } : t)),
    );
    setVoiceOpen(false);
  }

  return (
    <MobileShell>
      {/* Header */}
      <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
        <button
          onClick={() => router.history.back()}
          aria-label="Back"
          className="big-tap grid place-items-center rounded-xl"
          style={{ backgroundColor: "var(--surface-2)" }}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
            {cls.time} · {info.subject.name}
          </p>
          <h1 className="truncate text-2xl font-black">
            Grade {cls.grade}
            {cls.section}
          </h1>
        </div>
      </header>

      {/* Chapter card */}
      <section className="card-elevated mt-6 p-5 animate-rise-in">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
              Chapter
            </p>
            <h2 className="mt-1 truncate text-xl font-black">{info.chapter.title}</h2>
          </div>
          <StatusPill status={info.chapter.status} />
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs" style={{ color: "var(--muted-foreground)" }}>
            <span>Progress</span>
            <span className="font-semibold" style={{ color: "var(--foreground)" }}>
              {progress}%
            </span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full" style={{ backgroundColor: "var(--muted)" }}>
            <div
              className="h-full rounded-full transition-[width] duration-700"
              style={{ width: `${progress}%`, backgroundColor: "var(--primary)" }}
            />
          </div>
        </div>
      </section>

      {/* Voice */}
      <section className="mt-6">
        <button
          onClick={() => setVoiceOpen(true)}
          className="big-tap flex w-full items-center gap-4 rounded-2xl p-5 text-left"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklab, var(--primary) 22%, var(--surface)), var(--surface))",
            border: "1px solid color-mix(in oklab, var(--primary) 30%, transparent)",
          }}
        >
          <div
            className="grid h-14 w-14 shrink-0 place-items-center rounded-full"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            <Mic className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold">Update by voice</p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              "Today I completed velocity and acceleration" — AI does the rest.
            </p>
          </div>
        </button>
      </section>

      {/* Topics */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
            Today's topics
          </p>
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            {topics.filter((t) => t.status === "completed").length} / {topics.length}
          </span>
        </div>
        <ul className="space-y-3">
          {topics.map((t, i) => (
            <li key={t.id} className="animate-rise-in" style={{ animationDelay: `${i * 40}ms` }}>
              <SwipeToComplete
                label={t.title}
                done={t.status === "completed"}
                onComplete={() => complete(t.id)}
              />
            </li>
          ))}
        </ul>
      </section>

      {/* AI suggestion */}
      <section
        className="mt-6 rounded-2xl p-4"
        style={{
          backgroundColor: "color-mix(in oklab, var(--status-revision) 12%, var(--surface))",
          border: "1px solid color-mix(in oklab, var(--status-revision) 25%, transparent)",
        }}
      >
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-4 w-4" style={{ color: statusMeta.revision.token }} />
          <p className="text-sm">
            You usually spend <b>3 classes</b> on Motion. This time you're at <b>5</b>. Likely cause:
            attendance dropped below 80% on Tuesday.
          </p>
        </div>
      </section>

      {/* Voice modal */}
      {voiceOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-6 backdrop-blur"
          onClick={() => setVoiceOpen(false)}
        >
          <div
            className="card-elevated w-full max-w-sm p-6 text-center animate-rise-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="mx-auto grid h-24 w-24 place-items-center rounded-full animate-station-pulse"
              style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              <Mic className="h-10 w-10" />
            </div>
            <p className="mt-6 text-lg font-bold">Listening…</p>
            <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
              "Today I completed velocity and acceleration."
            </p>
            <button
              onClick={applyVoice}
              className="big-tap mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold"
              style={{ backgroundColor: "var(--status-completed)", color: "var(--primary-foreground)" }}
            >
              <Check className="h-5 w-5" /> Confirm
            </button>
            <button
              onClick={() => setVoiceOpen(false)}
              className="mt-3 w-full text-sm"
              style={{ color: "var(--muted-foreground)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Celebration */}
      {celebrate && (
        <div className="pointer-events-none fixed inset-0 z-40 grid place-items-center">
          <div
            className="rounded-2xl px-6 py-4 text-center shadow-xl animate-rise-in"
            style={{
              backgroundColor: "var(--status-completed)",
              color: "var(--primary-foreground)",
            }}
          >
            <p className="text-lg font-black">🎉 Chapter complete!</p>
            <Link to="/" className="mt-1 inline-block text-xs underline">
              Back to today
            </Link>
          </div>
        </div>
      )}
    </MobileShell>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/AppShell";
import { currentTeacher, todaysClasses, findChapter, chapterProgress } from "@/lib/mock-data";
import { Play, Clock, BookOpenCheck, ListTodo, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today's Classes — ClassPulse" },
      { name: "description", content: "Update today's class in seconds. Real-time syllabus tracking for teachers." },
      { property: "og:title", content: "ClassPulse — Today's Classes" },
      { property: "og:description", content: "Real-time syllabus coverage for teachers. Voice-ready, offline-capable." },
    ],
  }),
  component: TeacherHome,
});

function TeacherHome() {
  const current = todaysClasses.find((c) => c.status === "current") ?? todaysClasses[0];
  const upcoming = todaysClasses.filter((c) => c.id !== current.id);

  return (
    <MobileShell>
      {/* Greeting */}
      <header className="animate-rise-in">
        <p className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
          {currentTeacher.greeting}
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">{currentTeacher.name}</h1>
      </header>

      {/* Today summary */}
      <section className="mt-6 grid grid-cols-3 gap-3 animate-rise-in" style={{ animationDelay: "40ms" }}>
        <SummaryTile icon={<Clock className="h-5 w-5" />} value={currentTeacher.classesToday} label="Classes" />
        <SummaryTile icon={<ListTodo className="h-5 w-5" />} value={currentTeacher.homeworkPending} label="Homework" />
        <SummaryTile icon={<BookOpenCheck className="h-5 w-5" />} value={currentTeacher.topicsRemaining} label="Topics" />
      </section>

      {/* Current class — huge tap target */}
      <section className="mt-6 animate-rise-in" style={{ animationDelay: "80ms" }}>
        <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
          Right now
        </p>
        <CurrentClassCard classId={current.id} />
      </section>

      {/* Upcoming */}
      <section className="mt-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
          Upcoming
        </p>
        <ul className="space-y-3">
          {upcoming.map((c, i) => (
            <li key={c.id} className="animate-rise-in" style={{ animationDelay: `${120 + i * 40}ms` }}>
              <UpcomingClassRow classId={c.id} />
            </li>
          ))}
        </ul>
      </section>

      {/* Metro map peek */}
      <section className="mt-8 animate-rise-in">
        <Link
          to="/metro"
          className="card-elevated block p-5"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklab, var(--primary) 18%, var(--surface)), var(--surface))",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="grid h-11 w-11 place-items-center rounded-xl"
              style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold">See your Academic Metro Map</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Every chapter, every station — where you are on the journey.
              </p>
            </div>
          </div>
        </Link>
      </section>
    </MobileShell>
  );
}

function SummaryTile({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="card-elevated flex flex-col items-start gap-2 p-4">
      <span style={{ color: "var(--primary)" }}>{icon}</span>
      <p className="text-2xl font-black leading-none">{value}</p>
      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </p>
    </div>
  );
}

function CurrentClassCard({ classId }: { classId: string }) {
  const cls = todaysClasses.find((c) => c.id === classId)!;
  const info = findChapter(cls.chapterId)!;
  const progress = chapterProgress(info.chapter);

  return (
    <Link
      to="/class/$id"
      params={{ id: cls.id }}
      className="card-elevated block overflow-hidden p-5"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <p className="text-3xl font-black leading-none">{cls.time}</p>
          <p className="mt-2 truncate text-lg font-bold">
            {cls.subject} · Grade {cls.grade}
            {cls.section}
          </p>
          <p className="mt-1 truncate text-sm" style={{ color: "var(--muted-foreground)" }}>
            Chapter: {info.chapter.title}
          </p>
        </div>
        <div
          className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl"
          style={{
            backgroundColor: "var(--primary)",
            color: "var(--primary-foreground)",
          }}
        >
          <Play className="h-7 w-7 fill-current" />
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs" style={{ color: "var(--muted-foreground)" }}>
          <span>Chapter progress</span>
          <span className="font-semibold" style={{ color: "var(--foreground)" }}>
            {progress}%
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full" style={{ backgroundColor: "var(--muted)" }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${progress}%`, backgroundColor: "var(--primary)" }}
          />
        </div>
      </div>
    </Link>
  );
}

function UpcomingClassRow({ classId }: { classId: string }) {
  const cls = todaysClasses.find((c) => c.id === classId)!;
  const info = findChapter(cls.chapterId)!;

  return (
    <Link
      to="/class/$id"
      params={{ id: cls.id }}
      className="card-elevated grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 p-4"
    >
      <div className="w-14 shrink-0">
        <p className="text-lg font-black leading-none">{cls.time}</p>
      </div>
      <div className="min-w-0">
        <p className="truncate font-bold">
          {cls.subject} · {cls.grade}
          {cls.section}
        </p>
        <p className="truncate text-xs" style={{ color: "var(--muted-foreground)" }}>
          {info.chapter.title}
        </p>
      </div>
      <span
        className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
        style={{
          backgroundColor: "color-mix(in oklab, var(--primary) 15%, transparent)",
          color: "var(--primary)",
        }}
      >
        Upcoming
      </span>
    </Link>
  );
}

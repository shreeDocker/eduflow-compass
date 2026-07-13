import { createFileRoute, Navigate, notFound } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TopicProgressCard } from "@/components/TopicProgressCard";
import { CompletionPopper } from "@/components/CompletionPopper";
import { ProgressSlider } from "@/components/ProgressSlider";
import { SwipeToComplete } from "@/components/SwipeToComplete";
import { findChapter, findClass } from "@/lib/mock-data";
import { useRole } from "@/lib/role-context";
import { useSyllabusProgress } from "@/lib/syllabus-progress-context";
import { currentUserId } from "@/lib/syllabus-data";
import { classToSyllabusPath } from "@/lib/syllabus-progress-keys";
import { isClassSessionForTeacher, topicProgress } from "@/lib/syllabus-utils";

export const Route = createFileRoute("/class/$id")({
  head: () => ({
    meta: [
      { title: `Class — Swotify Plus` },
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
    <AppShell title="Not found" showBack backTo="/today">
      <p className="text-center text-theme-muted">Class not found.</p>
    </AppShell>
  ),
});

function StartClass() {
  const { classId } = Route.useLoaderData();
  const cls = findClass(classId)!;
  const { isAdmin } = useRole();
  const { grades, setTopicProgress } = useSyllabusProgress();

  const syllabusPath = classToSyllabusPath(cls.grade, cls.section, cls.subject);
  const canAccess = isAdmin || isClassSessionForTeacher(cls, grades, currentUserId);

  const syllabusChapter = useMemo(() => {
    if (!syllabusPath) return null;
    const grade = grades.find((g) => g.id === syllabusPath.gradeId);
    const subject = grade?.subjects.find((s) => s.id === syllabusPath.subjectId);
    return subject?.chapters.find((c) => c.id === cls.chapterId) ?? null;
  }, [grades, cls.chapterId, syllabusPath]);

  const info = findChapter(cls.chapterId);
  const subjectName = syllabusChapter
    ? grades
        .find((g) => g.id === syllabusPath?.gradeId)
        ?.subjects.find((s) => s.id === syllabusPath?.subjectId)?.name ?? cls.subject
    : info?.subject.name ?? cls.subject;
  const chapterTitle = syllabusChapter?.title ?? info?.chapter.title ?? "Chapter";

  const topics = useMemo(() => {
    if (syllabusChapter && syllabusChapter.topics.length > 0) {
      return syllabusChapter.topics.map((t) => ({
        id: t.id,
        title: t.title,
        progress: topicProgress(t),
      }));
    }

    const base =
      info?.chapter.topics.length
        ? info.chapter.topics
        : [
            { id: "auto1", title: "Introduction" },
            { id: "auto2", title: "Core concept" },
            { id: "auto3", title: "Practice" },
          ];

    if (!syllabusPath) return base.map((t) => ({ ...t, progress: 0 }));

    const grade = grades.find((g) => g.id === syllabusPath.gradeId);
    const subject = grade?.subjects.find((s) => s.id === syllabusPath.subjectId);
    const chapter = subject?.chapters.find((c) => c.id === cls.chapterId);

    return base.map((t) => {
      const syllabusTopic = chapter?.topics.find((st) => st.id === t.id);
      return { ...t, progress: syllabusTopic ? topicProgress(syllabusTopic) : 0 };
    });
  }, [grades, info?.chapter.topics, cls.chapterId, syllabusPath, syllabusChapter]);

  const [celebrate, setCelebrate] = useState({
    show: false,
    message: "",
    sub: "",
    fullScreen: false,
  });

  const progress = topics.length
    ? Math.round(topics.reduce((s, t) => s + t.progress, 0) / topics.length)
    : 0;
  const doneCount = topics.filter((t) => t.progress >= 100).length;
  const chapterDone = progress >= 100;

  const dismissCelebrate = useCallback(() => {
    setCelebrate((c) => ({ ...c, show: false }));
  }, []);

  function updateTopic(topicId: string, value: number, title: string) {
    if (!syllabusPath) return;
    setTopicProgress(
      {
        gradeId: syllabusPath.gradeId,
        subjectId: syllabusPath.subjectId,
        chapterId: cls.chapterId,
        topicId,
      },
      value,
    );
    if (value >= 100) {
      const othersDone = topics.every((x) => (x.id === topicId ? true : x.progress >= 100));
      setCelebrate({
        show: true,
        message: othersDone ? "Chapter complete!" : "Done",
        sub: othersDone ? chapterTitle : title,
        fullScreen: othersDone,
      });
    }
  }

  function updateChapterProgress(value: number) {
    if (!syllabusPath) return;
    const incomplete = topics.filter((t) => t.progress < 100);
    if (incomplete.length === 0) return;

    incomplete.forEach((t) => {
      setTopicProgress(
        {
          gradeId: syllabusPath.gradeId,
          subjectId: syllabusPath.subjectId,
          chapterId: cls.chapterId,
          topicId: t.id,
        },
        value,
      );
    });

    if (value >= 100) {
      setCelebrate({
        show: true,
        message: "Chapter complete!",
        sub: chapterTitle,
        fullScreen: true,
      });
    }
  }

  function markChapterComplete() {
    if (chapterDone) return;
    updateChapterProgress(100);
  }

  if (!canAccess) return <Navigate to="/today" replace />;

  return (
    <AppShell
      title={`Grade ${cls.grade}${cls.section} · ${subjectName}`}
      showBack
      backTo="/today"
    >
      <section className="min-card mb-4 p-4">
        <p className="text-[11px] text-theme-muted">{cls.time}</p>
        <h2 className="mt-1 text-base font-semibold text-theme">{chapterTitle}</h2>
        <div className="mt-3 flex items-center justify-between text-xs text-theme-muted">
          <span>
            {doneCount} of {topics.length} topics
          </span>
          <span className="font-mono font-medium text-theme" data-metric>
            {progress}%
          </span>
        </div>

        {!chapterDone ? (
          <>
            <ProgressSlider
              value={progress}
              onChange={updateChapterProgress}
              accent={progress >= 50 ? "var(--min-orange)" : "var(--min-accent)"}
              className="mt-3"
              aria-label={`${chapterTitle} chapter completion`}
            />
            <div className="mt-3">
              <SwipeToComplete done={chapterDone} onComplete={markChapterComplete} />
            </div>
          </>
        ) : (
          <>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--min-track)]">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{ width: "100%", background: "var(--min-green)" }}
              />
            </div>
            <div className="mt-3 flex items-center gap-2.5 text-theme-success">
              <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} />
              <p className="text-[15px] font-medium">Chapter completed</p>
            </div>
          </>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-theme-label">Topics</h3>
        <ul className="space-y-2">
          {topics.map((t) => (
            <li key={t.id}>
              <TopicProgressCard
                label={t.title}
                progress={t.progress}
                variant="tracker"
                onProgressChange={(v) => updateTopic(t.id, v, t.title)}
              />
            </li>
          ))}
        </ul>
      </section>

      <CompletionPopper
        show={celebrate.show}
        message={celebrate.message}
        submessage={celebrate.sub}
        onDone={dismissCelebrate}
        fullScreen={celebrate.fullScreen}
      />
    </AppShell>
  );
}

import { Link } from "@tanstack/react-router";
import { School, Layers } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProgressBadge, ProgressBar, progressTone } from "@/components/syllabus/ProgressBar";
import { SectionSubjectCompletion } from "@/components/admin/SectionSubjectCompletion";
import type { SyllabusGrade } from "@/lib/syllabus-data";
import {
  buildSectionBoard,
  listClassProgress,
  listGradeProgress,
  schoolProgress,
  type ClassProgressRow,
} from "@/lib/syllabus-utils";

type AdminInsightsAccordionProps = {
  grades: SyllabusGrade[];
};

export function AdminInsightsAccordion({ grades }: AdminInsightsAccordionProps) {
  const classes = listClassProgress(grades);
  const gradesByLevel = listGradeProgress(grades);
  const sectionBoard = buildSectionBoard(grades);

  return (
    <Accordion
      type="multiple"
      defaultValue={[]}
      className="rounded-xl border border-[var(--min-border)] bg-[var(--min-surface)] px-4 sm:px-5"
    >
      <AccordionItem value="sections" className="border-[var(--min-border)]">
        <AccordionTrigger className="py-3.5 text-sm hover:no-underline">
          <span className="flex items-center gap-2 font-display font-semibold">
            <School className="h-4 w-4 text-[var(--sw-sapphire-600)]" />
            All sections
            <span className="font-normal text-theme-muted">({classes.length})</span>
          </span>
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <SectionsGrid sections={classes} />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="grades" className="border-none">
        <AccordionTrigger className="py-3.5 text-sm hover:no-underline">
          <span className="flex items-center gap-2 font-display font-semibold">
            <Layers className="h-4 w-4 text-[var(--sw-violet-600)]" />
            Grade board
            <span className="font-normal text-theme-muted">({gradesByLevel.length} grades)</span>
          </span>
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <SectionSubjectCompletion board={sectionBoard} embedded />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function SectionsGrid({ sections }: { sections: ClassProgressRow[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {sections.map((c) => {
        const tone = progressTone(c.progress);
        const accent =
          tone === "emerald"
            ? "var(--sw-emerald-500)"
            : tone === "sapphire"
              ? "var(--sw-sapphire-500)"
              : tone === "gold"
                ? "var(--sw-gold-500)"
                : "var(--sw-coral-500)";
        return (
          <div
            key={c.id}
            className="rounded-[8px] border border-[var(--min-border)] bg-[var(--min-bg)] p-3"
            style={{ borderLeft: `3px solid ${accent}` }}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-theme">
                {c.label} {c.section}
              </p>
              <ProgressBadge value={c.progress} />
            </div>
            <ProgressBar value={c.progress} accent={accent} className="mt-2" />
          </div>
        );
      })}
    </div>
  );
}

export function AdminProgressSummaryStrip({ grades }: { grades: SyllabusGrade[] }) {
  const classes = listClassProgress(grades);
  const gradesByLevel = listGradeProgress(grades);
  const schoolPct = schoolProgress(grades);

  return (
    <section className="grid gap-3 sm:grid-cols-3">
      <SummaryLinkCard
        to="/books"
        search={{ view: "catalog", layout: "overview" }}
        label="School overview"
        value={`${schoolPct}%`}
        hint={`${classes.length} sections · expand in catalog`}
      />
      <SummaryLinkCard
        to="/books"
        search={{ view: "catalog", layout: "subjects" }}
        label="By subject"
        value="Teachers →"
        hint="Same subject across teachers"
      />
      <SummaryLinkCard
        to="/principal"
        label="Command center"
        value="Dashboard →"
        hint={gradesByLevel.map((g) => `${g.gradeLabel} ${g.progress}%`).join(" · ")}
        compact
      />
    </section>
  );
}

function SummaryLinkCard({
  to,
  search,
  label,
  value,
  hint,
  compact,
}: {
  to: "/books" | "/principal";
  search?: { view?: string; layout?: string };
  label: string;
  value: string;
  hint: string;
  compact?: boolean;
}) {
  return (
    <Link
      to={to}
      search={search}
      className="card-elevated card-elevated-hover block p-4 text-left"
      style={{ borderLeft: "3px solid var(--sw-sapphire-400)" }}
    >
      <p className="sw-section-label">{label}</p>
      <p
        className={`mt-1 font-semibold text-theme ${compact ? "font-mono text-xs leading-relaxed" : "font-mono text-xl"}`}
        data-metric
      >
        {value}
      </p>
      <p className="mt-1 text-[11px] text-theme-muted">{hint}</p>
    </Link>
  );
}

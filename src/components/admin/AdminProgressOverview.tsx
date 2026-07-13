import type { SyllabusGrade } from "@/lib/syllabus-data";
import { AdminInsightsAccordion } from "@/components/admin/AdminInsightsAccordion";

export { AdminProgressSummaryStrip } from "@/components/admin/AdminInsightsAccordion";

type AdminProgressOverviewProps = {
  grades: SyllabusGrade[];
};

export function AdminProgressOverview({ grades }: AdminProgressOverviewProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-theme-muted">
        School-wide insights in one place — expand any group below.
      </p>
      <AdminInsightsAccordion grades={grades} />
    </div>
  );
}

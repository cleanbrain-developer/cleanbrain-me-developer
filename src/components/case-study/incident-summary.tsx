import type { CaseStudy } from "@/content/types";
import { Card } from "@/components/ui/card";

function Row({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  );
}

/**
 * A 10-second read of the incident, before the full Context → ... → Lessons
 * Learned narrative below it. Every field is either `incidentType` (a label
 * extracted from the case study's own title) or an existing field/first list
 * item — nothing here is new prose.
 */
export function IncidentSummary({ caseStudy }: { caseStudy: CaseStudy }) {
  return (
    <Card elevated>
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Row label="Incident Type" value={caseStudy.incidentType} />
        <Row label="Primary Symptom" value={caseStudy.symptoms[0]} />
        <Row label="Root Cause" value={caseStudy.rootCause} wide />
        <Row label="Resolution" value={caseStudy.solution} wide />
        <Row label="Trade-off" value={caseStudy.tradeoffs[0]} wide />
      </dl>
    </Card>
  );
}

import Link from "next/link";
import type { CaseStudy } from "@/content/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function CaseStudyCard({
  caseStudy,
  headingLevel = "h3",
}: {
  caseStudy: CaseStudy;
  /** The page this card is rendered on decides the level, so the heading order never skips a level. */
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  return (
    <Link href={`/case-studies/${caseStudy.slug}`} className="block">
      <Card className="transition-colors hover:bg-surface-hover">
        <Heading className="text-base font-semibold text-foreground">{caseStudy.title}</Heading>
        <div className="mt-1">
          <Badge>{caseStudy.incidentType}</Badge>
        </div>
        <p className="mt-2 text-sm text-muted">{caseStudy.summary}</p>
      </Card>
    </Link>
  );
}

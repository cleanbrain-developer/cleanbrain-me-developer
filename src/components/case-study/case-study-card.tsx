import Link from "next/link";
import type { CaseStudy } from "@/content/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function CaseStudyCard({ caseStudy }: { caseStudy: CaseStudy }) {
  return (
    <Link href={`/case-studies/${caseStudy.slug}`} className="block">
      <Card className="transition-colors hover:bg-surface-hover">
        <h3 className="text-base font-semibold text-foreground">{caseStudy.title}</h3>
        <div className="mt-1">
          <Badge>{caseStudy.incidentType}</Badge>
        </div>
        <p className="mt-2 text-sm text-muted">{caseStudy.summary}</p>
      </Card>
    </Link>
  );
}

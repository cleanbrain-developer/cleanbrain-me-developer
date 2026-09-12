import Link from "next/link";
import type { CaseStudy } from "@/content/types";

export function CaseStudyCard({ caseStudy }: { caseStudy: CaseStudy }) {
  return (
    <Link
      href={`/case-studies/${caseStudy.slug}`}
      className="block rounded-lg border border-border bg-surface p-5 transition-colors hover:bg-surface-hover"
    >
      <h3 className="text-base font-semibold text-foreground">{caseStudy.title}</h3>
      <p className="mt-2 text-sm text-muted">{caseStudy.summary}</p>
    </Link>
  );
}

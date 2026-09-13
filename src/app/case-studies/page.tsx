import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/portfolio/section-heading";
import { CaseStudyCard } from "@/components/case-study/case-study-card";
import { caseStudies } from "@/content/case-studies";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Case Studies",
  description: "Abstracted production engineering case studies: investigation, root cause, and lessons learned.",
  path: "/case-studies",
});

export default function CaseStudiesPage() {
  return (
    <Container>
      <section className="py-16 sm:py-20">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Case Studies
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          Composite, abstracted scenarios representative of real production engineering work.
          Company, customer, and system names are never disclosed here — see each case study
          for details.
        </p>
      </section>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {caseStudies.map((caseStudy) => (
          <CaseStudyCard key={caseStudy.slug} caseStudy={caseStudy} />
        ))}
      </div>

      <section className="mt-12 border-t border-border py-12 pb-20">
        <SectionHeading
          eyebrow="More"
          title="Why the site is built this way"
          description="The engineering principles behind retry/DLQ design, observability, and evidence over simulation — the reasoning these case studies draw on."
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/architecture"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
          >
            Read the architecture principles
          </Link>
          <Link
            href="/projects"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
          >
            Explore Projects
          </Link>
        </div>
      </section>
    </Container>
  );
}

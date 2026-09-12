import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { CaseStudyCard } from "@/components/case-study/case-study-card";
import { caseStudies } from "@/content/case-studies";

export const metadata: Metadata = {
  title: "Case Studies",
  description: "Abstracted production engineering case studies: investigation, root cause, and lessons learned.",
};

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
      <div className="grid grid-cols-1 gap-4 pb-20 sm:grid-cols-2">
        {caseStudies.map((caseStudy) => (
          <CaseStudyCard key={caseStudy.slug} caseStudy={caseStudy} />
        ))}
      </div>
    </Container>
  );
}

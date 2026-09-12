import type { CaseStudy } from "@/content/types";

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border py-8 first:border-t-0 first:pt-0">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-accent">{title}</h2>
      <div className="mt-3 text-muted">{children}</div>
    </section>
  );
}

function DetailList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function CaseStudyDetail({ caseStudy }: { caseStudy: CaseStudy }) {
  return (
    <article>
      <header className="py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {caseStudy.title}
        </h1>
        <p className="mt-3 max-w-2xl text-muted">{caseStudy.summary}</p>
      </header>

      <DetailSection title="Context">
        <p>{caseStudy.context}</p>
      </DetailSection>
      <DetailSection title="Problem">
        <p>{caseStudy.problem}</p>
      </DetailSection>
      <DetailSection title="Symptoms">
        <DetailList items={caseStudy.symptoms} />
      </DetailSection>
      <DetailSection title="Constraints">
        <DetailList items={caseStudy.constraints} />
      </DetailSection>
      <DetailSection title="Investigation">
        <p>{caseStudy.investigation}</p>
      </DetailSection>
      <DetailSection title="Root cause">
        <p>{caseStudy.rootCause}</p>
      </DetailSection>
      <DetailSection title="Solution">
        <p>{caseStudy.solution}</p>
      </DetailSection>
      <DetailSection title="Trade-offs">
        <DetailList items={caseStudy.tradeoffs} />
      </DetailSection>
      <DetailSection title="Result">
        <p>{caseStudy.result}</p>
      </DetailSection>
      <DetailSection title="Lessons learned">
        <DetailList items={caseStudy.lessonsLearned} />
      </DetailSection>
    </article>
  );
}

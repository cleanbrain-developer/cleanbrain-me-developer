import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { CaseStudyDetail } from "@/components/case-study/case-study-detail";
import { caseStudies, getCaseStudyBySlug } from "@/content/case-studies";

export function generateStaticParams() {
  return caseStudies.map((caseStudy) => ({ slug: caseStudy.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/case-studies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = getCaseStudyBySlug(slug);
  if (!caseStudy) return {};
  return { title: caseStudy.title, description: caseStudy.summary };
}

export default async function CaseStudyDetailPage({
  params,
}: PageProps<"/case-studies/[slug]">) {
  const { slug } = await params;
  const caseStudy = getCaseStudyBySlug(slug);
  if (!caseStudy) notFound();

  return (
    <Container>
      <CaseStudyDetail caseStudy={caseStudy} />
    </Container>
  );
}

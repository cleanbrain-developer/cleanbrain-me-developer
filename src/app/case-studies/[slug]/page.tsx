import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { CaseStudyDetail } from "@/components/case-study/case-study-detail";
import { caseStudies, getCaseStudyBySlug } from "@/content/case-studies";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return caseStudies.map((caseStudy) => ({ slug: caseStudy.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/case-studies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = getCaseStudyBySlug(slug);
  if (!caseStudy) return {};
  return pageMetadata({
    title: caseStudy.title,
    description: caseStudy.summary,
    path: `/case-studies/${caseStudy.slug}`,
  });
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

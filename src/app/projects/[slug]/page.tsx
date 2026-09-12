import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { ProjectDetail } from "@/components/project/project-detail";
import { projects, getProjectBySlug } from "@/content/projects";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return pageMetadata({
    title: project.name,
    description: project.summary,
    path: `/projects/${project.slug}`,
  });
}

export default async function ProjectDetailPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <Container>
      <ProjectDetail project={project} />
    </Container>
  );
}

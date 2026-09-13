import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/portfolio/section-heading";
import { ProjectCard } from "@/components/project/project-card";
import { projects } from "@/content/projects";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Projects",
  description: "Projects written as problem, architecture, decisions, failure handling, and result.",
  path: "/projects",
});

export default function ProjectsPage() {
  return (
    <Container>
      <section className="py-16 sm:py-20">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Projects
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          Each project below is written as problem, architecture, key decisions, failure
          handling, observability, result, and lessons learned — not a technology list.
        </p>
      </section>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>

      <section className="mt-12 border-t border-border py-12 pb-20">
        <SectionHeading
          eyebrow="More"
          title="See these projects running for real"
          description="RelayHub's own delivery, DLQ, and ingress data — pushed live from the deployed service, not a screenshot."
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/lab"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:opacity-90"
          >
            Open Live Monitoring
          </Link>
          <Link
            href="/case-studies"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
          >
            Case Studies
          </Link>
        </div>
      </section>
    </Container>
  );
}

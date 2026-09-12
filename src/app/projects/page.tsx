import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { ProjectCard } from "@/components/project/project-card";
import { projects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Projects written as problem, architecture, decisions, failure handling, and result.",
};

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
      <div className="grid grid-cols-1 gap-4 pb-20 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </Container>
  );
}

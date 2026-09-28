import type { Project } from "@/content/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArchitectureDiagram } from "@/components/project/architecture-diagram";
import {
  relayHubDiagramNodes,
  relayHubDiagramEdges,
  relayHubDiagramSize,
} from "@/content/relayhub-architecture";
import {
  englishCoreSpeakingDiagramNodes,
  englishCoreSpeakingDiagramEdges,
  englishCoreSpeakingDiagramSize,
} from "@/content/english-core-speaking-architecture";

const DIAGRAMS: Record<
  string,
  { nodes: typeof relayHubDiagramNodes; edges: typeof relayHubDiagramEdges; size: { width: number; height: number } }
> = {
  relayhub: { nodes: relayHubDiagramNodes, edges: relayHubDiagramEdges, size: relayHubDiagramSize },
  "english-core-speaking": {
    nodes: englishCoreSpeakingDiagramNodes,
    edges: englishCoreSpeakingDiagramEdges,
    size: englishCoreSpeakingDiagramSize,
  },
};

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border py-8 first:border-t-0 first:pt-0">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-accent">{title}</h2>
      <div className="mt-3 text-foreground">{children}</div>
    </section>
  );
}

function DetailList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 text-muted">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function ProjectDetail({ project }: { project: Project }) {
  const diagram = DIAGRAMS[project.slug];

  return (
    <article>
      <header className="py-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {project.name}
          </h1>
          <Badge tone={project.status === "live" ? "live" : "default"}>
            {project.status === "live" ? "Live" : "In development"}
          </Badge>
        </div>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-accent">
          {project.kind} · {project.focus}
        </p>
        <p className="mt-3 max-w-2xl text-muted">{project.summary}</p>
        <p className="mt-2 text-sm text-muted">Role: {project.role}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {project.links.live ? <Button href={project.links.live}>View Live</Button> : null}
          {project.links.github ? (
            <Button href={project.links.github} variant="secondary">
              View Source
            </Button>
          ) : null}
        </div>
        <ul className="mt-6 flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <li key={tech}>
              <Badge>{tech}</Badge>
            </li>
          ))}
        </ul>
      </header>

      <DetailSection title="Problem">
        <p className="text-muted">{project.problem}</p>
      </DetailSection>
      <DetailSection title="Why it matters">
        <p className="text-muted">{project.whyItMatters}</p>
      </DetailSection>
      <DetailSection title="Architecture">
        <p className="text-muted">{project.architecture}</p>
        {diagram ? (
          <div className="mt-4">
            <ArchitectureDiagram
              nodes={diagram.nodes}
              edges={diagram.edges}
              width={diagram.size.width}
              height={diagram.size.height}
              label={`${project.name} architecture diagram`}
            />
          </div>
        ) : null}
      </DetailSection>
      <DetailSection title="Key engineering decisions">
        <DetailList items={project.keyDecisions} />
      </DetailSection>
      <DetailSection title="Failure handling">
        <DetailList items={project.failureHandling} />
      </DetailSection>
      <DetailSection title="Observability">
        <DetailList items={project.observability} />
      </DetailSection>
      <DetailSection title="Result">
        <p className="text-muted">{project.result}</p>
      </DetailSection>
      <DetailSection title="What I learned">
        <DetailList items={project.lessonsLearned} />
      </DetailSection>
    </article>
  );
}

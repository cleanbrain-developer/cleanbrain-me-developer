import type { Project } from "@/content/types";

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
  return (
    <article>
      <header className="py-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {project.name}
          </h1>
          <span className="rounded-full border border-border px-2 py-0.5 font-mono text-xs text-muted">
            {project.status === "live" ? "Live" : "In development"}
          </span>
        </div>
        <p className="mt-3 max-w-2xl text-muted">{project.summary}</p>
        <p className="mt-2 text-sm text-muted">Role: {project.role}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {project.links.live ? (
            <a
              href={project.links.live}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:opacity-90"
            >
              View Live
            </a>
          ) : null}
          {project.links.github ? (
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
            >
              View Source
            </a>
          ) : null}
        </div>
        <ul className="mt-6 flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <li
              key={tech}
              className="rounded-full bg-surface px-2 py-1 font-mono text-xs text-muted"
            >
              {tech}
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

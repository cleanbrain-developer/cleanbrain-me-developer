import Link from "next/link";
import type { Project } from "@/content/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function ProjectCard({
  project,
  headingLevel = "h3",
}: {
  project: Project;
  /** The page this card is rendered on decides the level, so the heading order never skips a level. */
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  return (
    <Link href={`/projects/${project.slug}`} className="block">
      <Card className="transition-colors hover:bg-surface-hover">
        <div className="flex items-center justify-between gap-2">
          <Heading className="text-base font-semibold text-foreground">{project.name}</Heading>
          <Badge tone={project.status === "live" ? "live" : "default"}>
            {project.status === "live" ? "Live" : "In development"}
          </Badge>
        </div>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-accent">{project.kind}</p>
        <p className="mt-2 text-sm text-muted">{project.summary}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {project.technologies.slice(0, 4).map((tech) => (
            <li key={tech}>
              <Badge>{tech}</Badge>
            </li>
          ))}
        </ul>
      </Card>
    </Link>
  );
}

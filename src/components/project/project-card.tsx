import Link from "next/link";
import type { Project } from "@/content/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="block rounded-lg border border-border bg-surface p-5 transition-colors hover:bg-surface-hover"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-foreground">{project.name}</h3>
        <span className="rounded-full border border-border px-2 py-0.5 font-mono text-xs text-muted">
          {project.status === "live" ? "Live" : "In development"}
        </span>
      </div>
      <p className="mt-2 text-sm text-muted">{project.summary}</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {project.technologies.slice(0, 4).map((tech) => (
          <li
            key={tech}
            className="rounded-full bg-background px-2 py-0.5 font-mono text-xs text-muted"
          >
            {tech}
          </li>
        ))}
      </ul>
    </Link>
  );
}

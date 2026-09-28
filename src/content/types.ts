export interface TechArea {
  label: string;
  items: string[];
}

export interface ExperienceFocusArea {
  slug: string;
  title: string;
  /** Short form of `title`, for compact UI (homepage grid, JSON-LD knowsAbout) that can't fit the full title. */
  shortLabel: string;
  description: string;
  highlights: string[];
  /** Project(s)/Case Study(ies) this focus area is demonstrated in, as real navigable links. */
  relatedLinks: { label: string; href: string }[];
}

export interface ImpactStat {
  value: string;
  label: string;
  detail: string;
}

export interface Profile {
  name: string;
  role: string;
  yearsOfExperience: number;
  tagline: string;
  summary: string;
  techStack: TechArea[];
  links: {
    github: string;
    email: string;
  };
}

export interface Project {
  slug: string;
  name: string;
  /** One-line category, e.g. "Event-driven Integration Platform" — extracted from `summary`/`problem`, not a new claim. */
  kind: string;
  /** One-line focus statement, e.g. "Reliability & Failure Handling" — same source as `kind`. */
  focus: string;
  summary: string;
  status: "live" | "in-development";
  role: string;
  problem: string;
  whyItMatters: string;
  architecture: string;
  keyDecisions: string[];
  failureHandling: string[];
  observability: string[];
  result: string;
  lessonsLearned: string[];
  technologies: string[];
  featured: boolean;
  links: {
    live?: string;
    github?: string;
  };
}

export interface CaseStudy {
  slug: string;
  title: string;
  /** Short category label extracted from `title`, e.g. "Race Condition" — not a new claim. */
  incidentType: string;
  summary: string;
  context: string;
  problem: string;
  symptoms: string[];
  constraints: string[];
  investigation: string;
  rootCause: string;
  solution: string;
  tradeoffs: string[];
  result: string;
  lessonsLearned: string[];
}

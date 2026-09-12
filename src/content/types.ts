export interface TechArea {
  label: string;
  items: string[];
}

export interface ExperienceFocusArea {
  slug: string;
  title: string;
  description: string;
  highlights: string[];
}

export interface Profile {
  name: string;
  role: string;
  yearsOfExperience: number;
  tagline: string;
  summary: string;
  focusAreas: string[];
  techStack: TechArea[];
  links: {
    github: string;
    email: string;
  };
}

export interface Project {
  slug: string;
  name: string;
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

import type { Profile } from "@/content/types";

export const profile: Profile = {
  name: "cleanbrain.developer",
  role: "Backend Engineer",
  yearsOfExperience: 9,
  tagline: "Building reliable integrations and observable distributed systems.",
  summary:
    "Backend engineer with around 9 years of experience across Java/Spring and TypeScript/Node.js/NestJS backend systems that connect multiple services and operate under real-world constraints. Focused on system behavior, data flow, failure modes, transaction boundaries, and operational constraints rather than treating any one technology stack as the goal.",
  techStack: [
    {
      label: "Backend",
      items: ["Java", "Spring / Spring Boot", "TypeScript", "Node.js", "NestJS", "REST API design"],
    },
    {
      label: "Data",
      items: ["PostgreSQL", "JPA", "QueryDSL", "Prisma", "Redis"],
    },
    {
      label: "Integration & Messaging",
      items: ["Kafka", "Event-driven systems", "OAuth2 / OIDC / SAML"],
    },
    {
      label: "Platform & Operations",
      items: ["Docker", "Kubernetes", "k3s"],
    },
  ],
  links: {
    github: "https://github.com/cleanbrain-developer",
    email: "cleanbrain.developer@gmail.com",
  },
};

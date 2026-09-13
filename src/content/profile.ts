import type { Profile } from "@/content/types";

export const profile: Profile = {
  name: "cleanbrain.developer",
  role: "Backend Engineer",
  yearsOfExperience: 8,
  tagline: "Building reliable integrations and observable distributed systems.",
  summary:
    "Backend engineer with 8+ years of experience across Java/Spring and TypeScript/Node.js/NestJS backend systems that connect multiple services — enterprise SaaS platforms, identity/IAM, and applied AI included — and operate under real-world constraints. Focused on system behavior, data flow, failure modes, transaction boundaries, and operational constraints rather than treating any one technology stack as the goal.",
  techStack: [
    {
      label: "Backend",
      items: ["Java", "Spring / Spring Boot", "TypeScript", "Node.js", "NestJS", "Express", "REST API & WebSocket design"],
    },
    {
      label: "Data",
      items: ["PostgreSQL", "JPA", "QueryDSL", "Prisma", "Redis"],
    },
    {
      label: "Enterprise Integration",
      items: ["Salesforce", "SAP S/4HANA Cloud", "WMS", "Kafka", "Event-driven systems"],
    },
    {
      label: "Identity & Access",
      items: ["IAM", "SSO", "SAML", "OAuth2 / OIDC", "Microsoft Azure", "Microsoft Graph API"],
    },
    {
      label: "AI Integration",
      items: ["STT", "Translation", "TTS", "LLM Function Calling", "Claude API"],
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

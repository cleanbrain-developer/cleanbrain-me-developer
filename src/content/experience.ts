import type { ExperienceFocusArea } from "@/content/types";

export const experienceFocusAreas: ExperienceFocusArea[] = [
  {
    slug: "backend-api-design",
    title: "Backend API Design & Development",
    shortLabel: "Backend Engineering",
    description:
      "Designing and building REST APIs and backend architecture across Java/Spring and TypeScript/NestJS services, with an emphasis on making boundaries and contracts explicit before implementation.",
    highlights: [
      "API and service boundary design for systems that connect multiple internal and external consumers",
      "Backend architecture for both greenfield services (see Projects) and systems with existing constraints",
    ],
  },
  {
    slug: "enterprise-integration",
    title: "Enterprise System Integration & Distributed Data Flows",
    shortLabel: "Enterprise Integration",
    description:
      "Connecting systems that were not designed to talk to each other, and keeping the resulting data flow understandable, observable, and recoverable when a step fails.",
    highlights: [
      "Mapping and transformation between systems with different data models",
      "Designing for partial failure: retry, dead-letter handling, and replay rather than best-effort delivery",
      "See RelayHub (Projects) and the Case Studies for concrete examples of this focus area in practice",
    ],
  },
  {
    slug: "transaction-and-data-consistency",
    title: "Transaction & Data Consistency",
    shortLabel: "Transaction & Data Consistency",
    description:
      "Reasoning about transaction boundaries and consistency guarantees in systems where a single business operation spans multiple services or data stores.",
    highlights: [
      "Identifying race conditions and inconsistent-state windows in asynchronous processing paths",
      "Choosing between strict consistency, eventual consistency, and compensating actions based on the actual failure modes involved",
    ],
  },
  {
    slug: "authentication-and-identity",
    title: "Authentication & Identity Integration",
    shortLabel: "Auth & Identity Integration",
    description: "Integrating authentication and identity across services using OAuth2, OIDC, and SAML.",
    highlights: [
      "OAuth2/OIDC integration for user-facing services (see English Core Speaking, Projects)",
      "Session and identity boundaries between a frontend, backend API, and third-party identity providers",
    ],
  },
  {
    slug: "batch-async-event-driven",
    title: "Batch, Asynchronous & Event-driven Processing",
    shortLabel: "Distributed & Event-driven Systems",
    description:
      "Building processing pipelines — batch, asynchronous, and event-driven — that stay correct and debuggable as scale and failure scenarios grow.",
    highlights: [
      "Event-driven pipelines with Kafka as the backbone (see RelayHub, Projects)",
      "Batch processing constraints when legacy state and new configuration must coexist (see Case Studies)",
    ],
  },
  {
    slug: "production-troubleshooting",
    title: "Performance Bottleneck Analysis & Production Troubleshooting",
    shortLabel: "Production Troubleshooting",
    description:
      "Diagnosing real production incidents — not only reproducing failures locally, but verifying root cause and fix against the actual running system.",
    highlights: [
      "Root-cause analysis for intermittent, timing-dependent, and load-dependent failures",
      "Distinguishing a fix that passes a test from one that is verified against production behavior",
    ],
  },
  {
    slug: "ai-llm-integration",
    title: "AI / LLM API Integration",
    shortLabel: "AI / LLM Integration",
    description:
      "Integrating external AI/LLM APIs into product backends as one more external dependency to design around — with its own latency, failure, and cost characteristics.",
    highlights: [
      "External AI/LLM API integration for a user-facing evaluation feature (see English Core Speaking, Projects)",
    ],
  },
];

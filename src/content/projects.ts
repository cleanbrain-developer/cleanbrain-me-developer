import type { Project } from "@/content/types";

export const projects: Project[] = [
  {
    slug: "relayhub",
    name: "RelayHub",
    summary:
      "An event-integration platform: events are ingested, validated, transformed, and delivered to downstream targets with retry, dead-letter handling, replay, and metrics — the same behavior this site's Live Lab lets you trigger yourself.",
    status: "live",
    role: "Sole designer and implementer.",
    problem:
      "Enterprise integration work keeps producing the same shape of problem: one system emits an event, another system needs to receive it, and the boundary between them has to survive validation failures, downstream outages, and the occasional need to replay something that failed hours ago. Point-to-point integrations solve this once and then get rebuilt for the next pair of systems.",
    whyItMatters:
      "A visible, reusable answer to 'how do you actually handle a delivery failure in a distributed system' is more convincing than a description of it — this project exists to demonstrate that behavior directly, not just to talk about it.",
    architecture:
      "Kafka is the backbone: incoming events are ingested onto a topic, then move through validation and transformation stages before an outbound delivery step calls the configured target. Failed deliveries are retried with backoff; exhausted retries move the event to a dead-letter path where it can be inspected and replayed. An admin console (backed by Spring Boot and Prometheus-scraped metrics) gives operational visibility into throughput, failure rate, and queue depth. `relayhub-demo-systems` runs alongside the core service as simulated source/target systems that generate continuous demo traffic, so the pipeline has real events flowing through it rather than sitting idle.",
    keyDecisions: [
      "Kafka as the event backbone rather than a simpler point-to-point queue, so ingestion and delivery are decoupled and replay is a first-class operation, not an afterthought.",
      "A dedicated dead-letter path with manual replay, instead of dropping or silently retrying forever, so a failed event is always something a human can act on.",
      "An admin console with real metrics (via Prometheus) rather than log-diving as the primary way to understand system health.",
    ],
    failureHandling: [
      "Delivery failures (timeouts, target errors) trigger a bounded retry policy before an event is moved to the dead-letter path.",
      "Dead-lettered events preserve enough context (payload, error, retry history) to diagnose and manually replay them.",
    ],
    observability: [
      "Prometheus-backed metrics feed the admin console's time-series charts (throughput, success/failure rate, latency).",
      "Continuous synthetic traffic from `relayhub-demo-systems` keeps those metrics meaningful even without live production integrations.",
    ],
    result:
      "Live in production, running continuously against synthetic source/target traffic. The RelayHub Live Lab on this site is backed by the same event/pipeline model this project actually implements.",
    lessonsLearned: [
      "Kafka's KRaft mode needs a complete, consistent environment-variable set to come up cleanly in a container — partial configuration (e.g. only `advertised.listeners`) fails in ways that look unrelated to the actual missing setting.",
      "An admin console is only as useful as the metrics wired into it — visibility has to be designed in from the start, not bolted on after the pipeline works.",
    ],
    technologies: ["Java", "Spring Boot", "Kafka", "PostgreSQL", "Prometheus", "Kubernetes / k3s"],
    featured: true,
    links: {
      live: "https://relayhub-java.developer.cleanbrain.me",
      github: "https://github.com/cleanbrain-developer/relayhub-java",
    },
  },
  {
    slug: "english-core-speaking",
    name: "English Core Speaking",
    summary:
      "A full-stack English speaking practice service: a NestJS backend and Vue 3 frontend, with OAuth-based sign-in and an external AI/LLM API integration for evaluating spoken responses.",
    status: "live",
    role: "Sole designer and implementer.",
    problem:
      "Practicing spoken English needs fast, structured feedback, not just a transcript. That means integrating a real-time or near-real-time evaluation step into an otherwise ordinary CRUD-shaped product, without the AI dependency becoming a single point of failure for the whole product.",
    whyItMatters:
      "This project is the counterpart to RelayHub: a real, user-facing product rather than an integration lab, exercising ordinary full-stack concerns — auth, data modeling, deployment — at production scale rather than as a demo.",
    architecture:
      "A NestJS backend exposes a REST API over PostgreSQL via Prisma; a Vue 3 frontend consumes it. OAuth handles sign-in so the product never stores credentials itself. Spoken-response evaluation is delegated to an external AI/LLM API, called from the backend as a bounded, isolated dependency rather than something the frontend talks to directly. The whole stack is built and deployed as containers on the same k3s cluster as this site.",
    keyDecisions: [
      "NestJS + Prisma for the backend to keep the data-access layer typed and migration-driven rather than hand-rolled SQL.",
      "OAuth for authentication instead of a custom credential store, removing an entire class of security responsibility from the product.",
      "The AI/LLM evaluation call is isolated behind a backend boundary, not called from the client, so its latency and failure behavior can be controlled centrally.",
    ],
    failureHandling: [
      "The external AI/LLM dependency is treated as a fallible external call with its own latency and error budget, not assumed to always succeed.",
    ],
    observability: [
      "Standard backend request logging and k3s-level health checks; no dedicated metrics dashboard for this project yet (unlike RelayHub).",
    ],
    result:
      "Live in production on the same Hetzner k3s cluster that hosts this site, serving real practice sessions.",
    lessonsLearned: [
      "Treating an external AI API as an ordinary external dependency (with timeouts, error handling, and a fallback UX) matters more for reliability than the specific model or provider chosen.",
    ],
    technologies: ["NestJS", "Vue 3", "PostgreSQL", "Prisma", "OAuth", "Kubernetes / k3s"],
    featured: true,
    links: {
      live: "https://english-core-speaking.cleanbrain.me",
      github: "https://github.com/cleanbrain-developer/english-core-speaking",
    },
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

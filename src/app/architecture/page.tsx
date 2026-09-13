import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Architecture",
  description: "Why these systems are shaped the way they are: event-driven integration, retry/DLQ, idempotency, and observability.",
  path: "/architecture",
});

const PRINCIPLES = [
  {
    title: "Event-driven integration over point-to-point calls",
    body: "RelayHub treats integration as ingest → validate → transform → deliver, with Kafka decoupling producers from consumers. A slow or unavailable downstream target degrades that target's delivery, not the whole pipeline.",
  },
  {
    title: "Retry and DLQ as first-class outcomes, not error handling as an afterthought",
    body: "A delivery failure is an expected outcome, not an exception to route around. Bounded retries, then a dead-letter path with enough context to diagnose and replay, mean a failure is always something a human can act on later — not silently dropped or retried forever.",
  },
  {
    title: "Idempotency and ordering where they actually matter",
    body: "Concurrency without an ordering guarantee is how the race condition in “A Race Condition in Distributed Delivery Processing” (Case Studies) happened. Where two related events can race, per-entity ordering (not a global lock) is usually the cheapest fix that preserves throughput.",
  },
  {
    title: "Observability as part of the design, not bolted on after",
    body: "RelayHub's admin console is backed by Prometheus metrics fed by continuous synthetic traffic (relayhub-demo-systems), so throughput, latency, and failure rate are visible even without live production integrations.",
  },
  {
    title: "Evidence over simulation, once evidence is actually available",
    body: "This site's RelayHub Live Monitoring page used to be a client-side mock of RelayHub's pipeline; it now reads relayhub-java's real, public delivery/DLQ/metrics endpoints directly, scoped by CORS to exactly this origin. A simulation is worth building only until the real thing can be shown safely — once it can, showing the real thing is strictly more convincing.",
  },
  {
    title: "Batch vs. real-time is a deliberate choice, not a default",
    body: "“Legacy State vs. New Configuration in Batch Processing” (Case Studies) is a reminder that a batch job's assumptions about record shape have to account for records created under an older configuration — a schema or config change isn't finished until existing records are accounted for, not just new ones.",
  },
] as const;

export default function ArchitecturePage() {
  return (
    <Container>
      <section className="py-16 sm:py-20">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Architecture
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          Not a diagram gallery — the reasoning behind why the projects and case studies on this
          site are shaped the way they are.
        </p>
      </section>
      <div className="space-y-8 pb-20">
        {PRINCIPLES.map((principle) => (
          <section
            key={principle.title}
            className="border-t border-border pt-8 first:border-t-0 first:pt-0"
          >
            <h2 className="text-lg font-semibold text-foreground">{principle.title}</h2>
            <p className="mt-2 max-w-2xl text-muted">{principle.body}</p>
          </section>
        ))}
      </div>
    </Container>
  );
}

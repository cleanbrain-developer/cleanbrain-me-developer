import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { ArchitectureDiagram, type DiagramEdge, type DiagramNode } from "@/components/project/architecture-diagram";
import { relayHubDiagramNodes, relayHubDiagramEdges, relayHubDiagramSize } from "@/content/relayhub-architecture";
import { retryDlqDiagramNodes, retryDlqDiagramEdges, retryDlqDiagramSize } from "@/content/retry-dlq-flow";
import { observabilityDiagramNodes, observabilityDiagramEdges, observabilityDiagramSize } from "@/content/observability-flow";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Architecture",
  description: "Why these systems are shaped the way they are: event-driven integration, retry/DLQ, idempotency, and observability.",
  path: "/architecture",
});

interface Principle {
  title: string;
  body: string;
  diagram?: { nodes: DiagramNode[]; edges: DiagramEdge[]; width: number; height: number; label: string };
}

const PRINCIPLES: Principle[] = [
  {
    title: "Event-driven integration over point-to-point calls",
    body: "RelayHub treats integration as ingest → validate → transform → deliver, with Kafka decoupling producers from consumers. A slow or unavailable downstream target degrades that target's delivery, not the whole pipeline.",
    diagram: {
      nodes: relayHubDiagramNodes,
      edges: relayHubDiagramEdges,
      ...relayHubDiagramSize,
      label: "RelayHub's event-driven pipeline: Source through Kafka, Validate, Transform, Deliver to Target, with a Retry, DLQ, Replay recovery path",
    },
  },
  {
    title: "Retry and DLQ as first-class outcomes, not error handling as an afterthought",
    body: "A delivery failure is an expected outcome, not an exception to route around. Bounded retries, then a dead-letter path with enough context to diagnose and replay, mean a failure is always something a human can act on later — not silently dropped or retried forever.",
    diagram: {
      nodes: retryDlqDiagramNodes,
      edges: retryDlqDiagramEdges,
      ...retryDlqDiagramSize,
      label: "Retry and DLQ recovery path: Deliver succeeds directly to Target, or retries, moves to DLQ, and replays back to Target",
    },
  },
  {
    title: "Idempotency and ordering where they actually matter",
    body: "Concurrency without an ordering guarantee is how the race condition in “A Race Condition in Distributed Delivery Processing” (Case Studies) happened. Where two related events can race, per-entity ordering (not a global lock) is usually the cheapest fix that preserves throughput.",
  },
  {
    title: "Observability as part of the design, not bolted on after",
    body: "RelayHub's admin console is backed by Prometheus metrics fed by continuous synthetic traffic (relayhub-demo-systems), so throughput, latency, and failure rate are visible even without live production integrations.",
    diagram: {
      nodes: observabilityDiagramNodes,
      edges: observabilityDiagramEdges,
      ...observabilityDiagramSize,
      label: "How metrics reach this site: relayhub-java's Actuator is scraped by an internal-only Prometheus, queried through relayhub-java's Metrics Proxy, and fetched by this site over CORS",
    },
  },
  {
    title: "Evidence over simulation, once evidence is actually available",
    body: "This site's RelayHub Live Monitoring page used to be a client-side mock of RelayHub's pipeline; it now reads relayhub-java's real, public delivery/DLQ/metrics endpoints directly, scoped by CORS to exactly this origin. A simulation is worth building only until the real thing can be shown safely — once it can, showing the real thing is strictly more convincing.",
  },
  {
    title: "Batch vs. real-time is a deliberate choice, not a default",
    body: "“Legacy State vs. New Configuration in Batch Processing” (Case Studies) is a reminder that a batch job's assumptions about record shape have to account for records created under an older configuration — a schema or config change isn't finished until existing records are accounted for, not just new ones.",
  },
];

export default function ArchitecturePage() {
  return (
    <Container>
      <section className="py-16 sm:py-20">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Architecture
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          Not just a diagram gallery — the reasoning behind why the projects and case studies on
          this site are shaped the way they are, illustrated where a picture clarifies the shape
          faster than prose.
        </p>
      </section>
      <div className="pb-20">
        {PRINCIPLES.map((principle, index) => (
          <section
            key={principle.title}
            className="grid grid-cols-1 gap-3 border-t border-border py-10 first:border-t-0 first:pt-0 lg:grid-cols-[88px_1fr] lg:gap-10"
          >
            <span className="font-mono text-3xl font-semibold text-border sm:text-4xl">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{principle.title}</h2>
              <p className="mt-2 max-w-2xl text-muted">{principle.body}</p>
              {principle.diagram && (
                <div className="mt-4">
                  <ArchitectureDiagram
                    nodes={principle.diagram.nodes}
                    edges={principle.diagram.edges}
                    width={principle.diagram.width}
                    height={principle.diagram.height}
                    label={principle.diagram.label}
                  />
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </Container>
  );
}

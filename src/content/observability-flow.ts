import type { DiagramEdge, DiagramNode } from "@/components/project/architecture-diagram";

/**
 * How this site's Live Monitoring numbers actually reach the browser — verified
 * against relayhub-java's real `MetricsController` and `cleanbrain-me-infra`'s
 * README (`kubernetes/apps/relayhub-java/prometheus/`), not assumed. Prometheus
 * has no public hostname; relayhub-java's own API is the only thing that talks
 * to it, and this site only ever talks to relayhub-java's API (CORS-scoped).
 */
export const observabilityDiagramNodes: DiagramNode[] = [
  { id: "actuator", label: "Actuator", x: 80, y: 60 },
  { id: "prometheus", label: "Prometheus", x: 280, y: 60, tone: "accent" },
  { id: "proxy", label: "Metrics Proxy", x: 480, y: 60 },
  { id: "site", label: "This Site", x: 680, y: 60, tone: "success" },
];

export const observabilityDiagramEdges: DiagramEdge[] = [
  { from: "actuator", to: "prometheus" },
  { from: "prometheus", to: "proxy" },
  { from: "proxy", to: "site" },
];

export const observabilityDiagramSize = { width: 760, height: 120 };

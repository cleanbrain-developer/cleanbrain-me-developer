import type { DiagramEdge, DiagramNode } from "@/components/project/architecture-diagram";

/**
 * RelayHub's real pipeline shape (see `projects.ts`'s `architecture` field for
 * the prose version): Kafka-backed ingest → validate → transform → deliver,
 * with a bounded retry → dead-letter → replay path on failure. Dashed edges
 * are the failure path; solid edges are the happy path.
 */
export const relayHubDiagramNodes: DiagramNode[] = [
  { id: "source", label: "Source", x: 70, y: 60 },
  { id: "kafka", label: "Kafka", x: 220, y: 60 },
  { id: "validate", label: "Validate", x: 370, y: 60 },
  { id: "transform", label: "Transform", x: 520, y: 60 },
  { id: "deliver", label: "Deliver", x: 670, y: 60, tone: "accent" },
  { id: "target", label: "Target", x: 820, y: 60, tone: "success" },
  { id: "retry", label: "Retry", x: 670, y: 160 },
  { id: "dlq", label: "DLQ", x: 670, y: 260, tone: "danger" },
  { id: "replay", label: "Replay", x: 820, y: 260 },
];

export const relayHubDiagramEdges: DiagramEdge[] = [
  { from: "source", to: "kafka" },
  { from: "kafka", to: "validate" },
  { from: "validate", to: "transform" },
  { from: "transform", to: "deliver" },
  { from: "deliver", to: "target" },
  { from: "deliver", to: "retry", dashed: true },
  { from: "retry", to: "dlq", dashed: true },
  { from: "dlq", to: "replay", dashed: true },
  { from: "replay", to: "target", dashed: true },
];

export const relayHubDiagramSize = { width: 930, height: 320 };

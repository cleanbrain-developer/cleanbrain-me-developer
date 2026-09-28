import type { DiagramEdge, DiagramNode } from "@/components/project/architecture-diagram";

/**
 * A zoomed-in view of RelayHub's failure/recovery path — the same `deliver`
 * onward slice already visible in `relayhub-architecture.ts`'s full pipeline
 * diagram, isolated here so the "Retry and DLQ" principle doesn't have to
 * reuse the whole ingest→deliver flow just to make this one point.
 */
export const retryDlqDiagramNodes: DiagramNode[] = [
  { id: "deliver", label: "Deliver", x: 90, y: 60, tone: "accent" },
  { id: "target", label: "Target", x: 340, y: 60, tone: "success" },
  { id: "retry", label: "Retry", x: 90, y: 160 },
  { id: "dlq", label: "DLQ", x: 90, y: 260, tone: "danger" },
  { id: "replay", label: "Replay", x: 340, y: 260 },
];

export const retryDlqDiagramEdges: DiagramEdge[] = [
  { from: "deliver", to: "target" },
  { from: "deliver", to: "retry", dashed: true },
  { from: "retry", to: "dlq", dashed: true },
  { from: "dlq", to: "replay", dashed: true },
  { from: "replay", to: "target", dashed: true },
];

export const retryDlqDiagramSize = { width: 460, height: 320 };

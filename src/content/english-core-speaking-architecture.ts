import type { DiagramEdge, DiagramNode } from "@/components/project/architecture-diagram";

/**
 * English Core Speaking's real request shape (see `projects.ts`'s
 * `architecture` field for the prose version): a Vue frontend never talks to
 * data stores or the AI provider directly — everything is bounded behind the
 * NestJS backend, which is the point (credential boundary, backend boundary,
 * isolated external dependency).
 */
export const englishCoreSpeakingDiagramNodes: DiagramNode[] = [
  { id: "user", label: "User", x: 80, y: 150 },
  { id: "frontend", label: "Vue Frontend", x: 280, y: 150 },
  { id: "backend", label: "NestJS Backend", x: 480, y: 150, tone: "accent" },
  { id: "postgres", label: "PostgreSQL", x: 700, y: 60 },
  { id: "oauth", label: "OAuth Provider", x: 700, y: 150 },
  { id: "ai", label: "AI / LLM API", x: 700, y: 240 },
];

export const englishCoreSpeakingDiagramEdges: DiagramEdge[] = [
  { from: "user", to: "frontend" },
  { from: "frontend", to: "backend" },
  { from: "backend", to: "postgres" },
  { from: "backend", to: "oauth" },
  { from: "backend", to: "ai" },
];

export const englishCoreSpeakingDiagramSize = { width: 820, height: 300 };

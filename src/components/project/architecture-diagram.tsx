export interface DiagramNode {
  id: string;
  label: string;
  x: number;
  y: number;
  tone?: "default" | "accent" | "success" | "danger";
}

export interface DiagramEdge {
  from: string;
  to: string;
  dashed?: boolean;
}

const NODE_WIDTH = 140;
const NODE_HEIGHT = 44;

const TONE_STROKE: Record<NonNullable<DiagramNode["tone"]>, string> = {
  default: "var(--border)",
  accent: "var(--accent)",
  success: "var(--success)",
  danger: "var(--destructive)",
};

/** Where a straight line from `from` to `to` crosses `to`'s rectangle boundary, so edges stop at the box edge instead of running into its center. */
function boundaryPoint(from: DiagramNode, to: DiagramNode): { x: number; y: number } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (dx === 0 && dy === 0) return to;
  const scaleX = dx === 0 ? Infinity : NODE_WIDTH / 2 / Math.abs(dx);
  const scaleY = dy === 0 ? Infinity : NODE_HEIGHT / 2 / Math.abs(dy);
  const scale = Math.min(scaleX, scaleY);
  return { x: to.x - dx * scale, y: to.y - dy * scale };
}

/**
 * A small, static (no animation — a one-time-render diagram doesn't need
 * it), hand-placed SVG flow diagram: boxes and arrows, theme-colored via
 * this site's existing CSS custom properties. Deliberately separate from
 * `LiveTopology`'s hub-spoke pulse engine (`live-topology.tsx`) — a
 * different shape (linear/branching flow, not animated hub-spoke) — so
 * nothing here touches that file or its regression surface.
 */
export function ArchitectureDiagram({
  nodes,
  edges,
  width,
  height,
  label,
}: {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  width: number;
  height: number;
  label: string;
}) {
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  // Fixed pixel width, not "100%": a diagram with real labels needs to stay
  // legible, not shrink to fit a narrow viewport (the same trade-off the
  // Recent Activity table already makes on /lab/relayhub — scroll within a
  // bordered box rather than shrink text below readable).
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-background">
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={label}
      className="block"
    >
      <defs>
        <marker id="diagram-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" />
        </marker>
      </defs>

      {edges.map((edge, i) => {
        const from = byId[edge.from];
        const to = byId[edge.to];
        if (!from || !to) return null;
        const start = boundaryPoint(to, from);
        const end = boundaryPoint(from, to);
        return (
          <line
            key={i}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke="var(--muted)"
            strokeWidth={1.5}
            strokeDasharray={edge.dashed ? "5 4" : undefined}
            markerEnd="url(#diagram-arrow)"
          />
        );
      })}

      {nodes.map((node) => (
        <g key={node.id}>
          <rect
            x={node.x - NODE_WIDTH / 2}
            y={node.y - NODE_HEIGHT / 2}
            width={NODE_WIDTH}
            height={NODE_HEIGHT}
            rx={8}
            fill="var(--surface)"
            stroke={TONE_STROKE[node.tone ?? "default"]}
            strokeWidth={2}
          />
          <text
            x={node.x}
            y={node.y + 4}
            textAnchor="middle"
            fontSize={12}
            fontWeight={600}
            fill="var(--foreground)"
          >
            {node.label}
          </text>
        </g>
      ))}
    </svg>
    </div>
  );
}

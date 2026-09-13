import type { RelayHubSeriesPoint } from "@/lib/relayhub/live-observability";

const VIEW_WIDTH = 240;
const VIEW_HEIGHT = 56;

export function Sparkline({
  points,
  color = "#5b8def",
}: {
  points: RelayHubSeriesPoint[];
  color?: string;
}) {
  if (points.length < 2) {
    return <div className="h-14 w-full" aria-hidden />;
  }

  const values = points.map((p) => p.value);
  const max = Math.max(...values, 0);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const step = VIEW_WIDTH / (points.length - 1);

  const coords = points
    .map((p, i) => {
      const x = i * step;
      const y = VIEW_HEIGHT - ((p.value - min) / range) * (VIEW_HEIGHT - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const latest = values.at(-1) ?? 0;
  const latestY = VIEW_HEIGHT - ((latest - min) / range) * (VIEW_HEIGHT - 4) - 2;

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      preserveAspectRatio="none"
      className="h-14 w-full"
      role="img"
      aria-label={`Sparkline, latest value ${latest.toFixed(1)}`}
    >
      <polyline points={coords} fill="none" stroke={color} strokeWidth="2" />
      <circle cx={VIEW_WIDTH} cy={latestY} r="3" fill={color}>
        <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

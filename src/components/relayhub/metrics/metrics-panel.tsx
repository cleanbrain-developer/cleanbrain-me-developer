import type { RelayHubMetrics } from "@/lib/relayhub/types";

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function MetricsPanel({ metrics }: { metrics: RelayHubMetrics | undefined }) {
  const rows = [
    { label: "Requests / sec", value: metrics ? metrics.requestsPerSecond.toFixed(1) : "–" },
    { label: "Success rate", value: metrics ? formatPercent(metrics.successRate) : "–" },
    { label: "Failure rate", value: metrics ? formatPercent(metrics.failureRate) : "–" },
    { label: "P95 latency", value: metrics ? `${metrics.p95LatencyMs} ms` : "–" },
    { label: "Retry count", value: metrics ? String(metrics.retryCount) : "–" },
    { label: "DLQ count", value: metrics ? String(metrics.dlqCount) : "–" },
  ];

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">Metrics</h3>
        <span className="rounded-full border border-border px-2 py-0.5 font-mono text-xs text-accent">
          Synthetic demo data
        </span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-xs text-muted">{row.label}</dt>
            <dd className="mt-1 font-mono text-lg text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

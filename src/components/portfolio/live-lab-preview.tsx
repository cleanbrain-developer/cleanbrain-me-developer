const SYNTHETIC_METRICS = [
  { label: "Requests / sec", value: "24" },
  { label: "Success rate", value: "98.2%" },
  { label: "P95 latency", value: "214 ms" },
  { label: "Retries", value: "2" },
  { label: "DLQ", value: "1" },
] as const;

export function LiveLabPreview() {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-xs uppercase tracking-wider text-muted">
          RelayHub pipeline snapshot
        </p>
        <span className="rounded-full border border-border px-2 py-0.5 font-mono text-xs text-accent">
          Synthetic demo data
        </span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {SYNTHETIC_METRICS.map((metric) => (
          <div key={metric.label}>
            <dt className="text-xs text-muted">{metric.label}</dt>
            <dd className="mt-1 font-mono text-lg text-foreground">{metric.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

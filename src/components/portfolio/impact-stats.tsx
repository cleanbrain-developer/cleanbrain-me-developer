import type { ImpactStat } from "@/content/types";

export function ImpactStats({ items }: { items: ImpactStat[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-border bg-surface p-5">
          <p className="whitespace-nowrap font-mono text-2xl font-semibold text-foreground sm:text-3xl">
            {item.value}
          </p>
          <p className="mt-1 text-xs uppercase tracking-wide text-accent">{item.label}</p>
          <p className="mt-2 text-sm text-muted">{item.detail}</p>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import {
  fetchRelayHubLiveObservability,
  type RelayHubLiveObservability,
} from "@/lib/relayhub/live-observability";
import { Sparkline } from "@/components/relayhub/live-observability/sparkline";

const REFRESH_INTERVAL_MS = 10_000;

const STATUS_COLOR: Record<string, string> = {
  success: "#34d399",
  failed: "#f87171",
};

function StatTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "danger";
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p
        className={`mt-2 font-mono text-3xl font-semibold sm:text-4xl ${
          tone === "danger" && value !== "0" ? "text-red-400" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function LiveDashboard() {
  const [data, setData] = useState<RelayHubLiveObservability>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  function refresh() {
    fetchRelayHubLiveObservability()
      .then((result) => {
        setData(result);
        setError(undefined);
      })
      .catch(() => setError("relayhub-java's live monitoring data is currently unavailable."))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    fetchRelayHubLiveObservability()
      .then((result) => {
        setData(result);
        setError(undefined);
      })
      .catch(() => setError("relayhub-java's live monitoring data is currently unavailable."))
      .finally(() => setIsLoading(false));

    intervalRef.current = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, []);

  const ingressSeries = data?.ingressSeries[0]?.points ?? [];

  return (
    <div className="rounded-xl border border-border bg-surface p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
          </span>
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">
            relayhub-java — Live Monitoring
          </h2>
        </div>
        <a
          href="https://relayhub-java.developer.cleanbrain.me"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-accent hover:underline"
        >
          Open relayhub-java &rarr;
        </a>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Real production telemetry, refreshed automatically every 10 seconds — not a simulation.
        Synthetic traffic against the real service is generated continuously by
        relayhub-demo-systems.
      </p>

      {isLoading ? (
        <p className="mt-6 text-sm text-muted">Connecting to relayhub-java…</p>
      ) : error && !data ? (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted">{error}</p>
          <button
            type="button"
            onClick={refresh}
            className="rounded-md border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-surface-hover"
          >
            Retry
          </button>
        </div>
      ) : data ? (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile label="Succeeded" value={data.summary.succeeded.toLocaleString()} />
            <StatTile label="Pending" value={data.summary.pending.toLocaleString()} />
            <StatTile
              label="Dead (DLQ)"
              value={data.summary.dead.toLocaleString()}
              tone="danger"
            />
            <StatTile
              label="Ingress events / min"
              value={data.ingressEventsPerMinute.toFixed(1)}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted">
                Ingress events / min — last 30 min
              </p>
              <Sparkline points={ingressSeries} color="#5b8def" />
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted">
                Delivery attempts / min by status — last 30 min
              </p>
              <div className="space-y-2">
                {data.deliveryAttemptSeries.length > 0 ? (
                  data.deliveryAttemptSeries.map((series) => (
                    <div key={series.label}>
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: STATUS_COLOR[series.label] ?? "#9aa3ad" }}
                        />
                        {series.label}
                      </div>
                      <Sparkline
                        points={series.points}
                        color={STATUS_COLOR[series.label] ?? "#9aa3ad"}
                      />
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-sm text-muted">No delivery activity in this window.</p>
                )}
              </div>
            </div>
          </div>

          {data.targets.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                Delivery targets
              </h3>
              <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {data.targets.map((target) => (
                  <li
                    key={target.id}
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-foreground">{target.name}</span>{" "}
                    <span className="text-muted">— {target.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
            <span>
              {error
                ? "Last successful update: " + new Date(data.fetchedAt).toLocaleTimeString()
                : "Updated " + new Date(data.fetchedAt).toLocaleTimeString()}
            </span>
            <button
              type="button"
              onClick={refresh}
              className="rounded-md border border-border px-3 py-1 font-medium text-foreground hover:bg-surface-hover"
            >
              Refresh now
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

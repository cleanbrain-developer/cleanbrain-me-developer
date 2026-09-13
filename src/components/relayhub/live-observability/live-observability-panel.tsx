"use client";

import { useEffect, useState } from "react";
import {
  fetchRelayHubLiveObservability,
  type RelayHubLiveObservability,
} from "@/lib/relayhub/live-observability";

export function LiveObservabilityPanel() {
  const [data, setData] = useState<RelayHubLiveObservability>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  function refresh() {
    setIsLoading(true);
    setError(undefined);
    fetchRelayHubLiveObservability()
      .then(setData)
      .catch(() => setError("relayhub-java's live observability data is currently unavailable."))
      .finally(() => setIsLoading(false));
  }

  // isLoading already starts true, so the effect body itself never calls
  // setState synchronously — every setState call below happens inside a
  // promise callback, not the effect body.
  useEffect(() => {
    fetchRelayHubLiveObservability()
      .then(setData)
      .catch(() => setError("relayhub-java's live observability data is currently unavailable."))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted">
            relayhub-java production telemetry
          </p>
          <p className="mt-1 text-sm text-muted">
            The real service behind this Lab, not a simulation — synthetic traffic against it is
            generated continuously by{" "}
            <a
              href="https://relayhub-java.developer.cleanbrain.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              relayhub-java
            </a>
            &apos;s own demo systems.
          </p>
        </div>
        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 font-mono text-xs text-emerald-400">
          Live · real data
        </span>
      </div>

      {isLoading ? (
        <p className="mt-4 text-sm text-muted">Loading live telemetry…</p>
      ) : error ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
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
          <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <dt className="text-xs text-muted">Succeeded</dt>
              <dd className="mt-1 font-mono text-lg text-foreground">
                {data.summary.succeeded.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Pending</dt>
              <dd className="mt-1 font-mono text-lg text-foreground">
                {data.summary.pending.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Dead (DLQ)</dt>
              <dd className="mt-1 font-mono text-lg text-foreground">
                {data.summary.dead.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Ingress events / min</dt>
              <dd className="mt-1 font-mono text-lg text-foreground">
                {data.ingressEventsPerMinute.toFixed(1)}
              </dd>
            </div>
          </dl>

          {data.targets.length > 0 ? (
            <div className="mt-5">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">
                Delivery targets
              </h4>
              <ul className="mt-2 space-y-1 text-sm text-muted">
                {data.targets.map((target) => (
                  <li key={target.id}>
                    <span className="font-medium text-foreground">{target.name}</span> —{" "}
                    {target.description}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-4 flex items-center justify-between text-xs text-muted">
            <span>Fetched {new Date(data.fetchedAt).toLocaleTimeString()}</span>
            <button
              type="button"
              onClick={refresh}
              className="rounded-md border border-border px-3 py-1 font-medium text-foreground hover:bg-surface-hover"
            >
              Refresh
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

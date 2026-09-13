const RELAYHUB_JAVA_BASE_URL = "https://relayhub-java.developer.cleanbrain.me";

export interface RelayHubLiveSummary {
  succeeded: number;
  pending: number;
  dead: number;
}

export interface RelayHubLiveTarget {
  id: string;
  key: string;
  name: string;
  description: string;
  status: string;
}

export interface RelayHubLiveObservability {
  summary: RelayHubLiveSummary;
  targets: RelayHubLiveTarget[];
  ingressEventsPerMinute: number;
  fetchedAt: string;
}

interface PrometheusInstantResult {
  status: string;
  data?: {
    result: { value: [number, string] }[];
  };
}

async function fetchIngressEventsPerMinute(): Promise<number> {
  const query = "sum(rate(relayhub_ingress_events_total[5m]))*60";
  const response = await fetch(
    `${RELAYHUB_JAVA_BASE_URL}/api/metrics/query?query=${encodeURIComponent(query)}`,
  );
  if (!response.ok) throw new Error(`Prometheus query failed: ${response.status}`);
  const body = (await response.json()) as PrometheusInstantResult;
  const value = body.data?.result[0]?.value[1];
  return value ? Number(value) : 0;
}

/**
 * Reads relayhub-java's real, public, read-only observability endpoints directly from the
 * browser (see docs/decisions/ADR-0004-live-relayhub-observability.md) -- this is the actual
 * production service, not MockRelayHubAdapter. Deliberately kept separate from RelayHubAdapter:
 * that interface exists for the interactive Lab (generate/replay a synthetic event), while this
 * is a one-way, read-only view of real telemetry with no equivalent "mock" implementation to be
 * an interface for.
 */
export async function fetchRelayHubLiveObservability(): Promise<RelayHubLiveObservability> {
  const [summary, targets, ingressEventsPerMinute] = await Promise.all([
    fetch(`${RELAYHUB_JAVA_BASE_URL}/api/deliveries/summary`).then((res) => {
      if (!res.ok) throw new Error(`Failed to load delivery summary: ${res.status}`);
      return res.json() as Promise<RelayHubLiveSummary>;
    }),
    fetch(`${RELAYHUB_JAVA_BASE_URL}/api/targets`).then((res) => {
      if (!res.ok) throw new Error(`Failed to load targets: ${res.status}`);
      return res.json() as Promise<RelayHubLiveTarget[]>;
    }),
    fetchIngressEventsPerMinute(),
  ]);

  return { summary, targets, ingressEventsPerMinute, fetchedAt: new Date().toISOString() };
}

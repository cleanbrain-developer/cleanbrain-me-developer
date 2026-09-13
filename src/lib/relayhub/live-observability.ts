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

export interface RelayHubSeriesPoint {
  timestamp: number;
  value: number;
}

export interface RelayHubSeries {
  label: string;
  points: RelayHubSeriesPoint[];
}

export interface RelayHubLiveObservability {
  summary: RelayHubLiveSummary;
  targets: RelayHubLiveTarget[];
  ingressEventsPerMinute: number;
  ingressSeries: RelayHubSeries[];
  deliveryAttemptSeries: RelayHubSeries[];
  fetchedAt: string;
}

export interface PrometheusInstantResult {
  data?: { result: { value: [number, string] }[] };
}

export interface PrometheusRangeResult {
  data?: { result: { metric: Record<string, string>; values: [number, string][] }[] };
}

/** Pure, unit-testable: pulls the first (and only expected) scalar out of a Prometheus instant query response. */
export function parseInstantValue(body: PrometheusInstantResult): number {
  const value = body.data?.result[0]?.value[1];
  return value ? Number(value) : 0;
}

/** Pure, unit-testable: reshapes a Prometheus range query response into this app's RelayHubSeries shape. */
export function parseRangeSeries(
  body: PrometheusRangeResult,
  seriesLabel: (metric: Record<string, string>) => string,
): RelayHubSeries[] {
  return (body.data?.result ?? []).map((series) => ({
    label: seriesLabel(series.metric),
    points: series.values.map(([timestamp, value]) => ({
      timestamp,
      value: Number(value),
    })),
  }));
}

async function queryInstant(query: string): Promise<number> {
  const response = await fetch(
    `${RELAYHUB_JAVA_BASE_URL}/api/metrics/query?query=${encodeURIComponent(query)}`,
  );
  if (!response.ok) throw new Error(`Prometheus instant query failed: ${response.status}`);
  return parseInstantValue((await response.json()) as PrometheusInstantResult);
}

async function queryRange(
  query: string,
  rangeMinutes: number,
  stepSeconds: number,
  seriesLabel: (metric: Record<string, string>) => string,
): Promise<RelayHubSeries[]> {
  const end = Math.floor(Date.now() / 1000);
  const start = end - rangeMinutes * 60;
  const params = new URLSearchParams({
    query,
    start: String(start),
    end: String(end),
    step: String(stepSeconds),
  });
  const response = await fetch(`${RELAYHUB_JAVA_BASE_URL}/api/metrics/query_range?${params}`);
  if (!response.ok) throw new Error(`Prometheus range query failed: ${response.status}`);
  return parseRangeSeries((await response.json()) as PrometheusRangeResult, seriesLabel);
}

/**
 * Reads relayhub-java's real, public, read-only observability endpoints directly from the
 * browser (see docs/decisions/ADR-0004-live-relayhub-observability.md) -- this is the actual
 * production service, driving the "RelayHub Live Monitoring" dashboard at /lab/relayhub. There
 * is no mock/adapter layer for this data: it is a one-way, real-time view of a real system, not
 * a simulation (see ADR-0005 for why the earlier interactive Mock Lab was removed).
 */
export async function fetchRelayHubLiveObservability(): Promise<RelayHubLiveObservability> {
  const [summary, targets, ingressEventsPerMinute, ingressSeries, deliveryAttemptSeries] =
    await Promise.all([
      fetch(`${RELAYHUB_JAVA_BASE_URL}/api/deliveries/summary`).then((res) => {
        if (!res.ok) throw new Error(`Failed to load delivery summary: ${res.status}`);
        return res.json() as Promise<RelayHubLiveSummary>;
      }),
      fetch(`${RELAYHUB_JAVA_BASE_URL}/api/targets`).then((res) => {
        if (!res.ok) throw new Error(`Failed to load targets: ${res.status}`);
        return res.json() as Promise<RelayHubLiveTarget[]>;
      }),
      queryInstant("sum(rate(relayhub_ingress_events_total[5m]))*60"),
      queryRange("sum(rate(relayhub_ingress_events_total[5m]))*60", 30, 60, () => "events/min"),
      queryRange(
        "sum by (status) (rate(relayhub_delivery_attempts_total[5m]) * 60)",
        30,
        60,
        (metric) => metric.status ?? "unknown",
      ),
    ]);

  return {
    summary,
    targets,
    ingressEventsPerMinute,
    ingressSeries,
    deliveryAttemptSeries,
    fetchedAt: new Date().toISOString(),
  };
}

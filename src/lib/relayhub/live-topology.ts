const RELAYHUB_JAVA_BASE_URL = "https://relayhub-java.developer.cleanbrain.me";

export interface RelayHubSource {
  id: string;
  key: string;
  name: string;
  status: string;
}

export interface RelayHubTarget {
  id: string;
  key: string;
  name: string;
  status: string;
}

export interface RelayHubSubscription {
  id: string;
  sourceKey: string;
  sourceEventKey: string;
  targetKey: string;
  status: string;
}

export interface RelayHubDlqSchedule {
  intervalMs: number;
  lastRunAt: string;
  nextRunAt: string;
}

export interface RelayHubDeliverySummary {
  pending: number;
  succeeded: number;
  dead: number;
}

/**
 * One activity event as pushed over relayhub-java's own SSE stream
 * (see LiveActivityController.java / LiveActivityBroadcaster.java in that repo) --
 * this app is a real subscriber to it, not a poller.
 */
export interface RelayHubLiveEvent {
  stage: "ingress" | "delivery" | "dlq";
  sourceKey: string;
  eventKey: string | null;
  targetKey: string | null;
  status: "success" | "failed" | "dead" | null;
  replay: boolean;
  attemptId: string | null;
  at: string;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${RELAYHUB_JAVA_BASE_URL}${path}`);
  if (!response.ok) throw new Error(`${path} failed: ${response.status}`);
  return (await response.json()) as T;
}

export async function fetchTopology(): Promise<{
  sources: RelayHubSource[];
  targets: RelayHubTarget[];
  subscriptions: RelayHubSubscription[];
  summary: RelayHubDeliverySummary;
  dlqSchedule: RelayHubDlqSchedule;
}> {
  const [sources, targets, subscriptions, summary, dlqSchedule] = await Promise.all([
    getJson<RelayHubSource[]>("/api/sources"),
    getJson<RelayHubTarget[]>("/api/targets"),
    getJson<RelayHubSubscription[]>("/api/subscriptions"),
    getJson<RelayHubDeliverySummary>("/api/deliveries/summary"),
    getJson<RelayHubDlqSchedule>("/api/dlq/schedule"),
  ]);

  return {
    sources: sources.filter((s) => s.status === "ACTIVE"),
    targets: targets.filter((t) => t.status === "ACTIVE"),
    subscriptions: subscriptions.filter((s) => s.status === "ACTIVE"),
    summary,
    dlqSchedule,
  };
}

export function openLiveActivityStream(
  onEvent: (event: RelayHubLiveEvent) => void,
  onConnectionChange: (connected: boolean) => void,
): () => void {
  const source = new EventSource(`${RELAYHUB_JAVA_BASE_URL}/api/live/stream`);
  source.onopen = () => onConnectionChange(true);
  source.onerror = () => onConnectionChange(false);
  source.addEventListener("activity", (e) => {
    onEvent(JSON.parse((e as MessageEvent).data) as RelayHubLiveEvent);
  });
  return () => source.close();
}

import type { RelayHubAdapter } from "@/lib/relayhub/adapter";
import type { EventExecution, GenerateEventInput, RelayHubMetrics } from "@/lib/relayhub/types";

/**
 * Calls a real RelayHub demo API implementing the contract documented in
 * docs/decisions/ADR-0002-relayhub-http-adapter-contract.md. Not used by
 * default (see src/lib/relayhub/service.ts) — no such API is deployed yet.
 * Response bodies are trusted to match EventExecution/RelayHubMetrics as-is;
 * add runtime validation once a real API exists to validate against.
 */
export class HttpRelayHubAdapter implements RelayHubAdapter {
  constructor(private readonly baseUrl: string) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
    if (!response.ok) {
      throw new Error(`RelayHub API error: ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as T;
  }

  generateEvent(input: GenerateEventInput): Promise<EventExecution> {
    return this.request<EventExecution>("/events", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  getRecentEvents(): Promise<EventExecution[]> {
    return this.request<EventExecution[]>("/events?limit=10");
  }

  async getEvent(eventId: string): Promise<EventExecution | undefined> {
    try {
      return await this.request<EventExecution>(`/events/${eventId}`);
    } catch {
      return undefined;
    }
  }

  getMetrics(): Promise<RelayHubMetrics> {
    return this.request<RelayHubMetrics>("/metrics");
  }

  replayDlq(eventId: string): Promise<EventExecution> {
    return this.request<EventExecution>(`/events/${eventId}/replay`, { method: "POST" });
  }
}

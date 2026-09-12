import type { EventExecution, GenerateEventInput, RelayHubMetrics } from "@/lib/relayhub/types";

export interface RelayHubAdapter {
  generateEvent(input: GenerateEventInput): Promise<EventExecution>;
  getRecentEvents(): Promise<EventExecution[]>;
  getEvent(eventId: string): Promise<EventExecution | undefined>;
  getMetrics(): Promise<RelayHubMetrics>;
  replayDlq(eventId: string): Promise<EventExecution>;
}

export type PipelineStage =
  | "source"
  | "ingestion"
  | "validation"
  | "transformation"
  | "delivery"
  | "target";

export const PIPELINE_STAGES: PipelineStage[] = [
  "source",
  "ingestion",
  "validation",
  "transformation",
  "delivery",
  "target",
];

export type StageStatus = "pending" | "processing" | "success" | "failed" | "skipped";

export type EventExecutionStatus = "processing" | "success" | "failed" | "retrying" | "dlq";

export type EventType = "order.created" | "inventory.updated" | "customer.updated";

export type Scenario = "normal" | "target-500" | "timeout" | "validation-error";

export interface EventStageExecution {
  stage: PipelineStage;
  status: StageStatus;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  message?: string;
}

export interface EventExecutionError {
  stage: PipelineStage;
  message: string;
}

export interface EventExecution {
  id: string;
  traceId: string;
  eventType: EventType;
  scenario: Scenario;
  status: EventExecutionStatus;
  latencyMs?: number;
  retryCount: number;
  createdAt: string;
  completedAt?: string;
  payload: Record<string, unknown>;
  stages: EventStageExecution[];
  error?: EventExecutionError;
}

export interface RelayHubMetrics {
  requestsPerSecond: number;
  successRate: number;
  failureRate: number;
  p95LatencyMs: number;
  retryCount: number;
  dlqCount: number;
  sampledAt: string;
}

export interface GenerateEventInput {
  eventType: EventType;
  scenario: Scenario;
}

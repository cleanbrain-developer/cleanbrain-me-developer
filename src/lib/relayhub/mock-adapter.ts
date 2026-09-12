import type { RelayHubAdapter } from "@/lib/relayhub/adapter";
import type {
  EventExecution,
  EventExecutionError,
  EventExecutionStatus,
  EventStageExecution,
  EventType,
  GenerateEventInput,
  PipelineStage,
  RelayHubMetrics,
  StageStatus,
} from "@/lib/relayhub/types";

const MAX_STORED_EVENTS = 30;
const MAX_RETRIES = 3;
const NETWORK_DELAY_MS = 400;

function randomInt(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min));
}

function randomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildSyntheticPayload(eventType: EventType): Record<string, unknown> {
  switch (eventType) {
    case "order.created":
      return {
        orderId: randomId("SYN-ORDER"),
        items: randomInt(1, 5),
        totalAmount: Number((randomInt(1000, 25000) / 100).toFixed(2)),
      };
    case "inventory.updated":
      return { sku: randomId("SYN-SKU"), quantityDelta: randomInt(-20, 20) };
    case "customer.updated":
      return { customerId: randomId("SYN-CUST"), field: "email" };
  }
}

function percentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) return 0;
  const index = Math.min(
    sortedValues.length - 1,
    Math.floor(p * sortedValues.length),
  );
  return sortedValues[index];
}

class StageTimeline {
  private cursor: number;
  readonly startTime: number;
  readonly stages: EventStageExecution[] = [];

  constructor() {
    this.startTime = Date.now();
    this.cursor = this.startTime;
  }

  push(stage: PipelineStage, status: StageStatus, durationMs: number, message?: string) {
    const startedAt = new Date(this.cursor).toISOString();
    this.cursor += durationMs;
    const completedAt = new Date(this.cursor).toISOString();
    this.stages.push({ stage, status, startedAt, completedAt, durationMs, message });
  }

  get elapsedMs(): number {
    return this.cursor - this.startTime;
  }
}

function simulate(id: string, traceId: string, input: GenerateEventInput): EventExecution {
  const timeline = new StageTimeline();
  let status: EventExecutionStatus;
  let retryCount = 0;
  let error: EventExecutionError | undefined;

  timeline.push("source", "success", randomInt(5, 15));

  if (input.scenario === "validation-error") {
    timeline.push("ingestion", "success", randomInt(20, 50));
    const message = "Payload failed schema validation: missing required field.";
    timeline.push("validation", "failed", randomInt(15, 35), message);
    timeline.push("transformation", "skipped", 0, "Not reached — validation failed.");
    timeline.push("delivery", "skipped", 0, "Not reached — validation failed.");
    timeline.push("target", "skipped", 0, "Not reached — validation failed.");
    status = "failed";
    error = { stage: "validation", message };
  } else {
    timeline.push("ingestion", "success", randomInt(20, 50));
    timeline.push("validation", "success", randomInt(15, 35));
    timeline.push("transformation", "success", randomInt(20, 50));

    if (input.scenario === "normal") {
      timeline.push("delivery", "success", randomInt(40, 120));
      timeline.push("target", "success", randomInt(20, 60));
      status = "success";
    } else {
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const message =
          input.scenario === "timeout"
            ? `Delivery attempt ${attempt} timed out waiting for the target simulator.`
            : `Delivery attempt ${attempt} failed: target simulator responded 500.`;
        const duration = input.scenario === "timeout" ? randomInt(300, 600) : randomInt(80, 200);
        timeline.push("delivery", "failed", duration, message);
        retryCount++;
      }
      timeline.push("target", "skipped", 0, "Not reached — delivery retries exhausted.");
      status = "dlq";
      error = {
        stage: "delivery",
        message:
          input.scenario === "timeout"
            ? `Delivery failed after ${MAX_RETRIES} attempts: target simulator timed out each time.`
            : `Delivery failed after ${MAX_RETRIES} attempts: target simulator responded 500 each time.`,
      };
    }
  }

  const createdAt = new Date(timeline.startTime).toISOString();
  const completedAt = new Date(timeline.startTime + timeline.elapsedMs).toISOString();

  return {
    id,
    traceId,
    eventType: input.eventType,
    scenario: input.scenario,
    status,
    latencyMs: timeline.elapsedMs,
    retryCount,
    createdAt,
    completedAt,
    payload: buildSyntheticPayload(input.eventType),
    stages: timeline.stages,
    error,
  };
}

export class MockRelayHubAdapter implements RelayHubAdapter {
  private events: EventExecution[] = [];

  async generateEvent(input: GenerateEventInput): Promise<EventExecution> {
    await sleep(NETWORK_DELAY_MS);
    const event = simulate(randomId("evt"), randomId("trace"), input);
    this.events.unshift(event);
    if (this.events.length > MAX_STORED_EVENTS) {
      this.events.length = MAX_STORED_EVENTS;
    }
    return event;
  }

  async getRecentEvents(): Promise<EventExecution[]> {
    return this.events.slice(0, 10);
  }

  async getEvent(eventId: string): Promise<EventExecution | undefined> {
    return this.events.find((event) => event.id === eventId);
  }

  async getMetrics(): Promise<RelayHubMetrics> {
    const total = this.events.length;
    const successCount = this.events.filter((event) => event.status === "success").length;
    const failureCount = this.events.filter(
      (event) => event.status === "failed" || event.status === "dlq",
    ).length;
    const latencies = this.events
      .map((event) => event.latencyMs)
      .filter((value): value is number => typeof value === "number")
      .sort((a, b) => a - b);

    return {
      requestsPerSecond: Number((8 + Math.random() * 6).toFixed(1)),
      successRate: total > 0 ? successCount / total : 1,
      failureRate: total > 0 ? failureCount / total : 0,
      p95LatencyMs: latencies.length > 0 ? percentile(latencies, 0.95) : 180,
      retryCount: this.events.reduce((sum, event) => sum + event.retryCount, 0),
      dlqCount: this.events.filter((event) => event.status === "dlq").length,
      sampledAt: new Date().toISOString(),
    };
  }

  async replayDlq(eventId: string): Promise<EventExecution> {
    await sleep(NETWORK_DELAY_MS);
    const index = this.events.findIndex((event) => event.id === eventId);
    if (index === -1 || this.events[index].status !== "dlq") {
      throw new Error("Event not found or not eligible for replay.");
    }

    const original = this.events[index];
    const timeline = new StageTimeline();
    const succeeds = Math.random() < 0.7;
    const deliveryDuration = randomInt(40, 150);
    timeline.push(
      "delivery",
      succeeds ? "success" : "failed",
      deliveryDuration,
      succeeds ? "Replay delivery succeeded." : "Replay delivery failed: target simulator responded 500 again.",
    );
    if (succeeds) {
      timeline.push("target", "success", randomInt(20, 60));
    } else {
      timeline.push("target", "skipped", 0, "Not reached — replay delivery failed.");
    }

    const replayed: EventExecution = {
      ...original,
      status: succeeds ? "success" : "dlq",
      retryCount: original.retryCount + 1,
      completedAt: new Date(timeline.startTime + timeline.elapsedMs).toISOString(),
      stages: [...original.stages, ...timeline.stages],
      error: succeeds
        ? undefined
        : { stage: "delivery", message: "Replay delivery failed: target simulator responded 500 again." },
    };

    this.events[index] = replayed;
    return replayed;
  }
}

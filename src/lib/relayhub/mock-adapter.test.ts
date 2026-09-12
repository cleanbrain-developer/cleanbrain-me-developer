import { beforeEach, describe, expect, it } from "vitest";
import { MockRelayHubAdapter } from "@/lib/relayhub/mock-adapter";

describe("MockRelayHubAdapter", () => {
  let adapter: MockRelayHubAdapter;

  beforeEach(() => {
    adapter = new MockRelayHubAdapter();
  });

  it("resolves the normal scenario as success with no retries", async () => {
    const event = await adapter.generateEvent({ eventType: "order.created", scenario: "normal" });
    expect(event.status).toBe("success");
    expect(event.retryCount).toBe(0);
    expect(event.error).toBeUndefined();
    expect(event.stages.map((s) => s.stage)).toEqual([
      "source",
      "ingestion",
      "validation",
      "transformation",
      "delivery",
      "target",
    ]);
    expect(event.stages.every((s) => s.status === "success")).toBe(true);
  });

  it("moves the target-500 scenario to DLQ after exhausting retries", async () => {
    const event = await adapter.generateEvent({
      eventType: "order.created",
      scenario: "target-500",
    });
    expect(event.status).toBe("dlq");
    expect(event.retryCount).toBe(3);
    expect(event.error?.stage).toBe("delivery");
    const deliveryAttempts = event.stages.filter((s) => s.stage === "delivery");
    expect(deliveryAttempts).toHaveLength(3);
    expect(deliveryAttempts.every((s) => s.status === "failed")).toBe(true);
    const target = event.stages.find((s) => s.stage === "target");
    expect(target?.status).toBe("skipped");
  });

  it("fails the validation-error scenario immediately with no retries", async () => {
    const event = await adapter.generateEvent({
      eventType: "order.created",
      scenario: "validation-error",
    });
    expect(event.status).toBe("failed");
    expect(event.retryCount).toBe(0);
    expect(event.error?.stage).toBe("validation");
    const laterStages = event.stages.filter((s) =>
      ["transformation", "delivery", "target"].includes(s.stage),
    );
    expect(laterStages.every((s) => s.status === "skipped")).toBe(true);
  });

  it("only allows replaying an event that is actually in the DLQ", async () => {
    const success = await adapter.generateEvent({
      eventType: "order.created",
      scenario: "normal",
    });
    await expect(adapter.replayDlq(success.id)).rejects.toThrow();
    await expect(adapter.replayDlq("nonexistent-id")).rejects.toThrow();
  });

  it("replays a DLQ event to either success or dlq, appending to its stage history", async () => {
    const dlqEvent = await adapter.generateEvent({
      eventType: "order.created",
      scenario: "target-500",
    });
    const originalStageCount = dlqEvent.stages.length;

    const replayed = await adapter.replayDlq(dlqEvent.id);

    expect(["success", "dlq"]).toContain(replayed.status);
    expect(replayed.retryCount).toBe(dlqEvent.retryCount + 1);
    expect(replayed.stages.length).toBeGreaterThan(originalStageCount);

    const stored = await adapter.getEvent(dlqEvent.id);
    expect(stored?.status).toBe(replayed.status);
  });

  it("aggregates metrics from generated events", async () => {
    await adapter.generateEvent({ eventType: "order.created", scenario: "normal" });
    await adapter.generateEvent({ eventType: "order.created", scenario: "target-500" });

    const metrics = await adapter.getMetrics();
    expect(metrics.dlqCount).toBe(1);
    expect(metrics.retryCount).toBe(3);
    expect(metrics.successRate).toBeCloseTo(0.5);
    expect(metrics.failureRate).toBeCloseTo(0.5);
  });

  it("returns the most recently generated events first, capped at 10", async () => {
    for (let i = 0; i < 12; i++) {
      await adapter.generateEvent({ eventType: "inventory.updated", scenario: "normal" });
    }
    const recent = await adapter.getRecentEvents();
    expect(recent).toHaveLength(10);
  });
});

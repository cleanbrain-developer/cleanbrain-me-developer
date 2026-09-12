import { describe, expect, it } from "vitest";
import { toPipelineSlots } from "@/lib/relayhub/pipeline";
import type { EventStageExecution } from "@/lib/relayhub/types";

function stage(overrides: Partial<EventStageExecution>): EventStageExecution {
  return { stage: "source", status: "success", ...overrides };
}

describe("toPipelineSlots", () => {
  it("returns all six pipeline stages, defaulting to pending when absent", () => {
    const slots = toPipelineSlots([]);
    expect(slots.map((slot) => slot.stage)).toEqual([
      "source",
      "ingestion",
      "validation",
      "transformation",
      "delivery",
      "target",
    ]);
    expect(slots.every((slot) => slot.status === "pending")).toBe(true);
  });

  it("collapses multiple attempts for the same stage into one slot using the last attempt", () => {
    const stages: EventStageExecution[] = [
      stage({ stage: "source", status: "success" }),
      stage({ stage: "delivery", status: "failed", message: "attempt 1" }),
      stage({ stage: "delivery", status: "failed", message: "attempt 2" }),
      stage({ stage: "delivery", status: "failed", message: "attempt 3" }),
      stage({ stage: "target", status: "skipped" }),
    ];

    const slots = toPipelineSlots(stages);
    const delivery = slots.find((slot) => slot.stage === "delivery");

    expect(delivery?.status).toBe("failed");
    expect(delivery?.attempts).toHaveLength(3);
    expect(delivery?.attempts.at(-1)?.message).toBe("attempt 3");
  });

  it("reflects a successful stage's status directly when there is only one attempt", () => {
    const slots = toPipelineSlots([stage({ stage: "validation", status: "success" })]);
    const validation = slots.find((slot) => slot.stage === "validation");
    expect(validation?.status).toBe("success");
    expect(validation?.attempts).toHaveLength(1);
  });
});

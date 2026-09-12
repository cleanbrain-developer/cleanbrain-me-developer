import { PIPELINE_STAGES, type EventStageExecution, type PipelineStage, type StageStatus } from "@/lib/relayhub/types";

export interface PipelineSlot {
  stage: PipelineStage;
  status: StageStatus;
  attempts: EventStageExecution[];
}

/**
 * Collapses a raw stage-execution timeline (which may contain multiple
 * entries for "delivery" when the event was retried) into exactly one slot
 * per pipeline stage, in pipeline order, for the top-level Pipeline view.
 * The full attempt-by-attempt detail remains available via `attempts` for
 * the Event Detail / retry history view.
 */
export function toPipelineSlots(stages: EventStageExecution[]): PipelineSlot[] {
  return PIPELINE_STAGES.map((stage) => {
    const attempts = stages.filter((entry) => entry.stage === stage);
    const last = attempts.at(-1);
    return {
      stage,
      status: last?.status ?? "pending",
      attempts,
    };
  });
}

export const STAGE_LABELS: Record<PipelineStage, string> = {
  source: "Source",
  ingestion: "Ingestion",
  validation: "Validation",
  transformation: "Transformation",
  delivery: "Delivery",
  target: "Target",
};

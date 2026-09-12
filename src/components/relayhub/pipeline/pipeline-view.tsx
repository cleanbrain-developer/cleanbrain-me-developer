import type { PipelineSlot } from "@/lib/relayhub/pipeline";
import { PipelineStageBadge } from "@/components/relayhub/pipeline/pipeline-stage";

export function PipelineView({ slots }: { slots: PipelineSlot[] }) {
  return (
    <div
      className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-2"
      aria-label="Event pipeline"
    >
      {slots.map((slot, index) => (
        <div key={slot.stage} className="flex flex-1 items-center gap-2 sm:contents">
          <PipelineStageBadge slot={slot} />
          {index < slots.length - 1 ? (
            <span aria-hidden className="hidden text-muted sm:block">
              &rarr;
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

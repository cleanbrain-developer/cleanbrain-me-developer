import type { PipelineSlot } from "@/lib/relayhub/pipeline";
import { STAGE_LABELS } from "@/lib/relayhub/pipeline";

const STATUS_STYLES: Record<PipelineSlot["status"], string> = {
  pending: "border-border text-muted",
  processing: "border-accent text-accent animate-pulse",
  success: "border-emerald-500/60 text-emerald-400",
  failed: "border-red-500/60 text-red-400",
  skipped: "border-border text-muted opacity-60",
};

const STATUS_SYMBOL: Record<PipelineSlot["status"], string> = {
  pending: "○", // ○
  processing: "◐", // ◐
  success: "✓", // ✓
  failed: "✕", // ✕
  skipped: "–", // –
};

export function PipelineStageBadge({ slot }: { slot: PipelineSlot }) {
  const attemptCount = slot.attempts.length;
  return (
    <div
      className={`flex min-w-[7rem] flex-1 flex-col items-center gap-1 rounded-lg border px-3 py-3 text-center ${STATUS_STYLES[slot.status]}`}
      role="status"
      aria-label={`${STAGE_LABELS[slot.stage]}: ${slot.status}`}
    >
      <span aria-hidden className="font-mono text-lg">
        {STATUS_SYMBOL[slot.status]}
      </span>
      <span className="text-xs font-medium text-foreground">{STAGE_LABELS[slot.stage]}</span>
      <span className="font-mono text-[11px] uppercase tracking-wide">{slot.status}</span>
      {attemptCount > 1 ? (
        <span className="rounded-full bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted">
          {attemptCount} attempts
        </span>
      ) : null}
    </div>
  );
}

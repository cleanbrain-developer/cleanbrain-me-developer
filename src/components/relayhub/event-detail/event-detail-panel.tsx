import type { EventExecution } from "@/lib/relayhub/types";
import { ReplayButton } from "@/components/relayhub/dlq/replay-button";

export function EventDetailPanel({
  event,
  isReplaying,
  onReplay,
}: {
  event: EventExecution | undefined;
  isReplaying: boolean;
  onReplay: (eventId: string) => void;
}) {
  if (!event) {
    return (
      <div className="rounded-lg border border-border bg-surface p-5 text-sm text-muted">
        Select an event from the table to see its detail.
      </div>
    );
  }

  const deliveryAttempts = event.stages.filter((stage) => stage.stage === "delivery");

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-muted">Event {event.id}</p>
          <p className="font-mono text-xs text-muted">Trace {event.traceId}</p>
        </div>
        {event.status === "dlq" ? (
          <ReplayButton isReplaying={isReplaying} onReplay={() => onReplay(event.id)} />
        ) : null}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <dt className="text-xs text-muted">Status</dt>
          <dd className="font-medium text-foreground">{event.status}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Duration</dt>
          <dd className="font-medium text-foreground">
            {event.latencyMs !== undefined ? `${event.latencyMs} ms` : "–"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Retries</dt>
          <dd className="font-medium text-foreground">{event.retryCount}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">DLQ</dt>
          <dd className="font-medium text-foreground">{event.status === "dlq" ? "Yes" : "No"}</dd>
        </div>
      </dl>

      {event.error ? (
        <p className="mt-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          [{event.error.stage}] {event.error.message}
        </p>
      ) : null}

      <div className="mt-5">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Payload preview (synthetic)
        </h4>
        <pre className="mt-2 overflow-x-auto rounded-md bg-background p-3 font-mono text-xs text-muted">
          {JSON.stringify(event.payload, null, 2)}
        </pre>
      </div>

      <div className="mt-5">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Stage timeline
        </h4>
        <ul className="mt-2 space-y-1 text-sm">
          {event.stages.map((stage, index) => (
            <li key={`${stage.stage}-${index}`} className="flex flex-wrap gap-2 text-muted">
              <span className="w-28 shrink-0 font-medium text-foreground">{stage.stage}</span>
              <span className="w-20 shrink-0">{stage.status}</span>
              <span className="w-16 shrink-0">
                {stage.durationMs !== undefined ? `${stage.durationMs} ms` : ""}
              </span>
              {stage.message ? <span>{stage.message}</span> : null}
            </li>
          ))}
        </ul>
      </div>

      {deliveryAttempts.length > 1 ? (
        <div className="mt-5">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Retry history (delivery)
          </h4>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {deliveryAttempts.map((attempt, index) => (
              <li key={index}>
                Attempt {index + 1}: {attempt.status} — {attempt.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

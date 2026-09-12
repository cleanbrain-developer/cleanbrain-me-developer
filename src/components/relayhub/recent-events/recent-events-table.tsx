import type { EventExecution } from "@/lib/relayhub/types";

const STATUS_TEXT_STYLES: Record<EventExecution["status"], string> = {
  processing: "text-accent",
  success: "text-emerald-400",
  failed: "text-red-400",
  retrying: "text-amber-400",
  dlq: "text-red-400",
};

export function RecentEventsTable({
  events,
  selectedEventId,
  onSelect,
}: {
  events: EventExecution[];
  selectedEventId: string | undefined;
  onSelect: (eventId: string) => void;
}) {
  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-5 text-sm text-muted">
        No events yet. Generate one above to see it here.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
            <th className="px-4 py-3 font-medium">Event</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Latency</th>
            <th className="px-4 py-3 font-medium">Retries</th>
            <th className="px-4 py-3 font-medium">Time</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr
              key={event.id}
              onClick={() => onSelect(event.id)}
              aria-current={event.id === selectedEventId}
              className={`cursor-pointer border-b border-border last:border-0 hover:bg-surface-hover ${
                event.id === selectedEventId ? "bg-surface-hover" : ""
              }`}
            >
              <td className="px-4 py-3 font-mono text-xs text-muted">{event.id}</td>
              <td className="px-4 py-3 text-foreground">{event.eventType}</td>
              <td className={`px-4 py-3 font-medium ${STATUS_TEXT_STYLES[event.status]}`}>
                {event.status}
              </td>
              <td className="px-4 py-3 text-muted">
                {event.latencyMs !== undefined ? `${event.latencyMs} ms` : "–"}
              </td>
              <td className="px-4 py-3 text-muted">{event.retryCount}</td>
              <td className="px-4 py-3 text-muted">
                {new Date(event.createdAt).toLocaleTimeString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

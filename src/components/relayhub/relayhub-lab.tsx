"use client";

import { useEffect, useState } from "react";
import { relayHubLabService } from "@/lib/relayhub/service";
import { PIPELINE_STAGES } from "@/lib/relayhub/types";
import type { EventExecution, EventType, RelayHubMetrics, Scenario } from "@/lib/relayhub/types";
import { toPipelineSlots } from "@/lib/relayhub/pipeline";
import { EventGeneratorForm } from "@/components/relayhub/event-generator/event-generator-form";
import { PipelineView } from "@/components/relayhub/pipeline/pipeline-view";
import { MetricsPanel } from "@/components/relayhub/metrics/metrics-panel";
import { RecentEventsTable } from "@/components/relayhub/recent-events/recent-events-table";
import { EventDetailPanel } from "@/components/relayhub/event-detail/event-detail-panel";

const REVEAL_STEP_MS = 300;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function RelayHubLab() {
  const [eventType, setEventType] = useState<EventType>("order.created");
  const [scenario, setScenario] = useState<Scenario>("normal");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const [events, setEvents] = useState<EventExecution[]>([]);
  const [metrics, setMetrics] = useState<RelayHubMetrics>();
  const [selectedEventId, setSelectedEventId] = useState<string>();
  const [pendingEvent, setPendingEvent] = useState<EventExecution>();
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    relayHubLabService.getMetrics().then(setMetrics);
  }, []);

  async function refresh() {
    const [recent, freshMetrics] = await Promise.all([
      relayHubLabService.getRecentEvents(),
      relayHubLabService.getMetrics(),
    ]);
    setEvents(recent);
    setMetrics(freshMetrics);
  }

  async function handleGenerate() {
    setIsGenerating(true);
    setPendingEvent(undefined);
    setRevealedCount(0);

    const result = await relayHubLabService.generateEvent({ eventType, scenario });
    setPendingEvent(result);

    for (let step = 1; step <= PIPELINE_STAGES.length; step++) {
      await sleep(REVEAL_STEP_MS);
      setRevealedCount(step);
    }

    await refresh();
    setSelectedEventId(result.id);
    setIsGenerating(false);
  }

  async function handleReplay(eventId: string) {
    setIsReplaying(true);
    await relayHubLabService.replayDlq(eventId);
    await refresh();
    setIsReplaying(false);
  }

  function handleSelect(eventId: string) {
    setPendingEvent(undefined);
    setSelectedEventId(eventId);
  }

  const selectedEvent = events.find((event) => event.id === selectedEventId);
  const activeEvent = pendingEvent ?? selectedEvent;
  const effectiveRevealCount =
    pendingEvent && isGenerating ? revealedCount : PIPELINE_STAGES.length;
  const slots = toPipelineSlots(activeEvent?.stages ?? []).map((slot, index) =>
    index < effectiveRevealCount ? slot : { ...slot, status: "pending" as const, attempts: [] },
  );

  return (
    <div className="space-y-6 pb-20">
      <EventGeneratorForm
        eventType={eventType}
        scenario={scenario}
        isGenerating={isGenerating}
        onEventTypeChange={setEventType}
        onScenarioChange={setScenario}
        onGenerate={handleGenerate}
      />

      <section aria-live="polite">
        <h2 className="mb-2 text-sm font-semibold text-foreground">Live Pipeline</h2>
        <PipelineView slots={slots} />
      </section>

      <MetricsPanel metrics={metrics} />

      <section>
        <h2 className="mb-2 text-sm font-semibold text-foreground">Recent Events</h2>
        <RecentEventsTable
          events={events}
          selectedEventId={selectedEventId}
          onSelect={handleSelect}
        />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-foreground">Event Detail</h2>
        <EventDetailPanel event={selectedEvent} isReplaying={isReplaying} onReplay={handleReplay} />
      </section>
    </div>
  );
}

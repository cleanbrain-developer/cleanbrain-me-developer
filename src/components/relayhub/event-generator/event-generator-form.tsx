import { EVENT_TYPE_OPTIONS, SCENARIO_OPTIONS } from "@/lib/relayhub/scenarios";
import type { EventType, Scenario } from "@/lib/relayhub/types";

export function EventGeneratorForm({
  eventType,
  scenario,
  isGenerating,
  onEventTypeChange,
  onScenarioChange,
  onGenerate,
}: {
  eventType: EventType;
  scenario: Scenario;
  isGenerating: boolean;
  onEventTypeChange: (value: EventType) => void;
  onScenarioChange: (value: Scenario) => void;
  onGenerate: () => void;
}) {
  return (
    <form
      className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 sm:flex-row sm:items-end sm:gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onGenerate();
      }}
    >
      <div className="flex-1">
        <label htmlFor="event-type" className="block text-xs font-medium text-muted">
          Event type
        </label>
        <select
          id="event-type"
          value={eventType}
          disabled={isGenerating}
          onChange={(event) => onEventTypeChange(event.target.value as EventType)}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          {EVENT_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <label htmlFor="scenario" className="block text-xs font-medium text-muted">
          Scenario
        </label>
        <select
          id="scenario"
          value={scenario}
          disabled={isGenerating}
          onChange={(event) => onScenarioChange(event.target.value as Scenario)}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          {SCENARIO_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-muted">
          {SCENARIO_OPTIONS.find((option) => option.value === scenario)?.description}
        </p>
      </div>

      <button
        type="submit"
        disabled={isGenerating}
        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isGenerating ? "Generating…" : "Generate Event"}
      </button>
    </form>
  );
}

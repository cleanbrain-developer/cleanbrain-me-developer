import type { EventType, Scenario } from "@/lib/relayhub/types";

export const EVENT_TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: "order.created", label: "Order Created" },
  { value: "inventory.updated", label: "Inventory Updated" },
  { value: "customer.updated", label: "Customer Updated" },
];

export const SCENARIO_OPTIONS: { value: Scenario; label: string; description: string }[] = [
  { value: "normal", label: "Normal", description: "Every stage succeeds." },
  {
    value: "target-500",
    label: "Target 500",
    description: "The target simulator returns 500 on delivery; retries, then DLQ.",
  },
  {
    value: "timeout",
    label: "Timeout",
    description: "The target simulator times out on delivery; retries, then DLQ.",
  },
  {
    value: "validation-error",
    label: "Validation Error",
    description: "The event fails validation and is not retried.",
  },
];

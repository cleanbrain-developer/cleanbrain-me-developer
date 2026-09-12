import type { RelayHubAdapter } from "@/lib/relayhub/adapter";
import { MockRelayHubAdapter } from "@/lib/relayhub/mock-adapter";
import { HttpRelayHubAdapter } from "@/lib/relayhub/http-adapter";

// Adapter selection lives here and only here — components must import
// relayHubLabService, never a concrete adapter or fetch() directly, so this
// is the one place that changes when a real API becomes available. Defaults
// to MockRelayHubAdapter; NEXT_PUBLIC_RELAYHUB_ADAPTER=http opts into
// HttpRelayHubAdapter against NEXT_PUBLIC_RELAYHUB_API_URL, once a real API
// implementing docs/decisions/ADR-0002's contract actually exists. Neither
// env var is set in production today (see docs/status/current-state.md).
function createRelayHubAdapter(): RelayHubAdapter {
  if (process.env.NEXT_PUBLIC_RELAYHUB_ADAPTER === "http") {
    const baseUrl = process.env.NEXT_PUBLIC_RELAYHUB_API_URL;
    if (!baseUrl) {
      throw new Error(
        "NEXT_PUBLIC_RELAYHUB_API_URL must be set when NEXT_PUBLIC_RELAYHUB_ADAPTER=http",
      );
    }
    return new HttpRelayHubAdapter(baseUrl);
  }
  return new MockRelayHubAdapter();
}

export const relayHubLabService: RelayHubAdapter = createRelayHubAdapter();

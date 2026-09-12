import type { RelayHubAdapter } from "@/lib/relayhub/adapter";
import { MockRelayHubAdapter } from "@/lib/relayhub/mock-adapter";

// V1 always uses MockRelayHubAdapter — there is no HttpRelayHubAdapter yet
// (see docs/product/scope.md and docs/architecture/overview.md). Components
// must import this singleton, never a concrete adapter, so a future
// HttpRelayHubAdapter can be introduced here without touching UI code.
export const relayHubLabService: RelayHubAdapter = new MockRelayHubAdapter();

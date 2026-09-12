# ADR-0002: RelayHub HTTP Adapter Contract (Interface Readiness Only)

- Status: Accepted
- Date: 2026-09-13
- Deciders: cleanbrain.developer

## Context

The RelayHub Live Lab (`/lab/relayhub`) is built entirely against the `RelayHubAdapter` interface (`docs/architecture/overview.md`, "Adapter pattern"), currently implemented only by `MockRelayHubAdapter`. Phase 4 of the roadmap (`docs/status/current-state.md`) calls for "`HttpRelayHubAdapter` interface readiness only, no real backend call yet" — the UI and adapter boundary should be ready for a real API without one existing yet, and without fabricating a claim that one does.

No real RelayHub demo API is deployed today. `relayhub-java` is a real, separately deployed project (see `/projects/relayhub`), but its actual admin/API surface is not something this repository can assume or bind to without that project's own explicit contract.

## Decision

- Add `HttpRelayHubAdapter` (`src/lib/relayhub/http-adapter.ts`) implementing `RelayHubAdapter` against a small, explicit REST contract, documented here so it is a decision, not an assumption baked silently into the code:
  - `POST {baseUrl}/events` with body `GenerateEventInput` → `EventExecution`
  - `GET {baseUrl}/events?limit=10` → `EventExecution[]`
  - `GET {baseUrl}/events/{id}` → `EventExecution` (adapter returns `undefined` on any request failure, matching the interface's optional return)
  - `GET {baseUrl}/metrics` → `RelayHubMetrics`
  - `POST {baseUrl}/events/{id}/replay` → `EventExecution`
  - Response bodies are trusted to already match the `EventExecution`/`RelayHubMetrics` shapes in `src/lib/relayhub/types.ts` — no runtime schema validation is implemented, since there is no real endpoint yet to validate against.
- Adapter selection is centralized in `src/lib/relayhub/service.ts`: `NEXT_PUBLIC_RELAYHUB_ADAPTER=http` (with `NEXT_PUBLIC_RELAYHUB_API_URL` set) switches to `HttpRelayHubAdapter`; anything else (including unset, which is production's actual state today) keeps `MockRelayHubAdapter`. `NEXT_PUBLIC_` is required because this selection happens in a Client Component (`RelayHubLab`), and only `NEXT_PUBLIC_`-prefixed environment variables are available in the browser bundle in Next.js.
- This contract is provisional and owned by this repository until a real backend implements it. It is not a claim that `relayhub-java` exposes, or will expose, exactly these routes.

## Consequences

### Positive

- The UI/adapter boundary (`docs/architecture/overview.md`'s "Constraints agents must preserve") is exercised by a second real implementation, not just asserted in prose — a future real backend has a concrete target to implement against, or this contract can be revised before any backend commits to it.
- No production behavior changes: the default remains `MockRelayHubAdapter`, so shipping this ADR carries no operational risk.

### Costs and risks

- The contract above is speculative until a real backend exists — treat every field and route name here as a proposal, not a stable public API, until an accepted follow-up ADR ties a real deployed backend to it.
- No runtime response validation exists yet; a real backend that returns a shape close to but not exactly matching `EventExecution`/`RelayHubMetrics` would fail silently or throw deep in the UI rather than at the adapter boundary. Revisit before ever setting `NEXT_PUBLIC_RELAYHUB_ADAPTER=http` against a real deployment.

## Alternatives considered

### Wait until a real backend exists before writing any HTTP adapter code

Keeps the codebase smaller until the need is real, but leaves the "smallest coherent change" principle satisfied only by not touching this at all — rejected because the roadmap (design spec §9, "Real API Ready") explicitly calls for adapter-interface readiness as its own phase, decoupled from when a real backend actually ships.

### Skip documenting a contract and let the adapter's method signatures speak for themselves

The interface (`RelayHubAdapter`) already documents parameter/return shapes; an ADR is still needed for the parts an interface cannot express — HTTP verbs, paths, env var names, and the explicit "provisional, not a real deployed contract" caveat. Rejected as insufficient on its own.

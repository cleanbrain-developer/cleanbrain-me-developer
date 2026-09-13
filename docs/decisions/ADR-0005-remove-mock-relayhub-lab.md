# ADR-0005: Remove the Mock RelayHub Lab; Live Monitoring Becomes the Front Door

- Status: Accepted
- Date: 2026-09-13
- Deciders: cleanbrain.developer

## Context

Phase 3–4 of this project's original build (per the init prompt and design spec, and ADR-0002) delivered an interactive "RelayHub Live Lab": a predefined Event Generator, a six-stage pipeline visualization, synthetic metrics, a recent-events table, an event-detail view, and DLQ replay — all backed by `MockRelayHubAdapter`, a client-side state machine, behind a `RelayHubAdapter` interface that also had an unused `HttpRelayHubAdapter` implementation (ADR-0002) ready for a real backend that never became the active adapter.

ADR-0004 then added `LiveObservabilityPanel`, a small real-data panel below that Mock Lab, reading relayhub-java's actual production telemetry. Once real data was visible on the same page as the simulation, the simulation's purpose weakened: the maintainer confirmed the "Generate Event" flow was not actually being used, and asked for it to be removed, with the real telemetry promoted from a secondary panel to the main, attention-grabbing experience — including making `/` (the site root) redirect straight to it.

## Decision

- Delete the entire Mock Lab: `src/lib/relayhub/{adapter,mock-adapter,mock-adapter.test,http-adapter,service,scenarios,pipeline,pipeline.test,types}.ts` and `src/components/relayhub/{event-generator,pipeline,metrics,recent-events,event-detail,dlq}/` and `relayhub-lab.tsx`. `RelayHubAdapter`, `MockRelayHubAdapter`, and `HttpRelayHubAdapter` no longer exist in this codebase. ADR-0002's provisional HTTP contract is now historical record only — superseded, not implemented by anything.
- Rebuild `/lab/relayhub` around `LiveDashboard` (`src/components/relayhub/live-observability/live-dashboard.tsx`): large KPI tiles (Succeeded / Pending / Dead / Ingress events per minute), two `Sparkline` time-series charts (ingress rate, delivery attempts by status — both real Prometheus range queries, not accumulated client-side samples), a live delivery-targets list, and a pulsing "live" indicator. Auto-refreshes every 10 seconds without a full-page reload or loading-state flash, so a visitor watching the page sees it actually update.
- `src/lib/relayhub/live-observability.ts` grew `parseInstantValue`/`parseRangeSeries` as pure, exported, unit-tested functions (`live-observability.test.ts`, fixtures drawn from real captured API responses) — replacing the unit-test coverage that existed for the deleted `MockRelayHubAdapter`/`toPipelineSlots`, so the "first automated test suite" investment from Phase 5 isn't simply lost.
- `/` now redirects to `/lab/relayhub` instead of the former homepage (see the routing change recorded alongside ADR-0004 in `docs/status/current-state.md`) — the Live Monitoring dashboard is now the front door of the entire site, not a secondary destination reached only via a nav link.
- Replaced every remaining "Live Lab" / "generate a synthetic event" reference in content and prose (`/architecture`, `/projects/relayhub`'s content, nav label, the `/lab` landing page) with "Live Monitoring" framing that accurately describes what the page now does.

## Consequences

### Positive

- Removes real, if narrow, misdirection risk: a page that both simulates RelayHub and shows RelayHub's real data invited exactly the "is this real or fake" confusion the whole site's "Evidence over Claims" thesis (`docs/product/overview.md`) exists to avoid. One unambiguous data source per page is simpler to reason about and to trust.
- Deletes a meaningful amount of code and its associated cognitive surface (an adapter interface, two implementations, a scenario state machine, six component folders) that was confirmed unused — a real simplification, not just a reorganization.
- The site's most prominent real estate (`/`) now demonstrates a genuinely live system rather than routing to a static portfolio page first.

### Costs and risks

- This reverses a P0 requirement from the original init prompt/design spec (`docs/product/scope.md`'s original "in scope" list, and ADR-0002) without reopening those source documents — per `.ai/constitution/documentation-policy.md` ("Authority"), the repository's current, accepted decisions win over the original prompt once they diverge, and this ADR is that explicit record.
- The site now has **no offline-safe demo**: if `relayhub-java` is down, `/` (via the redirect) shows an error/retry state instead of any content proving backend capability, where previously the Mock Lab worked regardless of any real backend's availability. Accepted as a deliberate trade-off — the maintainer explicitly prioritized real evidence over guaranteed uptime for this specific page.
- `docs/product/scope.md`'s "Demo safety" principle (no arbitrary URL/header/script input) was originally written for the Mock Lab's `GenerateEventInput`; it now has no code left to apply to on this page, but the principle itself remains valid guidance if any future interactive feature is added — it is not deleted, only currently unapplied.
- Anyone who bookmarked `/` for the portfolio narrative now lands on the dashboard instead; that content is not gone (`/profile`), but discoverability of it depends entirely on the header logo now.

## Alternatives considered

### Keep the Mock Lab, just de-emphasize it below the real dashboard

This was ADR-0004's actual state immediately before this ADR. Rejected once the maintainer confirmed the simulation was unused — keeping confirmed-dead code "just in case" contradicts `.ai/constitution/engineering-principles.md`'s "Minimal, coherent change" principle.

### Keep `RelayHubAdapter`/`MockRelayHubAdapter` as a code sample even if not linked from any page

Considered briefly as a way to preserve the Phase 3 work as a portfolio artifact in itself. Rejected: unreachable code with no route, nav link, or test coverage anyone would maintain going forward is a liability (bit rot, confusion for a future session), not an asset — the real GitHub history already preserves this work if it's ever wanted for reference.

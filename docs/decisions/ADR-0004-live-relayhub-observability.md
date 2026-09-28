# ADR-0004: Live RelayHub Observability (Real Cross-Origin Data, Not Mocked)

- Status: Accepted
- Date: 2026-09-13
- Deciders: cleanbrain.developer

## Context

The RelayHub Live Lab (`/lab/relayhub`) is, by design (ADR-0002, `docs/product/scope.md`), a client-side simulation backed by `MockRelayHubAdapter` — it never calls a real backend. That is correct for the interactive demo, but it means the page never actually proves that a real RelayHub deployment exists and behaves this way; it only asserts it in prose ("all data on this page is synthetic — see the RelayHub project page for the real, live system this simulates").

`relayhub-java` (the real, separately deployed project at `relayhub-java.developer.cleanbrain.me`) already exposes several public, unauthenticated, read-only GET endpoints (see that repo's `security/SecurityConfig.java`): `/api/deliveries/summary` (succeeded/pending/dead counts), `/api/targets` (the demo delivery targets and their behavior), `/api/metrics/query`/`query_range` (a thin, public proxy to its Prometheus instance, used by its own admin console's charts), and `/actuator/health`. All of this data was already viewable by directly opening those URLs in a browser — the only thing missing was the ability for `developer.cleanbrain.me`'s own JavaScript to `fetch()` it, which the browser blocks by default for a different origin without a CORS response header.

## Decision

- Add a `CorsConfigurationSource` bean to `relayhub-java`'s `SecurityConfig` (that repository), allowing `GET` requests from exactly `https://developer.cleanbrain.me` against `/api/deliveries/**`, `/api/targets/**`, `/api/metrics/**`, and `/actuator/**`. No other origin, no other HTTP method, and no additional endpoints are opened up. This does not change what data is public — it changes which origins may read that already-public data via JavaScript.
- Add `src/lib/relayhub/live-observability.ts` in this repository: a plain `fetch()`-based function (`fetchRelayHubLiveObservability`) that reads those endpoints directly from the browser. This is deliberately **not** an implementation of `RelayHubAdapter` — that interface exists for the interactive Lab's `generateEvent`/`replayDlq`/etc. lifecycle, which this has no equivalent of (it is read-only telemetry, not a simulated pipeline run). Forcing it through that interface would misrepresent it as another "adapter" choice alongside Mock/Http, when it is actually a different concern entirely: a real, live, unidirectional view into a separate production service.
- Render it via `LiveObservabilityPanel` (`src/components/relayhub/live-observability/`), placed below the Mock Lab on `/lab/relayhub`, under a "Beyond the simulation" heading, with its own distinct "Live · real data" badge — never sharing visual language with the Mock Lab's "Synthetic demo data" badge, so a visitor can never mistake one for the other.

## Consequences

### Positive

- The site can now show, not just claim, that a real RelayHub deployment with real delivery/DLQ/target state exists — direct evidence rather than an assertion, matching the site's own "Evidence over Claims" product thesis (`docs/product/overview.md`).
- The CORS grant is minimal and auditable: one origin, one HTTP verb, four path prefixes, all already public to any direct browser visit. It does not create a new capability, only a narrower way to read an existing one.

### Costs and risks

- **Cross-repository coupling that did not exist before.** `developer.cleanbrain.me` now has a real, if narrow, runtime dependency on `relayhub-java`'s specific API shape (`/api/deliveries/summary`'s field names, `/api/targets`'s shape, the exact PromQL metric names `relayhub_ingress_events_total` uses). A future breaking change to `relayhub-java`'s API surface, made without awareness of this dependency, would silently break this panel. `LiveObservabilityPanel` degrades to an explicit error + retry state rather than crashing the page, but the underlying coupling is real and undocumented on the `relayhub-java` side beyond this ADR and its own `SecurityConfig.java` comment.
- **Availability coupling.** If `relayhub-java` is down, redeploying, or under load, this panel shows an error state — acceptable (matches `docs/product/scope.md`'s "Error UX" expectations) but worth naming: this is the first place this site's own uptime is affected by another service's uptime, even if only for one non-critical panel.
- **No caching, no rate limiting on this repository's side.** Every visitor to `/lab/relayhub` triggers three GET requests against `relayhub-java`, uncached. At the traffic levels either site sees today this is not a concern, but it is a real load path that did not exist before, worth remembering if either site's traffic ever grows meaningfully.
- This ADR only covers this specific, narrow integration. It does not reopen or reinterpret ADR-0002's decision that `HttpRelayHubAdapter` (a full request/response simulation backend) remains unused — that adapter, if ever activated, would be a much larger, different commitment than this read-only telemetry panel.

## Alternatives considered

### Embed the real admin console via `<iframe>`

Rejected: `relayhub-java`'s responses carry `X-Frame-Options: DENY` (confirmed by directly requesting the live URL), and changing that would be a much larger security-posture change to that service than a scoped CORS allowlist for a handful of already-public GET endpoints.

### Proxy the requests through a server-side function on `developer.cleanbrain.me`

Rejected: this site is a static export with no server (ADR-0003) by deliberate choice, specifically because nothing about it needed server-side logic. Standing up a server, edge function, or Cloudflare Worker purely to work around a CORS header would reverse that decision for one feature, and add a new piece of infrastructure this cluster's resource budget (`cleanbrain-me-infra`'s README, "Resource budget") does not obviously have room for. A CORS header on the already-public API is the smaller, more honest fix.

### Leave it as an external link only, no embedded data

The simpler and lower-risk option, genuinely considered — it requires no cross-repo change at all. Rejected only because the maintainer explicitly asked for the real data to be shown on `developer.cleanbrain.me` itself, not just linked to; noted here so a future session understands this was a deliberate choice between two reasonable options, not an oversight.

## Update (2026-09-13): the animated Live topology, not just KPI tiles

The first version of this ADR shipped `LiveObservabilityPanel` — KPI tiles and two range-query sparklines, a static-feeling summary. The maintainer's actual ask was for the page to visually grab attention the moment a visitor lands on it, the way `relayhub-java`'s own admin-console **Live** page does (`frontend/src/pages/LivePage.tsx` in that repo: a real-time SSE-driven topology diagram with animated "missile" pulses, impact explosions, and node-hit shake effects). A static dashboard, however accurate, does not read as "live" the instant the page loads.

**Decision, extended:**

- Ported `LivePage.tsx`'s topology animation into this repository as `LiveTopology` (`src/components/relayhub/live-observability/live-topology.tsx`), fed by `src/lib/relayhub/live-topology.ts`. It opens a real cross-origin `EventSource` against `relayhub-java`'s `/api/live/stream` (Server-Sent Events) and renders the same Source → Event → RelayHub → Target diagram, with the same pulse/explosion/shake visual language — recolored to this site's theme tokens, not relayhub-java's.
- Expanded `relayhub-java`'s `CorsConfigurationSource` (same bean, same origin, still `GET`-only) to also cover `/api/sources/**`, `/api/subscriptions/**`, `/api/dlq/**` (needed to lay out the diagram and show the DLQ auto-replay countdown), and `/api/live/**` (the SSE stream itself).
- This is a **port that runs natively on this site**, not an `<iframe>` of `relayhub-java`'s page — the alternative considered and rejected above (`X-Frame-Options: DENY`) still applies, and a genuine same-site rebuild is arguably the stronger portfolio demonstration besides.
- Deliberately narrower than the original: no login-gated demo-generator pause/resume control (this site has no auth and ADR-0004's "read-only, `GET`-only" boundary should stay true even as the visualization grows), and no click-through request/response detail on the activity feed.
- `LiveObservabilityPanel`'s KPI tiles and sparklines were **not deleted** — renamed/kept as `LiveDashboard`, now a secondary "Aggregate stats" section below `LiveTopology` on the same page. The topology animation is the primary, attention-grabbing view; the dashboard remains for anyone who wants trend/summary numbers rather than watching individual events fly by.

**Additional cost this update accepts:** the topology view depends on more of `relayhub-java`'s surface than before (`/api/sources`, `/api/subscriptions`, `/api/dlq/schedule`, plus the SSE event shape itself), and holds one open `EventSource` connection per visiting tab for as long as the tab is open — a real, if currently small, persistent-connection load on `relayhub-java` that a plain polling dashboard did not create.

## Update (2026-09-29): click-through request/response detail, after all

The previous update's "Decision, extended" explicitly excluded click-through detail on the activity feed. Two follow-up UX-review specs both asked for exactly that — a drill-down on Recent Activity rows.

The first attempt at this the same day discovered that `relayhub-java`'s attempt-detail fields (`DeliveryAttemptResponse`'s request/response/error, and the full per-delivery retry history via `GET /api/deliveries/{deliveryId}/attempts`) were `hasRole("ADMIN")`-gated on that service, not just uncovered by CORS — a real, prior security decision there (2026-09-17: an Attempt carries actual request/response payload content, not just outcome metadata). A CORS entry alone doesn't grant access, and a public site can't authenticate as admin without embedding a credential client-side, so that attempt was reverted the same day, on both repos, before shipping.

The maintainer then made a deliberate call on `relayhub-java`'s side: every Source/Target attached to that deployment is, and will remain, a demo system under `relayhub-demo-systems` generating synthetic traffic only — there is no real target integration to protect, so the admin gate was reopened as public (see `relayhub-java`'s `docs/status/current-state.md`, 2026-09-29, and `SecurityConfig.java`'s explicit "revisit if a real Target is ever connected" note).

**Decision, extended again:**

- Added a click-to-open `Sheet` (`src/components/relayhub/live-observability/activity-detail-sheet.tsx`) on any `"delivery"`-stage row in `LiveTopology`'s Recent Activity table (rows with an `attemptId`; `"ingress"`/`"dlq"` rows have none and stay non-interactive). Shows the clicked attempt's real request method/URL/body, HTTP status, response body, and error message, plus the delivery's full real retry history — not a fabricated stage timeline.
- CORS on `relayhub-java`: added `/api/delivery-attempts/**` (same bean, same origin, still `GET`-only). `GET /api/deliveries/{deliveryId}/attempts` needed no new entry — already covered by the existing `/api/deliveries/**`.
- Introduced this repository's first Radix-based UI primitive (`@radix-ui/react-dialog`, wrapped as `src/components/ui/sheet.tsx`) specifically for this — ADR-0006 anticipated Radix arriving exactly when a Dialog/Sheet was actually needed, and this is that moment.
- Two fields the underlying specs also asked for (a trace/correlation id, per-attempt latency) do **not** exist on `relayhub-java` today, regardless of the auth question, and were **not** added to the frontend — see `docs/relayhub-observability-gap.md` for what's missing and what adding it would take, rather than inventing either in this app.

This does not reopen `relayhub-java`'s admin write boundary — every new call from this site is still a `GET` against a now-intentionally-public endpoint. The security decision itself (whether Attempt data should be public) belongs to `relayhub-java`, not to this repository; this ADR records that this site now depends on that endpoint being public, and why.

# Architecture Overview

## Architectural style

developer.cleanbrain.me is a Next.js (App Router, TypeScript) application. Server Components are the default; Client Components are used only where interactivity is required (primarily `/lab/relayhub`, the site's front door via `/`'s redirect). There is no database and no custom backend server, and — since ADR-0005 — no mock/simulation layer either: `/lab/relayhub` reads relayhub-java's real production telemetry directly, including a live SSE stream (ADR-0004's "Update"). The `RelayHubAdapter`/`MockRelayHubAdapter`/`HttpRelayHubAdapter` interfaces from ADR-0002 (Phase 3–4 of the original build) were removed entirely — see ADR-0005 for why.

```text
src/content/*.ts (profile, experience, projects, case studies)
    ↓
Server Components (app/**/page.tsx)
    ↓
Presentation components (src/components/**)
```

```text
LiveTopology (Client Component)         LiveDashboard (Client Component)
    ↓ EventSource (SSE)                     ↓ fetch (poll every 10s)
    ↓ + one-time fetch                      ↓
src/lib/relayhub/live-topology.ts       src/lib/relayhub/live-observability.ts
    ↓                                       ↓
relayhub-java's public REST + SSE endpoints (real, cross-origin, both)
```

## Layers

### Content

`src/content/` holds structured TypeScript modules (`profile.ts`, `experience.ts`, `projects.ts`, `case-studies/*.ts`) that are the single source of portfolio content. Presentation components read from these modules; they never define project or case-study text inline.

### RelayHub Live

`src/lib/relayhub/` is the only RelayHub-related domain code left, and it is two independent, real (not mocked) integrations, not one:

- `live-topology.ts` + `live-topology.tsx`: the primary, attention-grabbing view. Opens a real cross-origin `EventSource` against `relayhub-java`'s `/api/live/stream` and renders an animated Source → Event → RelayHub → Target diagram (pulses, impact explosions, node-hit shake) — a port of that repo's own admin-console Live page (`frontend/src/pages/LivePage.tsx`), recolored to this site's theme. Also fetches `/api/sources`, `/api/subscriptions`, `/api/dlq/schedule` once on mount to lay out the diagram and drive the DLQ countdown. See ADR-0004's "Update (2026-09-13)".
- `live-observability.ts` + `live-dashboard.tsx`: a secondary "Aggregate stats" section below the topology. Polls `relayhub-java`'s delivery-summary and Prometheus-backed metrics endpoints every 10 seconds, rendering KPI tiles and `Sparkline` (`sparkline.tsx`, a small dependency-free inline-SVG line chart — no charting library). `parseInstantValue`/`parseRangeSeries` are pure, unit-tested functions that reshape Prometheus's JSON response shapes into this app's types.

There is no adapter interface and no mock implementation for either: both are one-way, read-only views of a real system, not a simulated pipeline with interchangeable backends (see ADR-0005 for why the earlier `RelayHubAdapter`/`MockRelayHubAdapter` was removed).

### Presentation

`src/components/` is organized by feature area (`layout/`, `navigation/`, `portfolio/`, `project/`, `case-study/`, `relayhub/live-observability/`). Only components that need real interactivity (polling, client-side refresh) are Client Components.

## External integrations

`english-core-speaking` is referenced only as an outbound link from `/projects` content — this application never calls its API, shares sessions, or depends on its runtime availability.

`relayhub-java` is different and load-bearing — the site's most important external dependency: `/lab/relayhub` (the site's front door, since `/` redirects there) calls its real, public, read-only endpoints directly from the browser, both a one-time fetch (`/api/deliveries/summary`, `/api/targets`, `/api/subscriptions`, `/api/sources`, `/api/dlq/schedule`, `/api/metrics/query(_range)`) and a persistent Server-Sent Events connection (`/api/live/stream`) held open for as long as the tab stays on that page. This is a real runtime dependency: if `relayhub-java` is unavailable, the affected component shows an explicit error/retry state rather than crashing the page, but it is genuinely coupled to that service's uptime and exact API/metric-name/event-shape (see ADR-0004's "Costs and risks" and its "Update").

## Deployment target

The application is built as a static export (`output: "export"` in `next.config.ts`) and served by `nginx:1.27-alpine` — there is no running Node server in production (see ADR-0003; every route is static or `generateStaticParams`-driven, and the Live Monitoring dashboard is entirely client-side). The image runs inside the `cleanbrain-me-infra` Kubernetes cluster, under the `cleanbrain-me-developer` namespace convention, sharing the cluster's existing Gateway (`cleanbrain-me-gateway`) rather than provisioning new cluster-level resources. Kubernetes manifests themselves live in `cleanbrain-me-infra`, not in this repository — anything that looks like a required infra change is recorded in `docs/infra-required-changes.md` here, not implemented directly.

## Constraints agents must preserve

- Content-driven: portfolio content lives in `src/content/`, never hardcoded into a component.
- No mock/simulation UI: per ADR-0005, do not reintroduce a synthetic "generate an event" affordance on this site. If a demo/simulation need re-emerges, treat it as a new decision requiring its own ADR, not a revival of the deleted Phase 3 code.
- `relayhub-java` integration stays read-only and narrowly scoped: neither `LiveTopology` nor `LiveDashboard` may ever send a request that could mutate `relayhub-java` state, and any new endpoint either one reads must be added to that service's CORS allowlist deliberately (see ADR-0004), never assumed to already be covered by `**`.
- Server Components by default; a Client Component boundary must be justified by real interactivity, not convenience.
- No global state-management library, no CMS, no database, no auth in V1 (see `docs/product/scope.md`).
- Target cluster is 2 vCPU / 4 GB RAM / 40 GB disk (per `cleanbrain-me-infra`) — keep the runtime footprint of the served build and its container minimal.

# Architecture Overview

## Architectural style

developer.cleanbrain.me is a Next.js (App Router, TypeScript) application. Server Components are the default; Client Components are used only where interactivity is required (primarily the RelayHub Live Monitoring dashboard). There is no database and no custom backend server, and — since ADR-0005 — no mock/simulation layer either: the dashboard at `/lab/relayhub` reads relayhub-java's real production telemetry directly. The `RelayHubAdapter`/`MockRelayHubAdapter`/`HttpRelayHubAdapter` interfaces from ADR-0002 (Phase 3–4 of the original build) were removed entirely — see ADR-0005 for why.

```text
src/content/*.ts (profile, experience, projects, case studies)
    ↓
Server Components (app/**/page.tsx)
    ↓
Presentation components (src/components/**)
```

```text
LiveDashboard (Client Component, src/components/relayhub/live-observability/)
    ↓
fetchRelayHubLiveObservability (src/lib/relayhub/live-observability.ts)
    ↓
relayhub-java's public REST/Prometheus-proxy endpoints (real, cross-origin)
```

## Layers

### Content

`src/content/` holds structured TypeScript modules (`profile.ts`, `experience.ts`, `projects.ts`, `case-studies/*.ts`) that are the single source of portfolio content. Presentation components read from these modules; they never define project or case-study text inline.

### RelayHub Live Monitoring

`src/lib/relayhub/live-observability.ts` is the only RelayHub-related domain module left. It exports `fetchRelayHubLiveObservability()` (calls relayhub-java's real endpoints) and two pure, unit-tested parsing functions — `parseInstantValue`/`parseRangeSeries` — that reshape Prometheus's JSON response shapes into this app's `RelayHubSeries`/`RelayHubLiveSummary`/`RelayHubLiveTarget` types (see `docs/decisions/ADR-0004-live-relayhub-observability.md`). There is no adapter interface and no mock implementation: this is a one-way, read-only view of a real system, not a simulated pipeline with interchangeable backends. `LiveDashboard` (`src/components/relayhub/live-observability/live-dashboard.tsx`) is a Client Component that fetches on mount and every 10 seconds thereafter, rendering KPI tiles and `Sparkline` (`sparkline.tsx`, a small dependency-free inline-SVG line chart — no charting library).

### Presentation

`src/components/` is organized by feature area (`layout/`, `navigation/`, `portfolio/`, `project/`, `case-study/`, `relayhub/live-observability/`). Only components that need real interactivity (polling, client-side refresh) are Client Components.

## External integrations

`english-core-speaking` is referenced only as an outbound link from `/projects` content — this application never calls its API, shares sessions, or depends on its runtime availability.

`relayhub-java` is different and load-bearing: `src/lib/relayhub/live-observability.ts` calls its real, public, read-only endpoints (`/api/deliveries/summary`, `/api/targets`, `/api/metrics/query`, `/api/metrics/query_range`) directly from the browser, rendered by `LiveDashboard` on `/lab/relayhub` — now the site's front door (`/` redirects there). This is a real runtime dependency: if `relayhub-java` is unavailable, the dashboard shows an explicit error/retry state rather than crashing the page, but it is genuinely coupled to that service's uptime and exact API/metric-name shape (see ADR-0004's "Costs and risks").

## Deployment target

The application is built as a static export (`output: "export"` in `next.config.ts`) and served by `nginx:1.27-alpine` — there is no running Node server in production (see ADR-0003; every route is static or `generateStaticParams`-driven, and the Live Monitoring dashboard is entirely client-side). The image runs inside the `cleanbrain-me-infra` Kubernetes cluster, under the `cleanbrain-me-developer` namespace convention, sharing the cluster's existing Gateway (`cleanbrain-me-gateway`) rather than provisioning new cluster-level resources. Kubernetes manifests themselves live in `cleanbrain-me-infra`, not in this repository — anything that looks like a required infra change is recorded in `docs/infra-required-changes.md` here, not implemented directly.

## Constraints agents must preserve

- Content-driven: portfolio content lives in `src/content/`, never hardcoded into a component.
- No mock/simulation UI: per ADR-0005, do not reintroduce a synthetic "generate an event" affordance on this site. If a demo/simulation need re-emerges, treat it as a new decision requiring its own ADR, not a revival of the deleted Phase 3 code.
- `relayhub-java` integration stays read-only and narrowly scoped: `LiveDashboard` must never send a request that could mutate `relayhub-java` state, and any new endpoint it reads must be added to that service's CORS allowlist deliberately (see ADR-0004), never assumed to already be covered by `**`.
- Server Components by default; a Client Component boundary must be justified by real interactivity, not convenience.
- No global state-management library, no CMS, no database, no auth in V1 (see `docs/product/scope.md`).
- Target cluster is 2 vCPU / 4 GB RAM / 40 GB disk (per `cleanbrain-me-infra`) — keep the runtime footprint of the served build and its container minimal.

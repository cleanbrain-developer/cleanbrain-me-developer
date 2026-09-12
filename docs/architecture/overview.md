# Architecture Overview

## Architectural style

developer.cleanbrain.me is a Next.js (App Router, TypeScript) application. Server Components are the default; Client Components are used only where interactivity is required (primarily the RelayHub Live Lab). There is no database and no custom backend server — the "backend" behavior visitors interact with (the RelayHub Lab pipeline) is a client-side mock state machine behind an adapter interface. `HttpRelayHubAdapter` exists (see ADR-0002) but is not used in production; no real RelayHub demo API is deployed.

```text
src/content/*.ts (profile, experience, projects, case studies)
    ↓
Server Components (app/**/page.tsx)
    ↓
Presentation components (src/components/**)
```

```text
RelayHub Lab UI (Client Components)
    ↓
relayHubLabService (src/lib/relayhub/service.ts)
    ↓
RelayHubAdapter (interface)
    ├─ MockRelayHubAdapter   (active in production today)
    └─ HttpRelayHubAdapter   (implemented, ADR-0002 — opt-in only, no real API deployed)
```

## Layers

### Content

`src/content/` holds structured TypeScript modules (`profile.ts`, `experience.ts`, `projects.ts`, `case-studies/*.ts`) that are the single source of portfolio content. Presentation components read from these modules; they never define project or case-study text inline.

### Domain (RelayHub Lab)

`src/lib/relayhub/types.ts` defines `EventExecution`, `EventStageExecution`, `PipelineStage`/`StageStatus`, `EventExecutionStatus`, `RelayHubMetrics`, and related types. `src/lib/relayhub/pipeline.ts` adds the presentation-facing `toPipelineSlots` mapping (collapsing multi-attempt retries into one slot per pipeline stage). These types are shared by the adapter interface, both adapter implementations, and every Lab component — never redefined ad hoc in a component.

### Adapter pattern

`RelayHubAdapter` (`src/lib/relayhub/adapter.ts`) is the single interface (`generateEvent`, `getRecentEvents`, `getEvent`, `getMetrics`, `replayDlq`) that every Lab UI component depends on. `MockRelayHubAdapter` (`src/lib/relayhub/mock-adapter.ts`) implements it as an in-memory, scenario-driven state machine (see `docs/product/scope.md` for allowed scenarios); `HttpRelayHubAdapter` (`src/lib/relayhub/http-adapter.ts`) implements the same interface against a real API per the contract in ADR-0002, but is not active in production. Which adapter is active is selected once, in `src/lib/relayhub/service.ts`, by `NEXT_PUBLIC_RELAYHUB_ADAPTER` — never by a component branching on "is this mock or real."

Components must call the adapter through `relayHubLabService` (the singleton exported by `src/lib/relayhub/service.ts`), not `fetch()` or a concrete adapter class directly — no component should know whether it is talking to a mock or a real backend.

### Presentation

`src/components/` is organized by feature area (`layout/`, `navigation/`, `portfolio/`, `project/`, `case-study/`, `relayhub/{event-generator,pipeline,metrics,recent-events,event-detail,dlq}/`). The RelayHub Lab is decomposed into small components per the design spec, not one large client component; only the components that need interactivity are Client Components.

## External integrations

None in V1. `english-core-speaking` and `relayhub-java` are referenced only as outbound links from `/projects` content — this application never calls their APIs, shares sessions, or depends on their runtime availability.

## Deployment target

The application is built as a static export (`output: "export"` in `next.config.ts`) and served by `nginx:1.27-alpine` — there is no running Node server in production (see ADR-0003; every route is static or `generateStaticParams`-driven, and the RelayHub Lab is entirely client-side). The image runs inside the `cleanbrain-me-infra` Kubernetes cluster, under the `cleanbrain-me-developer` namespace convention, sharing the cluster's existing Gateway (`cleanbrain-me-gateway`) rather than provisioning new cluster-level resources. Kubernetes manifests themselves live in `cleanbrain-me-infra`, not in this repository — anything that looks like a required infra change is recorded in `docs/infra-required-changes.md` here, not implemented directly.

## Constraints agents must preserve

- Content-driven: portfolio content lives in `src/content/`, never hardcoded into a component.
- Adapter boundary: RelayHub Lab UI depends only on `RelayHubAdapter`; no component calls a network API directly.
- Demo safety: the public Lab only ever accepts a predefined event type and scenario, and only ever operates on synthetic data (see `.ai/constitution/engineering-principles.md`).
- Server Components by default; a Client Component boundary must be justified by real interactivity, not convenience.
- No global state-management library, no CMS, no database, no auth in V1 (see `docs/product/scope.md`).
- Target cluster is 2 vCPU / 4 GB RAM / 40 GB disk (per `cleanbrain-me-infra`) — keep the runtime footprint of the served build and its container minimal.
